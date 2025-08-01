/**
 * Error Reporting Backend
 * Basierend auf Optimierungsbericht für robuste Fehlerbehandlung
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { logger } from '../services/logger.service';

const router = Router();

interface ErrorReport {
  timestamp: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: string;
  userAgent: string;
  url: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  additionalData?: Record<string, any>;
}

// Error reporting endpoint
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { errors }: { errors: ErrorReport[] } = req.body;

    if (!Array.isArray(errors)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid error report format' 
      });
    }

    // Process each error report
    for (const errorReport of errors) {
      // Log error with appropriate level
      const logLevel = getLogLevel(errorReport.severity);
      logger[logLevel]('Frontend Error Report', {
        error: errorReport.error,
        context: errorReport.context,
        userAgent: errorReport.userAgent,
        url: errorReport.url,
        timestamp: errorReport.timestamp,
        additionalData: errorReport.additionalData
      });

      // In production, send to external monitoring service
      if (process.env.NODE_ENV === 'production') {
        await sendToExternalMonitoring(errorReport);
      }
    }

    res.json({ 
      success: true, 
      message: `Processed ${errors.length} error reports` 
    });
  } catch (error) {
    logger.error('Failed to process error reports', { error });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process error reports' 
    });
  }
});

// Get error statistics endpoint
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // In production, get from monitoring service
    // For now, return mock stats
    const stats = {
      totalErrors: 0,
      errorsByType: {
        javascript: 0,
        network: 0,
        react: 0,
        api: 0
      },
      errorsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Failed to get error statistics', { error });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get error statistics' 
    });
  }
});

function getLogLevel(severity: string): 'info' | 'warn' | 'error' {
  switch (severity) {
    case 'low':
      return 'info';
    case 'medium':
      return 'warn';
    case 'high':
    case 'critical':
      return 'error';
    default:
      return 'warn';
  }
}

async function sendToExternalMonitoring(errorReport: ErrorReport): Promise<void> {
  // Implementation for external monitoring service
  // Example: Sentry, LogRocket, DataDog, etc.
  try {
    // Mock implementation - replace with actual service
    console.log('[EXTERNAL MONITORING]', errorReport);
  } catch (error) {
    logger.warn('Failed to send error to external monitoring', { error });
  }
}

export default router;