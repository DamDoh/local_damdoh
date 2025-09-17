import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import mongoose from 'mongoose';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env.config';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Error:', {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // Handle operational errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  }

  // Handle Express validator errors
  if (Array.isArray(err) && err.length > 0 && 'msg' in err[0] && 'param' in err[0]) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.map(error => ({
      field: error.param,
      message: error.msg
    }));
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate Field Error';
    errors = {
      field: Object.keys((err as any).keyValue)[0],
      message: 'Field already exists'
    };
  }

  // Send response
  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
};