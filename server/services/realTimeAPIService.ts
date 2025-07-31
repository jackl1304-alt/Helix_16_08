import axios from 'axios';
import { storage } from '../storage';

interface APIEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  dataPath?: string;
  category: 'regulatory' | 'clinical' | 'safety' | 'standards' | 'global_health';
  region: string;
  priority: 'high' | 'medium' | 'low';
}

interface APIResponse {
  success: boolean;
  data: any[];
  source: string;
  timestamp: string;
  recordCount: number;
  error?: string;
}

interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  studyType: string;
  phase: string;
  overallStatus: string;
  startDate: string;
  completionDate: string;
  conditions: string[];
  interventions: string[];
}

interface WHOIndicator {
  indicatorCode: string;
  indicatorName: string;
  region: string;
  country: string;
  year: number;
  value: number;
  unit: string;
}

export class RealTimeAPIService {
  private apiEndpoints: APIEndpoint[] = [
    // FDA OpenFDA API - Highest Priority
    {
      name: 'FDA 510k Clearances',
      url: 'https://api.fda.gov/device/510k.json',
      method: 'GET',
      params: { limit: 100, sort: 'date_received:desc' },
      dataPath: 'results',
      category: 'regulatory',
      region: 'United States',
      priority: 'high'
    },
    {
      name: 'FDA Device Recalls',
      url: 'https://api.fda.gov/device/recall.json',
      method: 'GET',
      params: { limit: 100, sort: 'report_date:desc' },
      dataPath: 'results',
      category: 'safety',
      region: 'United States',
      priority: 'high'
    },
    {
      name: 'FDA PMA Approvals',
      url: 'https://api.fda.gov/device/pma.json',
      method: 'GET',
      params: { limit: 100, sort: 'date_received:desc' },
      dataPath: 'results',
      category: 'regulatory',
      region: 'United States',
      priority: 'high'
    },
    // WHO Global Health Observatory
    {
      name: 'WHO Health Indicators',
      url: 'https://ghoapi.azureedge.net/api/Indicator',
      method: 'GET',
      dataPath: 'value',
      category: 'global_health',
      region: 'Global',
      priority: 'high'
    },
    // ClinicalTrials.gov API
    {
      name: 'Clinical Trials Medical Devices',
      url: 'https://clinicaltrials.gov/api/query/study_fields',
      method: 'GET',
      params: {
        expr: 'medical device',
        fields: 'NCTId,BriefTitle,StudyType,Phase,OverallStatus,StartDate,CompletionDate,Condition,InterventionName',
        fmt: 'json',
        max_rnk: 100
      },
      dataPath: 'StudyFieldsResponse.StudyFields',
      category: 'clinical',
      region: 'Global',
      priority: 'high'
    }
  ];

  private rssFeeds: string[] = [
    'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds-fda',
    'https://www.ema.europa.eu/en/rss.xml',
    'https://www.bfarm.de/DE/Service/RSS/_node.html',
    'https://www.swissmedic.ch/swissmedic/de/home.rss.html',
    'https://www.mhra.gov.uk/news-and-events/news/rss.xml'
  ];

  async fetchFromAPI(endpoint: APIEndpoint): Promise<APIResponse> {
    try {
      console.log(`[Real-Time API] Fetching from ${endpoint.name}...`);
      
      const config = {
        method: endpoint.method,
        url: endpoint.url,
        headers: {
          'User-Agent': 'Helix-Regulatory-Intelligence/1.0',
          'Accept': 'application/json',
          ...endpoint.headers
        },
        params: endpoint.params,
        timeout: 30000
      };

      const response = await axios(config);
      
      let data = response.data;
      if (endpoint.dataPath) {
        const pathParts = endpoint.dataPath.split('.');
        for (const part of pathParts) {
          data = data?.[part];
        }
      }

      const results = Array.isArray(data) ? data : [data];
      
      console.log(`[Real-Time API] ${endpoint.name}: Retrieved ${results.length} records`);
      
      return {
        success: true,
        data: results,
        source: endpoint.name,
        timestamp: new Date().toISOString(),
        recordCount: results.length
      };
    } catch (error: any) {
      console.error(`[Real-Time API] Error fetching ${endpoint.name}:`, error.message);
      return {
        success: false,
        data: [],
        source: endpoint.name,
        timestamp: new Date().toISOString(),
        recordCount: 0,
        error: error.message
      };
    }
  }

