import { storage } from "../storage";
import { aiService } from "./aiService";
import { dataCollectionService } from "./dataCollectionService";
import { fdaOpenApiService } from "./fdaOpenApiService";
import { legalAnalysisService } from "./legalAnalysisService";
import type { RegulatoryUpdate, LegalCase } from "@shared/schema";

/**
 * Production Service for comprehensive regulatory intelligence management
 * Implements enterprise-grade data processing, quality assurance, and analytics
 */
export class ProductionService {
  private readonly serviceName = "ProductionService";
  private readonly version = "2.0.0";

  // Production metrics tracking
  private metrics = {
    dataProcessed: 0,
    successfulAnalyses: 0,
    errorCount: 0,
    averageProcessingTime: 0,
    lastUpdate: new Date()
  };

  /**
   * Comprehensive production data synchronization
   * Orchestrates all data collection and analysis services
   */
  async executeProductionSync(): Promise<{
    success: boolean;
    summary: {
      regulatoryUpdates: number;
      legalCases: number;
      aiAnalyses: number;
      performance: {
        duration: number;
        throughput: number;
        errorRate: number;
      };
    };
  }> {
    const startTime = Date.now();
    console.log(`🚀 [${this.serviceName}] Starting production synchronization...`);

    try {
      // Phase 1: Data Collection
      console.log("📥 Phase 1: Executing comprehensive data collection...");
      const collectionResults = await dataCollectionService.collectAllDataWithMetrics();

      // Phase 2: Legal Case Analysis
      console.log("⚖️ Phase 2: Analyzing legal cases...");
      const legalResults = await this.executeLegalAnalysis();

      // Phase 3: AI-Powered Analytics
      console.log("🧠 Phase 3: Running AI analytics...");
      const aiResults = await this.executeAIAnalytics();

      // Phase 4: Quality Assurance
      console.log("🔍 Phase 4: Quality assurance and validation...");
      const qaResults = await this.executeQualityAssurance();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update metrics
      this.updateMetrics(duration, collectionResults.success + legalResults.processed + aiResults.analyses);

      const summary = {
        regulatoryUpdates: collectionResults.totalUpdates,
        legalCases: legalResults.processed,
        aiAnalyses: aiResults.analyses,
        performance: {
          duration,
          throughput: (collectionResults.totalUpdates + legalResults.processed) / (duration / 1000),
          errorRate: (collectionResults.errors + legalResults.errors) / (collectionResults.success + legalResults.processed)
        }
      };

      console.log(`✅ [${this.serviceName}] Production sync completed successfully`);
      console.log(`📊 Summary: ${summary.regulatoryUpdates} updates, ${summary.legalCases} legal cases, ${summary.aiAnalyses} analyses`);
      console.log(`⏱️ Performance: ${duration}ms, ${summary.performance.throughput.toFixed(2)} items/sec`);

      return {
        success: true,
        summary
      };

    } catch (error) {
      console.error(`❌ [${this.serviceName}] Production sync failed:`, error);
      this.metrics.errorCount++;
      
      return {
        success: false,
        summary: {
          regulatoryUpdates: 0,
          legalCases: 0,
          aiAnalyses: 0,
          performance: {
            duration: Date.now() - startTime,
            throughput: 0,
            errorRate: 1.0
          }
        }
      };
    }
  }

  /**
   * Execute comprehensive legal case analysis
   */
  private async executeLegalAnalysis(): Promise<{ processed: number; errors: number }> {
    try {
      const allLegalCases = await storage.getAllLegalCases();
      let processed = 0;
      let errors = 0;

      // Process in batches for better performance
      const batchSize = 50;
      for (let i = 0; i < allLegalCases.length; i += batchSize) {
        const batch = allLegalCases.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(async (legalCase) => {
            try {
              const analysis = await aiService.analyzeLegalCase({
                title: legalCase.title,
                summary: legalCase.summary,
                keyIssues: legalCase.keywords || []
              });
              
              // Update case with AI analysis (if storage method exists)
              if ('updateLegalCaseAnalysis' in storage) {
                await (storage as any).updateLegalCaseAnalysis(legalCase.id, analysis);
              }
              
              return analysis;
            } catch (error) {
              console.error(`❌ Error analyzing legal case ${legalCase.id}:`, error);
              throw error;
            }
          })
        );

        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            processed++;
          } else {
            errors++;
          }
        });

        // Rate limiting between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`⚖️ Legal analysis completed: ${processed} processed, ${errors} errors`);
      return { processed, errors };

    } catch (error) {
      console.error("❌ Error in legal analysis execution:", error);
      return { processed: 0, errors: 1 };
    }
  }

  /**
   * Execute AI-powered analytics across all data
   */
  private async executeAIAnalytics(): Promise<{ analyses: number; insights: string[] }> {
    try {
      const allUpdates = await storage.getAllRegulatoryUpdates();
      let analyses = 0;
      const insights: string[] = [];

      // Market trend analysis
      const marketTrends = await aiService.analyzeMarketTrends(allUpdates);
      analyses++;

      // ML-powered trend analysis
      const mlTrends = await aiService.analyzeMarketTrendsML(allUpdates);
      analyses++;

      // Generate insights
      insights.push(...marketTrends.recommendations);
      insights.push(`Emerging technologies: ${mlTrends.emergingTechnologies.join(', ')}`);
      insights.push(`Regulatory focus areas: ${mlTrends.regulatoryFocus.join(', ')}`);

      console.log(`🧠 AI analytics completed: ${analyses} analyses, ${insights.length} insights generated`);
      return { analyses, insights };

    } catch (error) {
      console.error("❌ Error in AI analytics execution:", error);
      return { analyses: 0, insights: [] };
    }
  }

  /**
   * Execute quality assurance and data validation
   */
  private async executeQualityAssurance(): Promise<{ validated: number; issues: number }> {
    try {
      let validated = 0;
      let issues = 0;

      // Validate regulatory updates
      const updates = await storage.getAllRegulatoryUpdates();
      for (const update of updates.slice(0, 100)) { // Sample validation
        const isValid = this.validateRegulatoryUpdate(update);
        if (isValid) {
          validated++;
        } else {
          issues++;
        }
      }

      // Validate legal cases
      const legalCases = await storage.getAllLegalCases();
      for (const legalCase of legalCases.slice(0, 50)) { // Sample validation
        const isValid = this.validateLegalCase(legalCase);
        if (isValid) {
          validated++;
        } else {
          issues++;
        }
      }

      console.log(`🔍 Quality assurance completed: ${validated} validated, ${issues} issues found`);
      return { validated, issues };

    } catch (error) {
      console.error("❌ Error in quality assurance:", error);
      return { validated: 0, issues: 1 };
    }
  }

  /**
   * Validate regulatory update data quality
   */
  private validateRegulatoryUpdate(update: RegulatoryUpdate): boolean {
    if (!update.title || update.title.trim().length < 10) return false;
    if (!update.description || update.description.trim().length < 20) return false;
    if (!update.sourceId || !update.region) return false;
    if (!['approval', 'guidance', 'recall', 'warning', 'update'].includes(update.updateType)) return false;
    if (!['critical', 'high', 'medium', 'low'].includes(update.priority)) return false;
    
    return true;
  }

  /**
   * Validate legal case data quality
   */
  private validateLegalCase(legalCase: LegalCase): boolean {
    if (!legalCase.title || legalCase.title.trim().length < 10) return false;
    if (!legalCase.summary || legalCase.summary.trim().length < 30) return false;
    if (!legalCase.caseNumber || !legalCase.court) return false;
    if (!legalCase.jurisdiction || !legalCase.impactLevel) return false;
    
    return true;
  }

  /**
   * Update internal performance metrics
   */
  private updateMetrics(duration: number, itemsProcessed: number): void {
    this.metrics.dataProcessed += itemsProcessed;
    this.metrics.successfulAnalyses++;
    this.metrics.averageProcessingTime = (this.metrics.averageProcessingTime + duration) / 2;
    this.metrics.lastUpdate = new Date();
  }

  /**
   * Get current service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      serviceName: this.serviceName,
      version: this.version
    };
  }

  /**
   * Health check for production service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Array<{ name: string; status: string; lastCheck: Date }>;
    uptime: number;
  }> {
    const startTime = Date.now();
    const services = [];

    // Check data collection service
    try {
      await dataCollectionService.collectFDAData();
      services.push({ name: 'DataCollection', status: 'healthy', lastCheck: new Date() });
    } catch (error) {
      services.push({ name: 'DataCollection', status: 'unhealthy', lastCheck: new Date() });
    }

    // Check AI service
    try {
      await aiService.analyzeRegulatoryContent("Test medical device content");
      services.push({ name: 'AIService', status: 'healthy', lastCheck: new Date() });
    } catch (error) {
      services.push({ name: 'AIService', status: 'unhealthy', lastCheck: new Date() });
    }

    // Check legal analysis service
    try {
      await legalAnalysisService.analyzeLegalChanges();
      services.push({ name: 'LegalAnalysis', status: 'healthy', lastCheck: new Date() });
    } catch (error) {
      services.push({ name: 'LegalAnalysis', status: 'unhealthy', lastCheck: new Date() });
    }

    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyServices === totalServices) {
      status = 'healthy';
    } else if (healthyServices > totalServices / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      services,
      uptime: Date.now() - startTime
    };
  }
}

export const productionService = new ProductionService();