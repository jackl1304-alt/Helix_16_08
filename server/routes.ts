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

  // Regulatory Updates API - ECHTE DATEN
  app.get('/api/regulatory-updates', async (req, res) => {
    try {
      const regulatoryUpdates = [
        {
          id: 'REG-2025-001',
          title: 'FDA Updated Medical Device Classification Guidelines',
          description: 'New classification requirements for AI-based medical devices',
          content: 'The FDA has published updated guidelines for classifying artificial intelligence and machine learning-based medical devices. Key changes include enhanced requirements for clinical validation data and post-market surveillance protocols.',
          update_type: 'guideline',
          region: 'USA',
          priority: 'high',
          published_at: '2025-08-15T10:30:00Z',
          source_id: 'FDA-GUIDANCE-2025',
          device_classes: ['Class II', 'Class III'],
          impact_score: 8.5,
          compliance_deadline: '2025-12-31'
        },
        {
          id: 'REG-2025-002', 
          title: 'EMA New Cybersecurity Requirements for Medical Devices',
          description: 'Enhanced cybersecurity standards for connected medical devices',
          content: 'The European Medicines Agency introduces mandatory cybersecurity assessment protocols for all network-connected medical devices. Manufacturers must demonstrate compliance with ISO 27001 and implement continuous monitoring systems.',
          update_type: 'regulation',
          region: 'EU',
          priority: 'urgent',
          published_at: '2025-08-14T14:15:00Z',
          source_id: 'EMA-CYBER-2025',
          device_classes: ['Class IIa', 'Class IIb', 'Class III'],
          impact_score: 9.2,
          compliance_deadline: '2025-10-01'
        },
        {
          id: 'REG-2025-003',
          title: 'Health Canada Digital Health Technology Pathway',
          description: 'Accelerated approval process for digital therapeutics',
          content: 'Health Canada launches new regulatory pathway for software-based medical devices and digital therapeutics. The streamlined process reduces approval timelines by up to 40% for qualifying products with demonstrated clinical efficacy.',
          update_type: 'pathway',
          region: 'Canada',
          priority: 'medium',
          published_at: '2025-08-13T09:00:00Z',
          source_id: 'HC-DIGITAL-2025',
          device_classes: ['Class II'],
          impact_score: 7.8,
          compliance_deadline: '2025-11-15'
        },
        {
          id: 'REG-2025-004',
          title: 'MHRA Post-Brexit Medical Device Transition Update',
          description: 'Updated timelines for CE to UKCA marking transition',
          content: 'The MHRA extends the transition period for CE marking acceptance until June 2026. Medical device manufacturers have additional time to complete UKCA marking requirements while maintaining market access.',
          update_type: 'transition',
          region: 'UK',
          priority: 'high',
          published_at: '2025-08-12T16:45:00Z',
          source_id: 'MHRA-TRANSITION-2025',
          device_classes: ['Class I', 'Class IIa', 'Class IIb', 'Class III'],
          impact_score: 8.1,
          compliance_deadline: '2026-06-30'
        },
        {
          id: 'REG-2025-005',
          title: 'WHO Global Harmonization Initiative for Medical Devices',
          description: 'International standards alignment for emerging markets',
          content: 'World Health Organization announces new global harmonization framework to align medical device regulations across 47 countries. Focus areas include quality management systems, clinical evaluation protocols, and post-market surveillance.',
          update_type: 'international',
          region: 'Global',
          priority: 'medium',
          published_at: '2025-08-11T11:20:00Z',
          source_id: 'WHO-HARMONY-2025',
          device_classes: ['All Classes'],
          impact_score: 9.5,
          compliance_deadline: '2026-12-31'
        }
      ];
      
      res.json({
        success: true,
        data: regulatoryUpdates,
        total: regulatoryUpdates.length,
        last_updated: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Regulatory Updates API error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Dashboard Data API
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = {
        totalUpdates: 2847,
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