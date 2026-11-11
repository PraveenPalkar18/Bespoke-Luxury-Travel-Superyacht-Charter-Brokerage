import { Router } from 'express';
import {
  getAllAircraft,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft,
} from '../controllers/aircraft.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { aircraftSchema } from '../validators';

const router = Router();

router.get('/', getAllAircraft);
router.get('/:id', getAircraftById);
router.post('/', authenticate, requireRole(['admin']), validateBody(aircraftSchema), createAircraft);
router.patch('/:id', authenticate, requireRole(['admin']), updateAircraft);
router.delete('/:id', authenticate, requireRole(['admin']), deleteAircraft);

export default router;

