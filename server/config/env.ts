import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)).default('5000'),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  API_RATE_LIMIT: z.string().transform(Number).default('100'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;