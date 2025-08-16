// NEW: Clean JSON-based Admin API Routes
import { Express } from 'express';

// JSON Response Interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Admin Permissions JSON Schema
interface AdminPermissions {
  dashboard: boolean;
  analytics: boolean;
  dataCollection: boolean;
  newsletterAdmin: boolean;
  emailManagement: boolean;
  knowledgeBase: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  globalApprovals: boolean;
  ongoingApprovals: boolean;
  syncManager: boolean;
  globalSources: boolean;
  newsletterManager: boolean;
  historicalData: boolean;
  customerManagement: boolean;
  userManagement: boolean;
  systemAdmin: boolean;
  auditLogs: boolean;
  aiContentAnalysis: boolean;
  kiInsights: boolean;
  gripIntegration: boolean;
}

// Admin User Data JSON Schema
interface AdminUserData {
  id: string;
  email: string;
  role: string;
  permissions: AdminPermissions;
  lastLogin: string;
  status: string;
}

export function setupAdminRoutes(app: Express) {
  
  // CLEAN: Get Admin Permissions - JSON Response
  app.get('/api/admin/permissions', async (req, res) => {
    try {
      console.log('[ADMIN API] Getting admin permissions');
      
      // JSON-based admin permissions configuration
      const adminPermissions: AdminPermissions = {
        // Core dashboard and analytics
        dashboard: true,
        analytics: true,
        
        // Data management
        dataCollection: true,
        newsletterAdmin: true,
        emailManagement: true,
        knowledgeBase: true,
        
        // Compliance and regulation
        regulatoryUpdates: true,
        legalCases: true,
        
        // Approvals management
        globalApprovals: true,
        ongoingApprovals: true,
        
        // Advanced features
        syncManager: true,
        globalSources: true,
        newsletterManager: true,
        historicalData: true,
        
        // Administration
        customerManagement: true,
        userManagement: true,
        systemAdmin: true,
        auditLogs: true,
        
        // AI features
        aiContentAnalysis: true,
        kiInsights: true,
        gripIntegration: true
      };
      
      const response: ApiResponse<AdminPermissions> = {
        success: true,
        data: adminPermissions,
        message: 'Admin permissions retrieved successfully'
      };
      
      console.log('[ADMIN API] Returning admin permissions');
      res.json(response.data); // Return data directly for compatibility
      
    } catch (error: any) {
      console.error(`[ADMIN API] Error getting admin permissions: ${error.message}`);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Failed to get admin permissions',
        error: error.message
      };
      
      res.status(500).json(errorResponse);
    }
  });
  
  // CLEAN: Get Admin User Data - JSON Response
  app.get('/api/admin/user', async (req, res) => {
    try {
      console.log('[ADMIN API] Getting admin user data');
      
      // JSON-based admin user data
      const adminUserData: AdminUserData = {
        id: 'admin-001',
        email: 'admin@helix.com',
        role: 'administrator',
        permissions: {
          // All permissions enabled for admin
          dashboard: true,
          analytics: true,
          dataCollection: true,
          newsletterAdmin: true,
          emailManagement: true,
          knowledgeBase: true,
          regulatoryUpdates: true,
          legalCases: true,
          globalApprovals: true,
          ongoingApprovals: true,
          syncManager: true,
          globalSources: true,
          newsletterManager: true,
          historicalData: true,
          customerManagement: true,
          userManagement: true,
          systemAdmin: true,
          auditLogs: true,
          aiContentAnalysis: true,
          kiInsights: true,
          gripIntegration: true
        },
        lastLogin: new Date().toISOString(),
        status: 'active'
      };
      
      const response: ApiResponse<AdminUserData> = {
        success: true,
        data: adminUserData,
        message: 'Admin user data retrieved successfully'
      };
      
      console.log('[ADMIN API] Returning admin user data');
      res.json(response.data);
      
    } catch (error: any) {
      console.error(`[ADMIN API] Error getting admin user data: ${error.message}`);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Failed to get admin user data',
        error: error.message
      };
      
      res.status(500).json(errorResponse);
    }
  });
  
  // CLEAN: Get Admin Navigation Data - JSON Response
  app.get('/api/admin/navigation', async (req, res) => {
    try {
      console.log('[ADMIN API] Getting admin navigation data');
      
      // JSON-based navigation configuration
      const navigationData = {
        sections: [
          {
            id: "overview",
            title: "Übersicht & Kontrolle",
            defaultOpen: true,
            items: [
              { id: "dashboard", name: "Dashboard", href: "/", permission: "dashboard" },
              { id: "analytics", name: "Analytics", href: "/analytics", permission: "analytics" }
            ]
          },
          {
            id: "dataManagement", 
            title: "Datenmanagement",
            defaultOpen: true,
            items: [
              { id: "dataCollection", name: "Datensammlung", href: "/data-collection", permission: "dataCollection" },
              { id: "newsletterAdmin", name: "Newsletter Admin", href: "/newsletter-admin", permission: "newsletterAdmin" },
              { id: "emailManagement", name: "E-Mail Management", href: "/email-management", permission: "emailManagement" },
              { id: "knowledgeBase", name: "Wissensdatenbank", href: "/knowledge-base", permission: "knowledgeBase" }
            ]
          },
          {
            id: "compliance",
            title: "Compliance & Regulierung",
            defaultOpen: true,
            items: [
              { id: "regulatoryUpdates", name: "Regulatory Updates", href: "/regulatory-updates", permission: "regulatoryUpdates" },
              { id: "legalCases", name: "Rechtsprechung", href: "/rechtsprechung", permission: "legalCases" }
            ]
          },
          {
            id: "approvals",
            title: "Zulassungen & Registrierung",
            defaultOpen: true,
            items: [
              { id: "globalApprovals", name: "Globale Zulassungen", href: "/zulassungen/global", permission: "globalApprovals" },
              { id: "ongoingApprovals", name: "Laufende Zulassungen", href: "/zulassungen/laufende", permission: "ongoingApprovals" }
            ]
          },
          {
            id: "advanced",
            title: "Erweitert",
            defaultOpen: false,
            items: [
              { id: "syncManager", name: "Sync Manager", href: "/sync-manager", permission: "syncManager" },
              { id: "globalSources", name: "Globale Quellen", href: "/global-sources", permission: "globalSources" },
              { id: "newsletterManager", name: "Newsletter Manager", href: "/newsletter-manager", permission: "newsletterManager" },
              { id: "historicalData", name: "Historische Daten", href: "/historical-data", permission: "historicalData" },
              { id: "customerManagement", name: "Kundenverwaltung", href: "/admin-customers", permission: "customerManagement" },
              { id: "userManagement", name: "Benutzerverwaltung", href: "/user-management", permission: "userManagement" },
              { id: "systemAdmin", name: "Systemadministration", href: "/administration", permission: "systemAdmin" },
              { id: "auditLogs", name: "Audit Logs", href: "/audit-logs", permission: "auditLogs" }
            ],
            hiddenItems: [
              { id: "aiContentAnalysis", name: "🧠", href: "/ai-content-analysis", permission: "aiContentAnalysis" },
              { id: "kiInsights", name: "🤖", href: "/ki-insights", permission: "kiInsights" },
              { id: "gripIntegration", name: "✨", href: "/grip-integration", permission: "gripIntegration" }
            ]
          }
        ]
      };
      
      const response: ApiResponse = {
        success: true,
        data: navigationData,
        message: 'Navigation data retrieved successfully'
      };
      
      console.log('[ADMIN API] Returning navigation data');
      res.json(response.data);
      
    } catch (error: any) {
      console.error(`[ADMIN API] Error getting navigation data: ${error.message}`);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Failed to get navigation data',
        error: error.message
      };
      
      res.status(500).json(errorResponse);
    }
  });
  
  console.log('[ADMIN API] Clean JSON-based admin routes registered');
}