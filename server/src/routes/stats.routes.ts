import { Router } from 'express';
import { getStatsOverview } from '../controllers/stats.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/overview', authenticate, requireRole(['admin', 'broker']), getStatsOverview);

export default router;

