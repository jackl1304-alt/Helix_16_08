import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';
// Import from local files since @shared/types doesn't exist
import { asyncHandler } from '../middleware/error.middleware';

// Define types locally
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  description?: string;
  region?: string;
  update_type?: string;
  priority?: string;
  device_classes?: string[];
  published_at?: string;
  created_at?: string;
  effective_date?: string;
  source_id?: string;
  source_url?: string;
  content?: string;
  categories?: string[];
  raw_data?: any;
}

interface StorageRegulatoryUpdate {
  id: string;
  title: string;
  description?: string;
  region?: string;
  update_type?: string;
  priority?: string;
  device_classes?: string[];
  published_at?: string;
  created_at?: string;
  effective_date?: string;
  source_id?: string;
  source_url?: string;
  content?: string;
  categories?: string[];
  raw_data?: any;
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
import { storage } from '../storage';

export class RegulatoryController {
  getRecent = asyncHandler(async (req: Request, res: Response<ApiResponse<RegulatoryUpdate[]>>, next: NextFunction) => {
    logger.info("API: Fetching recent regulatory updates from database");
    
    const limitParam = req.query.limit as string;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      throw new ValidationError('Limit must be a number between 1 and 1000');
    }
    
    const region = req.query.region as string;
    
    const updates: StorageRegulatoryUpdate[] = await storage.getRecentRegulatoryUpdates(limit);
    
    // Filter by region if specified
    const filteredUpdates = region && region !== 'all'
      ? updates.filter(update => update.region?.toLowerCase().includes(region.toLowerCase()))
      : updates;
    
    // Transform to API format
    const transformedUpdates: RegulatoryUpdate[] = filteredUpdates.map(update => ({
      id: update.id,
      title: update.title,
      description: update.description,
      region: update.region,
      update_type: update.update_type as any,
      priority: update.priority as any,
      device_classes: update.device_classes,
      published_at: update.published_at,
      created_at: update.created_at,
      effective_date: update.effective_date,
      source_id: update.source_id,
      source_url: update.source_url,
      content: update.content,
      categories: update.categories,
      raw_data: update.raw_data
    }));
    
    logger.info("API: Retrieved regulatory updates from database", { 
      total: updates.length,
      filtered: filteredUpdates.length,
      region: region || 'all'
    });
    
    res.json({
      success: true,
      data: transformedUpdates,
      timestamp: new Date().toISOString()
    });
  });

  getAll = asyncHandler(async (req: Request, res: Response<ApiResponse<RegulatoryUpdate[]>>, next: NextFunction) => {
    logger.info("API: Fetching all regulatory updates");
    
    const updates: StorageRegulatoryUpdate[] = await storage.getAllRegulatoryUpdates();
    
    // Transform to API format
    const transformedUpdates: RegulatoryUpdate[] = updates.map(update => ({
      id: update.id,
      title: update.title,
      description: update.description,
      region: update.region,
      update_type: update.update_type as any,
      priority: update.priority as any,
      device_classes: update.device_classes,
      published_at: update.published_at,
      created_at: update.created_at,
      effective_date: update.effective_date,
      source_id: update.source_id,
      source_url: update.source_url,
      content: update.content,
      categories: update.categories,
      raw_data: update.raw_data
    }));
    
    logger.info("API: Retrieved all regulatory updates", { count: transformedUpdates.length });
    
    res.json({
      success: true,
      data: transformedUpdates,
      timestamp: new Date().toISOString()
    });
  });
}

export const regulatoryController = new RegulatoryController();