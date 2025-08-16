import express from 'express';
import { neon } from "@neondatabase/serverless";

const router = express.Router();
const sql = neon(process.env.DATABASE_URL!);

// Get tenant context
router.get('/context', async (req, res) => {
  try {
    // Demo tenant context
    const tenantContext = {
      id: '2d224347-b96e-4b61-acac-dbd414a0e048',
      name: 'Demo Medical Corp',
      subdomain: 'demo-medical',
      colorScheme: 'blue',
      subscriptionTier: 'professional',
      settings: {
        logo: null,
        customColors: {
          primary: '#2563eb',
          secondary: '#64748b'
        }
      }
    };

    console.log('[TENANT API] Context requested for tenant:', tenantContext.name);
    res.json(tenantContext);

  } catch (error) {
    console.error('[TENANT API] Context error:', error);
    res.status(500).json({ 
      error: 'Fehler beim Laden der Tenant-Daten',
      message: 'Bitte versuchen Sie es erneut'
    });
  }
});

// Get tenant dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Demo stats for professional tier
    const stats = {
      totalUpdates: 24,
      totalLegalCases: 12,
      activeDataSources: 15,
      monthlyUsage: 89, // Professional tier allows 200
      usageLimit: 200,
      usagePercentage: 44.5
    };

    console.log('[TENANT API] Dashboard stats requested');
    res.json(stats);

  } catch (error) {
    console.error('[TENANT API] Stats error:', error);
    res.status(500).json({ 
      error: 'Fehler beim Laden der Statistiken',
      message: 'Bitte versuchen Sie es erneut'
    });
  }
});

// Get tenant regulatory updates (filtered by subscription)
router.get('/regulatory-updates', async (req, res) => {
  try {
    // Get all regulatory updates from database
    const allUpdates = await sql`
      SELECT id, title, source, date_published, region, category, content, url, summary
      FROM regulatory_updates
      ORDER BY date_published DESC
      LIMIT 50
    `;

    // Filter based on professional subscription
    const filteredUpdates = allUpdates.slice(0, 20); // Professional tier gets top 20

    console.log('[TENANT API] Regulatory updates requested:', filteredUpdates.length);
    res.json(filteredUpdates);

  } catch (error) {
    console.error('[TENANT API] Regulatory updates error:', error);
    res.status(500).json({ 
      error: 'Fehler beim Laden der Updates',
      message: 'Bitte versuchen Sie es erneut'
    });
  }
});

// Get tenant legal cases (filtered by subscription)
router.get('/legal-cases', async (req, res) => {
  try {
    // Get legal cases from database
    const legalCases = await sql`
      SELECT id, title, court, date_decided, outcome, summary, case_number
      FROM legal_cases
      ORDER BY date_decided DESC
      LIMIT 20
    `;

    // Professional tier gets access to 50 cases
    const filteredCases = legalCases.slice(0, 12);

    console.log('[TENANT API] Legal cases requested:', filteredCases.length);
    res.json(filteredCases);

  } catch (error) {
    console.error('[TENANT API] Legal cases error:', error);
    res.status(500).json({ 
      error: 'Fehler beim Laden der Rechtsfälle',
      message: 'Bitte versuchen Sie es erneut'
    });
  }
});

export default router;