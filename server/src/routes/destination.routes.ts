import { Router } from 'express';
import {
  getAllDestinations,
  getDestinationByIdOrSlug,
  createDestination,
  updateDestination,
} from '../controllers/destination.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { destinationSchema } from '../validators';

const router = Router();

router.get('/', getAllDestinations);
router.get('/:id', getDestinationByIdOrSlug);
router.post('/', authenticate, requirePermission('catalogue.create'), validateBody(destinationSchema), createDestination);
router.patch('/:id', authenticate, requirePermission('catalogue.update'), updateDestination);

export default router;
