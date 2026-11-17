import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  getBrokers,
  inviteBroker,
  getInvitationDetails,
  acceptInvitation,
  updateBrokerStatus,
  revokeInvitation,
  getPendingInvitations,
  getAuditLogs,
} from '../controllers/auth.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  loginSchema,
  inviteBrokerSchema,
  acceptInviteSchema,
  updateBrokerStatusSchema,
} from '../validators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public Authentication & Onboarding Endpoints
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/invite/:token', authLimiter, getInvitationDetails);
router.post('/accept-invite', authLimiter, validateBody(acceptInviteSchema), acceptInvitation);

// Authenticated Broker Operations
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.get('/brokers', authenticate, getBrokers);

// Admin-Only Broker Management & RBAC Endpoints
router.post(
  '/invite',
  authenticate,
  requirePermission('brokers.invite'),
  validateBody(inviteBrokerSchema),
  inviteBroker
);

router.get(
  '/invitations/pending',
  authenticate,
  requirePermission('brokers.invite'),
  getPendingInvitations
);

router.post(
  '/invitations/:id/revoke',
  authenticate,
  requirePermission('brokers.invite'),
  revokeInvitation
);

router.patch(
  '/brokers/:id/status',
  authenticate,
  requirePermission('brokers.deactivate'),
  validateBody(updateBrokerStatusSchema),
  updateBrokerStatus
);

// Admin-Only Audit Log Viewer
router.get('/audit-logs', authenticate, requirePermission('audit.read'), getAuditLogs);

export default router;
