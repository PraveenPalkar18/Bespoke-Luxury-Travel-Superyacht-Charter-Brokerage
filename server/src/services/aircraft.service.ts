import { AircraftModel } from '../models/Aircraft';
import { IAircraft, PaginatedResult } from '../types';
import { ensureDatabaseConnected } from '../config/database';
import { NotFoundError } from '../utils/errors';

export interface AircraftFilterOptions {
  category?: string;
  search?: string;
  onlyPublished?: boolean;
  page?: number;
  limit?: number;
}

export class AircraftService {
  async getAll(options: AircraftFilterOptions = {}): Promise<PaginatedResult<IAircraft>> {
    ensureDatabaseConnected();

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(options.limit || 20, 100));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.onlyPublished !== false) {
      query.isPublished = true;
    }
    if (options.category) {
      query.category = options.category;
    }
    if (options.search) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { model: searchRegex },
        { description: searchRegex },
      ];
    }

    const [total, data] = await Promise.all([
      AircraftModel.countDocuments(query),
      AircraftModel.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: data as unknown as IAircraft[],
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

  async getById(id: string): Promise<IAircraft> {
    ensureDatabaseConnected();
    const aircraft = await AircraftModel.findById(id).lean();
    if (!aircraft) {
      throw new NotFoundError(`Aircraft not found with identifier: ${id}`);
    }
    return aircraft as unknown as IAircraft;
  }

  async create(data: Partial<IAircraft>): Promise<IAircraft> {
    ensureDatabaseConnected();
    const created = await AircraftModel.create(data);
    return created.toObject() as IAircraft;
  }

  async update(id: string, data: Partial<IAircraft>): Promise<IAircraft> {
    ensureDatabaseConnected();
    const updated = await AircraftModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      throw new NotFoundError(`Aircraft not found with identifier: ${id}`);
    }
    return updated as unknown as IAircraft;
  }

  async delete(id: string): Promise<boolean> {
    ensureDatabaseConnected();
    const deleted = await AircraftModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Aircraft not found with identifier: ${id}`);
    }
    return true;
  }
}

export const aircraftService = new AircraftService();

