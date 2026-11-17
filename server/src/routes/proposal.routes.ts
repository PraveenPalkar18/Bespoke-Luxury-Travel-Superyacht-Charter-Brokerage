import { Router } from 'express';
import {
  createProposal,
  getProposalsByInquiry,
  getProposalById,
  updateProposal,
  sendProposal,
  deleteProposal,
  getPublicProposal,
  respondPublicProposal,
} from '../controllers/proposal.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createProposalSchema,
  updateProposalSchema,
  clientResponseSchema,
} from '../validators';

const router = Router();

// Public Client Presentation Access (Secure Token-gated)
router.get('/public/:token', getPublicProposal);
router.post(
  '/public/:token/respond',
  validateBody(clientResponseSchema),
  respondPublicProposal
);

// Protected Broker & Admin Operations with Centralized RBAC
router.post(
  '/',
  authenticate,
  requirePermission('proposals.create'),
  validateBody(createProposalSchema),
  createProposal
);

router.get(
  '/inquiry/:inquiryId',
  authenticate,
  requirePermission(['proposals.read.all', 'proposals.read.assigned']),
  getProposalsByInquiry
);

router.get(
  '/:id',
  authenticate,
  requirePermission(['proposals.read.all', 'proposals.read.assigned']),
  getProposalById
);

router.patch(
  '/:id',
  authenticate,
  requirePermission('proposals.update'),
  validateBody(updateProposalSchema),
  updateProposal
);

router.post(
  '/:id/send',
  authenticate,
  requirePermission('proposals.dispatch'),
  sendProposal
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('proposals.create'),
  deleteProposal
);

export default router;
