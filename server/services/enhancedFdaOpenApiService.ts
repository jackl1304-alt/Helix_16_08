import { storage } from '../storage';
import { nlpService } from './nlpService';
import type { InsertRegulatoryUpdate } from '@shared/schema';

interface FDADevice {
  k_number?: string;
  device_name?: string;
  applicant?: string;
  date_received?: string;
  decision_date?: string;
  decision?: string;
  review_advisory_committee?: string;
  product_code?: string;
  regulation_number?: string;
  clearance_type?: string;
  third_party_flag?: string;
  expedited_review_flag?: string;
  statement_or_summary?: string;
  type?: string;
  openfda?: {
    device_name?: string;
    medical_specialty_description?: string;
    regulation_number?: string;
    device_class?: string;
    fei_number?: string[];
    registration_number?: string[];
  };
}

interface FDARecall {
  recall_number?: string;
  reason_for_recall?: string;
  status?: string;
  distribution_pattern?: string;
  product_description?: string;
  code_info?: string;
  product_quantity?: string;
  recall_initiation_date?: string;
  state?: string;
  event_id?: string;
  product_type?: string;
  more_code_info?: string;
  recalling_firm?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state_code?: string;
  postal_code?: string;
  country?: string;
  voluntary_mandated?: string;
  classification?: string;
  openfda?: {
    device_name?: string;
    medical_specialty_description?: string;
    regulation_number?: string;
    device_class?: string;
    fei_number?: string[];
    registration_number?: string[];
  };
}

