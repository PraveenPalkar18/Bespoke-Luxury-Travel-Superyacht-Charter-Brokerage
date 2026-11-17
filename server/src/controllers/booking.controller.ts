import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { bookingService } from '../services/booking.service';

export const listBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await bookingService.listBookings(req.user);
    res.status(200).json({
      success: true,
      data: bookings,
      total: bookings.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByProposal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.getBookingByProposalId(req.params.proposalId, req.user);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'No booking record found for this proposal.',
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const recordSupplierConfirmation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, serviceType } = req.params;
    const { supplierName, referenceOrContractNumber, notes } = req.body;

    const booking = await bookingService.recordSupplierConfirmation(
      id,
      serviceType as 'aircraft' | 'yacht' | 'accommodation',
      { supplierName, referenceOrContractNumber, notes },
      req.user
    );

    res.status(200).json({
      success: true,
      data: booking,
      message: `Supplier confirmation for ${serviceType} recorded successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
