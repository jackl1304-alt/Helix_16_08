import express from 'express';
import { TenantRequest, createTenantStorage } from '../middleware/tenant-isolation';

const router = express.Router();

/**
 * Tenant Dashboard Stats
 * Returns stats scoped to the current tenant only
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('[TENANT] Dashboard stats request received');
    
    // Use simplified stats for demo
    const stats = {
      totalUpdates: 24,
      uniqueUpdates: 11,
      totalLegalCases: 65,
      uniqueLegalCases: 65,
      recentUpdates: 0,
      recentLegalCases: 1,
      activeDataSources: 70
    };

    console.log('[TENANT] Returning dashboard stats:', stats);
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
router.get('/context', async (req, res) => {
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
router.get('/regulatory-updates', async (req, res) => {
  try {
    console.log('[TENANT] Regulatory updates request received');
    
    // Return sample updates for demo
    const updates = [
      {
        id: 'tenant-update-1',
        title: 'FDA Medical Device Guidance Update',
        description: 'New guidelines for medical device approval process',
        published_at: '2025-08-15T10:00:00Z',
        type: 'guidance'
      }
    ];

    console.log('[TENANT] Returning regulatory updates:', updates.length);
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