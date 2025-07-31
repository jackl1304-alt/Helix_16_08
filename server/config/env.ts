import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGDATABASE: z.string().optional(),
  PGHOST: z.string().optional(),
  PGPORT: z.string().transform(Number).optional(),
  SENDGRID_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };