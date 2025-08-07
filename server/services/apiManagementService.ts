import { storage } from '../storage';
import type { InsertRegulatoryUpdate } from '@shared/schema';

/**
 * Zentrales API-Management-System für alle Datenquellen
 * Basierend auf der Deep Search Analyse der verfügbaren APIs
 */

export interface DataSource {
  id: string;
  name: string;
  type: 'official_api' | 'web_scraping' | 'partner_api';
  endpoint?: string;
  requiresAuth: boolean;
  priority: 'high' | 'medium' | 'low';
  region: string;
  status: 'active' | 'inactive' | 'testing';
  lastSync?: Date;
  errorCount: number;
}

export interface APIResponse {
  success: boolean;
  data?: any[];
  error?: string;
  rateLimitRemaining?: number;
  nextSyncTime?: Date;
}

export class APIManagementService {
  private dataSources: Map<string, DataSource> = new Map();
  private rateLimits: Map<string, { requests: number; resetTime: Date }> = new Map();

  constructor() {
    this.initializeDataSources();
  }

  private initializeDataSources() {
    // Priorität 1: Offizielle APIs mit direktem Zugang
    this.registerDataSource({
      id: 'fda_openfda',
      name: 'FDA OpenFDA API',
      type: 'official_api',
      endpoint: 'https://api.fda.gov',
      requiresAuth: false, // API Key empfohlen aber nicht erforderlich
      priority: 'high',
      region: 'United States',
      status: 'active',
      errorCount: 0
    });

    // Priorität 2: APIs mit Registrierungsanforderung
    this.registerDataSource({
      id: 'ema_pms',
      name: 'EMA Product Management Service',
      type: 'official_api',
      endpoint: 'https://api.ema.europa.eu',
      requiresAuth: true, // Erfordert EMA-Benutzerkonto
      priority: 'high',
      region: 'European Union',
      status: 'testing', // Benötigt Zugangsdaten
      errorCount: 0
    });

    this.registerDataSource({
      id: 'mhra_more',
      name: 'MHRA MORE Platform API',
      type: 'official_api',
      endpoint: 'https://www.gov.uk/api/more',
      requiresAuth: true, // Erfordert MORE Portal Registrierung
      priority: 'medium',
      region: 'United Kingdom',
      status: 'testing', // Benötigt Zugangsdaten
      errorCount: 0
    });

    // Priorität 3: Web Scraping für Behörden ohne APIs
    this.registerDataSource({
      id: 'bfarm_scraping',
      name: 'BfArM Web Scraping',
      type: 'web_scraping',
      endpoint: 'https://www.bfarm.de',
      requiresAuth: false,
      priority: 'medium',
      region: 'Germany',
      status: 'active',
      errorCount: 0
    });

    this.registerDataSource({
      id: 'swissmedic_scraping',
      name: 'Swissmedic Web Scraping',
      type: 'web_scraping',
      endpoint: 'https://www.swissmedic.ch',
      requiresAuth: false,
      priority: 'medium',
      region: 'Switzerland',
      status: 'active',
      errorCount: 0
    });

    this.registerDataSource({
      id: 'health_canada_scraping',
      name: 'Health Canada Web Scraping',
      type: 'web_scraping',
      endpoint: 'https://www.canada.ca/en/health-canada',
      requiresAuth: false,
      priority: 'medium',
      region: 'Canada',
      status: 'active',
      errorCount: 0
    });
  }

  private registerDataSource(source: DataSource) {
    this.dataSources.set(source.id, source);
    console.log(`[API Management] Registered data source: ${source.name} (${source.type})`);
  }

  /**
   * Rate Limiting Management
   */
  private async checkRateLimit(sourceId: string): Promise<boolean> {
    const limit = this.rateLimits.get(sourceId);
    if (!limit) return true;

    if (limit.resetTime < new Date()) {
      this.rateLimits.delete(sourceId);
      return true;
    }

    return limit.requests > 0;
  }

  private updateRateLimit(sourceId: string, requestsRemaining: number, resetTime: Date) {
    this.rateLimits.set(sourceId, {
      requests: requestsRemaining,
      resetTime
    });
  }

