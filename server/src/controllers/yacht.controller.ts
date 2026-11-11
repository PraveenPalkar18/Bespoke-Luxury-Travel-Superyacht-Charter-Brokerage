import { Request, Response, NextFunction } from 'express';
import { yachtService } from '../services/yacht.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllYachts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { region, search, all, page, limit } = req.query;
    const onlyPublished = all !== 'true';

    const result = await yachtService.getAll({
      region: region as string,
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

export const getYachtById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const yacht = await yachtService.getById(id);

    res.status(200).json({
      success: true,
      data: yacht,
    });
  } catch (error) {
    next(error);
  }
};

export const createYacht = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await yachtService.create(req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Superyacht added to catalogue successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateYacht = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await yachtService.update(id, req.body);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Superyacht updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteYacht = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await yachtService.delete(id);

    res.status(200).json({
      success: true,
      message: 'Superyacht removed from catalogue successfully',
    });
  } catch (error) {
    next(error);
  }
};
