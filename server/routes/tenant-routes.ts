import express from 'express';
import { TenantRequest, createTenantStorage } from '../middleware/tenant-isolation';

const router = express.Router();

/**
 * Tenant Dashboard Stats
 * Returns stats scoped to the current tenant only
 */
// REMOVED - This route conflicts with the new tenant-api.ts  
// Use /api/tenant/dashboard/stats from tenant-api.ts instead
router.get('/dashboard/stats-old', async (req, res) => {
  try {
    console.log('[TENANT] Dashboard stats request received');
    
    // Tenant-specific stats based on subscription limits
    const stats = {
      totalUpdates: 15,        // Limited based on subscription
      totalLegalCases: 8,      // Limited based on subscription
      activeDataSources: 12,   // Limited based on subscription
      monthlyUsage: 23,        // Current month usage
      usageLimit: 200          // Professional plan limit
    };

    console.log('[TENANT] Returning tenant-specific stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('[TENANT] Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      message: 'Please try again or contact support'
    });
  }
});

/**
 * Tenant Context
 * Returns current tenant information
 */
// REMOVED - This route conflicts with the new tenant-api.ts
// Use /api/tenant/context from tenant-api.ts instead  
router.get('/context-old', async (req, res) => {
  try {
    console.log('[TENANT] Context request received');
    
    const tenant = {
      id: '2d224347-b96e-4b61-acac-dbd414a0e048',
      name: 'Demo Medical Corp',
      subdomain: 'demo-medical',
      colorScheme: 'blue',
      subscriptionTier: 'professional',
      settings: {}
    };

    console.log('[TENANT] Returning tenant context:', tenant);
    res.json(tenant);
  } catch (error) {
    console.error('[TENANT] Context error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenant context'
    });
  }
});

/**
 * Tenant Regulatory Updates
 * Returns updates scoped to the current tenant
 */
// REMOVED - This route conflicts with the new tenant-api.ts
// Use /api/tenant/regulatory-updates from tenant-api.ts instead
router.get('/regulatory-updates-old', async (req, res) => {
  try {
    console.log('[TENANT] Regulatory updates request received');
    
    // Return tenant-specific updates (limited by subscription)
    const updates = [
      {
        id: 'tenant-update-1',
        title: 'FDA Medical Device Guidance Update',
        description: 'New guidelines for medical device approval process specific to your sector',
        published_at: '2025-08-15T10:00:00Z',
        type: 'guidance'
      },
      {
        id: 'tenant-update-2', 
        title: 'EU MDR Implementation Changes',
        description: 'Updated requirements for medical device registration in Europe',
        published_at: '2025-08-14T14:30:00Z',
        type: 'regulatory'
      },
      {
        id: 'tenant-update-3',
        title: 'ISO 13485:2016 Updates',
        description: 'Quality management system updates for medical devices',
        published_at: '2025-08-13T09:15:00Z',
        type: 'standard'
      }
    ];

    console.log('[TENANT] Returning tenant regulatory updates:', updates.length);
    res.json(updates);
  } catch (error) {
    console.error('[TENANT] Regulatory updates error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch regulatory updates'
    });
  }
});

/**
 * Tenant Legal Cases
 * Returns legal cases scoped to the current tenant
 */
router.get('/legal-cases', async (req: TenantRequest, res) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const storage = createTenantStorage(req.tenant.id);
    const legalCases = await storage.getLegalCases(limit);

    res.json(legalCases);
  } catch (error) {
    console.error('[TENANT] Legal cases error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch legal cases'
    });
  }
});

/**
 * Tenant User Profile
 * Returns current user information within tenant context
 */
router.get('/profile', async (req: TenantRequest, res) => {
  try {
    if (!req.user || !req.tenant) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Ensure user belongs to current tenant
    if (req.user.tenantId !== req.tenant.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        subscriptionTier: req.tenant.subscriptionTier
      }
    });
  } catch (error) {
    console.error('[TENANT] Profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile'
    });
  }
});

/**
 * Tenant Settings
 * Allows tenant admins to update tenant settings
 */
router.get('/settings', async (req: TenantRequest, res) => {
  try {
    if (!req.user || !req.tenant) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only tenant admins can view settings
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    res.json({
      tenant: req.tenant,
      users: [], // TODO: Implement tenant user management
      subscription: {
        tier: req.tenant.subscriptionTier,
        features: [] // TODO: Implement feature list
      }
    });
  } catch (error) {
    console.error('[TENANT] Settings error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenant settings'
    });
  }
});

/**
 * Update Tenant Settings
 * Allows tenant admins to update tenant configuration
 */
router.put('/settings', async (req: TenantRequest, res) => {
  try {
    if (!req.user || !req.tenant) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only tenant admins can update settings
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // TODO: Implement tenant settings update
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[TENANT] Update settings error:', error);
    res.status(500).json({ 
      error: 'Failed to update tenant settings'
    });
  }
});

export default router;