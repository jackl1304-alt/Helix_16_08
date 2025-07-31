// Structured Error Classes for Type Safety and Better Error Handling

export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    stack?: string
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  public readonly name = 'ValidationError';
  
  constructor(
    message: string,
    public field: string,
    public value: unknown,
    public expectedType: string
  ) {
    super(`Validation failed for field '${field}': ${message}`, 400);
  }
}

export class DatabaseError extends AppError {
  public readonly name = 'DatabaseError';
  
  constructor(
    message: string,
    public operation: string,
    public table?: string,
    public originalError?: Error
  ) {
    super(`Database operation '${operation}' failed: ${message}`, 500);
  }
}

export class ApiError extends AppError {
  public readonly name = 'ApiError';
  
  constructor(
    message: string,
    statusCode: number,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message, statusCode);
  }
}

export class NotFoundError extends AppError {
  public readonly name = 'NotFoundError';
  
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404);
  }
}

export class AuthenticationError extends AppError {
  public readonly name = 'AuthenticationError';
  
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  public readonly name = 'AuthorizationError';
  
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class RateLimitError extends AppError {
  public readonly name = 'RateLimitError';
  
  constructor(
    public resetTime: Date,
    public limit: number,
    public windowMs: number
  ) {
    super(`Rate limit exceeded. Limit: ${limit} requests per ${windowMs}ms`, 429);
  }
}

export class ExternalServiceError extends AppError {
  public readonly name = 'ExternalServiceError';
  
  constructor(
    public serviceName: string,
    message: string,
    public originalError?: Error
  ) {
    super(`External service '${serviceName}' error: ${message}`, 502);
  }
}

export class ConfigurationError extends AppError {
  public readonly name = 'ConfigurationError';
  
  constructor(
    public configKey: string,
    message: string
  ) {
    super(`Configuration error for '${configKey}': ${message}`, 500, false);
  }
}

// Type guards for error handling
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isOperationalError = (error: unknown): boolean => {
  return isAppError(error) && error.isOperational;
};

// Error handler utility
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Unknown error occurred';
};

export const getErrorStatusCode = (error: unknown): number => {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
};

// Error response formatter
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export const formatErrorResponse = (error: unknown): ErrorResponse => {
  const message = getErrorMessage(error);
  const statusCode = getErrorStatusCode(error);
  
  const response: ErrorResponse = {
    error: isAppError(error) ? error.name : 'InternalServerError',
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (isAppError(error) && 'details' in error) {
    response.details = (error as ApiError).details;
  }

  return response;
};