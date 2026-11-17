"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.inquiryLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    },
    message: {
        success: false,
        error: 'TooManyRequests',
        message: 'Too many authentication attempts from this IP address. Please attempt again in 15 minutes.',
    },
});
exports.inquiryLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 submissions per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'TooManyRequests',
        message: 'Enquiry submission limit reached for this session. For immediate priority concierge routing, please contact our private charter desk directly.',
    },
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'TooManyRequests',
        message: 'Rate threshold exceeded. Please throttle API requests.',
    },
});
