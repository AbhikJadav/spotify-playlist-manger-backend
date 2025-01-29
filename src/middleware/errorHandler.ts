import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface CustomError extends Error {
  status?: number;
  code?: string | number;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err instanceof MongoError) {
    if (err.code === 11000) {
      statusCode = 400;
      message = 'Duplicate key error';
    }
  } else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
