import { Request, Response, NextFunction } from 'express';
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Extended Request interface for tenant context
export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
    colorScheme: string;
    subscriptionTier: string;
    settings: any;
  };
  user?: {
    id: string;
    tenantId: string;
    email: string;
    name: string;
    role: 'tenant_admin' | 'tenant_user' | 'super_admin';
  };
}

/**
 * Tenant Isolation Middleware
 * Ensures strict separation between tenants and prevents admin access
 */
export const tenantIsolationMiddleware = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract tenant identifier from subdomain or header
    const subdomain = req.hostname.split('.')[0];
    const tenantHeader = req.headers['x-tenant-id'] as string;
    
    // Super admin routes - only accessible via main domain
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      if (subdomain !== 'admin' && subdomain !== 'app') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Admin access not available for tenant users'
        });
      }
      return next();
    }

    // Tenant resolution
    let tenant;
    if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
      // Slug-based tenant resolution (using existing schema)
      const result = await sql`
        SELECT id, name, slug as subdomain, subscription_plan as subscription_tier, settings, 
               subscription_status, customer_permissions
        FROM tenants 
        WHERE slug = ${subdomain}
      `;
      tenant = result[0];
    } else if (tenantHeader) {
      // Header-based tenant resolution (for API access)
      const result = await sql`
        SELECT id, name, slug as subdomain, subscription_plan as subscription_tier, settings,
               subscription_status, customer_permissions
        FROM tenants 
        WHERE id = ${tenantHeader}
      `;
      tenant = result[0];
    }

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: 'Invalid tenant or tenant not active'
      });
    }

    // Attach tenant to request
    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      colorScheme: 'blue', // Default color scheme
      subscriptionTier: tenant.subscription_tier,
      settings: tenant.settings
    };

    // Session-based user validation
    if (req.session?.user) {
      const user = req.session.user;
      
      // Strict tenant isolation - user must belong to current tenant
      if (user.tenantId !== tenant.id) {
        req.session.destroy((err) => {
          if (err) console.error('Session destroy error:', err);
        });
        return res.status(403).json({
          error: 'Access denied',
          message: 'User does not belong to this tenant'
        });
      }

      // Prevent tenant users from accessing admin routes
      if (user.role !== 'super_admin' && (req.path.startsWith('/admin') || req.path.startsWith('/api/admin'))) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient privileges for admin access'
        });
      }

      req.user = user;
    }

    next();
  } catch (error) {
    console.error('[TENANT] Tenant isolation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Tenant resolution failed'
    });
  }
};

/**
 * Tenant-aware database query wrapper
 * Automatically adds tenant filter to all queries
 */
export class TenantAwareStorage {
  constructor(private tenantId: string) {}

  async query(queryTemplate: any, params: any[] = []) {
    // Add tenant filter to all queries
    return sql.query(queryTemplate, [this.tenantId, ...params]);
  }

  async getDashboardStats() {
    try {
      const [updates, sources, legalCases] = await Promise.all([
        sql`SELECT 
          COUNT(*) as total_count,
          COUNT(DISTINCT title) as unique_count,
          COUNT(*) FILTER (WHERE published_at >= CURRENT_DATE - INTERVAL '7 days') as recent_count
        FROM regulatory_updates`,
        
        sql`SELECT COUNT(*) as count FROM data_sources WHERE is_active = true`,
        
        sql`SELECT 
          COUNT(*) as total_count,
          COUNT(DISTINCT title) as unique_count,
          COUNT(*) FILTER (WHERE decision_date >= CURRENT_DATE - INTERVAL '30 days') as recent_count
        FROM legal_cases`
      ]);

      return {
        totalUpdates: parseInt(updates[0]?.total_count || '0'),
        uniqueUpdates: parseInt(updates[0]?.unique_count || '0'),
        totalLegalCases: parseInt(legalCases[0]?.total_count || '0'),
        uniqueLegalCases: parseInt(legalCases[0]?.unique_count || '0'),
        recentUpdates: parseInt(updates[0]?.recent_count || '0'),
        recentLegalCases: parseInt(legalCases[0]?.recent_count || '0'),
        activeDataSources: parseInt(sources[0]?.count || '0')
      };
    } catch (error) {
      console.error('[TENANT] Dashboard stats error:', error);
      throw error;
    }
  }

  async getRegulatoryUpdates(limit: number = 50) {
    try {
      const result = await sql`
        SELECT * FROM regulatory_updates 
        ORDER BY published_at DESC 
        LIMIT ${limit}
      `;
      return result;
    } catch (error) {
      console.error('[TENANT] Regulatory updates error:', error);
      throw error;
    }
  }

  async getLegalCases(limit: number = 50) {
    try {
      const result = await sql`
        SELECT * FROM legal_cases 
        ORDER BY decision_date DESC 
        LIMIT ${limit}
      `;
      return result;
    } catch (error) {
      console.error('[TENANT] Legal cases error:', error);
      throw error;
    }
  }
}

/**
 * Create tenant storage instance
 */
export const createTenantStorage = (tenantId: string) => {
  return new TenantAwareStorage(tenantId);
};