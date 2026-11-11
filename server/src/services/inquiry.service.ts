import { InquiryModel } from '../models/Inquiry';
import { IInquiry, IInternalNote, InquiryStatus, PaginatedResult } from '../types';
import { ensureDatabaseConnected } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { isValidStatusTransition, VALID_STATUS_TRANSITIONS } from '../validators';

export interface InquiryFilterOptions {
  status?: InquiryStatus;
  search?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export class InquiryService {
  private generateReferenceCode(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `AUR-${year}-${randomSuffix}`;
  }

  async create(data: Partial<IInquiry>): Promise<IInquiry> {
    ensureDatabaseConnected();

    const referenceCode = this.generateReferenceCode();
    const inquiryPayload = {
      ...data,
      referenceCode,
      status: 'new' as InquiryStatus,
      internalNotes: [],
    };

    const created = await InquiryModel.create(inquiryPayload);
    return created.toObject() as IInquiry;
  }

  async getAll(options: InquiryFilterOptions = {}): Promise<PaginatedResult<IInquiry>> {
    ensureDatabaseConnected();

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(options.limit || 20, 100));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status) {
      query.status = options.status;
    }
    if (options.assignedTo) {
      query.assignedTo = options.assignedTo;
    }
    if (options.search) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [
        { customerName: searchRegex },
        { email: searchRegex },
        { destination: searchRegex },
        { departureLocation: searchRegex },
        { referenceCode: searchRegex },
      ];
    }

    const [total, data] = await Promise.all([
      InquiryModel.countDocuments(query),
      InquiryModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: data as unknown as IInquiry[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getById(id: string): Promise<IInquiry> {
    ensureDatabaseConnected();
    const inquiry = await InquiryModel.findById(id).lean();
    if (!inquiry) {
      throw new NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
    }
    return inquiry as unknown as IInquiry;
  }

  async update(id: string, updateData: Partial<IInquiry>): Promise<IInquiry> {
    ensureDatabaseConnected();

    const current = await InquiryModel.findById(id);
    if (!current) {
      throw new NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
    }

    // Enforce state transition rules
    if (updateData.status && updateData.status !== current.status) {
      const isValid = isValidStatusTransition(current.status, updateData.status);
      if (!isValid) {
        const allowed = VALID_STATUS_TRANSITIONS[current.status] || [];
        throw new BadRequestError(
          `Invalid inquiry status transition from "${current.status}" to "${updateData.status}". Permitted transitions: ${allowed.join(', ') || 'None'}.`
        );
      }
    }

    Object.assign(current, updateData);
    await current.save();

    return current.toObject() as IInquiry;
  }

  async addNote(
    id: string,
    noteData: { content: string; category?: 'internal' | 'supplier' | 'customer_call' },
    author: { id: string; name: string }
  ): Promise<IInquiry> {
    ensureDatabaseConnected();

    const note: Partial<IInternalNote> = {
      authorId: author.id,
      authorName: author.name,
      content: noteData.content,
      category: noteData.category || 'internal',
      createdAt: new Date(),
    };

    const updated = await InquiryModel.findByIdAndUpdate(
      id,
      { $push: { internalNotes: note } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      throw new NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
    }

    return updated as unknown as IInquiry;
  }
}

export const inquiryService = new InquiryService();