export class EnhancedFDAOpenAPIService {
  private baseUrl = 'https://api.fda.gov';
  private rateLimitDelay = 1000; // 1 second between requests

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      console.log(`[Enhanced FDA API] Requesting: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Rate limiting
      await this.delay(this.rateLimitDelay);
      
      return data;
    } catch (error) {
      console.error(`[Enhanced FDA API] Request failed:`, error);
      throw error;
    }
  }

  async collect510kDevices(limit: number = 100): Promise<void> {
    try {
      console.log(`[Enhanced FDA API] Collecting 510(k) devices (limit: ${limit})`);
      
      const endpoint = `${this.baseUrl}/device/510k.json?limit=${limit}&sort=date_received:desc`;
      const data = await this.makeRequest(endpoint);
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid FDA 510k response format');
      }
      
      console.log(`[Enhanced FDA API] Found ${data.results.length} 510(k) devices`);
      
      for (const device of data.results as FDADevice[]) {
        await this.process510kDevice(device);
      }
      
      console.log(`[Enhanced FDA API] 510(k) collection completed`);
    } catch (error) {
      console.error('[Enhanced FDA API] Error collecting 510k devices:', error);
      throw error;
    }
  }

  private async process510kDevice(device: FDADevice): Promise<void> {
    try {
      const content = this.formatDeviceContent(device);
      const categories = await nlpService.categorizeContent(content);
      const sourceId = await this.getFDASourceId();

      const regulatoryUpdate: InsertRegulatoryUpdate = {
        title: `FDA 510(k): ${device.device_name || 'Unknown Device'}${device.k_number ? ` (${device.k_number})` : ''}`,
        content,
        sourceId,
        sourceUrl: device.k_number ? `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${device.k_number}` : '',
        region: 'US',
        updateType: 'approval',
        priority: this.determinePriority(device),
        deviceClasses: device.openfda?.device_class ? [device.openfda.device_class] : [],
        categories: categories.categories,
        rawData: device,
        publishedAt: this.parseDate(device.date_received) || new Date(),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[Enhanced FDA API] Successfully created regulatory update: ${regulatoryUpdate.title}`);
    } catch (error) {
      console.error('[Enhanced FDA API] Error processing 510k device:', error);
    }
  }

  async collectRecalls(limit: number = 100): Promise<void> {
    try {
      console.log(`[Enhanced FDA API] Collecting device recalls (limit: ${limit})`);
      
      const endpoint = `${this.baseUrl}/device/recall.json?limit=${limit}&sort=recall_initiation_date:desc`;
      const data = await this.makeRequest(endpoint);
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid FDA recall response format');
      }
      
      console.log(`[Enhanced FDA API] Found ${data.results.length} recalls`);
      
      for (const recall of data.results as FDARecall[]) {
        await this.processRecall(recall);
      }
      
      console.log(`[Enhanced FDA API] Recall collection completed`);
    } catch (error) {
      console.error('[Enhanced FDA API] Error collecting recalls:', error);
      throw error;
    }
  }

  private async processRecall(recall: FDARecall): Promise<void> {
    try {
      const content = this.formatRecallContent(recall);
      const categories = await nlpService.categorizeContent(content);
      const sourceId = await this.getFDASourceId();

      const regulatoryUpdate: InsertRegulatoryUpdate = {
        title: `FDA Recall: ${recall.product_description || 'Medical Device Recall'}`,
        content,
        sourceId,
        sourceUrl: recall.recall_number ? `https://www.fda.gov/medical-devices/medical-device-recalls/${recall.recall_number}` : '',
        region: 'US',
        updateType: 'recall',
        priority: this.determineRecallPriority(recall),
        deviceClasses: recall.openfda?.device_class ? [recall.openfda.device_class] : [],
        categories: categories.categories,
        rawData: recall,
        publishedAt: this.parseDate(recall.recall_initiation_date) || new Date(),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[Enhanced FDA API] Successfully created recall update: ${regulatoryUpdate.title}`);
    } catch (error) {
      console.error('[Enhanced FDA API] Error processing recall:', error);
    }
  }

  private formatDeviceContent(device: FDADevice): string {
    const parts = [];
    
    if (device.device_name) parts.push(`Device: ${device.device_name}`);
    if (device.applicant) parts.push(`Applicant: ${device.applicant}`);
    if (device.decision) parts.push(`Decision: ${device.decision}`);
    if (device.statement_or_summary) parts.push(`Summary: ${device.statement_or_summary}`);
    if (device.review_advisory_committee) parts.push(`Review Committee: ${device.review_advisory_committee}`);
    if (device.product_code) parts.push(`Product Code: ${device.product_code}`);
    if (device.regulation_number) parts.push(`Regulation: ${device.regulation_number}`);
    if (device.openfda?.device_class) parts.push(`Device Class: ${device.openfda.device_class}`);
    if (device.openfda?.medical_specialty_description) parts.push(`Medical Specialty: ${device.openfda.medical_specialty_description}`);

    return parts.join('\n');
  }

  private formatRecallContent(recall: FDARecall): string {
    const parts = [];
    
    if (recall.product_description) parts.push(`Product: ${recall.product_description}`);
    if (recall.reason_for_recall) parts.push(`Reason: ${recall.reason_for_recall}`);
    if (recall.recalling_firm) parts.push(`Recalling Firm: ${recall.recalling_firm}`);
    if (recall.distribution_pattern) parts.push(`Distribution: ${recall.distribution_pattern}`);
    if (recall.product_quantity) parts.push(`Quantity: ${recall.product_quantity}`);
    if (recall.classification) parts.push(`Classification: ${recall.classification}`);
    if (recall.voluntary_mandated) parts.push(`Type: ${recall.voluntary_mandated}`);
    if (recall.status) parts.push(`Status: ${recall.status}`);

    return parts.join('\n');
  }

  private determinePriority(device: FDADevice): 'high' | 'medium' | 'low' {
    if (device.openfda?.device_class === 'Class III' || device.expedited_review_flag === 'Y') {
      return 'high';
    }
    if (device.openfda?.device_class === 'Class II') {
      return 'medium';
    }
    return 'low';
  }

  private determineRecallPriority(recall: FDARecall): 'high' | 'medium' | 'low' {
    if (recall.classification === 'Class I') {
      return 'high';
    }
    if (recall.classification === 'Class II') {
      return 'medium';
    }
    return 'low';
  }

  private parseDate(dateString?: string): Date | null {
    if (!dateString) return null;
    try {
      return new Date(dateString);
    } catch {
      return null;
    }
  }

  private async getFDASourceId(): Promise<string> {
    try {
      const sources = await storage.getAllDataSources();
      const fdaSource = sources.find(s => s.id === 'fda_510k' || s.name?.includes('FDA'));
      return fdaSource?.id || 'fda_510k';
    } catch (error) {
      console.error('Error getting FDA source ID:', error);
      return 'fda_510k';
    }
  }
}

export const enhancedFdaOpenApiService = new EnhancedFDAOpenAPIService();