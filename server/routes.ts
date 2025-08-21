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