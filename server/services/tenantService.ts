import { db } from "../db";
import { tenants, tenantUsers, tenantDashboards, tenantDataAccess, tenantInvitations } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { InsertTenant, Tenant, InsertTenantUser, TenantUser } from "@shared/schema";

export class TenantService {
  // Get all tenants with user counts
  static async getAllTenants() {
    const tenantsWithCounts = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        subscriptionPlan: tenants.subscriptionPlan,
        subscriptionStatus: tenants.subscriptionStatus,
        billingEmail: tenants.billingEmail,
        maxUsers: tenants.maxUsers,
        maxDataSources: tenants.maxDataSources,
        apiAccessEnabled: tenants.apiAccessEnabled,
        customBrandingEnabled: tenants.customBrandingEnabled,
        trialEndsAt: tenants.trialEndsAt,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt
      })
      .from(tenants)
      .orderBy(desc(tenants.createdAt));

    // Manually get counts for each tenant
    const tenantsWithCountsResult = await Promise.all(
      tenantsWithCounts.map(async (tenant) => {
        const [userCount, dashboardCount] = await Promise.all([
          db.select().from(tenantUsers).where(eq(tenantUsers.tenantId, tenant.id)),
          db.select().from(tenantDashboards).where(eq(tenantDashboards.tenantId, tenant.id))
        ]);

        return {
          ...tenant,
          _count: {
            tenantUsers: userCount.length,
            dashboards: dashboardCount.length
          }
        };
      })
    );

    return tenantsWithCountsResult;
  }

  // Get tenant by ID
  static async getTenantById(id: string) {
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return tenant;
  }

  // Get tenant by slug
  static async getTenantBySlug(slug: string) {
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    return tenant;
  }

  // Create new tenant
  static async createTenant(data: InsertTenant) {
    // Check if slug is unique
    const existingTenant = await this.getTenantBySlug(data.slug);
    if (existingTenant) {
      throw new Error('Slug already exists');
    }

    // Set trial end date (30 days from now)
    if (!data.trialEndsAt && data.subscriptionStatus === 'trial') {
      data.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const [tenant] = await db
      .insert(tenants)
      .values(data)
      .returning();

    // Create default data access permissions
    await db.insert(tenantDataAccess).values({
      tenantId: tenant.id,
      dataSourceId: 'default',
      allowedRegions: ['US', 'EU'],
      monthlyLimit: data.subscriptionPlan === 'starter' ? 500 : 
                   data.subscriptionPlan === 'professional' ? 2500 : 999999
    });

    return tenant;
  }

  // Update tenant
  static async updateTenant(id: string, data: Partial<InsertTenant>) {
    const [tenant] = await db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return tenant;
  }

  // Delete tenant
  static async deleteTenant(id: string) {
    // First, delete all related data
    await Promise.all([
      db.delete(tenantUsers).where(eq(tenantUsers.tenantId, id)),
      db.delete(tenantDashboards).where(eq(tenantDashboards.tenantId, id)),
      db.delete(tenantDataAccess).where(eq(tenantDataAccess.tenantId, id)),
      db.delete(tenantInvitations).where(eq(tenantInvitations.tenantId, id))
    ]);

    // Then delete the tenant
    const [deletedTenant] = await db
      .delete(tenants)
      .where(eq(tenants.id, id))
      .returning();

    if (!deletedTenant) {
      throw new Error('Tenant not found');
    }

    return { success: true };
  }

  // Get tenant users
  static async getTenantUsers(tenantId: string) {
    return await db
      .select({
        id: tenantUsers.id,
        tenantId: tenantUsers.tenantId,
        userId: tenantUsers.userId,
        role: tenantUsers.role,
        permissions: tenantUsers.permissions,
        dashboardConfig: tenantUsers.dashboardConfig,
        isActive: tenantUsers.isActive,
        invitedAt: tenantUsers.invitedAt,
        joinedAt: tenantUsers.joinedAt,
        createdAt: tenantUsers.createdAt
      })
      .from(tenantUsers)
      .where(eq(tenantUsers.tenantId, tenantId))
      .orderBy(desc(tenantUsers.createdAt));
  }

  // Add user to tenant
  static async addUserToTenant(data: InsertTenantUser) {
    const [tenantUser] = await db
      .insert(tenantUsers)
      .values(data)
      .returning();

    return tenantUser;
  }

  // Update tenant user
  static async updateTenantUser(id: string, data: Partial<InsertTenantUser>) {
    const [tenantUser] = await db
      .update(tenantUsers)
      .set(data)
      .where(eq(tenantUsers.id, id))
      .returning();

    if (!tenantUser) {
      throw new Error('Tenant user not found');
    }

    return tenantUser;
  }

  // Remove user from tenant
  static async removeUserFromTenant(tenantId: string, userId: string) {
    const [deletedUser] = await db
      .delete(tenantUsers)
      .where(and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.userId, userId)))
      .returning();

    if (!deletedUser) {
      throw new Error('Tenant user not found');
    }

    return { success: true };
  }

  // Get tenant statistics
  static async getTenantStats() {
    const allTenants = await db.select().from(tenants);
    
    const stats = {
      totalTenants: allTenants.length,
      activeTenants: allTenants.filter(t => t.subscriptionStatus === 'active').length,
      trialTenants: allTenants.filter(t => t.subscriptionStatus === 'trial').length,
      suspendedTenants: allTenants.filter(t => t.subscriptionStatus === 'suspended').length,
      planDistribution: {
        starter: allTenants.filter(t => t.subscriptionPlan === 'starter').length,
        professional: allTenants.filter(t => t.subscriptionPlan === 'professional').length,
        enterprise: allTenants.filter(t => t.subscriptionPlan === 'enterprise').length
      }
    };

    return stats;
  }

  // Check tenant limits and usage
  static async checkTenantLimits(tenantId: string) {
    const tenant = await this.getTenantById(tenantId);
    const users = await this.getTenantUsers(tenantId);
    
    const [dataAccess] = await db
      .select()
      .from(tenantDataAccess)
      .where(eq(tenantDataAccess.tenantId, tenantId))
      .limit(1);

    return {
      users: {
        current: users.length,
        max: tenant.maxUsers,
        available: tenant.maxUsers - users.length
      },
      dataAccess: {
        currentUsage: dataAccess?.currentUsage || 0,
        monthlyLimit: dataAccess?.monthlyLimit || 500,
        remaining: (dataAccess?.monthlyLimit || 500) - (dataAccess?.currentUsage || 0)
      },
      features: {
        apiAccess: tenant.apiAccessEnabled,
        customBranding: tenant.customBrandingEnabled
      }
    };
  }
}