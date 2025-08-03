import { Logger } from './logger.service';
import { storage } from '../storage';
import { legalDataService } from './legalDataService';

const logger = new Logger('BackgroundInitService');

/**
 * Background initialization service for non-critical data loading
 * Implements async initialization to improve server startup performance
 */
export class BackgroundInitService {
  private static instance: BackgroundInitService;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): BackgroundInitService {
    if (!BackgroundInitService.instance) {
      BackgroundInitService.instance = new BackgroundInitService();
    }
    return BackgroundInitService.instance;
  }

  /**
   * Start background initialization without blocking server startup
   */
  async startBackgroundInit(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performBackgroundInit();
    
    // Don't await - let it run in background
    this.initializationPromise.catch(error => {
      logger.error('Background initialization failed', { error });
    });

    return Promise.resolve();
  }

  /**
   * Get the initialization status
   */
  async waitForInit(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    return Promise.resolve();
  }

  private async performBackgroundInit(): Promise<void> {
    logger.info("Starting background data initialization...");
    
    try {
      // Initialize data sources
      await this.initializeDataSources();
      
      // Initialize legal data if needed
      await this.initializeLegalDataIfNeeded();
      
      // Initialize regulatory data if needed  
      await this.initializeRegulatoryDataIfNeeded();
      
      logger.info("Background initialization completed successfully");
    } catch (error) {
      logger.error("Background initialization failed", { error });
      throw error;
    }
  }

  private async initializeDataSources(): Promise<void> {
    try {
      const existingSources = await storage.getAllDataSources();
      logger.info(`Found ${existingSources.length} existing data sources`);
      
      // Only initialize if we have fewer than expected sources
      if (existingSources.length < 46) {
        logger.info("Initializing additional data sources...");
        
        const requiredSources = [
          // GRIP Platform - Global Intelligence
          { id: 'grip_platform', name: 'GRIP Regulatory Intelligence', endpoint: 'https://grip-app.pureglobal.com', country: 'GLOBAL', region: 'Global', type: 'intelligence', category: 'regulatory', isActive: true },
          // Core FDA sources
          { id: 'fda_510k', name: 'FDA 510(k) Database', endpoint: 'https://api.fda.gov/device/510k.json', country: 'US', region: 'North America', type: 'regulatory', category: 'approvals', isActive: true },
          { id: 'fda_recalls', name: 'FDA Device Recalls', endpoint: 'https://api.fda.gov/device/recall.json', country: 'US', region: 'North America', type: 'safety', category: 'recalls', isActive: true },
          // Add only essential sources for performance
        ];
        
        for (const source of requiredSources) {
          try {
            await storage.createDataSource(source);
            logger.debug(`Created/Updated data source: ${source.name}`);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            logger.debug(`Data source ${source.name} already exists or error: ${errorMessage}`);
          }
        }
      }
      
      const finalCount = await storage.getAllDataSources();
      logger.info(`Data sources ready: ${finalCount.length} sources available`);
      
    } catch (error) {
      logger.error("Error initializing data sources", { error });
      throw error;
    }
  }

  private async initializeLegalDataIfNeeded(): Promise<void> {
    try {
      const currentLegalCases = await storage.getAllLegalCases();
      logger.info(`Current legal cases in database: ${currentLegalCases.length}`);
      
      // Only initialize if we have insufficient data
      if (currentLegalCases.length < 100) {
        logger.info("Initializing legal data in background...");
        await legalDataService.initializeLegalData();
        
        const updatedLegalCount = await storage.getAllLegalCases();
        logger.info(`Legal data initialized: ${updatedLegalCount.length} legal cases`);
      }
    } catch (error) {
      logger.error("Error initializing legal data", { error });
      // Don't throw - allow other init to continue
    }
  }

  private async initializeRegulatoryDataIfNeeded(): Promise<void> {
    try {
      const currentUpdates = await storage.getAllRegulatoryUpdates();
      logger.info(`Current regulatory updates: ${currentUpdates.length}`);
      
      // Only collect if we have insufficient data
      if (currentUpdates.length < 1000) {
        logger.info("Starting regulatory data collection in background...");
        
        // Import and initialize data collection service
        const { DataCollectionService } = await import("./dataCollectionService");
        const dataService = new DataCollectionService();
        
        // Perform limited initial collection to avoid overwhelming startup
        await dataService.performLimitedDataCollection(10);
        
        const updatedCount = await storage.getAllRegulatoryUpdates();
        logger.info(`Regulatory data collection completed: ${updatedCount.length} updates`);
      }
    } catch (error) {
      logger.error("Error collecting regulatory data", { error });
      // Don't throw - allow other init to continue
    }
  }
}

export const backgroundInitService = BackgroundInitService.getInstance();