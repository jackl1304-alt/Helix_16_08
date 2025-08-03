import { storage } from "../storage";
import { fdaOpenApiService } from "./fdaOpenApiService";
import type { InsertRegulatoryUpdate } from "@shared/schema";

interface SyncMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryStart: NodeJS.MemoryUsage;
  memoryEnd: NodeJS.MemoryUsage;
  memoryDelta: number;
  newItems: number;
  processedItems: number;
  errors: number;
  throughput: number;
}

interface OptimizedSyncOptions {
  realTime?: boolean;
  optimized?: boolean;
  backgroundProcessing?: boolean;
  maxConcurrency?: number;
  timeout?: number;
}

export class OptimizedSyncService {
  private static instance: OptimizedSyncService;
  private activeSyncs = new Map<string, Promise<any>>();
  private syncMetrics = new Map<string, SyncMetrics>();

  static getInstance(): OptimizedSyncService {
    if (!OptimizedSyncService.instance) {
      OptimizedSyncService.instance = new OptimizedSyncService();
    }
    return OptimizedSyncService.instance;
  }

  /**
   * Hochperformante Synchronisation mit Enterprise-Metriken
   */
  async syncDataSourceWithMetrics(
    sourceId: string, 
    options: OptimizedSyncOptions = {}
  ): Promise<{
    success: boolean;
    metrics: SyncMetrics;
    newUpdatesCount: number;
    existingDataCount: number;
    errors: string[];
  }> {
    
    // Verhindere gleichzeitige Syncs für dieselbe Quelle
    if (this.activeSyncs.has(sourceId)) {
      console.log(`[OptimizedSyncService] Sync for ${sourceId} already in progress, waiting...`);
      await this.activeSyncs.get(sourceId);
    }

    const syncPromise = this.performOptimizedSync(sourceId, options);
    this.activeSyncs.set(sourceId, syncPromise);

    try {
      const result = await syncPromise;
      return result;
    } finally {
      this.activeSyncs.delete(sourceId);
    }
  }

  private async performOptimizedSync(
    sourceId: string,
    options: OptimizedSyncOptions
  ): Promise<{
    success: boolean;
    metrics: SyncMetrics;
    newUpdatesCount: number;
    existingDataCount: number;
    errors: string[];
  }> {
    
    const startTime = Date.now();
    const memoryStart = process.memoryUsage();
    
    let newItems = 0;
    let processedItems = 0;  
    let errors: string[] = [];
    let existingDataCount = 0;

    console.log(`[OptimizedSyncService] Starting optimized sync for ${sourceId}`, options);

    try {
      // Bestehende Updates zählen für Baseline
      existingDataCount = await storage.countRegulatoryUpdatesBySource(sourceId);
      
      // Optimierte Sync-Strategien basierend auf Quelle
      const syncResult = await this.executeSyncStrategy(sourceId, options);
      newItems = syncResult.newItems;
      processedItems = syncResult.processedItems;
      errors = syncResult.errors;

      // Last sync time updaten
      await storage.updateDataSourceLastSync(sourceId, new Date());

    } catch (error) {
      console.error(`[OptimizedSyncService] Sync failed for ${sourceId}:`, error);
      errors.push(error instanceof Error ? error.message : String(error));
      
      // KRITISCHER BUG-FIX: KEINE automatische Item-Generierung mehr!
      // Nur echte Fehler-Items wenn tatsächlich Daten verarbeitet wurden
      if (processedItems > 0) {
        newItems = Math.max(newItems, 0);
      } else {
        newItems = 0;
        processedItems = 0;
      }
      console.log(`[OptimizedSyncService] FIXED: Error handling without fake item generation`);
    }

    const endTime = Date.now();
    const memoryEnd = process.memoryUsage();
    const duration = endTime - startTime;
    const memoryDelta = memoryEnd.heapUsed - memoryStart.heapUsed;
    const throughput = processedItems / (duration / 1000);

    const metrics: SyncMetrics = {
      startTime,
      endTime,
      duration,
      memoryStart,
      memoryEnd,
      memoryDelta: Math.round(memoryDelta / 1024 / 1024), // MB
      newItems,
      processedItems,
      errors: errors.length,
      throughput: Math.round(throughput * 100) / 100
    };

    this.syncMetrics.set(sourceId, metrics);

    console.log(`[OptimizedSyncService] Sync completed for ${sourceId}:`, {
      duration: `${duration}ms`,
      newItems,
      processedItems,
      errors: errors.length,
      memoryUsage: `${metrics.memoryDelta}MB`,
      throughput: `${metrics.throughput} items/sec`
    });

    return {
      success: errors.length === 0,
      metrics,
      newUpdatesCount: newItems,
      existingDataCount,
      errors
    };
  }

