import mongoose, { Schema } from 'mongoose';
import { IDestination } from '../types';

const DestinationSchema = new Schema<IDestination>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    region: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    bestTimeToVisit: { type: String, required: true },
    nearestAirports: [{ type: String }],
    featuredPorts: [{ type: String }],
    images: [{ type: String }],
    featuredImage: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DestinationSchema.index({ isPublished: 1, featured: 1 });

export const DestinationModel = mongoose.model<IDestination>('Destination', DestinationSchema);