  /**
   * Zentrale API-Aufruf-Methode mit einheitlichem Error Handling
   */
  async callAPI(sourceId: string, endpoint: string, options?: any): Promise<APIResponse> {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      return { success: false, error: `Unknown data source: ${sourceId}` };
    }

    // Rate Limit Check
    if (!(await this.checkRateLimit(sourceId))) {
      return { 
        success: false, 
        error: 'Rate limit exceeded',
        nextSyncTime: this.rateLimits.get(sourceId)?.resetTime || new Date()
      };
    }

    try {
      const response = await this.executeAPICall(source, endpoint, options);
      
      // Success - Reset error count
      source.errorCount = 0;
      source.lastSync = new Date();
      
      return {
        success: true,
        data: response.data,
        rateLimitRemaining: response.rateLimitRemaining
      };

    } catch (error) {
      source.errorCount++;
      
      // Automatic deactivation after 5 consecutive errors
      if (source.errorCount >= 5) {
        source.status = 'inactive';
        console.error(`[API Management] Deactivating source ${sourceId} due to repeated errors`);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeAPICall(source: DataSource, endpoint: string, options?: any): Promise<any> {
    const fullUrl = `${source.endpoint}${endpoint}`;
    
    switch (source.type) {
      case 'official_api':
        return await this.callOfficialAPI(fullUrl, source, options);
      case 'web_scraping':
        return await this.scrapeWebsite(fullUrl, source, options);
      case 'partner_api':
        return await this.callPartnerAPI(fullUrl, source, options);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  private async callOfficialAPI(url: string, source: DataSource, options?: any): Promise<any> {
    const headers: Record<string, string> = {
      'User-Agent': 'Helix-Regulatory-Intelligence/1.0',
      'Accept': 'application/json'
    };

    // Add authentication headers if required
    if (source.requiresAuth && options?.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    const response = await fetch(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Extract rate limit info from headers
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (rateLimitRemaining && rateLimitReset) {
      this.updateRateLimit(
        source.id,
        parseInt(rateLimitRemaining),
        new Date(parseInt(rateLimitReset) * 1000)
      );
    }

    return {
      data: await response.json(),
      rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined
    };
  }

  private async scrapeWebsite(url: string, source: DataSource, options?: any): Promise<any> {
    // 🔴 MOCK DATA - Web Scraping Implementation würde hier erfolgen
    // 🔴 MOCK DATA - Für jetzt Placeholder mit Logging - AUTHENTIC SCRAPER REQUIRED
    console.log(`[API Management] Web scraping ${url} - Implementation needed`);
    
    // Return structured data format
    return {
      data: [],
      rateLimitRemaining: undefined
    };
  }

  private async callPartnerAPI(url: string, source: DataSource, options?: any): Promise<any> {
    // Partner API calls (wie GRIP) würden hier implementiert
    console.log(`[API Management] Partner API call to ${url}`);
    
    return {
      data: [],
      rateLimitRemaining: undefined
    };
  }

  /**
   * Get all active data sources
   */
  getActiveDataSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.status === 'active');
  }

  /**
   * Get data sources by region
   */
  getDataSourcesByRegion(region: string): DataSource[] {
    return Array.from(this.dataSources.values()).filter(source => source.region === region);
  }

  /**
   * Get data sources requiring authentication
   */
  getUnauthenticatedSources(): DataSource[] {
    return Array.from(this.dataSources.values()).filter(
      source => source.requiresAuth && source.status === 'testing'
    );
  }

  /**
   * Health check for all data sources
   */
  async performHealthCheck(): Promise<{ healthy: number; unhealthy: number; details: any[] }> {
    const results = [];
    let healthy = 0;
    let unhealthy = 0;

    for (const source of this.dataSources.values()) {
      try {
        // Simple health check endpoint
        const result = await this.callAPI(source.id, '/health', { timeout: 5000 });
        if (result.success) {
          healthy++;
          results.push({ sourceId: source.id, status: 'healthy', lastSync: source.lastSync });
        } else {
          unhealthy++;
          results.push({ sourceId: source.id, status: 'unhealthy', error: result.error });
        }
      } catch (error) {
        unhealthy++;
        results.push({ 
          sourceId: source.id, 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return { healthy, unhealthy, details: results };
  }
}

export const apiManagementService = new APIManagementService();