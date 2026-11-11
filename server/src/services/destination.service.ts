import mongoose from 'mongoose';
import { DestinationModel } from '../models/Destination';
import { IDestination } from '../types';
import { ensureDatabaseConnected } from '../config/database';
import { NotFoundError } from '../utils/errors';

export interface DestinationFilterOptions {
  region?: string;
  search?: string;
  onlyPublished?: boolean;
}

export class DestinationService {
  async getAll(options: DestinationFilterOptions = {}): Promise<IDestination[]> {
    ensureDatabaseConnected();

    const query: any = {};
    if (options.onlyPublished !== false) {
      query.isPublished = true;
    }
    if (options.region) {
      query.region = new RegExp(options.region.trim(), 'i');
    }
    if (options.search) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { region: searchRegex },
        { description: searchRegex },
        { tagline: searchRegex },
      ];
    }

    const destinations = await DestinationModel.find(query)
      .sort({ featured: -1, name: 1 })
      .lean();

    return destinations as unknown as IDestination[];
  }

  async getByIdOrSlug(idOrSlug: string): Promise<IDestination> {
    ensureDatabaseConnected();

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const destination = await DestinationModel.findOne(query).lean();
    if (!destination) {
      throw new NotFoundError(`Destination not found for identifier or slug: ${idOrSlug}`);
    }
    return destination as unknown as IDestination;
  }

  async create(data: Partial<IDestination>): Promise<IDestination> {
    ensureDatabaseConnected();
    const created = await DestinationModel.create(data);
    return created.toObject() as IDestination;
  }

  async update(id: string, data: Partial<IDestination>): Promise<IDestination> {
    ensureDatabaseConnected();
    const updated = await DestinationModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      throw new NotFoundError(`Destination not found with identifier: ${id}`);
    }
    return updated as unknown as IDestination;
  }
}

export const destinationService = new DestinationService();

