"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = exports.AuditService = void 0;
const AuditLog_1 = require("../models/AuditLog");
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
function sanitizeMetadata(data) {
    if (!data || typeof data !== 'object')
        return data;
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.has(lowerKey)) {
            sanitized[key] = '[REDACTED]';
        }
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeMetadata(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
class AuditService {
    async log(params) {
        try {
            const cleanMetadata = sanitizeMetadata(params.metadata);
            await AuditLog_1.AuditLogModel.create({
                actor: params.actor,
                action: params.action,
                resourceType: params.resourceType,
                resourceId: params.resourceId,
                metadata: cleanMetadata,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                timestamp: new Date(),
            });
        }
        catch (err) {
            // Never let an audit logging failure crash the primary business operation
            console.warn('[AuditService] Failed to record audit log:', err.message);
        }
    }
    async getLogs(params) {
        const query = {};
        if (params.action)
            query.action = params.action;
        if (params.resourceType)
            query.resourceType = params.resourceType;
        if (params.actorId)
            query['actor.id'] = params.actorId;
        const limit = Math.min(params.limit || 50, 100);
        const skip = params.skip || 0;
        const [logs, total] = await Promise.all([
            AuditLog_1.AuditLogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
            AuditLog_1.AuditLogModel.countDocuments(query),
        ]);
        return { logs: logs, total };
    }
}
exports.AuditService = AuditService;
exports.auditService = new AuditService();
