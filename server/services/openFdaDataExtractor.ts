import { storage } from '../storage';
import { nlpService } from './nlpService';
import type { InsertRegulatoryUpdate } from '@shared/schema';

interface OpenFDARecall {
  cfres_id?: string;
  product_res_number?: string;
  event_date_initiated?: string;
  event_date_posted?: string;
  recall_status?: string;
  event_date_terminated?: string;
  res_event_number?: string;
  product_code?: string;
  k_numbers?: string[];
  product_description?: string;
  code_info?: string;
  recalling_firm?: string;
  address_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  additional_info_contact?: string;
  reason_for_recall?: string;
  root_cause_description?: string;
  action?: string;
  product_quantity?: string;
  distribution_pattern?: string;
  openfda?: {
    device_name?: string;
    medical_specialty_description?: string;
    regulation_number?: string;
    device_class?: string;
    fei_number?: string[];
    registration_number?: string[];
    k_number?: string[];
  };
}

interface OpenFDAResponse {
  meta: {
    disclaimer: string;
    terms: string;
    license: string;
    last_updated: string;
    results: {
      skip: number;
      limit: number;
      total: number;
    };
  };
  results: OpenFDARecall[];
}

export class OpenFDADataExtractor {
  private baseUrl = 'https://api.fda.gov';
  private rateLimitDelay = 1000; // 1 second between requests

