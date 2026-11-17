import mongoose, { Schema } from 'mongoose';
import { IBooking, ISupplierConfirmation } from '../types';

const SupplierConfirmationSchema = new Schema<ISupplierConfirmation>(
  {
    required: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
    supplierName: { type: String, trim: true },
    confirmedAt: { type: Date },
    confirmedBy: { type: String },
    referenceOrContractNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    referenceCode: { type: String, required: true, unique: true },
    inquiryId: { type: String, required: true, index: true },
    proposalId: { type: String, required: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, lowercase: true, trim: true },
    assignedBrokerId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending_supplier_confirmation', 'confirmed', 'cancelled'],
      default: 'pending_supplier_confirmation',
      index: true,
    },
    supplierConfirmations: {
      aircraft: {
        type: SupplierConfirmationSchema,
        default: () => ({ required: false, confirmed: false }),
      },
      yacht: {
        type: SupplierConfirmationSchema,
        default: () => ({ required: false, confirmed: false }),
      },
      accommodation: {
        type: SupplierConfirmationSchema,
        default: () => ({ required: false, confirmed: false }),
      },
    },
    totalAmount: { type: Number, required: true },
    confirmedAt: { type: Date },
    confirmedBy: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ assignedBrokerId: 1, status: 1 });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
