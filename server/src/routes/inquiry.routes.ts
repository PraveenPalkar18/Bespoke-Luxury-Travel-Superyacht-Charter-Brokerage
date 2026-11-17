import { Router } from 'express';
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  addInternalNote,
} from '../controllers/inquiry.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createInquirySchema,
  updateInquirySchema,
  addInternalNoteSchema,
} from '../validators';
import { inquiryLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public multi-step bespoke journey enquiry submission with rate limiter
router.post('/', inquiryLimiter, validateBody(createInquirySchema), createInquiry);

// Protected broker & admin workflow with centralized RBAC permissions
router.get(
  '/',
  authenticate,
  requirePermission(['enquiries.read.all', 'enquiries.read.assigned']),
  getAllInquiries
);

router.get(
  '/:id',
  authenticate,
  requirePermission(['enquiries.read.all', 'enquiries.read.assigned']),
  getInquiryById
);

router.patch(
  '/:id',
  authenticate,
  requirePermission('enquiries.update'),
  validateBody(updateInquirySchema),
  updateInquiry
);

router.post(
  '/:id/notes',
  authenticate,
  requirePermission('enquiries.update'),
  validateBody(addInternalNoteSchema),
  addInternalNote
);

export default router;
