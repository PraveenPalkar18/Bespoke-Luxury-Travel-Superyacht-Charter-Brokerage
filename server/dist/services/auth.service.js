"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const BrokerInvitation_1 = require("../models/BrokerInvitation");
const Inquiry_1 = require("../models/Inquiry");
const audit_service_1 = require("./audit.service");
const config_1 = require("../config");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const permissions_1 = require("../security/permissions");
class AuthService {
    /**
     * Authenticate user with work email and password.
     * Creates an active server-tracked session and issues token.
     */
    async login(email, plainPassword, ctx = {}) {
        (0, database_1.ensureDatabaseConnected)();
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            await audit_service_1.auditService.log({
                actor: { email: normalizedEmail, role: 'anonymous' },
                action: 'failed_login',
                resourceType: 'auth',
                metadata: { reason: 'User not found' },
                ipAddress: ctx.ipAddress,
                userAgent: ctx.userAgent,
            });
            throw new errors_1.UnauthorizedError('Invalid email or password credentials');
        }
        if (!user.isActive) {
            await audit_service_1.auditService.log({
                actor: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
                action: 'failed_login',
                resourceType: 'auth',
                metadata: { reason: 'Account deactivated' },
                ipAddress: ctx.ipAddress,
                userAgent: ctx.userAgent,
            });
            throw new errors_1.UnauthorizedError('Account has been deactivated. Please contact the Managing Director.');
        }
        const isMatch = await bcryptjs_1.default.compare(plainPassword, user.passwordHash);
        if (!isMatch) {
            await audit_service_1.auditService.log({
                actor: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
                action: 'failed_login',
                resourceType: 'auth',
                metadata: { reason: 'Password mismatch' },
                ipAddress: ctx.ipAddress,
                userAgent: ctx.userAgent,
            });
            throw new errors_1.UnauthorizedError('Invalid email or password credentials');
        }
        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();
        // Create a secure server-side session
        const rawSessionToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(rawSessionToken).digest('hex');
        const csrfToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const session = await Session_1.SessionModel.create({
            userId: user._id,
            tokenHash,
            csrfToken,
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
            isValid: true,
            expiresAt,
            lastActivityAt: new Date(),
        });
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            sessionId: session._id.toString(),
            permissions: permissions_1.ROLE_PERMISSIONS[user.role],
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, {
            expiresIn: config_1.config.jwtExpiresIn,
        });
        await audit_service_1.auditService.log({
            actor: { id: user._id.toString(), email: user.email, name: user.name, role: user.role },
            action: 'successful_login',
            resourceType: 'auth',
            resourceId: user._id.toString(),
            metadata: { sessionId: session._id.toString() },
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
        });
        const userObj = user.toObject();
        delete userObj.passwordHash;
        return {
            token,
            user: userObj,
            sessionId: session._id.toString(),
            csrfToken,
        };
    }
    /**
     * Invalidate server session and log logout audit event.
     */
    async logout(userId, sessionId, ctx = {}) {
        (0, database_1.ensureDatabaseConnected)();
        if (sessionId) {
            await Session_1.SessionModel.findByIdAndUpdate(sessionId, { isValid: false });
        }
        else {
            // Invalidate all active sessions for this user if no specific session id
            await Session_1.SessionModel.updateMany({ userId: new mongoose_1.default.Types.ObjectId(userId) }, { isValid: false });
        }
        await audit_service_1.auditService.log({
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
    async getUserById(id) {
        (0, database_1.ensureDatabaseConnected)();
        const user = await User_1.UserModel.findById(id).select('-passwordHash').lean();
        if (!user) {
            throw new errors_1.NotFoundError(`User account not found with identifier: ${id}`);
        }
        return user;
    }
    /**
     * Get all brokers with assigned enquiry counts (Admin views all, Broker views active list).
     */
    async getAllBrokers(requestingUserRole) {
        (0, database_1.ensureDatabaseConnected)();
        const filter = {};
        if (requestingUserRole !== 'admin') {
            filter.isActive = true;
        }
        const users = await User_1.UserModel.find(filter).sort({ name: 1 }).lean();
        // Compute assigned enquiry counts for each broker
        const brokerIds = users.map((u) => u._id.toString());
        const enquiryCounts = await Inquiry_1.InquiryModel.aggregate([
            { $match: { assignedTo: { $in: brokerIds }, status: { $ne: 'archived' } } },
            { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        ]);
        const countMap = new Map();
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
    async inviteBroker(params, adminUser, ctx = {}) {
        (0, database_1.ensureDatabaseConnected)();
        const normalizedEmail = params.email.toLowerCase().trim();
        // Check if an account already exists with this email
        const existingUser = await User_1.UserModel.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new errors_1.BadRequestError(`A user account with email '${normalizedEmail}' already exists.`);
        }
        // Revoke any existing pending invitations for this email
        await BrokerInvitation_1.BrokerInvitationModel.updateMany({ email: normalizedEmail, isUsed: false, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
        // Generate single-use cryptographically secure random token (64 hex chars)
        const rawToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const invitation = await BrokerInvitation_1.BrokerInvitationModel.create({
            name: params.name.trim(),
            email: normalizedEmail,
            role: 'broker',
            phone: params.phone?.trim(),
            title: params.title?.trim() || 'Charter Broker',
            tokenHash,
            expiresAt,
            isUsed: false,
            isRevoked: false,
            invitedBy: new mongoose_1.default.Types.ObjectId(adminUser.id),
            invitedByName: adminUser.name,
        });
        await audit_service_1.auditService.log({
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
    async getInvitationByToken(rawToken) {
        (0, database_1.ensureDatabaseConnected)();
        const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const invitation = await BrokerInvitation_1.BrokerInvitationModel.findOne({ tokenHash });
        if (!invitation) {
            throw new errors_1.NotFoundError('Invalid invitation token. Please request a new invite link from the Managing Director.');
        }
        if (invitation.isRevoked) {
            throw new errors_1.BadRequestError('This invitation has been revoked by administration. Please contact the Managing Director.');
        }
        if (invitation.isUsed) {
            throw new errors_1.BadRequestError('This invitation has already been accepted. Please sign in with your credentials.');
        }
        if (invitation.expiresAt <= new Date()) {
            throw new errors_1.BadRequestError('This invitation link has expired. Please request a fresh invitation.');
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
    async acceptInvitation(rawToken, plainPassword, ctx = {}) {
        (0, database_1.ensureDatabaseConnected)();
        const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
        const invitation = await BrokerInvitation_1.BrokerInvitationModel.findOne({ tokenHash });
        if (!invitation) {
            throw new errors_1.NotFoundError('Invalid invitation token.');
        }
        if (invitation.isRevoked) {
            throw new errors_1.BadRequestError('This invitation has been revoked.');
        }
        if (invitation.isUsed) {
            throw new errors_1.BadRequestError('This invitation has already been used.');
        }
        if (invitation.expiresAt <= new Date()) {
            throw new errors_1.BadRequestError('This invitation has expired.');
        }
        // Check if user account was created in the meantime
        const existing = await User_1.UserModel.findOne({ email: invitation.email });
        if (existing) {
            throw new errors_1.BadRequestError('A user account already exists for this email address.');
        }
        // Hash password with cost factor 12
        const salt = await bcryptjs_1.default.genSalt(12);
        const passwordHash = await bcryptjs_1.default.hash(plainPassword, salt);
        const newUser = await User_1.UserModel.create({
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
        await audit_service_1.auditService.log({
            actor: { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role },
            action: 'invitation_accepted',
            resourceType: 'broker_invitation',
            resourceId: invitation._id.toString(),
            metadata: { userId: newUser._id.toString() },
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
        });
        await audit_service_1.auditService.log({
            actor: { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role },
            action: 'broker_activated',
            resourceType: 'user',
            resourceId: newUser._id.toString(),
            metadata: { title: newUser.title },
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
        });
        const userObj = newUser.toObject();
        delete userObj.passwordHash;
        return userObj;
    }
    /**
     * Admin-Only: Activate or deactivate a broker account.
     * Immediately invalidates all active sessions when deactivated.
     */
    async updateBrokerStatus(brokerId, isActive, reason, adminUser, ctx = {}) {
        (0, database_1.ensureDatabaseConnected)();
        if (adminUser && adminUser.id === brokerId && !isActive) {
            throw new errors_1.ForbiddenError('Managing Directors cannot deactivate their own administrative account.');
        }
        const user = await User_1.UserModel.findById(brokerId);
        if (!user) {
            throw new errors_1.NotFoundError(`User account not found with ID: ${brokerId}`);
        }
        user.isActive = isActive;
        if (!isActive) {
            user.deactivatedAt = new Date();
            user.deactivatedBy = adminUser?.name || 'Managing Director';
            // Crucial: Invalidate all active sessions for this deactivated broker immediately
            await Session_1.SessionModel.updateMany({ userId: user._id, isValid: true }, { isValid: false });
        }
        else {
            user.deactivatedAt = undefined;
            user.deactivatedBy = undefined;
        }
        await user.save();
        await audit_service_1.auditService.log({
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
        delete userObj.passwordHash;
        return userObj;
    }
    /**
     * Admin-Only: Revoke a pending invitation.
     */
    async revokeInvitation(invitationId, adminUser, ctx = {}) {
        (0, database_1.ensureDatabaseConnected)();
        const invitation = await BrokerInvitation_1.BrokerInvitationModel.findById(invitationId);
        if (!invitation) {
            throw new errors_1.NotFoundError('Invitation record not found.');
        }
        if (invitation.isUsed) {
            throw new errors_1.BadRequestError('Cannot revoke an invitation that has already been accepted.');
        }
        invitation.isRevoked = true;
        invitation.revokedAt = new Date();
        await invitation.save();
        await audit_service_1.auditService.log({
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
    async getPendingInvitations() {
        (0, database_1.ensureDatabaseConnected)();
        return BrokerInvitation_1.BrokerInvitationModel.find({ isUsed: false, isRevoked: false })
            .sort({ createdAt: -1 })
            .lean();
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
