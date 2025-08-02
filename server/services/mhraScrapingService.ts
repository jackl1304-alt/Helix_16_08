import { storage } from '../storage';
import { nlpService } from './nlpService';
import type { InsertRegulatoryUpdate } from '@shared/schema';

interface MHRADevice {
  registrationNumber: string;
  deviceName: string;
  manufacturer: string;
  deviceClass: string;
  registrationDate: string;
  status: string;
  intendedPurpose?: string;
  category?: string;
}

interface MHRASafetyAlert {
  alertNumber: string;
  title: string;
  deviceType: string;
  manufacturer: string;
  alertLevel: 'high' | 'medium' | 'low';
  description: string;
  actionRequired: string;
  publishedDate: string;
  affectedProducts: string[];
}

export class MHRAScrapingService {
  private baseUrl = 'https://www.gov.uk';
  private deviceRegistrationUrl = 'https://mhrabpm.appiancloud.com';
  
  constructor() {
    // Initialize with rate limiting
    this.rateLimitDelay = 2000; // 2 seconds between requests for web scraping
  }

  private rateLimitDelay: number;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async collectMHRADeviceRegistrations(): Promise<void> {
    try {
      console.log('[MHRA Scraper] Starting device registration collection...');
      
      // Note: This is a demonstration implementation
      // Real implementation would require authentication and proper scraping
      const mockDevices = this.generateMockMHRADevices();
      
      for (const device of mockDevices) {
        await this.processMHRADevice(device);
        await this.delay(this.rateLimitDelay);
      }
      
      console.log(`[MHRA Scraper] Device registration collection completed: ${mockDevices.length} devices`);
    } catch (error) {
      console.error('[MHRA Scraper] Error collecting device registrations:', error);
      throw error;
    }
  }

  async collectMHRASafetyAlerts(): Promise<void> {
    try {
      console.log('[MHRA Scraper] Starting safety alerts collection...');
      
      const alertsUrl = `${this.baseUrl}/drug-device-alerts`;
      
      // Note: This would require actual web scraping implementation
      const mockAlerts = this.generateMockSafetyAlerts();
      
      for (const alert of mockAlerts) {
        await this.processSafetyAlert(alert);
        await this.delay(this.rateLimitDelay);
      }
      
      console.log(`[MHRA Scraper] Safety alerts collection completed: ${mockAlerts.length} alerts`);
    } catch (error) {
      console.error('[MHRA Scraper] Error collecting safety alerts:', error);
      throw error;
    }
  }

