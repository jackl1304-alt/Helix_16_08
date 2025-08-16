import express from 'express';
import { TenantRequest, createTenantStorage } from '../middleware/tenant-isolation';

const router = express.Router();

/**
 * Tenant Dashboard Stats
 * Returns stats scoped to the current tenant only
 */
router.get('/dashboard/stats', async (req: TenantRequest, res) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    const storage = createTenantStorage(req.tenant.id);
    const stats = await storage.getDashboardStats();

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
router.get('/context', async (req: TenantRequest, res) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    res.json({
      id: req.tenant.id,
      name: req.tenant.name,
      subdomain: req.tenant.subdomain,
      colorScheme: req.tenant.colorScheme,
      subscriptionTier: req.tenant.subscriptionTier,
      settings: req.tenant.settings
    });
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
router.get('/regulatory-updates', async (req: TenantRequest, res) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const storage = createTenantStorage(req.tenant.id);
    const updates = await storage.getRegulatoryUpdates(limit);

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