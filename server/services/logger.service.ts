import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  [key: string]: unknown;
}

export class Logger {
  private winston: WinstonLogger;
  private context: string;

  constructor(context: string = 'Application') {
    this.context = context;
    this.winston = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
        format.printf(({ timestamp, level, message, context, ...meta }) => {
          const logObject = {
            timestamp,
            level,
            message,
            context: context || this.context,
            ...meta
          };
          
          // In development, use prettier format
          if (process.env.NODE_ENV === 'development') {
            return `${timestamp} [${level.toUpperCase()}] [${context || this.context}] ${message} ${
              Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ''
            }`;
          }
          
          return JSON.stringify(logObject);
        })
      ),
      transports: [
        new transports.Console({
          handleExceptions: true,
          handleRejections: true
        })
      ],
      exitOnError: false
    });
  }

  error(message: string, context?: LogContext): void {
    this.winston.error(message, { context: this.context, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.winston.warn(message, { context: this.context, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.winston.info(message, { context: this.context, ...context });
  }

  debug(message: string, context?: LogContext): void {
    this.winston.debug(message, { context: this.context, ...context });
  }

  // HTTP request logging
  http(method: string, url: string, statusCode: number, responseTime: number, context?: LogContext): void {
    this.info(`${method} ${url}`, {
      method,
      url,
      statusCode,
      responseTime,
      ...context
    });
  }

  // Database operation logging
  database(operation: string, table: string, duration: number, context?: LogContext): void {
    this.debug(`DB ${operation} on ${table}`, {
      operation,
      table,
      duration,
      ...context
    });
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this[level](`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      performance: true,
      ...context
    });
  }

  // Security logging
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level = ['high', 'critical'].includes(severity) ? LogLevel.ERROR : LogLevel.WARN;
    this[level](`Security: ${event}`, {
      event,
      severity,
      security: true,
      ...context
    });
  }

  // API logging
  api(endpoint: string, method: string, statusCode: number, responseTime: number, context?: LogContext): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this[level](`API ${method} ${endpoint} - ${statusCode}`, {
      endpoint,
      method,
      statusCode,
      responseTime,
      api: true,
      ...context
    });
  }

  // Child logger with additional context
  child(additionalContext: LogContext): Logger {
    const childLogger = new Logger(this.context);
    // Add persistent context to all logs from this child
    const originalInfo = childLogger.winston.info.bind(childLogger.winston);
    const originalError = childLogger.winston.error.bind(childLogger.winston);
    const originalWarn = childLogger.winston.warn.bind(childLogger.winston);
    const originalDebug = childLogger.winston.debug.bind(childLogger.winston);
    
    childLogger.winston.info = (message: string, meta: any = {}) => {
      return originalInfo(message, { ...additionalContext, ...meta });
    };
    childLogger.winston.error = (message: string, meta: any = {}) => {
      return originalError(message, { ...additionalContext, ...meta });
    };
    childLogger.winston.warn = (message: string, meta: any = {}) => {
      return originalWarn(message, { ...additionalContext, ...meta });
    };
    childLogger.winston.debug = (message: string, meta: any = {}) => {
      return originalDebug(message, { ...additionalContext, ...meta });
    };
    
    return childLogger;
  }

  // Timer utility for performance monitoring
  startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.performance(label, duration);
    };
  }
}

// Global logger instance
export const logger = new Logger('Global');

// Specialized loggers for different modules
export const dbLogger = new Logger('Database');
export const apiLogger = new Logger('API');
export const authLogger = new Logger('Authentication');
export const securityLogger = new Logger('Security');

// Error logging utility
export const logError = (error: Error, context?: LogContext): void => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context
  });
};

// Request logging middleware utility
export const createRequestLogger = (logger: Logger) => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.api(req.originalUrl, req.method, res.statusCode, duration, {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    });
    
    next();
  };
};