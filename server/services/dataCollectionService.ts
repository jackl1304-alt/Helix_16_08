import { storage } from "../storage";
import * as nlpServiceModule from "./nlpService";
const nlpService = nlpServiceModule.nlpService;
import type { InsertRegulatoryUpdate } from "@shared/schema";

interface FDAResponse {
  results: Array<{
    k_number?: string;
    device_name?: string;
    decision_description?: string;
    decision_date?: string;
    advisory_committee_description?: string;
    product_code?: string;
    device_class?: string;
    regulation_number?: string;
    medical_specialty_description?: string;
    summary?: string;
  }>;
  meta: {
    total: number;
  };
}

interface EMAMedicine {
  name: string;
  active_substance: string;
  international_non_proprietary_name: string;
  therapeutic_area: string;
  authorisation_status: string;
  date_of_opinion: string;
  decision_date: string;
  revision_number: string;
  condition_indication: string;
  species: string;
  atc_code: string;
  orphan_medicine: string;
  marketing_authorisation_date: string;
  date_of_refusal_withdrawal: string;
  url: string;
}

class DataCollectionService {
  private readonly FDA_BASE_URL = "https://api.fda.gov/device";
  private readonly EMA_MEDICINES_URL = "https://www.ema.europa.eu/en/medicines/download-medicine-data";

  async collectFDAData(): Promise<void> {
    console.log("Starting FDA data collection...");
    
    try {
      // Get 510(k) clearances from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateString = thirtyDaysAgo.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `${this.FDA_BASE_URL}/510k.json?search=decision_date:[${dateString}+TO+*]&limit=100`
      );

      if (!response.ok) {
        throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
      }

      const data: FDAResponse = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log("No new FDA 510(k) data found");
        return;
      }

      console.log(`Processing ${data.results.length} FDA 510(k) records`);

