import { Router, Request, Response } from 'express';
import { logger } from '../services/logger.service';
import { asyncHandler } from '../middleware/error.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const credentialsSchema = z.record(z.string());
const sourceIdSchema = z.object({
  sourceId: z.string().min(1)
});

// Mock data store for credentials (in production, use database)
const credentialsStore: Record<string, Record<string, string>> = {};

// Get all data sources configuration
router.get('/data-sources', asyncHandler(async (req: Request, res: Response) => {
  logger.info('API: Fetching data sources configuration');
  
  // In production, this would fetch from database
  const dataSources = [
    {
      id: 'fda_510k',
      name: 'FDA 510(k) Database',
      status: 'inactive',
      hasCredentials: !!credentialsStore['fda_510k']
    },
    {
      id: 'ema_epar',
      name: 'EMA EPAR Database',
      status: 'active',
      hasCredentials: !!credentialsStore['ema_epar']
    },
    // Add more sources as needed
  ];
  
  res.json(dataSources);
}));

// Save credentials for a data source
router.post('/data-sources/:sourceId/credentials', 
  validateParams(sourceIdSchema),
  validateBody(credentialsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    const credentials = req.body;
    
    logger.info('API: Saving credentials for data source', { sourceId });
    
    // In production, encrypt and store in database
    credentialsStore[sourceId] = credentials;
    
    logger.info('API: Credentials saved successfully', { sourceId });
    
    res.json({
      success: true,
      message: 'Zugangsdaten erfolgreich gespeichert',
      timestamp: new Date().toISOString()
    });
  })
);

// Test connection for a data source
router.post('/data-sources/:sourceId/test',
  validateParams(sourceIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    
    logger.info('API: Testing connection for data source', { sourceId });
    
    const credentials = credentialsStore[sourceId];
    if (!credentials) {
      return res.status(400).json({
        success: false,
        error: 'Keine Zugangsdaten für diese Datenquelle gefunden',
        timestamp: new Date().toISOString()
      });
    }
    
    // In production, actually test the connection to the data source
    // For now, simulate a test
    const isSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (isSuccess) {
      logger.info('API: Connection test successful', { sourceId });
      res.json({
        success: true,
        message: 'Verbindung erfolgreich getestet',
        timestamp: new Date().toISOString()
      });
    } else {
      logger.warn('API: Connection test failed', { sourceId });
      res.status(400).json({
        success: false,
        error: 'Verbindungstest fehlgeschlagen - Überprüfen Sie die Zugangsdaten',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// Get credentials for a data source (masked for security)
router.get('/data-sources/:sourceId/credentials',
  validateParams(sourceIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    
    logger.info('API: Fetching masked credentials for data source', { sourceId });
    
    const credentials = credentialsStore[sourceId];
    if (!credentials) {
      return res.json({
        success: true,
        data: {},
        timestamp: new Date().toISOString()
      });
    }
    
    // Mask sensitive values
    const maskedCredentials: Record<string, string> = {};
    Object.keys(credentials).forEach(key => {
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
        maskedCredentials[key] = '****' + credentials[key].slice(-4);
      } else {
        maskedCredentials[key] = credentials[key];
      }
    });
    
    res.json({
      success: true,
      data: maskedCredentials,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;