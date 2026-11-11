import mongoose, { Schema } from 'mongoose';
import { IInquiry, IInternalNote } from '../types';

const InternalNoteSchema = new Schema<IInternalNote>(
  {
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['internal', 'supplier', 'customer_call'],
      default: 'internal',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const InquirySchema = new Schema<IInquiry>(
  {
    referenceCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'whatsapp'],
      default: 'email',
    },
    departureLocation: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    departureDate: { type: String, required: true },
    returnDate: { type: String },
    isFlexibleDates: { type: Boolean, default: false },
    travellers: { type: Number, required: true, min: 1 },
    requestedServices: [
      {
        type: String,
        enum: ['private_jet', 'superyacht', 'both', 'accommodation', 'bespoke_experiences'],
      },
    ],
    budgetRange: { type: String, required: true },
    travelPreferences: [{ type: String }],
    specialRequests: { type: String },
    interestedAircraftId: { type: String },
    interestedYachtId: { type: String },
    interestedDestinationId: { type: String },
    status: {
      type: String,
      enum: ['new', 'in_review', 'supplier_contacted', 'quote_sent', 'negotiating', 'confirmed', 'archived'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['standard', 'high', 'vip'],
      default: 'standard',
    },
    assignedTo: { type: String },
    assignedBrokerName: { type: String },
    internalNotes: [InternalNoteSchema],
    supplierNotes: { type: String },
  },
  { timestamps: true }
);

InquirySchema.index({ status: 1, createdAt: -1 });
InquirySchema.index({ assignedTo: 1, status: 1 });
InquirySchema.index({ email: 1 });

export const InquiryModel = mongoose.model<IInquiry>('Inquiry', InquirySchema);
