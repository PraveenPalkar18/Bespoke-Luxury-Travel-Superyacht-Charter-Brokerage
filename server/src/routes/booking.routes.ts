import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/auth';
import {
  listBookings,
  getBookingById,
  getBookingByProposal,
  recordSupplierConfirmation,
} from '../controllers/booking.controller';

const router = Router();

router.use(authenticate);

// View bookings
router.get('/', requirePermission('bookings.read.assigned'), listBookings);
router.get('/proposal/:proposalId', requirePermission('bookings.read.assigned'), getBookingByProposal);
router.get('/:id', requirePermission('bookings.read.assigned'), getBookingById);

// Record supplier confirmation (aircraft, yacht, accommodation)
router.patch(
  '/:id/suppliers/:serviceType',
  requirePermission('bookings.manage'),
  recordSupplierConfirmation
);

export default router;
