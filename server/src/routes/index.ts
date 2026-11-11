import { Router } from 'express';
import authRoutes from './auth.routes';
import aircraftRoutes from './aircraft.routes';
import yachtRoutes from './yacht.routes';
import destinationRoutes from './destination.routes';
import inquiryRoutes from './inquiry.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/aircraft', aircraftRoutes);
router.use('/yachts', yachtRoutes);
router.use('/destinations', destinationRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/stats', statsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Aurelia & Co. Luxury Brokerage API',
  });
});

export default router;

