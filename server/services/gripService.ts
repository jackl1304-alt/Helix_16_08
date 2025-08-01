import { logger } from './logger.service';
import type { InsertRegulatoryUpdate } from '@shared/schema';

interface GripLoginResponse {
  success: boolean;
  token?: string;
  sessionId?: string;
}

interface GripDataItem {
  id: string;
  title: string;
  content: string;
  publishedDate: string;
  category: string;
  url: string;
  source: string;
  region?: string;
  deviceType?: string;
  riskLevel?: string;
  regulatoryType?: string;
  impact?: string;
}

class GripService {
  private baseUrl = 'https://grip-app.pureglobal.com';
  private sessionToken: string | null = null;
  private sessionExpiry: Date | null = null;

  private async login(): Promise<boolean> {
    try {
      const username = process.env.GRIP_USERNAME;
      const password = process.env.GRIP_PASSWORD;

      if (!username || !password) {
        logger.error('GRIP credentials not found in environment variables');
        return false;
      }

      logger.info('Attempting GRIP login', { username: username.replace(/@.*/, '@***') });

      // Simulate login process (adjust based on actual GRIP API)
      const loginResponse = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Helix-RegulatorIntelligence/1.0'
        },
        body: JSON.stringify({
          email: username,
          password: password
        })
      });

      if (loginResponse.ok) {
        const data: GripLoginResponse = await loginResponse.json();
        this.sessionToken = data.token || data.sessionId || null;
        this.sessionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        logger.info('GRIP login successful');
        return true;
      } else {
        logger.error('GRIP login failed', { status: loginResponse.status });
        return false;
      }
    } catch (error) {
      logger.error('Error during GRIP login', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  private async ensureAuthenticated(): Promise<boolean> {
    if (!this.sessionToken || !this.sessionExpiry || this.sessionExpiry < new Date()) {
      return await this.login();
    }
    return true;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.sessionToken}`,
      'User-Agent': 'Helix-RegulatorIntelligence/1.0'
    };

    return fetch(url, { ...options, headers });
  }

  async extractRegulatoryData(): Promise<InsertRegulatoryUpdate[]> {
    try {
      logger.info('Starting GRIP data extraction');

      if (!(await this.ensureAuthenticated())) {
        throw new Error('Failed to authenticate with GRIP');
      }

      const updates: InsertRegulatoryUpdate[] = [];

      // Extract from different GRIP endpoints
      const endpoints = [
        '/api/regulatory-updates',
        '/api/device-approvals', 
        '/api/safety-alerts',
        '/api/guidance-documents',
        '/api/market-surveillance'
      ];

      for (const endpoint of endpoints) {
        try {
          logger.info(`Fetching data from GRIP endpoint: ${endpoint}`);
          
          const response = await this.fetchWithAuth(`${this.baseUrl}${endpoint}?limit=100&recent=true`);
          
          if (response.ok) {
            const data: GripDataItem[] = await response.json();
            
            for (const item of data) {
              const update: InsertRegulatoryUpdate = {
                title: item.title,
                content: item.content || 'Content extracted from GRIP platform',
                source: 'GRIP Platform',
                sourceUrl: item.url || `${this.baseUrl}/item/${item.id}`,
                publishedAt: new Date(item.publishedDate),
                region: item.region || 'Global',
                category: this.mapCategory(item.category),
                deviceType: item.deviceType || 'Unknown',
                riskLevel: item.riskLevel as 'low' | 'medium' | 'high' || 'medium',
                regulatoryType: item.regulatoryType || 'update',
                impact: item.impact || 'medium',
                extractedAt: new Date(),
                isProcessed: false
              };

              updates.push(update);
            }

            logger.info(`Extracted ${data.length} items from ${endpoint}`);
          } else {
            logger.warn(`Failed to fetch from ${endpoint}`, { status: response.status });
          }
        } catch (endpointError) {
          logger.error(`Error fetching from ${endpoint}`, { 
            error: endpointError instanceof Error ? endpointError.message : 'Unknown error' 
          });
        }
      }

      logger.info(`Total GRIP data extracted: ${updates.length} items`);
      return updates;

    } catch (error) {
      logger.error('Error during GRIP data extraction', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return [];
    }
  }

  private mapCategory(gripCategory: string): string {
    const categoryMap: Record<string, string> = {
      'device-approval': 'approvals',
      'safety-alert': 'safety',
      'guidance': 'guidance', 
      'market-surveillance': 'surveillance',
      'regulatory-update': 'regulatory',
      'standards': 'standards',
      'recall': 'safety'
    };

    return categoryMap[gripCategory.toLowerCase()] || 'regulatory';
  }

  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing GRIP connection');
      return await this.ensureAuthenticated();
    } catch (error) {
      logger.error('GRIP connection test failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }
}

export const gripService = new GripService();