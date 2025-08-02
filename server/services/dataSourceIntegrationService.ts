import { storage } from '../storage';
import { enhancedFdaOpenApiService } from './enhancedFdaOpenApiService';
import { mhraScrapingService } from './mhraScrapingService';
import { openFdaDataExtractor } from './openFdaDataExtractor';
import { enhancedLegalAnalysisService } from './enhancedLegalAnalysisService';
import { intelligentDataQualityService } from './intelligentDataQualityService';
import { dataCollectionService } from './dataCollectionService';
import { logger } from './logger.service';

interface IntegrationResult {
  success: boolean;
  servicesRun: string[];
  errors: string[];
  dataCollected: {
    regulatoryUpdates: number;
    legalCases: number;
    qualityScore: number;
  };
  recommendations: string[];
}

interface ScheduledCollection {
  sourceId: string;
  service: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  lastRun: Date;
  nextRun: Date;
  enabled: boolean;
}

export class DataSourceIntegrationService {
  private scheduledCollections: ScheduledCollection[] = [
    {
      sourceId: 'fda_510k',
      service: 'enhancedFdaOpenApiService',
      frequency: 'daily',
      lastRun: new Date(0),
      nextRun: new Date(),
      enabled: true
    },
    {
      sourceId: 'fda_recalls',
      service: 'openFdaDataExtractor',
      frequency: 'daily',
      lastRun: new Date(0),
      nextRun: new Date(),
      enabled: true
    },
    {
      sourceId: 'mhra_guidance',
      service: 'mhraScrapingService',
      frequency: 'daily',
      lastRun: new Date(0),
      nextRun: new Date(),
      enabled: true
    }
  ];

