import { Request, Response, NextFunction } from 'express';
import { inquiryService } from '../services/inquiry.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { InquiryStatus } from '../types';

export const createInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const created = await inquiryService.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        id: created._id,
        referenceCode: created.referenceCode,
        customerName: created.customerName,
        destination: created.destination,
        status: created.status,
        createdAt: created.createdAt,
      },
      message:
        'Your bespoke journey enquiry has been received. A Senior Charter Director has been notified and will contact you promptly.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllInquiries = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search, assignedTo, page, limit } = req.query;

    const result = await inquiryService.getAll({
      status: status as InquiryStatus,
      search: search as string,
      assignedTo: assignedTo as string,
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

export const getInquiryById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const inquiry = await inquiryService.getById(id);

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiry = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await inquiryService.update(id, req.body);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Enquiry record updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addInternalNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const author = {
      id: req.user?.id || 'anonymous_broker',
      name: req.user?.name || 'Charter Broker',
    };

    const updated = await inquiryService.addNote(id, req.body, author);

    res.status(201).json({
      success: true,
      data: updated,
      message: 'Internal dossier memorandum registered successfully',
    });
  } catch (error) {
    next(error);
  }
};
