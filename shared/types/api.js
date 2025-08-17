import { z } from 'zod';
export const SyncRequestSchema = z.object({
    id: z.string().min(1),
    force: z.boolean().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional()
});
export const DataSourceUpdateSchema = z.object({
    name: z.string().optional(),
    isActive: z.boolean().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'realtime']).optional(),
    endpoint: z.string().url().optional(),
    description: z.string().optional()
});
export const PaginationSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(50),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});
export const createApiResponse = (success, data, error, message, pagination) => ({
    success,
    data,
    error,
    message,
    timestamp: new Date().toISOString(),
    pagination
});
export const isApiError = (error) => {
    return typeof error === 'object' && error !== null && 'message' in error;
};
export const isDashboardStats = (data) => {
    return typeof data === 'object' &&
        data !== null &&
        'totalUpdates' in data &&
        'activeDataSources' in data;
};
//# sourceMappingURL=api.js.map