  private async processMHRADevice(device: MHRADevice): Promise<void> {
    try {
      const content = this.formatDeviceContent(device);
      const categories = await nlpService.categorizeContent(content);
      const sourceId = await this.getMHRASourceId();

      const regulatoryUpdate: InsertRegulatoryUpdate = {
        title: `MHRA Device Registration: ${device.deviceName}`,
        content,
        sourceId,
        sourceUrl: `${this.deviceRegistrationUrl}/device/${device.registrationNumber}`,
        region: 'UK',
        updateType: 'registration',
        priority: this.determineDevicePriority(device),
        deviceClasses: [device.deviceClass],
        categories: categories.categories,
        rawData: device,
        publishedAt: new Date(device.registrationDate),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[MHRA Scraper] Created device registration: ${device.deviceName}`);
    } catch (error) {
      console.error('[MHRA Scraper] Error processing device:', error);
    }
  }

  private async processSafetyAlert(alert: MHRASafetyAlert): Promise<void> {
    try {
      const content = this.formatAlertContent(alert);
      const categories = await nlpService.categorizeContent(content);
      const sourceId = await this.getMHRASourceId();

      const regulatoryUpdate: InsertRegulatoryUpdate = {
        title: `MHRA Safety Alert: ${alert.title}`,
        content,
        sourceId,
        sourceUrl: `${this.baseUrl}/drug-device-alerts/${alert.alertNumber}`,
        region: 'UK',
        updateType: 'safety_alert',
        priority: alert.alertLevel,
        deviceClasses: [alert.deviceType],
        categories: [...categories.categories, 'Safety Alert'],
        rawData: alert,
        publishedAt: new Date(alert.publishedDate),
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      console.log(`[MHRA Scraper] Created safety alert: ${alert.title}`);
    } catch (error) {
      console.error('[MHRA Scraper] Error processing safety alert:', error);
    }
  }

  private formatDeviceContent(device: MHRADevice): string {
    const parts = [
      `Device Name: ${device.deviceName}`,
      `Manufacturer: ${device.manufacturer}`,
      `Device Class: ${device.deviceClass}`,
      `Registration Number: ${device.registrationNumber}`,
      `Status: ${device.status}`,
      `Registration Date: ${device.registrationDate}`
    ];

    if (device.intendedPurpose) {
      parts.push(`Intended Purpose: ${device.intendedPurpose}`);
    }

    if (device.category) {
      parts.push(`Category: ${device.category}`);
    }

    return parts.join('\n');
  }

  private formatAlertContent(alert: MHRASafetyAlert): string {
    const parts = [
      `Alert Number: ${alert.alertNumber}`,
      `Device Type: ${alert.deviceType}`,
      `Manufacturer: ${alert.manufacturer}`,
      `Alert Level: ${alert.alertLevel.toUpperCase()}`,
      `Description: ${alert.description}`,
      `Action Required: ${alert.actionRequired}`
    ];

    if (alert.affectedProducts.length > 0) {
      parts.push(`Affected Products: ${alert.affectedProducts.join(', ')}`);
    }

    return parts.join('\n');
  }

  private determineDevicePriority(device: MHRADevice): 'high' | 'medium' | 'low' {
    if (device.deviceClass === 'Class III' || device.deviceClass === 'Class IIb') {
      return 'high';
    }
    if (device.deviceClass === 'Class IIa') {
      return 'medium';
    }
    return 'low';
  }

  private async getMHRASourceId(): Promise<string> {
    try {
      const sources = await storage.getAllDataSources();
      const mhraSource = sources.find(s => s.id === 'mhra_guidance' || s.name?.includes('MHRA'));
      return mhraSource?.id || 'mhra_guidance';
    } catch (error) {
      console.error('Error getting MHRA source ID:', error);
      return 'mhra_guidance';
    }
  }

  // Mock data generators for demonstration
  private generateMockMHRADevices(): MHRADevice[] {
    return [
      {
        registrationNumber: 'GB-MF-000012345',
        deviceName: 'Advanced Cardiac Monitor System',
        manufacturer: 'CardioTech Ltd',
        deviceClass: 'Class IIb',
        registrationDate: '2024-12-15',
        status: 'Active',
        intendedPurpose: 'Continuous cardiac monitoring for ICU patients',
        category: 'Monitoring Equipment'
      },
      {
        registrationNumber: 'GB-MF-000012346',
        deviceName: 'Surgical Navigation System',
        manufacturer: 'SurgiPrecision UK',
        deviceClass: 'Class III',
        registrationDate: '2024-12-10',
        status: 'Active',
        intendedPurpose: 'Real-time surgical guidance for neurosurgery',
        category: 'Surgical Equipment'
      },
      {
        registrationNumber: 'GB-MF-000012347',
        deviceName: 'Digital Blood Pressure Monitor',
        manufacturer: 'HealthMonitor Solutions',
        deviceClass: 'Class IIa',
        registrationDate: '2024-12-05',
        status: 'Active',
        intendedPurpose: 'Non-invasive blood pressure measurement',
        category: 'Diagnostic Equipment'
      }
    ];
  }

  private generateMockSafetyAlerts(): MHRASafetyAlert[] {
    return [
      {
        alertNumber: 'MDA/2024/045',
        title: 'Cybersecurity Vulnerability in Implantable Cardiac Devices',
        deviceType: 'Implantable Cardiac Devices',
        manufacturer: 'Multiple Manufacturers',
        alertLevel: 'high',
        description: 'Critical cybersecurity vulnerability identified in communication protocols of certain implantable cardiac devices',
        actionRequired: 'Immediate software update required. Contact manufacturer for update procedure.',
        publishedDate: '2024-12-20',
        affectedProducts: ['Model ICD-2024', 'Model PM-Advanced', 'Model CRT-Pro']
      },
      {
        alertNumber: 'MDA/2024/046',
        title: 'Battery Malfunction in Portable Ventilators',
        deviceType: 'Portable Ventilators',
        manufacturer: 'VentCare Systems',
        alertLevel: 'medium',
        description: 'Reports of unexpected battery drain in specific lot numbers of portable ventilators',
        actionRequired: 'Check lot numbers and replace affected batteries. Monitor battery performance closely.',
        publishedDate: '2024-12-18',
        affectedProducts: ['Model PortaVent-300', 'Model PortaVent-400']
      }
    ];
  }
}

export const mhraScrapingService = new MHRAScrapingService();