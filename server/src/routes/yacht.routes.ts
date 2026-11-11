import { Router } from 'express';
import {
  getAllYachts,
  getYachtById,
  createYacht,
  updateYacht,
  deleteYacht,
} from '../controllers/yacht.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { yachtSchema } from '../validators';

const router = Router();

router.get('/', getAllYachts);
router.get('/:id', getYachtById);
router.post('/', authenticate, requireRole(['admin']), validateBody(yachtSchema), createYacht);
router.patch('/:id', authenticate, requireRole(['admin']), updateYacht);
router.delete('/:id', authenticate, requireRole(['admin']), deleteYacht);

export default router;