      for (const item of data.results) {
        if (!item.k_number || !item.device_name) continue;

        const categories = await nlpService.categorizeContent(
          `${item.device_name} ${item.summary || ''} ${item.medical_specialty_description || ''}`
        );

        const updateData: InsertRegulatoryUpdate = {
          title: `FDA 510(k): ${item.device_name}`,
          description: item.summary || item.decision_description || 'FDA 510(k) clearance',
          sourceId: await this.getFDASourceId(),
          sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${item.k_number}`,
          region: 'US',
          updateType: 'approval',
          priority: this.determinePriority(item.device_class),
          deviceClasses: item.device_class ? [item.device_class] : [],
          categories,
          rawData: item,
          publishedAt: item.decision_date ? new Date(item.decision_date) : new Date(),
        };

        await storage.createRegulatoryUpdate(updateData);
      }

      // Also collect recalls
      await this.collectFDARecalls();
      
      console.log("FDA data collection completed");
    } catch (error) {
      console.error("Error collecting FDA data:", error);
      throw error;
    }
  }

  private async collectFDARecalls(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateString = thirtyDaysAgo.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `${this.FDA_BASE_URL}/recall.json?search=report_date:[${dateString}+TO+*]&limit=100`
      );

      if (!response.ok) {
        throw new Error(`FDA Recall API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log("No new FDA recall data found");
        return;
      }

      console.log(`Processing ${data.results.length} FDA recall records`);

      for (const item of data.results) {
        if (!item.product_description) continue;

        const categories = await nlpService.categorizeContent(
          `${item.product_description} ${item.reason_for_recall || ''}`
        );

        const updateData: InsertRegulatoryUpdate = {
          title: `FDA Recall: ${item.product_description}`,
          description: item.reason_for_recall || 'FDA device recall',
          sourceId: await this.getFDASourceId(),
          sourceUrl: item.more_code_info || 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
          region: 'US',
          updateType: 'recall',
          priority: 'high', // Recalls are always high priority
          deviceClasses: item.product_classification ? [item.product_classification] : [],
          categories,
          rawData: item,
          publishedAt: item.report_date ? new Date(item.report_date) : new Date(),
        };

        await storage.createRegulatoryUpdate(updateData);
      }
    } catch (error) {
      console.error("Error collecting FDA recall data:", error);
    }
  }

  async collectEMAData(): Promise<void> {
    console.log("Starting EMA data collection...");
    
    try {
      // Note: EMA doesn't have a direct API, so we would typically parse their download tables
      // For this MVP, we'll simulate the process with a basic structure
      
      // In a real implementation, you would:
      // 1. Download the Excel files from EMA website
      // 2. Parse the Excel data
      // 3. Compare with existing data to find updates
      
      // For now, we'll create a placeholder that could be extended
      console.log("EMA data collection would parse downloadable Excel tables");
      
      // Example of how real EMA data might be processed:
      const mockEMAData: Partial<EMAMedicine>[] = [
        // This would come from parsing actual EMA Excel downloads
      ];

      for (const item of mockEMAData) {
        if (!item.name) continue;

        const categories = await nlpService.categorizeContent(
          `${item.name} ${item.therapeutic_area || ''} ${item.condition_indication || ''}`
        );

        const updateData: InsertRegulatoryUpdate = {
          title: `EMA: ${item.name}`,
          description: item.condition_indication || 'EMA centrally authorized medicine',
          sourceId: await this.getEMASourceId(),
          sourceUrl: item.url || 'https://www.ema.europa.eu/en/medicines',
          region: 'EU',
          updateType: item.authorisation_status?.includes('withdrawn') ? 'variation' : 'approval',
          priority: 'medium',
          deviceClasses: item.therapeutic_area ? [item.therapeutic_area] : [],
          categories,
          rawData: item,
          publishedAt: item.marketing_authorisation_date ? new Date(item.marketing_authorisation_date) : new Date(),
        };

        await storage.createRegulatoryUpdate(updateData);
      }
      
      console.log("EMA data collection completed");
    } catch (error) {
      console.error("Error collecting EMA data:", error);
      throw error;
    }
  }

  async syncDataSource(sourceId: string): Promise<void> {
    const source = await storage.getDataSourceById(sourceId);
    if (!source) {
      throw new Error("Data source not found");
    }

    switch (source.type) {
      case 'fda':
        await this.collectFDAData();
        break;
      case 'ema':
        await this.collectEMAData();
        break;
      default:
        throw new Error(`Unsupported data source type: ${source.type}`);
    }

    await storage.updateDataSourceLastSync(sourceId, new Date());
  }

  async syncAllSources(): Promise<void> {
    console.log("Starting sync of all data sources...");
    
    try {
      await this.collectFDAData();
      await this.collectEMAData();
      console.log("All data sources synced successfully");
    } catch (error) {
      console.error("Error syncing data sources:", error);
      throw error;
    }
  }

  private async getFDASourceId(): Promise<string> {
    let source = await storage.getDataSourceByType('fda');
    if (!source) {
      source = await storage.createDataSource({
        name: 'FDA OpenFDA',
        type: 'fda',
        endpoint: this.FDA_BASE_URL,
        isActive: true,
        configData: { baseUrl: this.FDA_BASE_URL }
      });
    }
    return source.id;
  }

  private async getEMASourceId(): Promise<string> {
    let source = await storage.getDataSourceByType('ema');
    if (!source) {
      source = await storage.createDataSource({
        name: 'EMA Database',
        type: 'ema',
        endpoint: this.EMA_MEDICINES_URL,
        isActive: true,
        configData: { baseUrl: this.EMA_MEDICINES_URL }
      });
    }
    return source.id;
  }

  private determinePriority(deviceClass?: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (!deviceClass) return 'medium';
    
    const classNum = deviceClass.toLowerCase();
    if (classNum.includes('iii') || classNum.includes('3')) return 'high';
    if (classNum.includes('ii') || classNum.includes('2')) return 'medium';
    return 'low';
  }
}

export const dataCollectionService = new DataCollectionService();
