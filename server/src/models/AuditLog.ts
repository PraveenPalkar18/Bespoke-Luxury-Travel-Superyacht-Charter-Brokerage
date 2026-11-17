import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IAuditLog extends Document {
  actor: {
    id?: string;
    email?: string;
    name?: string;
    role?: UserRole | 'system' | 'anonymous';
  };
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      id: { type: String, index: true },
      email: { type: String, trim: true },
      name: { type: String, trim: true },
      role: { type: String, trim: true },
    },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ 'actor.id': 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
