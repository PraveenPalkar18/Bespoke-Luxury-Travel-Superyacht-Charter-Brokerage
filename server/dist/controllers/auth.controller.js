"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.getPendingInvitations = exports.revokeInvitation = exports.updateBrokerStatus = exports.acceptInvitation = exports.getInvitationDetails = exports.inviteBroker = exports.getBrokersList = exports.getBrokers = exports.getMe = exports.logout = exports.login = void 0;
const auth_service_1 = require("../services/auth.service");
const audit_service_1 = require("../services/audit.service");
const config_1 = require("../config");
const getClientContext = (req) => ({
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
    userAgent: req.headers['user-agent'],
});
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const ctx = getClientContext(req);
        const { token, user, sessionId, csrfToken } = await auth_service_1.authService.login(email, password, ctx);
        // Set secure HttpOnly session cookie for browser authentication
        res.cookie('aurelia_session', token, {
            httpOnly: true,
            secure: config_1.config.nodeEnv === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // Set double-submit Anti-CSRF token cookie (accessible to client-side scripts)
        res.cookie('aurelia_csrf', csrfToken, {
            httpOnly: false,
            secure: config_1.config.nodeEnv === 'production',
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
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const ctx = getClientContext(req);
        if (req.user) {
            await auth_service_1.authService.logout(req.user.id, req.user.sessionId, ctx);
        }
        // Clear session and CSRF cookies
        res.clearCookie('aurelia_session', { path: '/' });
        res.clearCookie('aurelia_csrf', { path: '/' });
        res.status(200).json({
            success: true,
            message: 'Session closed. You have been safely logged out.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthenticated' });
            return;
        }
        const user = await auth_service_1.authService.getUserById(req.user.id);
        res.status(200).json({
            success: true,
            data: {
                ...user,
                permissions: req.user.permissions,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const getBrokers = async (req, res, next) => {
    try {
        const role = req.user?.role || 'broker';
        const brokers = await auth_service_1.authService.getAllBrokers(role);
        res.status(200).json({
            success: true,
            count: brokers.length,
            data: brokers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBrokers = getBrokers;
exports.getBrokersList = exports.getBrokers;
const inviteBroker = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthenticated' });
            return;
        }
        const ctx = getClientContext(req);
        const { invitation, rawToken } = await auth_service_1.authService.inviteBroker(req.body, req.user, ctx);
        const inviteUrl = `${config_1.config.clientUrl}/invite/${rawToken}`;
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
    }
    catch (error) {
        next(error);
    }
};
exports.inviteBroker = inviteBroker;
const getInvitationDetails = async (req, res, next) => {
    try {
        const { token } = req.params;
        const details = await auth_service_1.authService.getInvitationByToken(token);
        res.status(200).json({
            success: true,
            data: details,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvitationDetails = getInvitationDetails;
const acceptInvitation = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const ctx = getClientContext(req);
        const user = await auth_service_1.authService.acceptInvitation(token, password, ctx);
        res.status(201).json({
            success: true,
            data: user,
            message: 'Broker onboarding completed successfully. Your account is now active.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.acceptInvitation = acceptInvitation;
const updateBrokerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive, reason } = req.body;
        const ctx = getClientContext(req);
        const updated = await auth_service_1.authService.updateBrokerStatus(id, isActive, reason, req.user, ctx);
        res.status(200).json({
            success: true,
            data: updated,
            message: `Broker account ${isActive ? 'activated' : 'deactivated'} successfully.`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBrokerStatus = updateBrokerStatus;
const revokeInvitation = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthenticated' });
            return;
        }
        const { id } = req.params;
        const ctx = getClientContext(req);
        await auth_service_1.authService.revokeInvitation(id, req.user, ctx);
        res.status(200).json({
            success: true,
            message: 'Broker invitation has been revoked.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.revokeInvitation = revokeInvitation;
const getPendingInvitations = async (req, res, next) => {
    try {
        const invitations = await auth_service_1.authService.getPendingInvitations();
        res.status(200).json({
            success: true,
            count: invitations.length,
            data: invitations,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingInvitations = getPendingInvitations;
const getAuditLogs = async (req, res, next) => {
    try {
        const { limit, skip, action, resourceType, actorId } = req.query;
        const result = await audit_service_1.auditService.getLogs({
            limit: limit ? parseInt(limit, 10) : undefined,
            skip: skip ? parseInt(skip, 10) : undefined,
            action: action,
            resourceType: resourceType,
            actorId: actorId,
        });
        res.status(200).json({
            success: true,
            data: result.logs,
            total: result.total,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogs = getAuditLogs;