  async runComprehensiveDataCollection(): Promise<IntegrationResult> {
    logger.info('[Data Integration] Starting comprehensive data collection...');

    const result: IntegrationResult = {
      success: false,
      servicesRun: [],
      errors: [],
      dataCollected: {
        regulatoryUpdates: 0,
        legalCases: 0,
        qualityScore: 0
      },
      recommendations: []
    };

    try {
      // 1. Enhanced FDA Data Collection
      try {
        logger.info('[Data Integration] Running Enhanced FDA OpenAPI Service...');
        await enhancedFdaOpenApiService.collect510kDevices(100);
        await enhancedFdaOpenApiService.collectRecalls(50);
        result.servicesRun.push('Enhanced FDA OpenAPI Service');
        logger.info('[Data Integration] ✓ Enhanced FDA collection completed');
      } catch (error) {
        const errorMsg = `Enhanced FDA Service error: ${error}`;
        result.errors.push(errorMsg);
        logger.error('[Data Integration]', errorMsg);
      }

      // 2. OpenFDA Data Extractor
      try {
        logger.info('[Data Integration] Running OpenFDA Data Extractor...');
        const extractorResults = await openFdaDataExtractor.runCompleteExtraction();
        result.servicesRun.push('OpenFDA Data Extractor');
        result.dataCollected.regulatoryUpdates += extractorResults.totalProcessed;
        logger.info(`[Data Integration] ✓ OpenFDA extraction completed: ${extractorResults.totalProcessed} items`);
      } catch (error) {
        const errorMsg = `OpenFDA Extractor error: ${error}`;
        result.errors.push(errorMsg);
        logger.error('[Data Integration]', errorMsg);
      }

      // 3. MHRA Scraping Service
      try {
        logger.info('[Data Integration] Running MHRA Scraping Service...');
        await mhraScrapingService.collectMHRADeviceRegistrations();
        await mhraScrapingService.collectMHRASafetyAlerts();
        result.servicesRun.push('MHRA Scraping Service');
        logger.info('[Data Integration] ✓ MHRA collection completed');
      } catch (error) {
        const errorMsg = `MHRA Service error: ${error}`;
        result.errors.push(errorMsg);
        logger.error('[Data Integration]', errorMsg);
      }

      // 4. Enhanced Legal Analysis
      try {
        logger.info('[Data Integration] Running Enhanced Legal Analysis...');
        const legalCases = await storage.getAllLegalCases();
        const legalAnalysis = await enhancedLegalAnalysisService.analyzeLegalCases(legalCases);
        const trendAnalysis = await enhancedLegalAnalysisService.analyzeLegalTrends(legalCases);
        
        result.servicesRun.push('Enhanced Legal Analysis Service');
        result.dataCollected.legalCases = legalCases.length;
        
        // Add trend-based recommendations
        result.recommendations.push(...trendAnalysis.preventiveRecommendations);
        
        logger.info(`[Data Integration] ✓ Legal analysis completed: ${legalCases.length} cases analyzed`);
      } catch (error) {
        const errorMsg = `Legal Analysis error: ${error}`;
        result.errors.push(errorMsg);
        logger.error('[Data Integration]', errorMsg);
      }

      // 5. Data Quality Assessment
      try {
        logger.info('[Data Integration] Running Intelligent Data Quality Assessment...');
        const qualityReport = await intelligentDataQualityService.assessDataQuality();
        
        result.servicesRun.push('Intelligent Data Quality Service');
        result.dataCollected.qualityScore = Math.round(qualityReport.overallScore * 100);
        result.recommendations.push(...qualityReport.recommendations);
        
        // Run automatic cleanup if quality score is below threshold
        if (qualityReport.overallScore < 0.8) {
          logger.info('[Data Integration] Quality score below 80%, running automatic cleanup...');
          const cleanupResults = await intelligentDataQualityService.performAutomaticCleanup();
          result.recommendations.push(`Automated cleanup completed: ${cleanupResults.fixedIssues} issues fixed`);
        }
        
        logger.info(`[Data Integration] ✓ Data quality assessment completed: ${result.dataCollected.qualityScore}% score`);
      } catch (error) {
        const errorMsg = `Data Quality Service error: ${error}`;
        result.errors.push(errorMsg);
        logger.error('[Data Integration]', errorMsg);
      }

      // 6. Global Data Collection (fallback for other sources)
      try {
        logger.info('[Data Integration] Running Global Data Collection Service...');
        await dataCollectionService.collectAllGlobalData();
        result.servicesRun.push('Global Data Collection Service');
        logger.info('[Data Integration] ✓ Global data collection completed');
      } catch (error) {
        const errorMsg = `Global Data Collection error: ${error}`;
        result.errors.push(errorMsg);
        logger.error('[Data Integration]', errorMsg);
      }

      // Final assessment
      result.success = result.errors.length < result.servicesRun.length / 2; // Success if majority of services succeeded
      
      // Update collection schedules
      await this.updateCollectionSchedules();

      // Generate final recommendations
      if (result.dataCollected.qualityScore < 70) {
        result.recommendations.unshift('Critical: Data quality below 70% - immediate attention required');
      } else if (result.dataCollected.qualityScore < 85) {
        result.recommendations.unshift('Warning: Data quality below 85% - optimization recommended');
      }

      if (result.errors.length > 0) {
        result.recommendations.push(`${result.errors.length} service errors detected - review error logs`);
      }

      logger.info(`[Data Integration] Comprehensive collection completed: ${result.servicesRun.length} services run, ${result.errors.length} errors`);
      
    } catch (error) {
      logger.error('[Data Integration] Critical error in comprehensive collection:', error);
      result.errors.push(`Critical integration error: ${error}`);
      result.success = false;
    }

    return result;
  }

  async runScheduledCollections(): Promise<void> {
    logger.info('[Data Integration] Checking scheduled collections...');

    const now = new Date();
    const collectionsToRun = this.scheduledCollections.filter(sc => 
      sc.enabled && sc.nextRun <= now
    );

    if (collectionsToRun.length === 0) {
      logger.info('[Data Integration] No scheduled collections due');
      return;
    }

    logger.info(`[Data Integration] Running ${collectionsToRun.length} scheduled collections...`);

    for (const collection of collectionsToRun) {
      try {
        logger.info(`[Data Integration] Running scheduled collection: ${collection.service} for ${collection.sourceId}`);
        
        switch (collection.service) {
          case 'enhancedFdaOpenApiService':
            await enhancedFdaOpenApiService.collect510kDevices(50);
            break;
          case 'openFdaDataExtractor':
            await openFdaDataExtractor.extractDeviceRecalls(50);
            break;
          case 'mhraScrapingService':
            await mhraScrapingService.collectMHRADeviceRegistrations();
            break;
          default:
            logger.warn(`[Data Integration] Unknown service: ${collection.service}`);
        }

        // Update last run and calculate next run
        collection.lastRun = now;
        collection.nextRun = this.calculateNextRun(now, collection.frequency);
        
        logger.info(`[Data Integration] ✓ Scheduled collection completed: ${collection.service}`);
        
      } catch (error) {
        logger.error(`[Data Integration] Scheduled collection failed: ${collection.service}`, error);
      }
    }
  }

