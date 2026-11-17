import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { csrfProtection } from './middleware/csrf';
import { config } from './config';
import { connectDatabase } from './config/database';

export const createApp = () => {
  const app = express();

  // Trust reverse proxy (Vercel, AWS, etc.) for rate limiter & client IP resolution
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet());

  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matched origins
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          /^https:\/\/.*\.vercel\.app$/.test(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    })
  );

  // Parsing Middleware
  app.use(cookieParser());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Anti-CSRF Protection for cookie-authenticated state-changing requests
  app.use('/api', csrfProtection);

  // Lazy DB connection middleware (crucial for serverless environments)
  if (process.env.NODE_ENV !== 'test') {
    app.use(async (req, res, next) => {
      // Let health check evaluate and report independent application/database state
      if (req.path === '/api/health' || req.path === '/health') {
        return next();
      }

      const initialReadyState = mongoose.connection.readyState as number;
      if (initialReadyState !== 1) {
        try {
          const connected = await connectDatabase();
          const currentReadyState = mongoose.connection.readyState as number;
          if (!connected || currentReadyState !== 1) {
            return res.status(503).json({
              success: false,
              error: 'DatabaseUnavailableError',
              message:
                'The luxury travel brokerage database is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in your environment.',
            });
          }
        } catch (err: any) {
          return res.status(503).json({
            success: false,
            error: 'DatabaseUnavailableError',
            message:
              'The luxury travel brokerage database is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in your environment.',
          });
        }
      }
      next();
    });
  }

  // Global rate limiter for API routes
  app.use('/api', apiLimiter);

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // API Routes
  app.use('/api', routes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `API Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
