// Temporary test file to create missing tenant data
import { Storage } from './storage.js';

const storage = new Storage();

async function createMissingTenant() {
  try {
    const tenantId = 'b616d190-c5ca-4f7f-b0c0-affa2b93783b';
    
    // Check if tenant exists
    let tenant;
    try {
      tenant = await storage.getTenant(tenantId);
      console.log(`Tenant ${tenantId} already exists:`, tenant);
      return;
    } catch (error) {
      // Tenant doesn't exist, create it
      console.log(`Creating tenant ${tenantId}...`);
    }

    // Create the missing tenant
    const newTenant = {
      id: tenantId,
      name: "Customer Portal User",
      slug: "customer-portal-user-669150",
      subscriptionPlan: "enterprise",
      subscriptionStatus: "trial",
      customerPermissions: {
        reports: false,
        analytics: false,
        auditLogs: true,
        dashboard: true,
        aiInsights: true,
        legalCases: false,
        newsletters: false,
        globalSources: false,
        knowledgeBase: false,
        administration: false,
        dataCollection: false,
        historicalData: false,
        systemSettings: true,
        userManagement: true,
        advancedAnalytics: false,
        regulatoryUpdates: true
      }
    };

    await storage.createTenant(newTenant);
    console.log('Missing tenant created successfully:', newTenant);
    
  } catch (error) {
    console.error('Error creating missing tenant:', error);
  }
}

createMissingTenant();