"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const permissions_1 = require("../security/permissions");
const authenticate = async (req, res, next) => {
    // 1. Extract token from HttpOnly cookie or Authorization Bearer header
    let token;
    const cookieToken = req.cookies?.aurelia_session;
    const authHeader = req.headers.authorization;
    if (cookieToken) {
        token = cookieToken;
    }
    else if (authHeader && authHeader.startsWith('Bearer ')) {
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
        let userId;
        let sessionId;
        // First try decoding as JWT
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            userId = decoded.id;
            sessionId = decoded.sessionId;
        }
        catch (jwtErr) {
            // If not a valid JWT, check if it's an opaque session token
            const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
            const session = await Session_1.SessionModel.findOne({
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
            await session.save().catch(() => { });
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
        const user = await User_1.UserModel.findById(userId).lean();
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
            const sessionDoc = await Session_1.SessionModel.findById(sessionId);
            if (sessionDoc && (!sessionDoc.isValid || sessionDoc.expiresAt <= new Date())) {
                res.status(401).json({
                    success: false,
                    message: 'Session has been invalidated or expired. Please sign in again.',
                });
                return;
            }
        }
        const permissions = permissions_1.ROLE_PERMISSIONS[user.role] || [];
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            sessionId,
            permissions,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Session has expired or token is invalid. Please log in again.',
        });
    }
};
exports.authenticate = authenticate;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthenticated access' });
            return;
        }
        const requiredList = Array.isArray(permission) ? permission : [permission];
        const hasAccess = requiredList.some((p) => (0, permissions_1.hasPermission)(req.user.role, p));
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
exports.requirePermission = requirePermission;
