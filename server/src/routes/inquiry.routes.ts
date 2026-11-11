import { Router } from 'express';
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  addInternalNote,
} from '../controllers/inquiry.controller';
import { authenticate, requireRole } from '../middleware/auth';
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

// Protected broker & admin workflow
router.get('/', authenticate, requireRole(['admin', 'broker']), getAllInquiries);
router.get('/:id', authenticate, requireRole(['admin', 'broker']), getInquiryById);
router.patch('/:id', authenticate, requireRole(['admin', 'broker']), validateBody(updateInquirySchema), updateInquiry);
router.post('/:id/notes', authenticate, requireRole(['admin', 'broker']), validateBody(addInternalNoteSchema), addInternalNote);

export default router;
