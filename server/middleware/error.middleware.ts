import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Logger } from '../services/logger.service';
// Define error types locally since @shared/types doesn't exist
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  public readonly field: string;
  public readonly value: unknown;
  public readonly expectedType: string;

  constructor(message: string, field: string, value: unknown, expectedType: string) {
    super(message, 400);
    this.field = field;
    this.value = value;
    this.expectedType = expectedType;
  }
}

class DatabaseError extends AppError {
  public readonly operation: string;
  public readonly table?: string;
  public readonly originalError: Error;

  constructor(message: string, operation: string, table?: string, originalError?: Error) {
    super(message, 500);
    this.operation = operation;
    this.table = table;
    this.originalError = originalError || new Error(message);
  }
}

const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

const isOperationalError = (error: AppError): boolean => {
  return error.isOperational;
};

const formatErrorResponse = (error: AppError) => {
  return {
    error: {
      message: error.message,
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    }
  };
};

const logger = new Logger('ErrorMiddleware');

// Async handler wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let processedError: AppError;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    processedError = new ValidationError(
      'Request validation failed',
      validationErrors[0]?.field || 'unknown',
      'invalid',
      'valid input'
    );
  }
  // Handle known application errors
  else if (isAppError(error)) {
    processedError = error;
  }
  // Handle unknown errors
  else {
    processedError = new AppError(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error'
        : error.message || 'Unknown error occurred',
      500,
      false
    );
  }

  // Log the error
  if (isOperationalError(processedError)) {
    logger.warn('Operational error occurred', {
      error: processedError.message,
      statusCode: processedError.statusCode,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  } else {
    logger.error('Non-operational error occurred', {
      error: processedError.message,
      stack: processedError.stack,
      statusCode: processedError.statusCode,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }

  // Send error response
  const errorResponse = formatErrorResponse(processedError);
  res.status(processedError.statusCode).json(errorResponse);
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Database error handler
export const handleDatabaseError = (error: unknown, operation: string, table?: string): never => {
  logger.error('Database error occurred', {
    operation,
    table,
    error: error instanceof Error ? error.message : String(error)
  });

  if (error instanceof Error) {
    throw new DatabaseError(error.message, operation, table, error);
  }
  
  throw new DatabaseError('Unknown database error', operation, table);
};

// Validation error handler
export const handleValidationError = (
  field: string,
  value: unknown,
  expectedType: string,
  customMessage?: string
): never => {
  const message = customMessage || `Invalid value for ${field}`;
  throw new ValidationError(message, field, value, expectedType);
};

// External service error handler
export const handleExternalServiceError = (
  serviceName: string,
  error: unknown,
  context?: Record<string, unknown>
): never => {
  logger.error('External service error', {
    serviceName,
    error: error instanceof Error ? error.message : String(error),
    ...context
  });

  const message = error instanceof Error ? error.message : 'External service unavailable';
  throw new AppError(`${serviceName} service error: ${message}`, 502);
};

// Process unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
  
  // In production, gracefully shutdown
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Process uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Always exit on uncaught exception
  process.exit(1);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));