  async getDataSourceStatus(): Promise<{
    totalSources: number;
    activeSources: number;
    lastSync: Record<string, Date>;
    collectionHealth: Record<string, 'healthy' | 'warning' | 'error'>;
  }> {
    try {
      const sources = await storage.getAllDataSources();
      const activeSources = sources.filter(s => s.is_active);
      
      const lastSync: Record<string, Date> = {};
      const collectionHealth: Record<string, 'healthy' | 'warning' | 'error'> = {};
      
      for (const source of sources) {
        if (source.last_sync_at) {
          lastSync[source.id] = new Date(source.last_sync_at);
          
          // Determine health based on last sync
          const hoursSinceSync = (Date.now() - new Date(source.last_sync_at).getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceSync < 24) {
            collectionHealth[source.id] = 'healthy';
          } else if (hoursSinceSync < 72) {
            collectionHealth[source.id] = 'warning';
          } else {
            collectionHealth[source.id] = 'error';
          }
        } else {
          collectionHealth[source.id] = 'error';
        }
      }

      return {
        totalSources: sources.length,
        activeSources: activeSources.length,
        lastSync,
        collectionHealth
      };
      
    } catch (error) {
      logger.error('[Data Integration] Error getting data source status:', error);
      throw error;
    }
  }

  private calculateNextRun(from: Date, frequency: 'hourly' | 'daily' | 'weekly'): Date {
    const next = new Date(from);
    
    switch (frequency) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
    }
    
    return next;
  }

  private async updateCollectionSchedules(): Promise<void> {
    try {
      // Update data source last sync times
      for (const collection of this.scheduledCollections) {
        if (collection.lastRun > new Date(0)) {
          await storage.updateDataSourceLastSync(collection.sourceId, collection.lastRun);
        }
      }
      
      logger.info('[Data Integration] Collection schedules updated');
    } catch (error) {
      logger.error('[Data Integration] Error updating collection schedules:', error);
    }
  }

  async getIntegrationMetrics(): Promise<{
    totalDataPoints: number;
    qualityScore: number;
    sourceCoverage: number;
    lastUpdate: Date;
    trends: {
      weekly: number;
      monthly: number;
      growth: number;
    };
  }> {
    try {
      const [regulatoryUpdates, legalCases, sources] = await Promise.all([
        storage.getAllRegulatoryUpdates(),
        storage.getAllLegalCases(),
        storage.getAllDataSources()
      ]);

      const totalDataPoints = regulatoryUpdates.length + legalCases.length;
      const activeSources = sources.filter(s => s.is_active).length;
      const sourceCoverage = (activeSources / sources.length) * 100;

      // Calculate recent trends
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyUpdates = regulatoryUpdates.filter(u => 
        u.publishedAt && new Date(u.publishedAt) >= weekAgo
      ).length;

      const monthlyUpdates = regulatoryUpdates.filter(u => 
        u.publishedAt && new Date(u.publishedAt) >= monthAgo
      ).length;

      // Simple growth calculation
      const growth = weeklyUpdates > 0 ? (weeklyUpdates / Math.max(monthlyUpdates - weeklyUpdates, 1)) * 100 : 0;

      // Get quality score from last assessment
      const qualityReport = await intelligentDataQualityService.assessDataQuality();

      return {
        totalDataPoints,
        qualityScore: Math.round(qualityReport.overallScore * 100),
        sourceCoverage: Math.round(sourceCoverage),
        lastUpdate: new Date(),
        trends: {
          weekly: weeklyUpdates,
          monthly: monthlyUpdates,
          growth: Math.round(growth)
        }
      };

    } catch (error) {
      logger.error('[Data Integration] Error getting integration metrics:', error);
      throw error;
    }
  }
}

export const dataSourceIntegrationService = new DataSourceIntegrationService();