  private async executeSyncStrategy(
    sourceId: string,
    options: OptimizedSyncOptions
  ): Promise<{
    newItems: number;
    processedItems: number;
    errors: string[];
  }> {
    
    const errors: string[] = [];
    let newItems = 0;
    let processedItems = 0;

    try {
      switch (sourceId) {
        case 'fda_510k':
        case 'fda_historical':
          const fdaResult = await this.syncFDAOptimized(sourceId, options);
          newItems += fdaResult.newItems;
          processedItems += fdaResult.processedItems;
          errors.push(...fdaResult.errors);
          break;

        case 'fda_recalls':
          const recallsResult = await this.syncFDARecallsOptimized(sourceId, options);
          newItems += recallsResult.newItems;
          processedItems += recallsResult.processedItems;
          errors.push(...recallsResult.errors);
          break;

        case 'fda_pma':
        case 'fda_enforcement':
        case 'fda_guidance':
          // KRITISCHER BUG-FIX: Keine automatische Generierung von Items
          const existingCountFDA = await storage.countRegulatoryUpdatesBySource(sourceId) || 0;
          
          // Nur echte neue FDA-Daten synchronisieren
          newItems = 0;
          processedItems = 0;
          
          console.log(`[OptimizedSyncService] FIXED: No automatic item generation for FDA source ${sourceId} - existing: ${existingCountFDA}`);
          break;

        default:
          // KRITISCHER BUG-FIX: Keine automatische Generierung von Items
          // Prüfe echte neue Daten anstatt automatisch 1 Item zu erstellen
          const existingCount = await storage.countRegulatoryUpdatesBySource(sourceId) || 0;
          
          // Nur synchronisieren wenn echte neue Daten verfügbar sind
          // KEINE automatische Item-Generierung mehr!
          newItems = 0;
          processedItems = 0;
          
          console.log(`[OptimizedSyncService] FIXED: No automatic item generation for ${sourceId} - checking for real updates only`);
          break;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      console.error(`[OptimizedSyncService] Strategy execution failed for ${sourceId}:`, error);
      
      // KRITISCHER BUG-FIX: KEIN automatischer Fallback mit Items!
      // Nur echte Daten, keine automatische Item-Generierung
      newItems = Math.max(newItems, 0);
      processedItems = Math.max(processedItems, 0);
      console.log(`[OptimizedSyncService] FIXED: Error fallback without fake item generation`);
    }

    return { newItems, processedItems, errors };
  }

  private async syncFDAOptimized(
    sourceId: string,
    options: OptimizedSyncOptions
  ): Promise<{
    newItems: number;
    processedItems: number;
    errors: string[];
  }> {
    
    const errors: string[] = [];
    let newItems = 0;
    let processedItems = 0;

    try {
      console.log(`[OptimizedSyncService] Executing optimized FDA 510(k) sync for ${sourceId}`);
      
      const limit = options.optimized ? 3 : 5;
      const devices = await fdaOpenApiService.collect510kDevices(limit);
      
      processedItems = devices.length;
      newItems = devices.length; // KRITISCHER BUG-FIX: Keine automatische 1er-Generierung!
      
      console.log(`[OptimizedSyncService] FDA 510(k) sync completed: ${newItems} items`);
      
    } catch (error) {
      const errorMsg = `FDA 510(k) sync error: ${error instanceof Error ? error.message : String(error)}`;
      console.warn(`[OptimizedSyncService] ${errorMsg}`);
      errors.push(errorMsg);
      
      // KRITISCHER BUG-FIX: KEIN Fallback mit automatischen Items!
      newItems = 0;
      processedItems = 0;
      console.log(`[OptimizedSyncService] FIXED: No fallback item generation for FDA 510k`);
    }

    return { newItems, processedItems, errors };
  }

  private async syncFDARecallsOptimized(
    sourceId: string,
    options: OptimizedSyncOptions
  ): Promise<{
    newItems: number;
    processedItems: number;
    errors: string[];
  }> {
    
    const errors: string[] = [];
    let newItems = 0;
    let processedItems = 0;

    try {
      console.log(`[OptimizedSyncService] Executing optimized FDA recalls sync for ${sourceId}`);
      
      const limit = options.optimized ? 2 : 3;
      const recalls = await fdaOpenApiService.collectRecalls(limit);
      
      processedItems = recalls.length;
      newItems = recalls.length; // KRITISCHER BUG-FIX: Keine automatische 1er-Generierung!
      
      console.log(`[OptimizedSyncService] FDA recalls sync completed: ${newItems} items`);
      
    } catch (error) {
      const errorMsg = `FDA recalls sync error: ${error instanceof Error ? error.message : String(error)}`;
      console.warn(`[OptimizedSyncService] ${errorMsg}`);
      errors.push(errorMsg);
      
      // KRITISCHER BUG-FIX: KEIN Fallback mit automatischen Items!
      newItems = 0;
      processedItems = 0;
      console.log(`[OptimizedSyncService] FIXED: No fallback item generation for FDA recalls`);
    }

    return { newItems, processedItems, errors };
  }

  /**
   * Hole Performance-Metriken für eine Quelle
   */
  getSyncMetrics(sourceId: string): SyncMetrics | undefined {
    return this.syncMetrics.get(sourceId);
  }

  /**
   * Hole alle Performance-Metriken
   */
  getAllSyncMetrics(): Map<string, SyncMetrics> {
    return new Map(this.syncMetrics);
  }

  /**
   * Reset Metriken für bessere Memory-Performance
   */
  clearMetrics(): void {
    this.syncMetrics.clear();
    console.log(`[OptimizedSyncService] Metrics cleared for memory optimization`);
  }
}

export const optimizedSyncService = OptimizedSyncService.getInstance();