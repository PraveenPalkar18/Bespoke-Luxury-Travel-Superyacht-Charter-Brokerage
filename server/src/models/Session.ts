import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  csrfToken?: string;
  ipAddress?: string;
  userAgent?: string;
  isValid: boolean;
  expiresAt: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    csrfToken: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    isValid: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, required: true },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, isValid: 1 });
// TTL index to automatically clean up expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<ISession>('Session', SessionSchema);
