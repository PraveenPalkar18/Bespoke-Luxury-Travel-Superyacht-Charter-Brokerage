import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { SessionModel } from '../models/Session';
import { BrokerInvitationModel, IBrokerInvitation } from '../models/BrokerInvitation';
import { InquiryModel } from '../models/Inquiry';
import { auditService } from './audit.service';
import { IUser, AuthUserPayload, UserRole } from '../types';
import { config } from '../config';
import { ensureDatabaseConnected } from '../config/database';
import { UnauthorizedError, NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { ROLE_PERMISSIONS } from '../security/permissions';

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface BrokerListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  assignedEnquiriesCount: number;
  createdAt: Date;
}

export class AuthService {
  /**
   * Authenticate user with work email and password.
   * Creates an active server-tracked session and issues token.
   */
  async login(
    email: string,
    plainPassword: string,
    ctx: RequestContext = {}
  ): Promise<{ token: string; user: Omit<IUser, 'passwordHash'>; sessionId: string }> {
    ensureDatabaseConnected();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      await auditService.log({
        actor: { email: normalizedEmail, role: 'anonymous' },
        action: 'failed_login',
        resourceType: 'auth',
        metadata: { reason: 'User not found' },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    if (!user.isActive) {
      await auditService.log({
        actor: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
        action: 'failed_login',
        resourceType: 'auth',
        metadata: { reason: 'Account deactivated' },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      throw new UnauthorizedError('Account has been deactivated. Please contact the Managing Director.');
    }

    const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isMatch) {
      await auditService.log({
        actor: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
        action: 'failed_login',
        resourceType: 'auth',
        metadata: { reason: 'Password mismatch' },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Create a secure server-side session
    const rawSessionToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawSessionToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await SessionModel.create({
      userId: user._id,
      tokenHash,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      isValid: true,
      expiresAt,
      lastActivityAt: new Date(),
    });

    const payload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId: session._id.toString(),
      permissions: ROLE_PERMISSIONS[user.role],
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    await auditService.log({
      actor: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
      action: 'successful_login',
      resourceType: 'auth',
      resourceId: user._id.toString(),
      metadata: { sessionId: session._id.toString() },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;

    return {
      token,
      user: userObj as Omit<IUser, 'passwordHash'>,
      sessionId: session._id.toString(),
    };
  }

  /**
   * Invalidate server session and log logout audit event.
   */
  async logout(userId: string, sessionId?: string, ctx: RequestContext = {}): Promise<void> {
    ensureDatabaseConnected();

    if (sessionId) {
      await SessionModel.findByIdAndUpdate(sessionId, { isValid: false });
    } else {
      // Invalidate all active sessions for this user if no specific session id
      await SessionModel.updateMany({ userId: new mongoose.Types.ObjectId(userId) }, { isValid: false });
    }

    await auditService.log({
      actor: { id: userId },
      action: 'logout',
      resourceType: 'auth',
      metadata: { sessionId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  }

  /**
   * Get authenticated user profile.
   */
  async getUserById(id: string): Promise<Omit<IUser, 'passwordHash'>> {
    ensureDatabaseConnected();

    const user = await UserModel.findById(id).select('-passwordHash').lean();
    if (!user) {
      throw new NotFoundError(`User account not found with identifier: ${id}`);
    }

    return user as unknown as Omit<IUser, 'passwordHash'>;
  }

  /**
   * Get all brokers with assigned enquiry counts (Admin views all, Broker views active list).
   */
  async getAllBrokers(requestingUserRole: UserRole): Promise<BrokerListItem[]> {
    ensureDatabaseConnected();

    const filter: any = {};
    if (requestingUserRole !== 'admin') {
      filter.isActive = true;
    }

    const users = await UserModel.find(filter).sort({ name: 1 }).lean();

    // Compute assigned enquiry counts for each broker
    const brokerIds = users.map((u) => u._id.toString());
    const enquiryCounts = await InquiryModel.aggregate([
      { $match: { assignedTo: { $in: brokerIds }, status: { $ne: 'archived' } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const ec of enquiryCounts) {
      countMap.set(ec._id, ec.count);
    }

    return users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      title: u.title || (u.role === 'admin' ? 'Managing Director' : 'Charter Broker'),
      phone: u.phone,
      isActive: u.isActive,
      lastLogin: u.lastLogin,
      assignedEnquiriesCount: countMap.get(u._id.toString()) || 0,
      createdAt: u.createdAt,
    }));
  }

  /**
   * Admin-Only: Invite a new broker with single-use cryptographic token.
   */
  async inviteBroker(
    params: { name: string; email: string; phone?: string; title?: string },
    adminUser: AuthUserPayload,
    ctx: RequestContext = {}
  ): Promise<{ invitation: IBrokerInvitation; rawToken: string }> {
    ensureDatabaseConnected();

    const normalizedEmail = params.email.toLowerCase().trim();

    // Check if an account already exists with this email
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new BadRequestError(`A user account with email '${normalizedEmail}' already exists.`);
    }

    // Revoke any existing pending invitations for this email
    await BrokerInvitationModel.updateMany(
      { email: normalizedEmail, isUsed: false, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    // Generate single-use cryptographically secure random token (64 hex chars)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await BrokerInvitationModel.create({
      name: params.name.trim(),
      email: normalizedEmail,
      role: 'broker',
      phone: params.phone?.trim(),
      title: params.title?.trim() || 'Charter Broker',
      tokenHash,
      expiresAt,
      isUsed: false,
      isRevoked: false,
      invitedBy: new mongoose.Types.ObjectId(adminUser.id),
      invitedByName: adminUser.name,
    });

    await auditService.log({
      actor: { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role },
      action: 'invitation_created',
      resourceType: 'broker_invitation',
      resourceId: invitation._id.toString(),
      metadata: {
        invitedEmail: normalizedEmail,
        invitedName: params.name,
        expiresAt,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return { invitation, rawToken };
  }

  /**
   * Validate invitation token and return broker invite details for onboarding UI.
   */
  async getInvitationByToken(rawToken: string): Promise<{
    email: string;
    name: string;
    title?: string;
    expiresAt: Date;
  }> {
    ensureDatabaseConnected();

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const invitation = await BrokerInvitationModel.findOne({ tokenHash });

    if (!invitation) {
      throw new NotFoundError('Invalid invitation token. Please request a new invite link from the Managing Director.');
    }

    if (invitation.isRevoked) {
      throw new BadRequestError('This invitation has been revoked by administration. Please contact the Managing Director.');
    }

    if (invitation.isUsed) {
      throw new BadRequestError('This invitation has already been accepted. Please sign in with your credentials.');
    }

    if (invitation.expiresAt <= new Date()) {
      throw new BadRequestError('This invitation link has expired. Please request a fresh invitation.');
    }

    return {
      email: invitation.email,
      name: invitation.name,
      title: invitation.title,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Complete broker onboarding: set password, create account, invalidate token.
   */
  async acceptInvitation(
    rawToken: string,
    plainPassword: string,
    ctx: RequestContext = {}
  ): Promise<Omit<IUser, 'passwordHash'>> {
    ensureDatabaseConnected();

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const invitation = await BrokerInvitationModel.findOne({ tokenHash });

    if (!invitation) {
      throw new NotFoundError('Invalid invitation token.');
    }

    if (invitation.isRevoked) {
      throw new BadRequestError('This invitation has been revoked.');
    }

    if (invitation.isUsed) {
      throw new BadRequestError('This invitation has already been used.');
    }

    if (invitation.expiresAt <= new Date()) {
      throw new BadRequestError('This invitation has expired.');
    }

    // Check if user account was created in the meantime
    const existing = await UserModel.findOne({ email: invitation.email });
    if (existing) {
      throw new BadRequestError('A user account already exists for this email address.');
    }

    // Hash password with cost factor 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    const newUser = await UserModel.create({
      name: invitation.name,
      email: invitation.email,
      passwordHash,
      role: invitation.role,
      title: invitation.title || 'Charter Broker',
      phone: invitation.phone,
      isActive: true,
    });

    // Mark invitation as single-use completed
    invitation.isUsed = true;
    invitation.usedAt = new Date();
    await invitation.save();

    await auditService.log({
      actor: { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role },
      action: 'invitation_accepted',
      resourceType: 'broker_invitation',
      resourceId: invitation._id.toString(),
      metadata: { userId: newUser._id.toString() },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    await auditService.log({
      actor: { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role },
      action: 'broker_activated',
      resourceType: 'user',
      resourceId: newUser._id.toString(),
      metadata: { title: newUser.title },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    const userObj = newUser.toObject();
    delete (userObj as any).passwordHash;

    return userObj as Omit<IUser, 'passwordHash'>;
  }

  /**
   * Admin-Only: Activate or deactivate a broker account.
   * Immediately invalidates all active sessions when deactivated.
   */
  async updateBrokerStatus(
    brokerId: string,
    isActive: boolean,
    reason?: string,
    adminUser?: AuthUserPayload,
    ctx: RequestContext = {}
  ): Promise<Omit<IUser, 'passwordHash'>> {
    ensureDatabaseConnected();

    if (adminUser && adminUser.id === brokerId && !isActive) {
      throw new ForbiddenError('Managing Directors cannot deactivate their own administrative account.');
    }

    const user = await UserModel.findById(brokerId);
    if (!user) {
      throw new NotFoundError(`User account not found with ID: ${brokerId}`);
    }

    user.isActive = isActive;
    if (!isActive) {
      user.deactivatedAt = new Date();
      user.deactivatedBy = adminUser?.name || 'Managing Director';

      // Crucial: Invalidate all active sessions for this deactivated broker immediately
      await SessionModel.updateMany(
        { userId: user._id, isValid: true },
        { isValid: false }
      );
    } else {
      user.deactivatedAt = undefined;
      user.deactivatedBy = undefined;
    }

    await user.save();

    await auditService.log({
      actor: adminUser
        ? { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role }
        : { role: 'system' },
      action: isActive ? 'broker_activated' : 'broker_deactivated',
      resourceType: 'user',
      resourceId: user._id.toString(),
      metadata: {
        brokerEmail: user.email,
        brokerName: user.name,
        reason,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;

    return userObj as Omit<IUser, 'passwordHash'>;
  }

  /**
   * Admin-Only: Revoke a pending invitation.
   */
  async revokeInvitation(
    invitationId: string,
    adminUser: AuthUserPayload,
    ctx: RequestContext = {}
  ): Promise<void> {
    ensureDatabaseConnected();

    const invitation = await BrokerInvitationModel.findById(invitationId);
    if (!invitation) {
      throw new NotFoundError('Invitation record not found.');
    }

    if (invitation.isUsed) {
      throw new BadRequestError('Cannot revoke an invitation that has already been accepted.');
    }

    invitation.isRevoked = true;
    invitation.revokedAt = new Date();
    await invitation.save();

    await auditService.log({
      actor: { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role },
      action: 'invitation_revoked',
      resourceType: 'broker_invitation',
      resourceId: invitation._id.toString(),
      metadata: { email: invitation.email },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  }

  /**
   * Admin-Only: List pending invitations.
   */
  async getPendingInvitations(): Promise<IBrokerInvitation[]> {
    ensureDatabaseConnected();

    return BrokerInvitationModel.find({ isUsed: false, isRevoked: false })
      .sort({ createdAt: -1 })
      .lean() as unknown as IBrokerInvitation[];
  }
}

export const authService = new AuthService();
