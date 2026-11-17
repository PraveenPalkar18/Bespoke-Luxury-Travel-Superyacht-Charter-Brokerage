import { Router } from 'express';
import {
  getAllYachts,
  getYachtById,
  createYacht,
  updateYacht,
  deleteYacht,
} from '../controllers/yacht.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { yachtSchema } from '../validators';

const router = Router();

router.get('/', getAllYachts);
router.get('/:id', getYachtById);
router.post('/', authenticate, requirePermission('catalogue.create'), validateBody(yachtSchema), createYacht);
router.patch('/:id', authenticate, requirePermission('catalogue.update'), updateYacht);
router.delete('/:id', authenticate, requirePermission('catalogue.delete'), deleteYacht);

export default router;
