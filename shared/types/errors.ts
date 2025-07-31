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

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, `Database error: ${message}`);
  }
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
}