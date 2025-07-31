import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';
import { ApiResponse, RegulatoryUpdate } from '@shared/types/api';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { storage } from '../storage';

export class RegulatoryController {
  getRecent = asyncHandler(async (req: Request, res: Response<ApiResponse<RegulatoryUpdate[]>>, next: NextFunction) => {
    logger.info("API: Fetching recent regulatory updates from database");
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const region = req.query.region as string;
    
    const updates = await storage.getRecentRegulatoryUpdates(limit);
    
    // Filter by region if specified
    const filteredUpdates = region && region !== 'all'
      ? updates.filter(update => update.region?.toLowerCase().includes(region.toLowerCase()))
      : updates;
    
    logger.info("API: Retrieved regulatory updates from database", { 
      total: updates.length,
      filtered: filteredUpdates.length,
      region: region || 'all'
    });
    
    res.json({
      success: true,
      data: filteredUpdates,
      timestamp: new Date().toISOString()
    });
  });

  getAll = asyncHandler(async (req: Request, res: Response<ApiResponse<RegulatoryUpdate[]>>, next: NextFunction) => {
    logger.info("API: Fetching all regulatory updates");
    
    const updates = await storage.getAllRegulatoryUpdates();
    
    logger.info("API: Retrieved all regulatory updates", { count: updates.length });
    
    res.json({
      success: true,
      data: updates,
      timestamp: new Date().toISOString()
    });
  });
}

export const regulatoryController = new RegulatoryController();