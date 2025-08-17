export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, stack) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
export class ValidationError extends AppError {
    constructor(message, field, value, expectedType) {
        super(`Validation failed for field '${field}': ${message}`, 400);
        this.field = field;
        this.value = value;
        this.expectedType = expectedType;
        this.name = 'ValidationError';
    }
}
export class DatabaseError extends AppError {
    constructor(message, operation, table, originalError) {
        super(`Database operation '${operation}' failed: ${message}`, 500);
        this.operation = operation;
        this.table = table;
        this.originalError = originalError;
        this.name = 'DatabaseError';
    }
}
export class ApiError extends AppError {
    constructor(message, statusCode, code, details) {
        super(message, statusCode);
        this.code = code;
        this.details = details;
        this.name = 'ApiError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource, identifier) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}
export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}
export class RateLimitError extends AppError {
    constructor(resetTime, limit, windowMs) {
        super(`Rate limit exceeded. Limit: ${limit} requests per ${windowMs}ms`, 429);
        this.resetTime = resetTime;
        this.limit = limit;
        this.windowMs = windowMs;
        this.name = 'RateLimitError';
    }
}
export class ExternalServiceError extends AppError {
    constructor(serviceName, message, originalError) {
        super(`External service '${serviceName}' error: ${message}`, 502);
        this.serviceName = serviceName;
        this.originalError = originalError;
        this.name = 'ExternalServiceError';
    }
}
export class ConfigurationError extends AppError {
    constructor(configKey, message) {
        super(`Configuration error for '${configKey}': ${message}`, 500, false);
        this.configKey = configKey;
        this.name = 'ConfigurationError';
    }
}
export const isAppError = (error) => {
    return error instanceof AppError;
};
export const isOperationalError = (error) => {
    return isAppError(error) && error.isOperational;
};
export const getErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }
    return typeof error === 'string' ? error : 'Unknown error occurred';
};
export const getErrorStatusCode = (error) => {
    if (isAppError(error)) {
        return error.statusCode;
    }
    return 500;
};
export const formatErrorResponse = (error) => {
    const message = getErrorMessage(error);
    const statusCode = getErrorStatusCode(error);
    const response = {
        error: isAppError(error) ? error.name : 'InternalServerError',
        message,
        statusCode,
        timestamp: new Date().toISOString()
    };
    if (isAppError(error) && 'details' in error) {
        response.details = error.details;
    }
    return response;
};
//# sourceMappingURL=errors.js.map