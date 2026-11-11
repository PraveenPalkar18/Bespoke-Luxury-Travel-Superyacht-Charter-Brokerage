import mongoose, { Schema } from 'mongoose';
import { IAircraft } from '../types';

const AircraftSchema = new Schema<IAircraft>(
  {
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Ultra Long-Range', 'Heavy Jet', 'Super Midsize', 'Midsize', 'VIP Airliner'],
      required: true,
    },
    passengerCapacity: { type: Number, required: true, min: 1 },
    range: { type: Number, required: true, min: 100 },
    cruiseSpeed: { type: Number, required: true, min: 200 },
    cabinHeight: { type: String, required: true },
    baggageCapacity: { type: String, required: true },
    hourlyRateEstimate: { type: Number },
    amenities: [{ type: String }],
    images: [{ type: String }],
    featuredImage: { type: String, required: true },
    description: { type: String, required: true },
    editorialSummary: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AircraftSchema.index({ isPublished: 1, category: 1 });
AircraftSchema.index({ featured: 1 });

export const AircraftModel = mongoose.model<IAircraft>('Aircraft', AircraftSchema);
