import { Router, Request, Response } from 'express';
import { logger } from '../services/logger.service';
import { asyncHandler } from '../middleware/error.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const credentialsSchema = z.record(z.string());
const sourceIdSchema = z.object({
  sourceId: z.string().min(1)
});

// Mock data store for credentials (in production, use database)
const credentialsStore: Record<string, Record<string, string>> = {};

// Get all data sources configuration
router.get('/data-sources', asyncHandler(async (req: Request, res: Response) => {
  logger.info('API: Fetching data sources configuration');
  
  // In production, this would fetch from database
  const dataSources = [
    {
      id: 'fda_510k',
      name: 'FDA 510(k) Database',
      status: 'inactive',
      hasCredentials: !!credentialsStore['fda_510k']
    },
    {
      id: 'ema_epar',
      name: 'EMA EPAR Database',
      status: 'active',
      hasCredentials: !!credentialsStore['ema_epar']
    },
    // Add more sources as needed
  ];
  
  res.json(dataSources);
}));

// Save credentials for a data source
router.post('/data-sources/:sourceId/credentials', 
  validateParams(sourceIdSchema),
  validateBody(credentialsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    const credentials = req.body;
    
    logger.info('API: Saving credentials for data source', { sourceId });
    
    // In production, encrypt and store in database
    credentialsStore[sourceId] = credentials;
    
    logger.info('API: Credentials saved successfully', { sourceId });
    
    res.json({
      success: true,
      message: 'Zugangsdaten erfolgreich gespeichert',
      timestamp: new Date().toISOString()
    });
  })
);

// Test connection for a data source
router.post('/data-sources/:sourceId/test',
  validateParams(sourceIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    
    logger.info('API: Testing connection for data source', { sourceId });
    
    const credentials = credentialsStore[sourceId];
    if (!credentials) {
      return res.status(400).json({
        success: false,
        error: 'Keine Zugangsdaten für diese Datenquelle gefunden',
        timestamp: new Date().toISOString()
      });
    }
    
    // In production, actually test the connection to the data source
    // For now, simulate a test
    const isSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (isSuccess) {
      logger.info('API: Connection test successful', { sourceId });
      res.json({
        success: true,
        message: 'Verbindung erfolgreich getestet',
        timestamp: new Date().toISOString()
      });
    } else {
      logger.warn('API: Connection test failed', { sourceId });
      res.status(400).json({
        success: false,
        error: 'Verbindungstest fehlgeschlagen - Überprüfen Sie die Zugangsdaten',
        timestamp: new Date().toISOString()
      });
    }
  })
);

// Get credentials for a data source (masked for security)
router.get('/data-sources/:sourceId/credentials',
  validateParams(sourceIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sourceId } = req.params;
    
    logger.info('API: Fetching masked credentials for data source', { sourceId });
    
    const credentials = credentialsStore[sourceId];
    if (!credentials) {
      return res.json({
        success: true,
        data: {},
        timestamp: new Date().toISOString()
      });
    }
    
    // Mask sensitive values
    const maskedCredentials: Record<string, string> = {};
    Object.keys(credentials).forEach(key => {
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
        maskedCredentials[key] = '****' + credentials[key].slice(-4);
      } else {
        maskedCredentials[key] = credentials[key];
      }
    });
    
    res.json({
      success: true,
      data: maskedCredentials,
      timestamp: new Date().toISOString()
    });
  })
);

// TENANT MANAGEMENT ROUTES
import { z } from 'zod';

// Validation schema für Tenant-Erstellung
const createTenantSchema = z.object({
  name: z.string().min(1, 'Firmenname ist erforderlich'),
  slug: z.string().min(1, 'Slug ist erforderlich'),
  subscriptionPlan: z.enum(['starter', 'professional', 'enterprise']),
  subscriptionStatus: z.enum(['trial', 'active', 'expired', 'cancelled']),
  billingEmail: z.string().email('Gültige E-Mail-Adresse erforderlich'),
  contactName: z.string().min(1, 'Kontaktname ist erforderlich'),
  contactEmail: z.string().email('Gültige Kontakt-E-Mail erforderlich'),
  maxUsers: z.number().min(1),
  maxDataSources: z.number().min(1),
  apiAccessEnabled: z.boolean().default(true)
});

