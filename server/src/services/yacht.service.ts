import { YachtModel } from '../models/Yacht';
import { IYacht, PaginatedResult } from '../types';
import { ensureDatabaseConnected } from '../config/database';
import { NotFoundError } from '../utils/errors';

export interface YachtFilterOptions {
  region?: string;
  search?: string;
  onlyPublished?: boolean;
  page?: number;
  limit?: number;
}

export class YachtService {
  async getAll(options: YachtFilterOptions = {}): Promise<PaginatedResult<IYacht>> {
    ensureDatabaseConnected();

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(options.limit || 20, 100));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.onlyPublished !== false) {
      query.isPublished = true;
    }
    if (options.region) {
      query.regions = { $in: [new RegExp(options.region.trim(), 'i')] };
    }
    if (options.search) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { builder: searchRegex },
        { description: searchRegex },
        { regions: { $in: [searchRegex] } },
      ];
    }

    const [total, data] = await Promise.all([
      YachtModel.countDocuments(query),
      YachtModel.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: data as unknown as IYacht[],
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

  async getById(id: string): Promise<IYacht> {
    ensureDatabaseConnected();
    const yacht = await YachtModel.findById(id).lean();
    if (!yacht) {
      throw new NotFoundError(`Superyacht not found with identifier: ${id}`);
    }
    return yacht as unknown as IYacht;
  }

  async create(data: Partial<IYacht>): Promise<IYacht> {
    ensureDatabaseConnected();
    const created = await YachtModel.create(data);
    return created.toObject() as IYacht;
  }

  async update(id: string, data: Partial<IYacht>): Promise<IYacht> {
    ensureDatabaseConnected();
    const updated = await YachtModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      throw new NotFoundError(`Superyacht not found with identifier: ${id}`);
    }
    return updated as unknown as IYacht;
  }

  async delete(id: string): Promise<boolean> {
    ensureDatabaseConnected();
    const deleted = await YachtModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Superyacht not found with identifier: ${id}`);
    }
    return true;
  }
}

export const yachtService = new YachtService();

