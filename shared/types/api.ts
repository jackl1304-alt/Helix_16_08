import { z } from 'zod';

// Standard API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Dashboard Statistics Interface
export interface DashboardStats {
  totalUpdates: number;
  uniqueUpdates: number;
  totalLegalCases: number;
  uniqueLegalCases: number;
  recentUpdates: number;
  recentLegalCases: number;
  activeDataSources: number;
  currentData: number;
  archivedData: number;
  duplicatesRemoved: string;
  dataQuality: string;
  totalArticles: number;
  totalSubscribers: number;
  pendingApprovals: number;
  totalNewsletters: number;
}

// Data Source Interface
export interface DataSource {
  id: string;
  name: string;
  type: 'regulatory' | 'standards' | 'legal' | 'guidelines' | 'recalls';
  category: string;
  isActive: boolean;
  lastSync?: Date;
  endpoint?: string;
  description?: string;
  region?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'realtime';
  credentialsRequired?: boolean;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
}

// Regulatory Update Interface
export interface RegulatoryUpdate {
  id: string;
  title: string;
  content: string;
  source: string;
  type: 'regulation' | 'guidance' | 'standard' | 'announcement';
  date: Date;
  region: string;
  category: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  url?: string;
  documentId?: string;
  status: 'draft' | 'published' | 'archived';
}

// Legal Case Interface
export interface LegalCase {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  jurisdiction: string;
  date: Date;
  summary: string;
  fullDecision?: string;
  outcome: 'pending' | 'plaintiff' | 'defendant' | 'settled' | 'dismissed';
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  relatedProducts?: string[];
  precedentValue: 'low' | 'medium' | 'high';
}

// API Request Validation Schemas
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

// Utility function to create standardized API responses
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  pagination?: ApiResponse<T>['pagination']
): ApiResponse<T> => ({
  success,
  data,
  error,
  message,
  timestamp: new Date().toISOString(),
  pagination
});

// Type guards
export const isApiError = (error: unknown): error is { message: string; statusCode?: number } => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isDashboardStats = (data: unknown): data is DashboardStats => {
  return typeof data === 'object' && 
         data !== null && 
         'totalUpdates' in data && 
         'activeDataSources' in data;
};