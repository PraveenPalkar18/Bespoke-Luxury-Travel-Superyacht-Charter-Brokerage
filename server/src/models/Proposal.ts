import mongoose, { Schema } from 'mongoose';
import { IProposal } from '../types';

const ItineraryDaySchema = new Schema(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    transportMode: {
      type: String,
      enum: ['private_jet', 'superyacht', 'helicopter', 'chauffeur', 'leisure'],
      default: 'leisure',
    },
    accommodation: { type: String },
    image: { type: String },
  },
  { _id: false }
);

const ProposalPricingSchema = new Schema(
  {
    currency: { type: String, enum: ['USD', 'EUR', 'GBP'], default: 'USD' },
    aircraftCharterPrice: { type: Number, default: 0 },
    yachtCharterPrice: { type: Number, default: 0 },
    estimatedAPA: { type: Number, default: 0 },
    conciergeAndCrewGratuity: { type: Number, default: 0 },
    taxesAndFees: { type: Number, default: 0 },
    totalEstimatedCost: { type: Number, required: true },
  },
  { _id: false }
);

const ProposalAircraftSpecSchema = new Schema(
  {
    aircraftId: { type: String },
    name: { type: String, required: true },
    model: { type: String, required: true },
    category: { type: String, required: true },
    departureFBO: { type: String },
    arrivalFBO: { type: String },
    flightHours: { type: Number },
    passengerCount: { type: Number },
    featuredImage: { type: String },
  },
  { _id: false }
);

const ProposalYachtSpecSchema = new Schema(
  {
    yachtId: { type: String },
    name: { type: String, required: true },
    builder: { type: String, required: true },
    lengthFeet: { type: Number, required: true },
    embarkationPort: { type: String, required: true },
    disembarkationPort: { type: String, required: true },
    charterDays: { type: Number, required: true },
    guestCount: { type: Number },
    featuredImage: { type: String },
  },
  { _id: false }
);

const ProposalSchema = new Schema<IProposal>(
  {
    inquiryId: { type: String, required: true, index: true },
    referenceCode: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, lowercase: true, trim: true },
    createdById: { type: String, required: true },
    createdByName: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'],
      default: 'draft',
      index: true,
    },
    validUntil: { type: Date, required: true },
    clientAccessToken: { type: String, required: true, unique: true },
    executiveSummary: { type: String, required: true },
    brokerPersonalNote: { type: String },
    aircraft: ProposalAircraftSpecSchema,
    yacht: ProposalYachtSpecSchema,
    itinerary: [ItineraryDaySchema],
    pricing: { type: ProposalPricingSchema, required: true },
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    paymentTerms: {
      type: String,
      default:
        '50% deposit upon formal charter agreement execution. Balance and estimated APA due 30 days prior to departure.',
    },
    clientFeedback: {
      respondedAt: { type: Date },
      decision: { type: String, enum: ['accepted', 'declined', 'requested_changes'] },
      clientNotes: { type: String },
    },
  },
  { timestamps: true }
);

ProposalSchema.index({ inquiryId: 1, createdAt: -1 });

export const ProposalModel = mongoose.model<IProposal>('Proposal', ProposalSchema);

