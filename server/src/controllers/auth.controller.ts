import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { auditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config';

const getClientContext = (req: Request) => ({
  ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip,
  userAgent: req.headers['user-agent'] as string,
});

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const ctx = getClientContext(req);
    const { token, user, sessionId, csrfToken } = await authService.login(email, password, ctx);

    // Set secure HttpOnly session cookie for browser authentication
    res.cookie('aurelia_session', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set double-submit Anti-CSRF token cookie (accessible to client-side scripts)
    res.cookie('aurelia_csrf', csrfToken, {
      httpOnly: false,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      token,
      csrfToken,
      user,
      sessionId,
      data: { token, csrfToken, user, sessionId },
      message: 'Authentication successful. Access granted to Aurelia & Co. terminal.',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ctx = getClientContext(req);
    if (req.user) {
      await authService.logout(req.user.id, req.user.sessionId, ctx);
    }

    // Clear session and CSRF cookies
    res.clearCookie('aurelia_session', { path: '/' });
    res.clearCookie('aurelia_csrf', { path: '/' });

    res.status(200).json({
      success: true,
      message: 'Session closed. You have been safely logged out.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const user = await authService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        ...user,
        permissions: req.user.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBrokers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user?.role || 'broker';
    const brokers = await authService.getAllBrokers(role);

    res.status(200).json({
      success: true,
      count: brokers.length,
      data: brokers,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrokersList = getBrokers;

export const inviteBroker = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const ctx = getClientContext(req);
    const { invitation, rawToken } = await authService.inviteBroker(req.body, req.user, ctx);

    const inviteUrl = `${config.clientUrl}/invite/${rawToken}`;

    res.status(201).json({
      success: true,
      data: {
        id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteUrl,
        // Include inviteToken only in non-production or for administrative direct copy
        inviteToken: rawToken,
      },
      message: `Invitation generated successfully for ${invitation.email}.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvitationDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const details = await authService.getInvitationByToken(token);

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;
    const ctx = getClientContext(req);
    const user = await authService.acceptInvitation(token, password, ctx);

    res.status(201).json({
      success: true,
      data: user,
      message: 'Broker onboarding completed successfully. Your account is now active.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrokerStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    const ctx = getClientContext(req);

    const updated = await authService.updateBrokerStatus(id, isActive, reason, req.user, ctx);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Broker account ${isActive ? 'activated' : 'deactivated'} successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export const revokeInvitation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const { id } = req.params;
    const ctx = getClientContext(req);
    await authService.revokeInvitation(id, req.user, ctx);

    res.status(200).json({
      success: true,
      message: 'Broker invitation has been revoked.',
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingInvitations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invitations = await authService.getPendingInvitations();

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit, skip, action, resourceType, actorId } = req.query;

    const result = await auditService.getLogs({
      limit: limit ? parseInt(limit as string, 10) : undefined,
      skip: skip ? parseInt(skip as string, 10) : undefined,
      action: action as string,
      resourceType: resourceType as string,
      actorId: actorId as string,
    });

    res.status(200).json({
      success: true,
      data: result.logs,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};
