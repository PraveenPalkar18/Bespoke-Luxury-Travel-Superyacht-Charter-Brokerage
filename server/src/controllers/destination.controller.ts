import { Request, Response, NextFunction } from 'express';
import { destinationService } from '../services/destination.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { region, search, all } = req.query;
    const onlyPublished = all !== 'true';

    const destinations = await destinationService.getAll({
      region: region as string,
      search: search as string,
      onlyPublished,
    });

    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationByIdOrSlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const destination = await destinationService.getByIdOrSlug(id);

    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const createDestination = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await destinationService.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Destination created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await destinationService.update(id, req.body);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Destination updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
