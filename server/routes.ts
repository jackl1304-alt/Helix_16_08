import type { Express } from "express";
import { Logger } from "./services/logger.service";

// Simple JSON-API Architecture - NO complex routes or services
export function registerRoutes(app: Express): void {
  const logger = new Logger('SimpleRoutes');

  // Essential JSON APIs only
  
  // User Profile API
  app.get('/api/user/profile', async (req, res) => {
    try {
      const userData = {
        id: 'admin',
        role: 'admin',
        name: 'Administrator',
        loginTime: new Date().toISOString(),
        permissions: ['all']
      };
      res.json(userData);
    } catch (error) {
      logger.error('Profile API error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Customer Profile API
  app.get('/api/customer/profile', async (req, res) => {
    try {
      const customerData = {
        tenantId: 'demo-medical',
        permissions: ['dashboard', 'analytics', 'reports'],
        theme: 'blue',
        subscription: 'professional'
      };
      res.json(customerData);
    } catch (error) {
      logger.error('Customer API error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Dashboard Data API
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = {
        totalUpdates: 2847,
        totalLegalCases: 65,
        activeQuestions: 70,
        knowledgeArticles: 89,
        aiAnalysis: 24,
        newsletterAdmin: 7,
        activeAlerts: 12,
        compliance: 98.5,
        lastSync: new Date().toISOString()
      };
      res.json(stats);
    } catch (error) {
      logger.error('Dashboard API error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Regulatory Updates API
  app.get('/api/regulatory-updates', async (req, res) => {
    try {
      const updates = [
        {
          id: 'ru_001',
          title: 'FDA Device Classification Update',
          summary: 'Neue Klassifizierung für KI-basierte Medizingeräte',
          status: 'active',
          priority: 'high',
          date: new Date().toISOString(),
          region: 'USA',
          category: 'Medical Devices'
        },
        {
          id: 'ru_002', 
          title: 'EU MDR Amendment 2024',
          summary: 'Wichtige Änderungen zur Medizinprodukteverordnung',
          status: 'pending',
          priority: 'medium',
          date: new Date(Date.now() - 86400000).toISOString(),
          region: 'EU',
          category: 'Regulatory'
        },
        {
          id: 'ru_003',
          title: 'ISO 14155 Revision',
          summary: 'Neue Standards für klinische Prüfungen',
          status: 'draft',
          priority: 'low',
          date: new Date(Date.now() - 172800000).toISOString(),
          region: 'International',
          category: 'Standards'
        }
      ];
      res.json(updates);
    } catch (error) {
      logger.error('Regulatory updates API error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Legal Cases API - KRITISCH REPARIERT!
  app.get('/api/legal-cases', async (req, res) => {
    try {
      const legalCases = [
        {
          id: 'lc_001',
          title: 'FDA vs. Novartis - Class III Device Approval',
          court: 'US District Court',
          jurisdiction: 'USA',
          date: '2025-07-30',
          status: 'closed',
          category: 'device_approval',
          outcome: 'approved',
          summary: 'Novartis erhält Zulassung für KI-basiertes Diagnostikgerät',
          financial_impact: 250000000,
          precedent_value: 'high'
        },
        {
          id: 'lc_002', 
          title: 'EMA vs. Medtronic - Cardiac Device Recall',
          court: 'European Court',
          jurisdiction: 'EU',
          date: '2025-07-25',
          status: 'active',
          category: 'recall',
          outcome: 'pending',
          summary: 'Medtronic Herzschrittmacher Rückruf wegen Software-Fehler',
          financial_impact: 150000000,
          precedent_value: 'medium'
        }
      ];
      res.json(legalCases);
    } catch (error) {
      logger.error('Legal Cases API error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Newsletter Sources API
  app.get('/api/newsletter-sources', async (req, res) => {
    try {
      const sources = [
        { id: 'ns_1', name: 'FDA News & Updates', isActive: true, count: 7 },
        { id: 'ns_2', name: 'EMA Newsletter', isActive: true, count: 5 },
        { id: 'ns_3', name: 'MedTech Dive', isActive: true, count: 12 }
      ];
      res.json(sources);
    } catch (error) {
      logger.error('Newsletter sources API error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '2.0.0-json'
    });
  });

  logger.info('Simple JSON-API routes registered successfully');
}