// POST /api/admin/tenants - Neuen Tenant erstellen
router.post('/tenants', async (req: Request, res: Response) => {
  try {
    console.log('[ADMIN] Creating new tenant:', req.body);
    
    // Validate input
    const validatedData = createTenantSchema.parse(req.body);
    
    // Import tenant service dynamically
    const { TenantService } = await import('../services/tenantService');
    
    // Create tenant with email service integration
    const newTenant = await TenantService.createTenant({
      name: validatedData.name,
      slug: validatedData.slug,
      subscriptionPlan: validatedData.subscriptionPlan,
      subscriptionStatus: validatedData.subscriptionStatus,
      billingEmail: validatedData.billingEmail,
      maxUsers: validatedData.maxUsers,
      maxDataSources: validatedData.maxDataSources,
      apiAccessEnabled: validatedData.apiAccessEnabled,
      contactName: validatedData.contactName,
      contactEmail: validatedData.contactEmail
    });

    console.log('[ADMIN] Tenant created successfully:', newTenant.id);
    
    res.status(201).json({
      success: true,
      data: newTenant,
      message: 'Tenant erfolgreich erstellt'
    });
    
  } catch (error: any) {
    console.error('[ADMIN] Error creating tenant:', error);
    
    if (error.message === 'Slug already exists') {
      return res.status(409).json({
        success: false,
        error: 'Slug bereits vergeben - bitte wählen Sie einen anderen',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Erstellen des Tenants',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/admin/tenants - Alle Tenants auflisten
router.get('/tenants', async (req: Request, res: Response) => {
  try {
    // Direct SQL query für bessere Kompatibilität
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL!);
    
    const result = await sql`
      SELECT 
        id,
        name,
        slug,
        subscription_plan as "subscriptionPlan",
        subscription_status as "subscriptionStatus", 
        billing_email as "billingEmail",
        max_users as "maxUsers",
        max_data_sources as "maxDataSources",
        api_access_enabled as "apiAccessEnabled",
        custom_branding_enabled as "customBrandingEnabled",
        trial_ends_at as "trialEndsAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM tenants 
      ORDER BY created_at DESC
    `;
    
    console.log('[ADMIN] Fetched tenants for frontend:', result.length);
    
    res.json(result);
  } catch (error: any) {
    console.error('[ADMIN] Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Tenants'
    });
  }
});

// PUT /api/admin/tenants/:id - Tenant bearbeiten
router.put('/tenants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('[ADMIN] Updating tenant:', id, updateData);
    
    const { db } = await import('../db');
    const { tenants } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // Build update object for Drizzle
    const updateFields: any = {};
    
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.subscriptionPlan) updateFields.subscriptionPlan = updateData.subscriptionPlan;
    if (updateData.subscriptionStatus) updateFields.subscriptionStatus = updateData.subscriptionStatus;
    if (updateData.billingEmail) updateFields.billingEmail = updateData.billingEmail;
    if (updateData.maxUsers !== undefined) updateFields.maxUsers = updateData.maxUsers;
    if (updateData.maxDataSources !== undefined) updateFields.maxDataSources = updateData.maxDataSources;
    if (updateData.apiAccessEnabled !== undefined) updateFields.apiAccessEnabled = updateData.apiAccessEnabled;
    if (updateData.customBrandingEnabled !== undefined) updateFields.customBrandingEnabled = updateData.customBrandingEnabled;
    
    updateFields.updatedAt = new Date();
    
    const result = await db.update(tenants)
      .set(updateFields)
      .where(eq(tenants.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant nicht gefunden'
      });
    }
    
    console.log('[ADMIN] Tenant updated successfully:', result[0].id);
    
    res.json({
      success: true,
      data: result[0],
      message: 'Tenant erfolgreich aktualisiert'
    });
    
  } catch (error: any) {
    console.error('[ADMIN] Error updating tenant:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Aktualisieren des Tenants'
    });
  }
});

// DELETE /api/admin/tenants/:id - Tenant löschen
router.delete('/tenants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('[ADMIN] Deleting tenant:', id);
    
    const { db } = await import('../db');
    const { tenants } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const result = await db.delete(tenants)
      .where(eq(tenants.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant nicht gefunden'
      });
    }
    
    console.log('[ADMIN] Tenant deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'Tenant erfolgreich gelöscht'
    });
    
  } catch (error: any) {
    console.error('[ADMIN] Error deleting tenant:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Löschen des Tenants'
    });
  }
});

export default router;