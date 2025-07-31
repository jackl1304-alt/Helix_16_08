import { storage } from '../storage';

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

export class FDAOpenAPIService {
  private baseUrl = 'https://api.fda.gov';
  private rateLimitDelay = 1000; // 1 second between requests

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      console.log(`[FDA API] Requesting: ${endpoint}`);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Rate limiting
      await this.delay(this.rateLimitDelay);
      
      return data;
    } catch (error) {
      console.error(`[FDA API] Request failed:`, error);
      throw error;
    }
  }

  async collect510kDevices(limit: number = 100): Promise<void> {
    try {
      console.log(`[FDA API] Collecting 510(k) devices (limit: ${limit})`);
      
      const endpoint = `${this.baseUrl}/device/510k.json?limit=${limit}&sort=date_received:desc`;
      const data = await this.makeRequest(endpoint);
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid FDA 510k response format');
      }
      
      console.log(`[FDA API] Found ${data.results.length} 510(k) devices`);
      
      for (const device of data.results as FDADevice[]) {
        await this.process510kDevice(device);
      }
      
      console.log(`[FDA API] 510(k) collection completed`);
    } catch (error) {
      console.error('[FDA API] Error collecting 510k devices:', error);
      throw error;
    }
  }

  private async process510kDevice(device: FDADevice): Promise<void> {
    try {
      const regulatoryUpdate = {
        id: `fda-510k-${device.k_number || Math.random().toString(36).substr(2, 9)}`,
        title: `FDA 510(k): ${device.device_name || 'Unknown Device'}${device.k_number ? ` (${device.k_number})` : ''}`,
        content: this.formatDeviceContent(device),
        source: 'FDA OpenAPI',
        type: 'FDA 510(k) Clearance',
        region: 'United States',
        authority: 'FDA',
        priority: this.determinePriority(device),
        device_class: device.openfda?.device_class || 'Unknown',
        product_code: device.product_code || '',
        regulation_number: device.regulation_number || device.openfda?.regulation_number || '',
        published_at: this.parseDate(device.date_received),
        decision_date: this.parseDate(device.decision_date),
        status: device.decision || 'Pending',
        metadata: {
          k_number: device.k_number,
          applicant: device.applicant,
          review_committee: device.review_advisory_committee,
          clearance_type: device.clearance_type,
          third_party: device.third_party_flag === 'Y',
          expedited_review: device.expedited_review_flag === 'Y',
          fei_numbers: device.openfda?.fei_number || [],
          registration_numbers: device.openfda?.registration_number || []
        }
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[FDA API] Successfully created regulatory update: ${regulatoryUpdate.title}`);
    } catch (error) {
      console.error('[FDA API] Error processing 510k device:', error);
    }
  }

  async collectRecalls(limit: number = 100): Promise<void> {
    try {
      console.log(`[FDA API] Collecting device recalls (limit: ${limit})`);
      
      const endpoint = `${this.baseUrl}/device/recall.json?limit=${limit}&sort=recall_initiation_date:desc`;
      const data = await this.makeRequest(endpoint);
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid FDA recall response format');
      }
      
      console.log(`[FDA API] Found ${data.results.length} recalls`);
      
      for (const recall of data.results as FDARecall[]) {
        await this.processRecall(recall);
      }
      
      console.log(`[FDA API] Recall collection completed`);
    } catch (error) {
      console.error('[FDA API] Error collecting recalls:', error);
      throw error;
    }
  }

  private async processRecall(recall: FDARecall): Promise<void> {
    try {
      const regulatoryUpdate = {
        id: `fda-recall-${recall.recall_number || Math.random().toString(36).substr(2, 9)}`,
        title: `FDA Recall: ${recall.product_description || 'Medical Device Recall'}`,
        content: this.formatRecallContent(recall),
        source: 'FDA OpenAPI',
        type: 'FDA Device Recall',
        region: 'United States',
        authority: 'FDA',
        priority: this.determineRecallPriority(recall),
        device_class: recall.openfda?.device_class || 'Unknown',
        classification: recall.classification || 'Unknown',
        published_at: this.parseDate(recall.recall_initiation_date),
        status: recall.status || 'Active',
        metadata: {
          recall_number: recall.recall_number,
          reason: recall.reason_for_recall,
          recalling_firm: recall.recalling_firm,
          distribution_pattern: recall.distribution_pattern,
          product_quantity: recall.product_quantity,
          voluntary_mandated: recall.voluntary_mandated,
          event_id: recall.event_id,
          address: {
            street: recall.address_1,
            street2: recall.address_2,
            city: recall.city,
            state: recall.state_code,
            postal_code: recall.postal_code,
            country: recall.country
          }
        }
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[FDA API] Successfully created recall update: ${regulatoryUpdate.title}`);
    } catch (error) {
      console.error('[FDA API] Error processing recall:', error);
    }
  }

  private formatDeviceContent(device: FDADevice): string {
    const parts = [];
    
    if (device.device_name) parts.push(`**Device:** ${device.device_name}`);
    if (device.applicant) parts.push(`**Applicant:** ${device.applicant}`);
    if (device.k_number) parts.push(`**K Number:** ${device.k_number}`);
    if (device.decision) parts.push(`**Decision:** ${device.decision}`);
    if (device.product_code) parts.push(`**Product Code:** ${device.product_code}`);
    if (device.regulation_number) parts.push(`**Regulation:** ${device.regulation_number}`);
    if (device.clearance_type) parts.push(`**Clearance Type:** ${device.clearance_type}`);
    if (device.review_advisory_committee) parts.push(`**Review Committee:** ${device.review_advisory_committee}`);
    
    if (device.statement_or_summary) {
      parts.push(`**Summary:** ${device.statement_or_summary}`);
    }
    
    if (device.openfda?.medical_specialty_description) {
      parts.push(`**Medical Specialty:** ${device.openfda.medical_specialty_description}`);
    }
    
    return parts.join('\n\n');
  }

  private formatRecallContent(recall: FDARecall): string {
    const parts = [];
    
    if (recall.product_description) parts.push(`**Product:** ${recall.product_description}`);
    if (recall.reason_for_recall) parts.push(`**Recall Reason:** ${recall.reason_for_recall}`);
    if (recall.recalling_firm) parts.push(`**Recalling Firm:** ${recall.recalling_firm}`);
    if (recall.classification) parts.push(`**Classification:** ${recall.classification}`);
    if (recall.status) parts.push(`**Status:** ${recall.status}`);
    if (recall.voluntary_mandated) parts.push(`**Type:** ${recall.voluntary_mandated}`);
    if (recall.distribution_pattern) parts.push(`**Distribution:** ${recall.distribution_pattern}`);
    if (recall.product_quantity) parts.push(`**Quantity:** ${recall.product_quantity}`);
    if (recall.code_info) parts.push(`**Code Info:** ${recall.code_info}`);
    
    return parts.join('\n\n');
  }

  private determinePriority(device: FDADevice): 'low' | 'medium' | 'high' | 'critical' {
    if (device.expedited_review_flag === 'Y') return 'high';
    if (device.openfda?.device_class === 'III') return 'high';
    if (device.openfda?.device_class === 'II') return 'medium';
    return 'low';
  }

  private determineRecallPriority(recall: FDARecall): 'low' | 'medium' | 'high' | 'critical' {
    if (recall.classification === 'Class I') return 'critical';
    if (recall.classification === 'Class II') return 'high';
    if (recall.classification === 'Class III') return 'medium';
    return 'low';
  }

  private parseDate(dateString?: string): Date {
    if (!dateString) return new Date();
    
    // FDA dates are typically in YYYY-MM-DD format
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  async syncFDAData(): Promise<void> {
    try {
      console.log('[FDA API] Starting comprehensive FDA data sync');
      
      // Collect latest 510(k) clearances
      await this.collect510kDevices(50);
      
      // Collect latest recalls
      await this.collectRecalls(25);
      
      console.log('[FDA API] FDA data sync completed successfully');
    } catch (error) {
      console.error('[FDA API] FDA data sync failed:', error);
      throw error;
    }
  }
}