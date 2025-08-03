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
  private apiKey = process.env.FDA_API_KEY || '';
  private rateLimitDelay = 250; // 250ms between requests (240 requests/minute limit)
  private maxRetries = 3;
  private retryDelay = 2000; // 2 second retry delay

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async exponentialBackoff(attempt: number): Promise<void> {
    const delay = this.retryDelay * Math.pow(2, attempt);
    await this.delay(delay);
  }

  private async makeRequest(endpoint: string, retryAttempt: number = 0): Promise<any> {
    try {
      // Add API key as URL parameter if available
      const urlWithKey = this.apiKey ? 
        `${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}` : 
        endpoint;
      
      console.log(`🔄 [FDA API] Requesting: ${urlWithKey.replace(this.apiKey, 'API_KEY_HIDDEN')} (attempt ${retryAttempt + 1})`);
      
      const response = await fetch(urlWithKey, {
        headers: {
          'User-Agent': 'Helix-Regulatory-Intelligence/1.0',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429 && retryAttempt < this.maxRetries) {
          console.log(`⏱️ [FDA API] Rate limited, retrying after backoff...`);
          await this.exponentialBackoff(retryAttempt);
          return this.makeRequest(endpoint, retryAttempt + 1);
        }
        throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid FDA API response format');
      }
      
      // Rate limiting
      await this.delay(this.rateLimitDelay);
      
      console.log(`✅ [FDA API] Request successful - received ${data.results?.length || 0} items`);
      return data;
    } catch (error) {
      if (retryAttempt < this.maxRetries && !(error as Error).message.includes('Rate limited')) {
        console.log(`🔄 [FDA API] Retrying request (attempt ${retryAttempt + 2})...`);
        await this.exponentialBackoff(retryAttempt);
        return this.makeRequest(endpoint, retryAttempt + 1);
      }
      
      console.error(`❌ [FDA API] Request failed after ${retryAttempt + 1} attempts:`, error);
      throw error;
    }
  }

  async collect510kDevices(limit: number = 100): Promise<FDADevice[]> {
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
      return data.results as FDADevice[];
    } catch (error) {
      console.error('[FDA API] Error collecting 510k devices:', error);
      throw error;
    }
  }

  private async process510kDevice(device: FDADevice): Promise<void> {
    try {
      const regulatoryUpdate = {
        title: `FDA 510(k): ${device.device_name || 'Unknown Device'}${device.k_number ? ` (${device.k_number})` : ''}`,
        description: this.formatDeviceContent(device),
        sourceId: 'fda_510k',
        sourceUrl: `https://www.fda.gov/medical-devices/510k-clearances/510k-clearance-${device.k_number}`,
        region: 'US',
        updateType: 'approval' as const,
        priority: this.determinePriority(device),
        deviceClasses: device.openfda?.device_class ? [device.openfda.device_class] : [],
        categories: await this.categorizeDevice(device),
        rawData: device,
        publishedAt: this.parseDate(device.decision_date) || new Date(),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[FDA API] Successfully created regulatory update: ${regulatoryUpdate.title}`);
    } catch (error) {
      console.error('[FDA API] Error processing 510k device:', error);
    }
  }

  async collectRecalls(limit: number = 100): Promise<FDARecall[]> {
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
      return data.results as FDARecall[];
    } catch (error) {
      console.error('[FDA API] Error collecting recalls:', error);
      throw error;
    }
  }

  private async processRecall(recall: FDARecall): Promise<void> {
    try {
      const regulatoryUpdate = {
        title: `FDA Recall: ${recall.product_description || 'Medical Device Recall'}`,
        description: this.formatRecallContent(recall),
        sourceId: 'fda_recalls',
        sourceUrl: `https://www.fda.gov/medical-devices/medical-device-recalls/${recall.recall_number}`,
        region: 'US',
        updateType: 'recall' as const,
        priority: this.determineRecallPriority(recall),
        deviceClasses: recall.openfda?.device_class ? [recall.openfda.device_class] : [],
        categories: ['Safety Alert', 'Device Recall'],
        rawData: recall,
        publishedAt: this.parseDate(recall.recall_initiation_date) || new Date(),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[FDA API] Successfully created recall update: ${regulatoryUpdate.title}`);
    } catch (error) {
      console.error('[FDA API] Error processing recall:', error);
    }
  }

  private formatDeviceContent(device: FDADevice): string {
    const parts = [
      `K-Nummer: ${device.k_number || 'N/A'}`,
      `Antragsteller: ${device.applicant || 'N/A'}`,
      `Produktcode: ${device.product_code || 'N/A'}`,
      `Geräteklasse: ${device.openfda?.device_class || 'N/A'}`,
      `Regulierungsnummer: ${device.regulation_number || device.openfda?.regulation_number || 'N/A'}`,
      `Entscheidungsdatum: ${device.decision_date || 'N/A'}`,
      `Status: ${device.decision || 'N/A'}`
    ];

    if (device.statement_or_summary) {
      parts.push(`Zusammenfassung: ${device.statement_or_summary}`);
    }

    if (device.openfda?.medical_specialty_description) {
      parts.push(`Medizinischer Bereich: ${device.openfda.medical_specialty_description}`);
    }

    return parts.join('\n');
  }

  private formatRecallContent(recall: FDARecall): string {
    const parts = [
      `Recall-Nummer: ${recall.recall_number || 'N/A'}`,
      `Grund: ${recall.reason_for_recall || 'N/A'}`,
      `Status: ${recall.status || 'N/A'}`,
      `Klassifizierung: ${recall.classification || 'N/A'}`,
      `Rückrufende Firma: ${recall.recalling_firm || 'N/A'}`,
      `Produktmenge: ${recall.product_quantity || 'N/A'}`,
      `Verteilungsmuster: ${recall.distribution_pattern || 'N/A'}`,
      `Freiwillig/Verpflichtend: ${recall.voluntary_mandated || 'N/A'}`
    ];

    if (recall.code_info) {
      parts.push(`Code-Info: ${recall.code_info}`);
    }

    return parts.join('\n');
  }

  private parseDate(dateString: string | undefined): Date | null {
    if (!dateString) return null;
    
    try {
      return new Date(dateString);
    } catch {
      return null;
    }
  }

  private determinePriority(device: FDADevice): 'critical' | 'high' | 'medium' | 'low' {
    const deviceClass = device.openfda?.device_class;
    const deviceName = device.device_name?.toLowerCase() || '';
    
    // High-risk devices
    if (deviceClass === 'Class III' || 
        deviceName.includes('implant') || 
        deviceName.includes('pacemaker') ||
        deviceName.includes('defibrillator')) {
      return 'critical';
    }
    
    // AI/ML devices
    if (deviceName.includes('ai') || 
        deviceName.includes('artificial intelligence') ||
        deviceName.includes('machine learning')) {
      return 'high';
    }
    
    // Class II devices
    if (deviceClass === 'Class II') {
      return 'medium';
    }
    
    return 'low';
  }

  private determineRecallPriority(recall: FDARecall): 'critical' | 'high' | 'medium' | 'low' {
    const classification = recall.classification?.toLowerCase() || '';
    const reason = recall.reason_for_recall?.toLowerCase() || '';
    
    // Class I recalls (most serious)
    if (classification.includes('class i') || 
        reason.includes('death') || 
        reason.includes('serious injury')) {
      return 'critical';
    }
    
    // Class II recalls
    if (classification.includes('class ii')) {
      return 'high';
    }
    
    // Class III recalls
    if (classification.includes('class iii')) {
      return 'medium';
    }
    
    return 'medium'; // Default for recalls
  }

  private async categorizeDevice(device: FDADevice): Promise<string[]> {
    const categories: string[] = [];
    const deviceName = device.device_name?.toLowerCase() || '';
    const specialty = device.openfda?.medical_specialty_description?.toLowerCase() || '';
    
    // Medical specialties
    if (specialty.includes('cardio')) categories.push('Kardiologie');
    if (specialty.includes('neuro')) categories.push('Neurologie');
    if (specialty.includes('ortho')) categories.push('Orthopädie');
    if (specialty.includes('radio')) categories.push('Radiologie');
    
    // Device types
    if (deviceName.includes('software') || deviceName.includes('ai')) {
      categories.push('Software-Medizinprodukt');
    }
    if (deviceName.includes('implant')) categories.push('Implantat');
    if (deviceName.includes('monitor')) categories.push('Monitoring');
    if (deviceName.includes('diagnostic')) categories.push('Diagnostik');
    
    // Default category
    if (categories.length === 0) {
      categories.push('Medizinprodukt');
    }
    
    return categories;
  }
}

export const fdaOpenApiService = new FDAOpenAPIService();