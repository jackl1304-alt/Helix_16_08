import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { KnowledgeExtractionService } from '../services/knowledge-extraction.service';
import { storage } from '../storage';
import { Logger } from '../services/logger.service';
import { asyncHandler } from '../middleware/error.middleware';
// Define createApiResponse locally since @shared/types doesn't exist
const createApiResponse = <T = any>(data: T, success: boolean = true, message?: string) => ({
  success,
  data,
  message
});

const router = Router();
const logger = new Logger('KnowledgeExtractionRoutes');
// Use type assertion to bypass interface mismatch temporarily
const extractionService = new KnowledgeExtractionService(storage as any);

// Schema für spezifische Quellen-Extraktion
const SpecificSourcesSchema = z.object({
  sourceIds: z.array(z.string()).min(1, 'At least one source ID is required')
});

/**
 * GET /api/knowledge-extraction/status
 * Überprüft den aktuellen Status der Knowledge Base
 */
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Fetching knowledge extraction status');
  
  try {
    const [articles, regulatoryUpdates, legalCases] = await Promise.all([
      storage.getAllKnowledgeArticles(),
      storage.getAllRegulatoryUpdates(),
      storage.getAllLegalCases()
    ]);

    const autoExtractedArticles = articles.filter(article => 
      article.tags.includes('auto-extracted')
    );

    const needsReviewArticles = articles.filter(article => 
      article.tags.includes('needs-review')
    );

    const status = {
      totalArticles: articles.length,
      autoExtractedArticles: autoExtractedArticles.length,
      needsReviewArticles: needsReviewArticles.length,
      publishedArticles: articles.filter(a => a.isPublished).length,
      draftArticles: articles.filter(a => !a.isPublished).length,
      availableSourceData: {
        regulatoryUpdates: regulatoryUpdates.length,
        legalCases: legalCases.length,
        totalSources: regulatoryUpdates.length + legalCases.length
      },
      extractionPotential: {
        unprocessedRegulatory: regulatoryUpdates.filter(update => 
          !articles.some(article => article.title.includes(update.title.substring(0, 50)))
        ).length,
        unprocessedLegal: legalCases.filter(legalCase => 
          !articles.some(article => article.title.includes(legalCase.title.substring(0, 50)))
        ).length
      }
    };

    logger.info('Knowledge extraction status retrieved', {
      totalArticles: status.totalArticles,
      extractionPotential: status.extractionPotential
    });

    res.json(status);
  } catch (error) {
    logger.error('Failed to fetch knowledge extraction status', { error });
    res.status(500).json({ 
      error: 'Failed to fetch status',
      totalArticles: 0,
      autoExtractedArticles: 0,
      needsReviewArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      availableSourceData: {
        regulatoryUpdates: 0,
        legalCases: 0,
        totalSources: 0
      },
      extractionPotential: {
        unprocessedRegulatory: 0,
        unprocessedLegal: 0
      }
    });
  }
}));

/**
 * POST /api/knowledge-extraction/extract-all
 * Startet die vollständige Extraktion aller verfügbaren Artikel
 */
router.post('/extract-all', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Starting full knowledge article extraction');
  
  try {
    const stats = await extractionService.extractArticlesFromAllSources();
    
    logger.info('Full knowledge extraction completed', { 
      totalProcessed: stats.totalProcessed,
      articlesExtracted: stats.articlesExtracted,
      duplicatesSkipped: stats.duplicatesSkipped,
      errorsEncountered: stats.errorsEncountered
    });
    
    res.json(createApiResponse(true, {
      message: 'Knowledge article extraction completed successfully',
      stats
    }));
  } catch (error) {
    logger.error('Failed to extract knowledge articles', { error });
    res.status(500).json(createApiResponse(false, undefined, 'Knowledge extraction failed'));
  }
}));

/**
 * POST /api/knowledge-extraction/extract-sources
 * Extrahiert Artikel aus spezifischen Datenquellen
 */
router.post('/extract-sources', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Starting specific source extraction', { body: req.body });
  
  try {
    const { sourceIds } = SpecificSourcesSchema.parse(req.body);
    
    const stats = await extractionService.extractFromSpecificSources(sourceIds);
    
    logger.info('Specific source extraction completed', { sourceIds, stats });
    
    res.json(createApiResponse(true, {
      message: `Knowledge article extraction completed for ${sourceIds.length} sources`,
      sourceIds,
      stats
    }));
  } catch (error) {
    logger.error('Failed to extract from specific sources', { error });
    res.status(500).json(createApiResponse(false, undefined, 'Specific source extraction failed'));
  }
}));

/**
 * GET /api/knowledge-extraction/preview
 * Zeigt eine Vorschau der extrahierbaren Artikel an
 */
router.get('/preview', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Generating extraction preview');
  
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const [regulatoryUpdates, legalCases, existingArticles] = await Promise.all([
      storage.getRecentRegulatoryUpdates(limit),
      storage.getAllLegalCases(),
      storage.getAllKnowledgeArticles()
    ]);

    const recentLegalCases = legalCases.slice(0, limit);

    // Extrahierbare Artikel identifizieren
    const extractableRegulatory = regulatoryUpdates
      .filter(update => update.url && update.title)
      .filter(update => !existingArticles.some(article => 
        article.title.includes(update.title.substring(0, 50))
      ))
      .map(update => ({
        id: update.id,
        title: update.title,
        source: update.source,
        region: update.region,
        type: 'regulatory',
        url: update.url,
        category: update.category
      }));

    const extractableLegal = recentLegalCases
      .filter(legalCase => legalCase.title)
      .filter(legalCase => !existingArticles.some(article => 
        article.title.includes(legalCase.title.substring(0, 50))
      ))
      .map(legalCase => ({
        id: legalCase.id,
        title: legalCase.title,
        source: legalCase.court,
        region: legalCase.jurisdiction,
        type: 'legal',
        url: `#legal-case-${legalCase.id}`,
        category: 'Legal Case'
      }));

    const preview = {
      extractableCount: extractableRegulatory.length + extractableLegal.length,
      regulatory: extractableRegulatory,
      legal: extractableLegal,
      summary: {
        totalExtractable: extractableRegulatory.length + extractableLegal.length,
        regulatoryCount: extractableRegulatory.length,
        legalCount: extractableLegal.length,
        existingArticles: existingArticles.length
      }
    };

    logger.info('Extraction preview generated', {
      extractableCount: preview.extractableCount,
      summary: preview.summary
    });

    res.json(createApiResponse(true, preview));
  } catch (error) {
    logger.error('Failed to generate extraction preview', { error });
    res.status(500).json(createApiResponse(false, undefined, 'Failed to generate preview'));
  }
}));

/**
 * DELETE /api/knowledge-extraction/auto-extracted
 * Löscht alle automatisch extrahierten Artikel (für Reset)
 */
router.delete('/auto-extracted', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Deleting all auto-extracted knowledge articles');
  
  try {
    const articles = await storage.getAllKnowledgeArticles();
    const autoExtractedArticles = articles.filter(article => 
      article.tags.includes('auto-extracted')
    );

    let deletedCount = 0;
    for (const article of autoExtractedArticles) {
      await storage.deleteKnowledgeArticle(article.id);
      deletedCount++;
    }

    logger.info('Auto-extracted articles deleted', { deletedCount });
    
    res.json(createApiResponse(true, {
      message: `${deletedCount} auto-extracted articles deleted successfully`,
      deletedCount
    }));
  } catch (error) {
    logger.error('Failed to delete auto-extracted articles', { error });
    res.status(500).json(createApiResponse(false, undefined, 'Failed to delete auto-extracted articles'));
  }
}));

export default router;