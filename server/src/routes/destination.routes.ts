import { Router } from 'express';
import {
  getAllDestinations,
  getDestinationByIdOrSlug,
  createDestination,
  updateDestination,
} from '../controllers/destination.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { destinationSchema } from '../validators';

const router = Router();

router.get('/', getAllDestinations);
router.get('/:id', getDestinationByIdOrSlug);
router.post('/', authenticate, requireRole(['admin']), validateBody(destinationSchema), createDestination);
router.patch('/:id', authenticate, requireRole(['admin']), updateDestination);

export default router;

