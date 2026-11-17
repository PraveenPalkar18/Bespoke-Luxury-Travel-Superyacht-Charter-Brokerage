import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { AuthUserPayload, UserRole } from '../types';
import { UserModel } from '../models/User';
import { SessionModel } from '../models/Session';
import { Permission, ROLE_PERMISSIONS, hasPermission } from '../security/permissions';

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1. Extract token from HttpOnly cookie or Authorization Bearer header
  let token: string | undefined;

  const cookieToken = req.cookies?.aurelia_session;
  const authHeader = req.headers.authorization;

  if (cookieToken) {
    token = cookieToken;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access the brokerage terminal.',
    });
    return;
  }

  try {
    let userId: string | undefined;
    let sessionId: string | undefined;

    // First try decoding as JWT
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      userId = decoded.id;
      sessionId = decoded.sessionId;
    } catch (jwtErr) {
      // If not a valid JWT, check if it's an opaque session token
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const session = await SessionModel.findOne({
        tokenHash,
        isValid: true,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        res.status(401).json({
          success: false,
          message: 'Session has expired or token is invalid. Please log in again.',
        });
        return;
      }

      userId = session.userId.toString();
      sessionId = session._id.toString();

      // Update last activity
      session.lastActivityAt = new Date();
      await session.save().catch(() => {});
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid session credentials. Please log in again.',
      });
      return;
    }

    // Always verify user status against DB in real time
    // This guarantees that deactivating a user or changing their role takes effect IMMEDIATELY!
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account not found or has been removed.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact the Managing Director.',
      });
      return;
    }

    // If session tracking is enabled, verify session validity if sessionId exists
    if (sessionId) {
      const sessionDoc = await SessionModel.findById(sessionId);
      if (sessionDoc && (!sessionDoc.isValid || sessionDoc.expiresAt <= new Date())) {
        res.status(401).json({
          success: false,
          message: 'Session has been invalidated or expired. Please sign in again.',
        });
        return;
      }
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId,
      permissions,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Session has expired or token is invalid. Please log in again.',
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated access' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for this operation',
      });
      return;
    }

    next();
  };
};

export const requirePermission = (permission: Permission | Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated access' });
      return;
    }

    const requiredList = Array.isArray(permission) ? permission : [permission];
    const hasAccess = requiredList.some((p) => hasPermission(req.user!.role, p));

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for this operation',
      });
      return;
    }

    next();
  };
};
