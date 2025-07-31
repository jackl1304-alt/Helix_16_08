import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const regulatoryUpdateSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  region: z.enum(['US', 'EU', 'UK', 'CH', 'DE', 'United States', 'Europe']),
  update_type: z.enum(['guidance', 'regulation', 'alert', 'approval', 'clearance']),
  priority: z.enum(['high', 'medium', 'low', 'urgent']),
  device_classes: z.array(z.string()).min(1),
  effective_date: z.string().datetime().optional(),
  source_url: z.string().url(),
  content: z.string().optional(),
  categories: z.record(z.unknown()).optional()
});

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('50'),
  region: z.string().optional(),
  priority: z.string().optional(),
  type: z.string().optional(),
});

// Validation Middleware
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(
        req.method === 'GET' ? req.query : req.body
      );
      (req as any).validated = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      } else {
        next(error);
      }
    }
  };
};