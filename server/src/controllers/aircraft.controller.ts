import { Request, Response, NextFunction } from 'express';
import { aircraftService } from '../services/aircraft.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllAircraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search, all, page, limit } = req.query;
    const onlyPublished = all !== 'true';

    const result = await aircraftService.getAll({
      category: category as string,
      search: search as string,
      onlyPublished,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAircraftById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const aircraft = await aircraftService.getById(id);

    res.status(200).json({
      success: true,
      data: aircraft,
    });
  } catch (error) {
    next(error);
  }
};

export const createAircraft = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await aircraftService.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Aircraft created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateAircraft = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await aircraftService.update(id, req.body);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Aircraft updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAircraft = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await aircraftService.delete(id);

    res.status(200).json({
      success: true,
      message: 'Aircraft removed from fleet successfully',
    });
  } catch (error) {
    next(error);
  }
};
