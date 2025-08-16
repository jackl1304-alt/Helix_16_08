// NEW: Clean JSON-based Customer API Routes
import { Express } from 'express';
import { storage } from '../storage';

// JSON Response Interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Customer Permissions JSON Schema
interface CustomerPermissions {
  dashboard: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  knowledgeBase: boolean;
  newsletters: boolean;
  analytics: boolean;
  reports: boolean;
  dataCollection: boolean;
  globalSources: boolean;
  historicalData: boolean;
  administration: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
  aiInsights: boolean;
  advancedAnalytics: boolean;
}

// Tenant Data JSON Schema
interface TenantData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  customerPermissions: CustomerPermissions;
}

// Dashboard Data JSON Schema  
interface DashboardData {
  tenant: {
    id: string;
    name: string;
    plan: string;
    status: string;
  };
  usage: {
    currentMonth: number;
    limit: number;
    percentage: number;
    users: number;
    userLimit: number;
    apiCalls: number;
    apiLimit: number;
  };
  compliance: {
    score: number;
    alerts: number;
    upcoming: number;
    resolved: number;
  };
  analytics: {
    riskTrend: string;
    engagement: number;
    efficiency: number;
    dataQuality: number;
  };
}

export function setupCustomerRoutes(app: Express) {
  
  // CLEAN: Get Tenant Data with Permissions - JSON Response
  app.get('/api/customer/tenant/:tenantId', async (req, res) => {
    try {
      const { tenantId } = req.params;
      console.log(`[CUSTOMER API] Getting tenant data: ${tenantId}`);
      
      // JSON-based tenant configuration
      const tenantData: TenantData = {
        id: tenantId,
        name: "Demo Medical Devices GmbH",
        slug: "demo-medical",
        plan: "Professional",
        status: "active",
        customerPermissions: {
          // Basic permissions - always available for Professional plan
          dashboard: true,
          regulatoryUpdates: true,
          legalCases: false,  // Not included in Professional
          knowledgeBase: true,
          newsletters: true,
          
          // Advanced permissions - restricted 
          analytics: false,
          reports: false,
          dataCollection: false,
          globalSources: false,
          historicalData: false,
          
          // Admin permissions - disabled for customers
          administration: false,
          userManagement: false,
          systemSettings: false,
          auditLogs: false,
          aiInsights: false,
          advancedAnalytics: false
        }
      };
      
      const response: ApiResponse<TenantData> = {
        success: true,
        data: tenantData,
        message: 'Tenant data retrieved successfully'
      };
      
      console.log(`[CUSTOMER API] Returning tenant data for: ${tenantId}`);
      res.json(response.data); // Return data directly for compatibility
      
    } catch (error: any) {
      console.error(`[CUSTOMER API] Error getting tenant data: ${error.message}`);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Failed to get tenant data',
        error: error.message
      };
      
      res.status(500).json(errorResponse);
    }
  });
  
  // CLEAN: Get Dashboard Data - JSON Response  
  app.get('/api/customer/dashboard/:tenantId', async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { range } = req.query;
      
      console.log(`[CUSTOMER API] Getting dashboard data for tenant: ${tenantId}, range: ${range}`);
      
      // JSON-based dashboard data
      const dashboardData: DashboardData = {
        tenant: {
          id: tenantId,
          name: "Demo Medical Devices GmbH",
          plan: "Professional",
          status: "active"
        },
        usage: {
          currentMonth: 1247,
          limit: 2500,
          percentage: 50,
          users: 12,
          userLimit: 25,
          apiCalls: 312,
          apiLimit: 1000
        },
        compliance: {
          score: 92,
          alerts: 8,
          upcoming: 15,
          resolved: 156
        },
        analytics: {
          riskTrend: 'decreasing',
          engagement: 89,
          efficiency: 94,
          dataQuality: 98
        }
      };
      
      const response: ApiResponse<DashboardData> = {
        success: true,
        data: dashboardData,
        message: 'Dashboard data retrieved successfully'
      };
      
      console.log(`[CUSTOMER API] Returning dashboard data for tenant: ${tenantId}`);
      res.json(response.data);
      
    } catch (error: any) {
      console.error(`[CUSTOMER API] Error getting dashboard data: ${error.message}`);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Failed to get dashboard data',
        error: error.message
      };
      
      res.status(500).json(errorResponse);
    }
  });
  
  // CLEAN: Get Knowledge Articles - JSON Response
  app.get('/api/customer/knowledge-articles/:tenantId', async (req, res) => {
    try {
      const { tenantId } = req.params;
      console.log(`[CUSTOMER API] Getting knowledge articles for tenant: ${tenantId}`);
      
      // Get articles from storage
      const allArticles = await storage.getAllKnowledgeArticles();
      
      // Filter for customer access - remove internal/admin articles
      const customerArticles = allArticles.filter((article: any) => {
        const isCustomerAccessible = article.priority !== 'internal' && 
                                   !article.tags?.some((tag: string) => 
                                     tag.toLowerCase().includes('admin') || 
                                     tag.toLowerCase().includes('internal')
                                   );
        return isCustomerAccessible;
      });
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: customerArticles,
        message: `Retrieved ${customerArticles.length} articles`
      };
      
      console.log(`[CUSTOMER API] Returning ${customerArticles.length} articles for tenant: ${tenantId}`);
      res.json(response.data);
      
    } catch (error: any) {
      console.error(`[CUSTOMER API] Error getting knowledge articles: ${error.message}`);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Failed to get knowledge articles',
        error: error.message
      };
      
      res.status(500).json(errorResponse);
    }
  });
  
  // CLEAN: Get Regulatory Updates - JSON Response
  app.get('/api/customer/regulatory-updates/:tenantId', async (req, res) => {
    try {
      const { tenantId } = req.params;
      console.log(`[CUSTOMER API] Getting regulatory updates for tenant: ${tenantId}`);
      
      // Get updates from storage
      const allUpdates = await storage.getAllRegulatoryUpdates();
      
      // Filter latest updates for customer
      const customerUpdates = allUpdates.slice(0, 50); // Limit to 50 latest
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: customerUpdates,
        message: `Retrieved ${customerUpdates.length} updates`
      };
      
      console.log(`[CUSTOMER API] Returning ${customerUpdates.length} updates for tenant: ${tenantId}`);
      res.json(response.data);
      
    } catch (error: any) {
      console.error(`[CUSTOMER API] Error getting regulatory updates: ${error.message}`);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Failed to get regulatory updates',
        error: error.message
      };
      
      res.status(500).json(errorResponse);
    }
  });
  
  console.log('[CUSTOMER API] Clean JSON-based customer routes registered');
}