  async extractDeviceRecalls(limit: number = 100): Promise<void> {
    console.log(`[OpenFDA Extractor] Starting device recalls extraction (limit: ${limit})`);
    
    try {
      const endpoint = `${this.baseUrl}/device/recall.json?limit=${limit}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`OpenFDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data: OpenFDAResponse = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid OpenFDA response format');
      }
      
      console.log(`[OpenFDA Extractor] Found ${data.results.length} recalls (total available: ${data.meta.results.total})`);
      
      let processedCount = 0;
      for (const recall of data.results) {
        try {
          await this.processRecall(recall);
          processedCount++;
          
          // Rate limiting
          await this.delay(this.rateLimitDelay);
        } catch (error) {
          console.error(`[OpenFDA Extractor] Error processing recall ${recall.cfres_id}:`, error);
        }
      }
      
      console.log(`[OpenFDA Extractor] Successfully processed ${processedCount}/${data.results.length} recalls`);
    } catch (error) {
      console.error('[OpenFDA Extractor] Error extracting device recalls:', error);
      throw error;
    }
  }

  async extractDevice510k(limit: number = 100): Promise<void> {
    console.log(`[OpenFDA Extractor] Starting 510(k) extraction (limit: ${limit})`);
    
    try {
      const endpoint = `${this.baseUrl}/device/510k.json?limit=${limit}&sort=date_received:desc`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`OpenFDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid OpenFDA 510k response format');
      }
      
      console.log(`[OpenFDA Extractor] Found ${data.results.length} 510(k) clearances`);
      
      let processedCount = 0;
      for (const device of data.results) {
        try {
          await this.process510kDevice(device);
          processedCount++;
          
          // Rate limiting
          await this.delay(this.rateLimitDelay);
        } catch (error) {
          console.error(`[OpenFDA Extractor] Error processing 510k device ${device.k_number}:`, error);
        }
      }
      
      console.log(`[OpenFDA Extractor] Successfully processed ${processedCount}/${data.results.length} 510(k) clearances`);
    } catch (error) {
      console.error('[OpenFDA Extractor] Error extracting 510k devices:', error);
      throw error;
    }
  }

  async extractDevicePMA(limit: number = 50): Promise<void> {
    console.log(`[OpenFDA Extractor] Starting PMA extraction (limit: ${limit})`);
    
    try {
      const endpoint = `${this.baseUrl}/device/pma.json?limit=${limit}&sort=date_received:desc`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`OpenFDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid OpenFDA PMA response format');
      }
      
      console.log(`[OpenFDA Extractor] Found ${data.results.length} PMA approvals`);
      
      let processedCount = 0;
      for (const device of data.results) {
        try {
          await this.processPMADevice(device);
          processedCount++;
          
          // Rate limiting
          await this.delay(this.rateLimitDelay);
        } catch (error) {
          console.error(`[OpenFDA Extractor] Error processing PMA device ${device.pma_number}:`, error);
        }
      }
      
      console.log(`[OpenFDA Extractor] Successfully processed ${processedCount}/${data.results.length} PMA approvals`);
    } catch (error) {
      console.error('[OpenFDA Extractor] Error extracting PMA devices:', error);
      throw error;
    }
  }

  private async processRecall(recall: OpenFDARecall): Promise<void> {
    try {
      const content = this.formatRecallContent(recall);
      const categories = await nlpService.categorizeContent(content);
      const sourceId = await this.getFDASourceId('recalls');

      const regulatoryUpdate: InsertRegulatoryUpdate = {
        title: `FDA Device Recall: ${recall.product_description || 'Medical Device'} (${recall.cfres_id || 'Unknown'})`,
        content,
        sourceId,
        sourceUrl: this.generateRecallUrl(recall),
        region: 'US',
        updateType: 'recall',
        priority: this.determineRecallPriority(recall),
        deviceClasses: this.extractDeviceClasses(recall),
        categories: [...categories.categories, 'Device Recall', 'Safety Alert'],
        rawData: recall,
        publishedAt: this.parseDate(recall.event_date_initiated || recall.event_date_posted) || new Date(),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[OpenFDA Extractor] Created recall update: ${recall.product_description || 'Unknown Product'}`);
    } catch (error) {
      console.error('[OpenFDA Extractor] Error processing recall:', error);
      throw error;
    }
  }

  private async process510kDevice(device: any): Promise<void> {
    try {
      const content = this.format510kContent(device);
      const categories = await nlpService.categorizeContent(content);
      const sourceId = await this.getFDASourceId('510k');

      const regulatoryUpdate: InsertRegulatoryUpdate = {
        title: `FDA 510(k) Clearance: ${device.device_name || 'Medical Device'} (${device.k_number || 'Unknown'})`,
        content,
        sourceId,
        sourceUrl: this.generate510kUrl(device),
        region: 'US',
        updateType: 'approval',
        priority: this.determine510kPriority(device),
        deviceClasses: this.extract510kDeviceClasses(device),
        categories: [...categories.categories, '510(k) Clearance', 'FDA Approval'],
        rawData: device,
        publishedAt: this.parseDate(device.date_received || device.decision_date) || new Date(),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[OpenFDA Extractor] Created 510(k) update: ${device.device_name || 'Unknown Device'}`);
    } catch (error) {
      console.error('[OpenFDA Extractor] Error processing 510k device:', error);
      throw error;
    }
  }

  private async processPMADevice(device: any): Promise<void> {
    try {
      const content = this.formatPMAContent(device);
      const categories = await nlpService.categorizeContent(content);
      const sourceId = await this.getFDASourceId('pma');

      const regulatoryUpdate: InsertRegulatoryUpdate = {
        title: `FDA PMA Approval: ${device.device_name || 'Medical Device'} (${device.pma_number || 'Unknown'})`,
        content,
        sourceId,
        sourceUrl: this.generatePMAUrl(device),
        region: 'US',
        updateType: 'approval',
        priority: 'high', // PMA is always high priority (Class III devices)
        deviceClasses: this.extractPMADeviceClasses(device),
        categories: [...categories.categories, 'PMA Approval', 'FDA Approval', 'Class III Device'],
        rawData: device,
        publishedAt: this.parseDate(device.date_received || device.decision_date) || new Date(),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[OpenFDA Extractor] Created PMA update: ${device.device_name || 'Unknown Device'}`);
    } catch (error) {
      console.error('[OpenFDA Extractor] Error processing PMA device:', error);
      throw error;
    }
  }

  private formatRecallContent(recall: OpenFDARecall): string {
    const sections = [];
    
    sections.push(`=== FDA Device Recall Information ===`);
    
    if (recall.product_description) {
      sections.push(`Product: ${recall.product_description}`);
    }
    
    if (recall.reason_for_recall) {
      sections.push(`\nReason for Recall:\n${recall.reason_for_recall}`);
    }
    
    if (recall.recalling_firm) {
      sections.push(`\nRecalling Firm: ${recall.recalling_firm}`);
    }
    
    if (recall.distribution_pattern) {
      sections.push(`\nDistribution Pattern: ${recall.distribution_pattern}`);
    }
    
    if (recall.product_quantity) {
      sections.push(`\nProduct Quantity: ${recall.product_quantity}`);
    }
    
    if (recall.recall_status) {
      sections.push(`\nRecall Status: ${recall.recall_status}`);
    }
    
    if (recall.action) {
      sections.push(`\nAction Taken:\n${recall.action}`);
    }
    
    if (recall.code_info) {
      sections.push(`\nProduct Codes: ${recall.code_info}`);
    }
    
    if (recall.k_numbers && recall.k_numbers.length > 0) {
      sections.push(`\nRelated 510(k) Numbers: ${recall.k_numbers.join(', ')}`);
    }
    
    if (recall.openfda) {
      sections.push(`\n=== Additional Device Information ===`);
      if (recall.openfda.device_class) {
        sections.push(`Device Class: ${recall.openfda.device_class}`);
      }
      if (recall.openfda.medical_specialty_description) {
        sections.push(`Medical Specialty: ${recall.openfda.medical_specialty_description}`);
      }
      if (recall.openfda.regulation_number) {
        sections.push(`Regulation Number: ${recall.openfda.regulation_number}`);
      }
    }
    
    return sections.join('\n');
  }

  private format510kContent(device: any): string {
    const sections = [];
    
    sections.push(`=== FDA 510(k) Clearance Information ===`);
    
    if (device.device_name) {
      sections.push(`Device Name: ${device.device_name}`);
    }
    
    if (device.applicant) {
      sections.push(`Applicant: ${device.applicant}`);
    }
    
    if (device.decision) {
      sections.push(`Decision: ${device.decision}`);
    }
    
    if (device.statement_or_summary) {
      sections.push(`\nSummary:\n${device.statement_or_summary}`);
    }
    
    if (device.product_code) {
      sections.push(`\nProduct Code: ${device.product_code}`);
    }
    
    if (device.regulation_number) {
      sections.push(`Regulation Number: ${device.regulation_number}`);
    }
    
    if (device.review_advisory_committee) {
      sections.push(`Review Committee: ${device.review_advisory_committee}`);
    }
    
    if (device.clearance_type) {
      sections.push(`Clearance Type: ${device.clearance_type}`);
    }
    
    if (device.expedited_review_flag === 'Y') {
      sections.push(`Expedited Review: Yes`);
    }
    
    if (device.third_party_flag === 'Y') {
      sections.push(`Third Party Review: Yes`);
    }
    
    if (device.openfda) {
      sections.push(`\n=== Device Classification ===`);
      if (device.openfda.device_class) {
        sections.push(`Device Class: ${device.openfda.device_class}`);
      }
      if (device.openfda.medical_specialty_description) {
        sections.push(`Medical Specialty: ${device.openfda.medical_specialty_description}`);
      }
    }
    
    return sections.join('\n');
  }

  private formatPMAContent(device: any): string {
    const sections = [];
    
    sections.push(`=== FDA PMA Approval Information ===`);
    
    if (device.device_name) {
      sections.push(`Device Name: ${device.device_name}`);
    }
    
    if (device.applicant) {
      sections.push(`Applicant: ${device.applicant}`);
    }
    
    if (device.supplement_reason) {
      sections.push(`Supplement Reason: ${device.supplement_reason}`);
    }
    
    if (device.statement_or_summary) {
      sections.push(`\nSummary:\n${device.statement_or_summary}`);
    }
    
    if (device.product_code) {
      sections.push(`\nProduct Code: ${device.product_code}`);
    }
    
    if (device.advisory_committee) {
      sections.push(`Advisory Committee: ${device.advisory_committee}`);
    }
    
    sections.push(`\nNote: This is a Class III medical device requiring PMA approval, indicating the highest level of regulatory oversight.`);
    
    return sections.join('\n');
  }

  private determineRecallPriority(recall: OpenFDARecall): 'high' | 'medium' | 'low' {
    const riskIndicators = [
      'death', 'life-threatening', 'serious injury', 'class i',
      'immediate', 'urgent', 'critical', 'emergency'
    ];
    
    const content = `${recall.reason_for_recall || ''} ${recall.action || ''}`.toLowerCase();
    
    if (riskIndicators.some(indicator => content.includes(indicator))) {
      return 'high';
    }
    
    if (recall.recall_status === 'Ongoing') {
      return 'medium';
    }
    
    return 'low';
  }

  private determine510kPriority(device: any): 'high' | 'medium' | 'low' {
    if (device.expedited_review_flag === 'Y') {
      return 'high';
    }
    
    if (device.openfda?.device_class === 'Class II') {
      return 'medium';
    }
    
    return 'low';
  }

  private extractDeviceClasses(recall: OpenFDARecall): string[] {
    const classes: string[] = [];
    
    if (recall.openfda?.device_class) {
      classes.push(recall.openfda.device_class);
    }
    
    if (recall.product_code) {
      classes.push(`Product Code: ${recall.product_code}`);
    }
    
    return classes.length > 0 ? classes : ['Unknown Class'];
  }

  private extract510kDeviceClasses(device: any): string[] {
    const classes: string[] = [];
    
    if (device.openfda?.device_class) {
      classes.push(device.openfda.device_class);
    } else {
      classes.push('Class II'); // Most 510(k) devices are Class II
    }
    
    if (device.product_code) {
      classes.push(`Product Code: ${device.product_code}`);
    }
    
    return classes;
  }

  private extractPMADeviceClasses(device: any): string[] {
    return ['Class III', `Product Code: ${device.product_code || 'Unknown'}`];
  }

  private generateRecallUrl(recall: OpenFDARecall): string {
    if (recall.cfres_id) {
      return `https://www.fda.gov/medical-devices/medical-device-recalls/recall-${recall.cfres_id}`;
    }
    return 'https://www.fda.gov/medical-devices/medical-device-recalls';
  }

  private generate510kUrl(device: any): string {
    if (device.k_number) {
      return `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${device.k_number}`;
    }
    return 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm';
  }

  private generatePMAUrl(device: any): string {
    if (device.pma_number) {
      return `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?ID=${device.pma_number}`;
    }
    return 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm';
  }

  private parseDate(dateString?: string): Date | null {
    if (!dateString) return null;
    try {
      // Handle different date formats from FDA API
      if (dateString.includes('-')) {
        return new Date(dateString);
      } else if (dateString.length === 8) {
        // Format: YYYYMMDD
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6)) - 1;
        const day = parseInt(dateString.substring(6, 8));
        return new Date(year, month, day);
      }
      return new Date(dateString);
    } catch {
      return null;
    }
  }

  private async getFDASourceId(type: 'recalls' | '510k' | 'pma'): Promise<string> {
    try {
      const sources = await storage.getAllDataSources();
      let sourceId: string;
      
      switch (type) {
        case 'recalls':
          sourceId = sources.find(s => s.id === 'fda_recalls' || s.name?.includes('FDA Recalls'))?.id || 'fda_recalls';
          break;
        case '510k':
          sourceId = sources.find(s => s.id === 'fda_510k' || s.name?.includes('FDA 510'))?.id || 'fda_510k';
          break;
        case 'pma':
          sourceId = sources.find(s => s.id === 'fda_pma' || s.name?.includes('FDA PMA'))?.id || 'fda_pma';
          break;
      }
      
      return sourceId;
    } catch (error) {
      console.error('Error getting FDA source ID:', error);
      return `fda_${type}`;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runCompleteExtraction(): Promise<{
    recalls: number;
    clearances510k: number;
    pmaApprovals: number;
    totalProcessed: number;
  }> {
    console.log('[OpenFDA Extractor] Starting complete FDA data extraction...');
    
    const results = {
      recalls: 0,
      clearances510k: 0,
      pmaApprovals: 0,
      totalProcessed: 0
    };

    try {
      // Extract device recalls
      await this.extractDeviceRecalls(100);
      results.recalls = 100;
      
      // Extract 510(k) clearances
      await this.extractDevice510k(100);
      results.clearances510k = 100;
      
      // Extract PMA approvals
      await this.extractDevicePMA(50);
      results.pmaApprovals = 50;
      
      results.totalProcessed = results.recalls + results.clearances510k + results.pmaApprovals;
      
      console.log(`[OpenFDA Extractor] Complete extraction finished: ${results.totalProcessed} total items processed`);
    } catch (error) {
      console.error('[OpenFDA Extractor] Error during complete extraction:', error);
      throw error;
    }

    return results;
  }
}

export const openFdaDataExtractor = new OpenFDADataExtractor();