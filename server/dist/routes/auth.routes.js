"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validators_1 = require("../validators");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public Authentication & Onboarding Endpoints
router.post('/login', rateLimiter_1.authLimiter, (0, validate_1.validateBody)(validators_1.loginSchema), auth_controller_1.login);
router.get('/invite/:token', rateLimiter_1.authLimiter, auth_controller_1.getInvitationDetails);
router.post('/accept-invite', rateLimiter_1.authLimiter, (0, validate_1.validateBody)(validators_1.acceptInviteSchema), auth_controller_1.acceptInvitation);
// Authenticated Broker Operations
router.post('/logout', auth_1.authenticate, auth_controller_1.logout);
router.get('/me', auth_1.authenticate, auth_controller_1.getMe);
router.get('/brokers', auth_1.authenticate, auth_controller_1.getBrokers);
// Admin-Only Broker Management & RBAC Endpoints
router.post('/invite', auth_1.authenticate, (0, auth_1.requirePermission)('brokers.invite'), (0, validate_1.validateBody)(validators_1.inviteBrokerSchema), auth_controller_1.inviteBroker);
router.get('/invitations/pending', auth_1.authenticate, (0, auth_1.requirePermission)('brokers.invite'), auth_controller_1.getPendingInvitations);
router.post('/invitations/:id/revoke', auth_1.authenticate, (0, auth_1.requirePermission)('brokers.invite'), auth_controller_1.revokeInvitation);
router.patch('/brokers/:id/status', auth_1.authenticate, (0, auth_1.requirePermission)('brokers.deactivate'), (0, validate_1.validateBody)(validators_1.updateBrokerStatusSchema), auth_controller_1.updateBrokerStatus);
// Admin-Only Audit Log Viewer
router.get('/audit-logs', auth_1.authenticate, (0, auth_1.requirePermission)('audit.read'), auth_controller_1.getAuditLogs);
exports.default = router;
