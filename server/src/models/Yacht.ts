import mongoose, { Schema } from 'mongoose';
import { IYacht } from '../types';

const YachtSchema = new Schema<IYacht>(
  {
    name: { type: String, required: true, trim: true },
    builder: { type: String, required: true, trim: true },
    yearBuilt: { type: Number, required: true },
    length: { type: Number, required: true, min: 10 },
    lengthFeet: { type: Number, required: true, min: 30 },
    guestCapacity: { type: Number, required: true, min: 1 },
    cabins: { type: Number, required: true, min: 1 },
    crew: { type: Number, required: true, min: 1 },
    beam: { type: Number, required: true },
    draft: { type: Number, required: true },
    cruisingSpeed: { type: Number, required: true },
    weeklyRateEstimate: { type: Number },
    regions: [{ type: String }],
    amenities: [{ type: String }],
    tendersAndToys: [{ type: String }],
    images: [{ type: String }],
    featuredImage: { type: String, required: true },
    description: { type: String, required: true },
    editorialSummary: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

YachtSchema.index({ isPublished: 1, guestCapacity: 1 });
YachtSchema.index({ regions: 1, isPublished: 1 });
YachtSchema.index({ featured: 1 });

export const YachtModel = mongoose.model<IYacht>('Yacht', YachtSchema);
