import winston from 'winston';

class LoggerService {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
          silent: process.env.NODE_ENV === 'production'
        })
      ]
    });
  }
  
  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }
  
  error(message: string, error?: any) {
    this.logger.error(message, { error: error?.stack || error });
  }
  
  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(message, data);
    }
  }
  
  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }
}

export const logger = new LoggerService();