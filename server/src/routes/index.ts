import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes';
import aircraftRoutes from './aircraft.routes';
import yachtRoutes from './yacht.routes';
import destinationRoutes from './destination.routes';
import inquiryRoutes from './inquiry.routes';
import statsRoutes from './stats.routes';
import proposalRoutes from './proposal.routes';
import bookingRoutes from './booking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/aircraft', aircraftRoutes);
router.use('/yachts', yachtRoutes);
router.use('/destinations', destinationRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/stats', statsRoutes);
router.use('/proposals', proposalRoutes);
router.use('/bookings', bookingRoutes);

// Health check distinguishing application health from database connectivity
router.get('/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'healthy',
    application: 'healthy',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    service: 'Aurelia & Co. Luxury Brokerage API',
  });
});

export default router;

