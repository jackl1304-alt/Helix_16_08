import { storage } from '../storage';

interface DeviceMapping {
  primaryId: string;
  relatedIds: string[];
  mappingType: 'manufacturer' | 'device_name' | 'regulation' | 'clinical_study';
  confidence: number; // 0-1
  lastUpdated: Date;
}

interface RegulatoryTimeline {
  deviceId: string;
  timeline: TimelineEvent[];
  jurisdiction: string;
  currentStatus: string;
}

interface TimelineEvent {
  date: Date;
  event: string;
  authority: string;
  status: string;
  documents: string[];
  impact: 'low' | 'medium' | 'high';
}

interface StandardMapping {
  standardId: string;
  applicableRegulations: string[];
  deviceCategories: string[];
  requirements: string[];
  lastUpdated: Date;
}

export class CrossReferenceService {
  private mappingThreshold = 0.75; // Minimum confidence for auto-mapping
  
  private async calculateSimilarity(str1: string, str2: string): Promise<number> {
    const normalize = (s: string) => s.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1.0;
    
    // Jaccard similarity for text comparison
    const words1 = new Set(s1.split(' '));
    const words2 = new Set(s2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private extractManufacturerFromContent(content: string): string | null {
    // Extract manufacturer from various content formats
    const patterns = [
      /manufacturer[:\s]+([^,\n.]+)/i,
      /applicant[:\s]+([^,\n.]+)/i,
      /company[:\s]+([^,\n.]+)/i,
      /sponsor[:\s]+([^,\n.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  private extractDeviceNameFromTitle(title: string): string | null {
    // Extract device name from title, removing regulatory prefixes
    const cleanTitle = title
      .replace(/^(FDA|EMA|BfArM|MHRA|Swissmedic)[\s:]+/i, '')
      .replace(/^(510\(k\)|PMA|CE Mark)[\s:]+/i, '')
      .replace(/^(Clearance|Approval|Registration)[\s:]+/i, '');
    
    return cleanTitle.trim() || null;
  }

  async mapDevicesBetweenJurisdictions(): Promise<DeviceMapping[]> {
    try {
      console.log('[CrossRef] Starting device mapping between jurisdictions');
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const deviceMappings: DeviceMapping[] = [];
      const processed = new Set<string>();
      
      // Group updates by potential device categories
      const deviceGroups: Record<string, any[]> = {};
      
      for (const update of allUpdates) {
        if (processed.has(update.id)) continue;
        
        const deviceName = this.extractDeviceNameFromTitle(update.title);
        const manufacturer = this.extractManufacturerFromContent(update.content);
        
        if (!deviceName && !manufacturer) continue;
        
        const groupKey = `${manufacturer || 'unknown'}_${deviceName || 'unknown'}`;
        
        if (!deviceGroups[groupKey]) {
          deviceGroups[groupKey] = [];
        }
        deviceGroups[groupKey].push(update);
      }
      
      // Create mappings for devices found in multiple jurisdictions
      for (const [groupKey, updates] of Object.entries(deviceGroups)) {
        if (updates.length < 2) continue;
        
        const authorities = new Set(updates.map(u => u.authority));
        if (authorities.size < 2) continue; // Must be cross-jurisdictional
        
        // Calculate confidence based on similarity
        let totalConfidence = 0;
        let comparisons = 0;
        
        for (let i = 0; i < updates.length; i++) {
          for (let j = i + 1; j < updates.length; j++) {
            const similarity = await this.calculateSimilarity(
              updates[i].title + ' ' + updates[i].content,
              updates[j].title + ' ' + updates[j].content
            );
            totalConfidence += similarity;
            comparisons++;
          }
        }
        
        const averageConfidence = comparisons > 0 ? totalConfidence / comparisons : 0;
        
        if (averageConfidence >= this.mappingThreshold) {
          const mapping: DeviceMapping = {
            primaryId: updates[0].id,
            relatedIds: updates.slice(1).map(u => u.id),
            mappingType: 'manufacturer',
            confidence: averageConfidence,
            lastUpdated: new Date()
          };
          
          deviceMappings.push(mapping);
          updates.forEach(u => processed.add(u.id));
        }
      }
      
      console.log(`[CrossRef] Created ${deviceMappings.length} device mappings`);
      return deviceMappings;
    } catch (error) {
      console.error('[CrossRef] Error mapping devices:', error);
      throw error;
    }
  }

  async generateRegulatoryTimeline(deviceId: string): Promise<RegulatoryTimeline | null> {
    try {
      console.log(`[CrossRef] Generating regulatory timeline for device: ${deviceId}`);
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const deviceUpdate = allUpdates.find(u => u.id === deviceId);
      
      if (!deviceUpdate) {
        console.log(`[CrossRef] Device not found: ${deviceId}`);
        return null;
      }
      
      // Find related updates for the same device/manufacturer
      const deviceName = this.extractDeviceNameFromTitle(deviceUpdate.title);
      const manufacturer = this.extractManufacturerFromContent(deviceUpdate.content);
      
      const relatedUpdates = [];
      
      for (const update of allUpdates) {
        if (update.id === deviceId) {
          relatedUpdates.push(update);
          continue;
        }
        
        const updateDeviceName = this.extractDeviceNameFromTitle(update.title);
        const updateManufacturer = this.extractManufacturerFromContent(update.content);
        
        // Match by device name or manufacturer
        const deviceMatch = deviceName && updateDeviceName ? 
          await this.calculateSimilarity(deviceName, updateDeviceName) : 0;
        const manufacturerMatch = manufacturer && updateManufacturer ? 
          await this.calculateSimilarity(manufacturer, updateManufacturer) : 0;
        
        if ((deviceMatch && deviceMatch > 0.7) || (manufacturerMatch && manufacturerMatch > 0.8)) {
          relatedUpdates.push(update);
        }
      }
      
      // Convert to timeline events
      const timelineEvents: TimelineEvent[] = relatedUpdates.map(update => ({
        date: new Date(update.published_at),
        event: this.categorizeEvent(update.type),
        authority: update.authority,
        status: update.status || 'Unknown',
        documents: [update.id],
        impact: update.priority === 'critical' ? 'high' : 
                update.priority === 'high' ? 'medium' : 'low'
      }));
      
      // Sort by date
      timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      const timeline: RegulatoryTimeline = {
        deviceId,
        timeline: timelineEvents,
        jurisdiction: deviceUpdate.region,
        currentStatus: this.determineCurrentStatus(timelineEvents)
      };
      
      console.log(`[CrossRef] Generated timeline with ${timelineEvents.length} events`);
      return timeline;
    } catch (error) {
      console.error('[CrossRef] Error generating timeline:', error);
      return null;
    }
  }

  private categorizeEvent(type: string): string {
    const eventMap: Record<string, string> = {
      'FDA 510(k) Clearance': 'Pre-market Clearance',
      'FDA PMA Approval': 'Pre-market Approval',
      'FDA Device Recall': 'Safety Action',
      'CE Mark': 'European Conformity',
      'EU MDR Device Registration': 'Registration',
      'EU MDR Incident Report': 'Safety Report',
      'Clinical Study': 'Clinical Evidence',
      'RSS Update': 'Information Update'
    };
    
    return eventMap[type] || 'Regulatory Update';
  }

  private determineCurrentStatus(events: TimelineEvent[]): string {
    if (events.length === 0) return 'Unknown';
    
    const latestEvent = events[events.length - 1];
    
    if (latestEvent.event.includes('Recall') || latestEvent.event.includes('Safety')) {
      return 'Under Safety Review';
    }
    
    if (latestEvent.event.includes('Approval') || latestEvent.event.includes('Clearance')) {
      return 'Approved';
    }
    
    if (latestEvent.event.includes('Registration')) {
      return 'Registered';
    }
    
    return 'Active';
  }

  async mapStandardsToRegulations(): Promise<StandardMapping[]> {
    try {
      console.log('[CrossRef] Mapping standards to regulations');
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const standardMappings: StandardMapping[] = [];
      
      // Common medical device standards and their regulatory contexts
      const knownStandards = [
        {
          id: 'ISO 13485:2016',
          name: 'Quality Management Systems',
          keywords: ['quality management', 'qms', 'iso 13485'],
          regulations: ['EU MDR', 'FDA QSR', '21 CFR 820'],
          categories: ['All Medical Devices']
        },
        {
          id: 'ISO 10993',
          name: 'Biological Evaluation',
          keywords: ['biocompatibility', 'biological evaluation', 'iso 10993'],
          regulations: ['EU MDR Annex I', 'FDA Biocompatibility'],
          categories: ['Implantable Devices', 'Contact Devices']
        },
        {
          id: 'ISO 14971:2019',
          name: 'Risk Management',
          keywords: ['risk management', 'risk analysis', 'iso 14971'],
          regulations: ['EU MDR Article 10', 'FDA Risk Management'],
          categories: ['All Medical Devices']
        },
        {
          id: 'IEC 62304',
          name: 'Medical Device Software',
          keywords: ['software', 'medical device software', 'iec 62304'],
          regulations: ['EU MDR Annex I', 'FDA Software Guidance'],
          categories: ['Software as Medical Device', 'Device with Software']
        }
      ];
      
      for (const standard of knownStandards) {
        const applicableUpdates = allUpdates.filter(update => {
          const content = (update.title + ' ' + update.content).toLowerCase();
          return standard.keywords.some(keyword => content.includes(keyword));
        });
        
        const applicableRegulations = [...new Set(
          applicableUpdates.map(update => `${update.authority} - ${update.type}`)
        )];
        
        if (applicableUpdates.length > 0) {
          const mapping: StandardMapping = {
            standardId: standard.id,
            applicableRegulations,
            deviceCategories: standard.categories,
            requirements: standard.regulations,
            lastUpdated: new Date()
          };
          
          standardMappings.push(mapping);
        }
      }
      
      console.log(`[CrossRef] Created ${standardMappings.length} standard mappings`);
      return standardMappings;
    } catch (error) {
      console.error('[CrossRef] Error mapping standards:', error);
      throw error;
    }
  }

  async linkClinicalStudiesToApprovals(): Promise<DeviceMapping[]> {
    try {
      console.log('[CrossRef] Linking clinical studies to approvals');
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const clinicalMappings: DeviceMapping[] = [];
      
      // Find clinical studies
      const clinicalStudies = allUpdates.filter(update => 
        update.type?.toLowerCase().includes('clinical') ||
        update.content.toLowerCase().includes('clinical study') ||
        update.content.toLowerCase().includes('clinical trial')
      );
      
      // Find approvals/clearances
      const approvals = allUpdates.filter(update =>
        update.type?.includes('510(k)') ||
        update.type?.includes('PMA') ||
        update.type?.includes('CE Mark') ||
        update.type?.includes('Approval') ||
        update.type?.includes('Clearance')
      );
      
      for (const study of clinicalStudies) {
        const studyDeviceName = this.extractDeviceNameFromTitle(study.title);
        const studyManufacturer = this.extractManufacturerFromContent(study.content);
        
        if (!studyDeviceName && !studyManufacturer) continue;
        
        const relatedApprovals = [];
        
        for (const approval of approvals) {
          const approvalDeviceName = this.extractDeviceNameFromTitle(approval.title);
          const approvalManufacturer = this.extractManufacturerFromContent(approval.content);
          
          let confidence = 0;
          
          if (studyDeviceName && approvalDeviceName) {
            confidence = Math.max(confidence, 
              await this.calculateSimilarity(studyDeviceName, approvalDeviceName));
          }
          
          if (studyManufacturer && approvalManufacturer) {
            confidence = Math.max(confidence,
              await this.calculateSimilarity(studyManufacturer, approvalManufacturer));
          }
          
          if (confidence >= this.mappingThreshold) {
            relatedApprovals.push(approval.id);
          }
        }
        
        if (relatedApprovals.length > 0) {
          const mapping: DeviceMapping = {
            primaryId: study.id,
            relatedIds: relatedApprovals,
            mappingType: 'clinical_study',
            confidence: 0.8, // Base confidence for clinical study links
            lastUpdated: new Date()
          };
          
          clinicalMappings.push(mapping);
        }
      }
      
      console.log(`[CrossRef] Created ${clinicalMappings.length} clinical study mappings`);
      return clinicalMappings;
    } catch (error) {
      console.error('[CrossRef] Error linking clinical studies:', error);
      throw error;
    }
  }

  async generateComprehensiveCrossReference(): Promise<{
    deviceMappings: DeviceMapping[];
    standardMappings: StandardMapping[];
    clinicalMappings: DeviceMapping[];
    totalMappings: number;
  }> {
    try {
      console.log('[CrossRef] Generating comprehensive cross-reference database');
      
      const [deviceMappings, standardMappings, clinicalMappings] = await Promise.all([
        this.mapDevicesBetweenJurisdictions(),
        this.mapStandardsToRegulations(),
        this.linkClinicalStudiesToApprovals()
      ]);
      
      const totalMappings = deviceMappings.length + standardMappings.length + clinicalMappings.length;
      
      console.log(`[CrossRef] Generated comprehensive cross-reference with ${totalMappings} total mappings`);
      
      return {
        deviceMappings,
        standardMappings,
        clinicalMappings,
        totalMappings
      };
    } catch (error) {
      console.error('[CrossRef] Error generating cross-reference:', error);
      throw error;
    }
  }
}