import { AuditLogModel, IAuditLog } from '../models/AuditLog';
import { UserRole } from '../types';

export interface AuditActor {
  id?: string;
  email?: string;
  name?: string;
  role?: UserRole | 'system' | 'anonymous';
}

export interface CreateAuditLogParams {
  actor: AuditActor;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'rawtoken',
  'accesstoken',
  'refreshtoken',
  'secret',
  'jwtsecret',
  'authorization',
  'cookie',
]);

function sanitizeMetadata(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data || typeof data !== 'object') return data;

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class AuditService {
  async log(params: CreateAuditLogParams): Promise<void> {
    try {
      const cleanMetadata = sanitizeMetadata(params.metadata);
      await AuditLogModel.create({
        actor: params.actor,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        metadata: cleanMetadata,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
      });
    } catch (err: any) {
      // Never let an audit logging failure crash the primary business operation
      console.warn('[AuditService] Failed to record audit log:', err.message);
    }
  }

  async getLogs(params: {
    limit?: number;
    skip?: number;
    action?: string;
    resourceType?: string;
    actorId?: string;
  }): Promise<{ logs: IAuditLog[]; total: number }> {
    const query: any = {};
    if (params.action) query.action = params.action;
    if (params.resourceType) query.resourceType = params.resourceType;
    if (params.actorId) query['actor.id'] = params.actorId;

    const limit = Math.min(params.limit || 50, 100);
    const skip = params.skip || 0;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLogModel.countDocuments(query),
    ]);

    return { logs: logs as unknown as IAuditLog[], total };
  }
}

export const auditService = new AuditService();
