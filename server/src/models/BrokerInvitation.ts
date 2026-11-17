import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IBrokerInvitation extends Document {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  title?: string;
  tokenHash: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  invitedBy: mongoose.Types.ObjectId;
  invitedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrokerInvitationSchema = new Schema<IBrokerInvitation>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'broker'], default: 'broker', required: true },
    phone: { type: String, trim: true },
    title: { type: String, trim: true, default: 'Charter Broker' },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    isUsed: { type: Boolean, default: false, index: true },
    usedAt: { type: Date },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedByName: { type: String, trim: true },
  },
  { timestamps: true }
);

BrokerInvitationSchema.index({ email: 1, isUsed: 1, isRevoked: 1 });

export const BrokerInvitationModel = mongoose.model<IBrokerInvitation>(
  'BrokerInvitation',
  BrokerInvitationSchema
);
