import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.error(`AppError: ${error.message}`, { 
      statusCode: error.statusCode,
      path: req.path,
      method: req.method
    });
    
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Unerwartete Fehler
  logger.error('Unexpected error:', error);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString()
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};