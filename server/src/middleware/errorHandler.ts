import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal error occurred';
  let errorType = err.name || 'InternalServerError';

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
    errorType = 'BadRequestError';
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `A resource with this ${field} already exists.`;
    errorType = 'ConflictError';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationErrors = Object.values(err.errors || {}).map((e: any) => e.message);
    message = `Validation failed: ${validationErrors.join(', ')}`;
    errorType = 'ValidationError';
  }

  // MongoDB connection / topology errors
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'DatabaseUnavailableError'
  ) {
    statusCode = 503;
    message = 'The luxury travel brokerage database is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in your environment.';
    errorType = 'DatabaseUnavailableError';
  }

  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: errorType,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
