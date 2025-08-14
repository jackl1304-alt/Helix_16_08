import { z } from 'zod';
// Define ConfigurationError locally since @shared/types doesn't exist
class ConfigurationError extends Error {
  public readonly code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
import { Logger } from '../services/logger.service';

const logger = new Logger('Environment');

// Environment validation schema
const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  REPLIT_DEPLOYMENT: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Optional API keys for external services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Session configuration
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  
  // Database configuration
  DB_POOL_MIN: z.string().transform(Number).pipe(z.number().min(0)).default('2'),
  DB_POOL_MAX: z.string().transform(Number).pipe(z.number().min(1)).default('10'),
  
  // External service timeouts
  API_TIMEOUT_MS: z.string().transform(Number).pipe(z.number().positive()).default('30000'),
  
  // Feature flags
  ENABLE_RATE_LIMITING: z.string().transform(v => v === 'true').default('true'),
  ENABLE_REQUEST_LOGGING: z.string().transform(v => v === 'true').default('true'),
  ENABLE_PERFORMANCE_MONITORING: z.string().transform(v => v === 'true').default('true')
});

export type Environment = z.infer<typeof EnvironmentSchema>;

class EnvironmentConfig {
  private _config: Environment | null = null;

  get config(): Environment {
    if (!this._config) {
      throw new ConfigurationError('ENVIRONMENT_NOT_LOADED', 'Environment configuration not loaded. Call validateAndLoad() first.');
    }
    return this._config;
  }

  validateAndLoad(): Environment {
    try {
      logger.info('Validating environment configuration');
      
      const result = EnvironmentSchema.safeParse(process.env);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        logger.error('Environment validation failed', { errors });
        
        throw new ConfigurationError(
          'ENVIRONMENT_VALIDATION',
          `Environment validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`
        );
      }

      this._config = result.data;
      
      logger.info('Environment configuration loaded successfully', {
        nodeEnv: this._config.NODE_ENV,
        port: this._config.PORT,
        logLevel: this._config.LOG_LEVEL,
        hasDatabaseUrl: !!this._config.DATABASE_URL,
        hasSessionSecret: !!this._config.SESSION_SECRET,
        rateLimitEnabled: this._config.ENABLE_RATE_LIMITING
      });

      return this._config;
    } catch (error) {
      logger.error('Failed to load environment configuration', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  // Helper methods for common checks
  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  hasApiKey(service: 'openai' | 'anthropic' | 'sendgrid'): boolean {
    switch (service) {
      case 'openai':
        return !!this.config.OPENAI_API_KEY;
      case 'anthropic':
        return !!this.config.ANTHROPIC_API_KEY;
      case 'sendgrid':
        return !!this.config.SENDGRID_API_KEY;
      default:
        return false;
    }
  }

  getDatabaseConfig() {
    return {
      url: this.config.DATABASE_URL,
      pool: {
        min: this.config.DB_POOL_MIN,
        max: this.config.DB_POOL_MAX
      }
    };
  }

  getRateLimitConfig() {
    return {
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
      max: this.config.RATE_LIMIT_MAX_REQUESTS,
      enabled: this.config.ENABLE_RATE_LIMITING
    };
  }

  // Validate specific environment requirements
  validateDatabaseConnection(): void {
    if (!this.config.DATABASE_URL) {
      throw new ConfigurationError('DATABASE_URL', 'Database URL is required but not provided');
    }

    try {
      new URL(this.config.DATABASE_URL);
    } catch {
      throw new ConfigurationError('DATABASE_URL', 'Database URL is not a valid URL');
    }
  }

  validateProductionRequirements(): void {
    if (!this.isProduction()) return;

    const requiredInProduction = [
      { key: 'SESSION_SECRET', value: this.config.SESSION_SECRET },
    ];

    const missing = requiredInProduction.filter(req => !req.value);
    
    if (missing.length > 0) {
      throw new ConfigurationError(
        'PRODUCTION_CONFIG',
        `Production environment requires: ${missing.map(m => m.key).join(', ')}`
      );
    }

    logger.info('Production environment validation passed');
  }
}

// Singleton instance
export const env = new EnvironmentConfig();

// Export for convenience
export const validateEnvironment = (): Environment => {
  const config = env.validateAndLoad();
  env.validateDatabaseConnection();
  env.validateProductionRequirements();
  return config;
};