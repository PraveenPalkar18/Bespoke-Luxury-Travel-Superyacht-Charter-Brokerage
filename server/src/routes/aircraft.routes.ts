import { Router } from 'express';
import {
  getAllAircraft,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft,
} from '../controllers/aircraft.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { aircraftSchema } from '../validators';

const router = Router();

router.get('/', getAllAircraft);
router.get('/:id', getAircraftById);
router.post('/', authenticate, requirePermission('catalogue.create'), validateBody(aircraftSchema), createAircraft);
router.patch('/:id', authenticate, requirePermission('catalogue.update'), updateAircraft);
router.delete('/:id', authenticate, requirePermission('catalogue.delete'), deleteAircraft);

export default router;
