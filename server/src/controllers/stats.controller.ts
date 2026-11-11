import { Response, NextFunction } from 'express';
import { statsService } from '../services/stats.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const getOverviewStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await statsService.getOverviewStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatsOverview = getOverviewStats;
