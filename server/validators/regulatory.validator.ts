import { z } from 'zod';

export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 10000, {
      message: 'Limit must be between 1 and 10000',
    }),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, {
      message: 'Offset must be 0 or greater',
    }),
  region: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  update_type: z.string().optional(),
});

export const regulatoryUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  source_id: z.string().min(1, 'Source ID is required'),
  source_url: z.string().url('Valid URL is required'),
  content: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  update_type: z.string().min(1, 'Update type is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  device_classes: z.array(z.string()).default([]),
  categories: z.record(z.unknown()).optional(),
  raw_data: z.record(z.unknown()).optional(),
  published_at: z.string().datetime('Valid ISO date required'),
  effective_date: z.string().datetime().optional(),
});

export const legalCaseSchema = z.object({
  case_number: z.string().min(1, 'Case number is required'),
  title: z.string().min(1, 'Title is required'),
  court: z.string().min(1, 'Court is required'),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  status: z.enum(['pending', 'closed', 'appealed', 'settled']),
  defendants: z.array(z.string()).min(1, 'At least one defendant required'),
  plaintiffs: z.array(z.string()).min(1, 'At least one plaintiff required'),
  legal_issues: z.array(z.string()).default([]),
  filed_date: z.string().datetime('Valid ISO date required'),
  decision_date: z.string().datetime().optional(),
  case_summary: z.string().optional(),
  outcome: z.string().optional(),
  impact_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  document_url: z.string().url().optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${message}`);
    }
    throw error;
  }
}