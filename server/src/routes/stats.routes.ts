import { Router } from 'express';
import { getStatsOverview } from '../controllers/stats.controller';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.get(
  '/overview',
  authenticate,
  requirePermission(['analytics.read.all', 'analytics.read.assigned']),
  getStatsOverview
);

export default router;
