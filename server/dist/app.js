"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const csrf_1 = require("./middleware/csrf");
const config_1 = require("./config");
const database_1 = require("./config/database");
const createApp = () => {
    const app = (0, express_1.default)();
    // Trust reverse proxy (Vercel, AWS, etc.) for rate limiter & client IP resolution
    app.set('trust proxy', 1);
    // Security Middleware
    app.use((0, helmet_1.default)());
    const allowedOrigins = [
        config_1.config.clientUrl,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ].filter(Boolean);
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matched origins
            if (!origin ||
                allowedOrigins.includes(origin) ||
                /^https:\/\/.*\.vercel\.app$/.test(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`Origin ${origin} not allowed by CORS policy`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    }));
    // Parsing Middleware
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: '5mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '5mb' }));
    // Anti-CSRF Protection for cookie-authenticated state-changing requests
    app.use(csrf_1.csrfProtection);
    // Lazy DB connection middleware (crucial for serverless environments)
    if (process.env.NODE_ENV !== 'test') {
        app.use(async (req, res, next) => {
            // Let health check evaluate and report independent application/database state
            if (req.path === '/api/health' || req.path === '/health') {
                return next();
            }
            const initialReadyState = mongoose_1.default.connection.readyState;
            if (initialReadyState !== 1) {
                try {
                    const connected = await (0, database_1.connectDatabase)();
                    const currentReadyState = mongoose_1.default.connection.readyState;
                    if (!connected || currentReadyState !== 1) {
                        return res.status(503).json({
                            success: false,
                            error: 'DatabaseUnavailableError',
                            message: 'The luxury travel brokerage database is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in your environment.',
                        });
                    }
                }
                catch (err) {
                    return res.status(503).json({
                        success: false,
                        error: 'DatabaseUnavailableError',
                        message: 'The luxury travel brokerage database is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in your environment.',
                    });
                }
            }
            next();
        });
    }
    // Global rate limiter for API routes
    app.use(rateLimiter_1.apiLimiter);
    // Logging
    if (process.env.NODE_ENV !== 'test') {
        app.use((0, morgan_1.default)('dev'));
    }
    // API Routes (mount at /api and / to handle both prefixed and root service routings)
    app.use('/api', routes_1.default);
    app.use(routes_1.default);
    // 404 Handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: `API Route not found: ${req.method} ${req.originalUrl}`,
        });
    });
    // Centralized Error Handler
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