  async syncFDAData(): Promise<{ success: boolean; summary: any }> {
    try {
      console.log('[Real-Time API] Starting FDA data synchronization...');
      
      const fdaEndpoints = this.apiEndpoints.filter(ep => 
        ep.name.includes('FDA') && ep.priority === 'high'
      );
      
      const results = await Promise.allSettled(
        fdaEndpoints.map(endpoint => this.fetchFromAPI(endpoint))
      );
      
      let totalRecords = 0;
      let successfulSyncs = 0;
      const syncSummary: any = {};
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const endpoint = fdaEndpoints[i];
        
        if (result.status === 'fulfilled' && result.value.success) {
          successfulSyncs++;
          totalRecords += result.value.recordCount;
          
          // Process and store FDA data
          await this.processFDAData(result.value, endpoint);
          
          syncSummary[endpoint.name] = {
            records: result.value.recordCount,
            status: 'success'
          };
        } else {
          syncSummary[endpoint.name] = {
            records: 0,
            status: 'failed',
            error: result.status === 'fulfilled' ? result.value.error : 'Promise rejected'
          };
        }
      }
      
      console.log(`[Real-Time API] FDA sync completed: ${successfulSyncs}/${fdaEndpoints.length} successful, ${totalRecords} total records`);
      
      return {
        success: successfulSyncs > 0,
        summary: {
          totalRecords,
          successfulSyncs,
          totalEndpoints: fdaEndpoints.length,
          details: syncSummary
        }
      };
    } catch (error: any) {
      console.error('[Real-Time API] FDA sync failed:', error);
      return { success: false, summary: { error: error.message } };
    }
  }

  async syncClinicalTrialsData(): Promise<{ success: boolean; summary: any }> {
    try {
      console.log('[Real-Time API] Starting Clinical Trials synchronization...');
      
      const clinicalEndpoint = this.apiEndpoints.find(ep => 
        ep.name === 'Clinical Trials Medical Devices'
      );
      
      if (!clinicalEndpoint) {
        throw new Error('Clinical Trials endpoint not found');
      }
      
      const response = await this.fetchFromAPI(clinicalEndpoint);
      
      if (response.success) {
        await this.processClinicalTrialsData(response);
        
        console.log(`[Real-Time API] Clinical Trials sync completed: ${response.recordCount} records`);
        
        return {
          success: true,
          summary: {
            totalRecords: response.recordCount,
            source: 'ClinicalTrials.gov',
            timestamp: response.timestamp
          }
        };
      } else {
        return {
          success: false,
          summary: { error: response.error }
        };
      }
    } catch (error: any) {
      console.error('[Real-Time API] Clinical Trials sync failed:', error);
      return { success: false, summary: { error: error.message } };
    }
  }

  async syncWHOData(): Promise<{ success: boolean; summary: any }> {
    try {
      console.log('[Real-Time API] Starting WHO Global Health Observatory synchronization...');
      
      const whoEndpoint = this.apiEndpoints.find(ep => 
        ep.name === 'WHO Health Indicators'
      );
      
      if (!whoEndpoint) {
        throw new Error('WHO endpoint not found');
      }
      
      const response = await this.fetchFromAPI(whoEndpoint);
      
      if (response.success) {
        await this.processWHOData(response);
        
        console.log(`[Real-Time API] WHO sync completed: ${response.recordCount} indicators`);
        
        return {
          success: true,
          summary: {
            totalRecords: response.recordCount,
            source: 'WHO Global Health Observatory',
            timestamp: response.timestamp
          }
        };
      } else {
        return {
          success: false,
          summary: { error: response.error }
        };
      }
    } catch (error: any) {
      console.error('[Real-Time API] WHO sync failed:', error);
      return { success: false, summary: { error: error.message } };
    }
  }

  private async processFDAData(apiResponse: APIResponse, endpoint: APIEndpoint): Promise<void> {
    try {
      for (const record of apiResponse.data) {
        const processedUpdate = this.transformFDARecord(record, endpoint);
        
        // Check if already exists to avoid duplicates
        const existing = await this.checkForDuplicate(processedUpdate);
        if (!existing) {
          await storage.createRegulatoryUpdate(processedUpdate);
        }
      }
    } catch (error) {
      console.error('[Real-Time API] Error processing FDA data:', error);
    }
  }

  private async processClinicalTrialsData(apiResponse: APIResponse): Promise<void> {
    try {
      for (const trial of apiResponse.data) {
        const processedTrial = this.transformClinicalTrialRecord(trial);
        
        // Store as regulatory update with clinical trial category
        const regulatoryUpdate = {
          id: `clinical-${processedTrial.nctId}`,
          title: `Clinical Trial: ${processedTrial.briefTitle}`,
          content: this.generateClinicalTrialContent(processedTrial),
          authority: 'ClinicalTrials.gov',
          region: 'Global',
          category: 'clinical_trials',
          type: 'clinical_study',
          published_at: new Date().toISOString(),
          priority: this.determineClinicalTrialPriority(processedTrial),
          tags: ['clinical_trial', 'medical_device', processedTrial.phase, processedTrial.overallStatus],
          url: `https://clinicaltrials.gov/ct2/show/${processedTrial.nctId}`,
          document_type: 'clinical_trial',
          language: 'en'
        };
        
        const existing = await this.checkForDuplicate(regulatoryUpdate);
        if (!existing) {
          await storage.createRegulatoryUpdate(regulatoryUpdate);
        }
      }
    } catch (error) {
      console.error('[Real-Time API] Error processing Clinical Trials data:', error);
    }
  }

  private async processWHOData(apiResponse: APIResponse): Promise<void> {
    try {
      // WHO indicators are metadata, we'll store them as reference data
      for (const indicator of apiResponse.data.slice(0, 50)) { // Limit to 50 most relevant
        const processedIndicator = {
          id: `who-${indicator.IndicatorCode || Date.now()}`,
          title: `WHO Health Indicator: ${indicator.IndicatorName || 'Health Indicator'}`,
          content: `Global health indicator from WHO Global Health Observatory. ${indicator.Definition || 'Health-related regulatory indicator for global monitoring.'}`,
          authority: 'WHO',
          region: 'Global',
          category: 'global_health',
          type: 'health_indicator',
          published_at: new Date().toISOString(),
          priority: 'medium' as const,
          tags: ['who', 'global_health', 'indicator', 'surveillance'],
          url: `https://www.who.int/data/gho/data/indicators/indicator-details/GHO/${indicator.IndicatorCode}`,
          document_type: 'health_indicator',
          language: 'en'
        };
        
        const existing = await this.checkForDuplicate(processedIndicator);
        if (!existing) {
          await storage.createRegulatoryUpdate(processedIndicator);
        }
      }
    } catch (error) {
      console.error('[Real-Time API] Error processing WHO data:', error);
    }
  }

  private transformFDARecord(record: any, endpoint: APIEndpoint): any {
    const baseTransform = {
      id: `fda-${endpoint.name.toLowerCase().replace(/\s+/g, '-')}-${record.k_number || record.pma_number || record.recall_number || Date.now()}`,
      authority: 'FDA',
      region: 'United States',
      published_at: record.date_received || record.report_date || new Date().toISOString(),
      language: 'en',
      url: this.generateFDAUrl(record, endpoint),
      document_type: this.getFDADocumentType(endpoint)
    };

    if (endpoint.name.includes('510k')) {
      return {
        ...baseTransform,
        title: `FDA 510(k): ${record.device_name || 'Medical Device Clearance'}`,
        content: this.generateFDA510kContent(record),
        category: 'medical_device_clearance',
        type: '510k_clearance',
        priority: this.determineFDAPriority(record),
        tags: ['fda', '510k', 'clearance', 'medical_device']
      };
    }

    if (endpoint.name.includes('Recall')) {
      return {
        ...baseTransform,
        title: `FDA Device Recall: ${record.product_description || 'Medical Device Recall'}`,
        content: this.generateFDARecallContent(record),
        category: 'safety_alert',
        type: 'device_recall',
        priority: this.determineFDARecallPriority(record),
        tags: ['fda', 'recall', 'safety', 'medical_device']
      };
    }

    if (endpoint.name.includes('PMA')) {
      return {
        ...baseTransform,
        title: `FDA PMA: ${record.device_name || 'Medical Device Approval'}`,
        content: this.generateFDAPMAContent(record),
        category: 'medical_device_approval',
        type: 'pma_approval',
        priority: this.determineFDAPriority(record),
        tags: ['fda', 'pma', 'approval', 'medical_device']
      };
    }

    return baseTransform;
  }

  private transformClinicalTrialRecord(trial: any): ClinicalTrial {
    return {
      nctId: trial.NCTId?.[0] || '',
      briefTitle: trial.BriefTitle?.[0] || '',
      studyType: trial.StudyType?.[0] || '',
      phase: trial.Phase?.[0] || '',
      overallStatus: trial.OverallStatus?.[0] || '',
      startDate: trial.StartDate?.[0] || '',
      completionDate: trial.CompletionDate?.[0] || '',
      conditions: trial.Condition || [],
      interventions: trial.InterventionName || []
    };
  }

  private generateFDA510kContent(record: any): string {
    return `FDA 510(k) Clearance for ${record.device_name || 'medical device'}.
    
Applicant: ${record.applicant || 'Not specified'}
Device Class: ${record.medical_specialty_description || 'Not specified'}
Product Code: ${record.product_code || 'Not specified'}
Decision Date: ${record.decision_date || 'Not specified'}
Regulation Number: ${record.regulation_number || 'Not specified'}

${record.statement || 'No additional statement provided.'}`;
  }

  private generateFDARecallContent(record: any): string {
    return `FDA Medical Device Recall: ${record.product_description || 'Medical device recall'}.
    
Recalling Firm: ${record.recalling_firm || 'Not specified'}
Recall Class: ${record.classification || 'Not specified'}
Recall Status: ${record.status || 'Not specified'}
Recall Initiation Date: ${record.recall_initiation_date || 'Not specified'}
Distribution Pattern: ${record.distribution_pattern || 'Not specified'}

Reason for Recall: ${record.reason_for_recall || 'Not specified'}`;
  }

  private generateFDAPMAContent(record: any): string {
    return `FDA PMA Approval for ${record.device_name || 'medical device'}.
    
Applicant: ${record.applicant || 'Not specified'}
Supplement Number: ${record.supplement_number || 'Not specified'}
Advisory Committee: ${record.advisory_committee || 'Not specified'}
Decision Date: ${record.decision_date || 'Not specified'}
Generic Name: ${record.generic_name || 'Not specified'}

${record.statement || 'No additional statement provided.'}`;
  }

  private generateClinicalTrialContent(trial: ClinicalTrial): string {
    return `Clinical Trial: ${trial.briefTitle}
    
NCT ID: ${trial.nctId}
Study Type: ${trial.studyType}
Phase: ${trial.phase}
Status: ${trial.overallStatus}
Start Date: ${trial.startDate}
Expected Completion: ${trial.completionDate}

Conditions: ${trial.conditions.join(', ') || 'Not specified'}
Interventions: ${trial.interventions.join(', ') || 'Not specified'}

This clinical trial involves medical devices and is relevant for regulatory intelligence monitoring.`;
  }

  private generateFDAUrl(record: any, endpoint: APIEndpoint): string {
    if (endpoint.name.includes('510k')) {
      return `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${record.k_number || ''}`;
    }
    if (endpoint.name.includes('PMA')) {
      return `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=${record.pma_number || ''}`;
    }
    return 'https://www.fda.gov/medical-devices';
  }

  private getFDADocumentType(endpoint: APIEndpoint): string {
    if (endpoint.name.includes('510k')) return '510k_clearance';
    if (endpoint.name.includes('Recall')) return 'device_recall';
    if (endpoint.name.includes('PMA')) return 'pma_approval';
    return 'fda_document';
  }

  private determineFDAPriority(record: any): 'low' | 'medium' | 'high' | 'critical' {
    const deviceName = (record.device_name || '').toLowerCase();
    const productCode = (record.product_code || '').toLowerCase();
    
    // High-risk device indicators
    if (deviceName.includes('cardiac') || deviceName.includes('heart') || 
        deviceName.includes('pacemaker') || deviceName.includes('defibrillator') ||
        deviceName.includes('implant') || productCode.includes('class iii')) {
      return 'high';
    }
    
    // Medium-risk indicators
    if (deviceName.includes('surgical') || deviceName.includes('diagnostic') ||
        productCode.includes('class ii')) {
      return 'medium';
    }
    
    return 'low';
  }

  private determineFDARecallPriority(record: any): 'low' | 'medium' | 'high' | 'critical' {
    const classification = (record.classification || '').toLowerCase();
    
    if (classification.includes('class i')) return 'critical';
    if (classification.includes('class ii')) return 'high';
    if (classification.includes('class iii')) return 'medium';
    
    return 'low';
  }

  private determineClinicalTrialPriority(trial: ClinicalTrial): 'low' | 'medium' | 'high' | 'critical' {
    const phase = trial.phase.toLowerCase();
    const status = trial.overallStatus.toLowerCase();
    
    if (phase.includes('phase 3') || phase.includes('phase iii')) return 'high';
    if (status.includes('completed') && (phase.includes('phase 2') || phase.includes('phase ii'))) return 'medium';
    
    return 'low';
  }

  private async checkForDuplicate(update: any): Promise<boolean> {
    try {
      const allUpdates = await storage.getAllRegulatoryUpdates();
      return allUpdates.some(existing => 
        existing.id === update.id || 
        (existing.title === update.title && existing.authority === update.authority)
      );
    } catch (error) {
      console.error('[Real-Time API] Error checking for duplicates:', error);
      return false;
    }
  }

  async performComprehensiveSync(): Promise<{ success: boolean; summary: any }> {
    try {
      console.log('[Real-Time API] Starting comprehensive real-time data synchronization...');
      
      const syncResults = await Promise.allSettled([
        this.syncFDAData(),
        this.syncClinicalTrialsData(),
        this.syncWHOData()
      ]);
      
      const results = {
        fda: syncResults[0].status === 'fulfilled' ? syncResults[0].value : { success: false, error: 'Failed to sync' },
        clinicalTrials: syncResults[1].status === 'fulfilled' ? syncResults[1].value : { success: false, error: 'Failed to sync' },
        who: syncResults[2].status === 'fulfilled' ? syncResults[2].value : { success: false, error: 'Failed to sync' }
      };
      
      const successCount = Object.values(results).filter(r => r.success).length;
      const totalSources = Object.keys(results).length;
      
      console.log(`[Real-Time API] Comprehensive sync completed: ${successCount}/${totalSources} sources successful`);
      
      return {
        success: successCount > 0,
        summary: {
          totalSources,
          successfulSources: successCount,
          results,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('[Real-Time API] Comprehensive sync failed:', error);
      return { success: false, summary: { error: error.message } };
    }
  }
}