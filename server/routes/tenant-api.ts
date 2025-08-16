import express from 'express';
import { neon } from "@neondatabase/serverless";

const router = express.Router();
const sql = neon(process.env.DATABASE_URL!);

// Helper function to determine impact level based on category
function getImpactLevel(category: string): string {
  if (!category) return 'medium';
  const cat = category.toLowerCase();
  if (cat.includes('recall') || cat.includes('safety') || cat.includes('alert')) return 'critical';
  if (cat.includes('approval') || cat.includes('clearance') || cat.includes('guidance')) return 'high';
  return 'medium';
}

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
    // Get real stats from database
    const [updateCount] = await sql`SELECT COUNT(*) as count FROM regulatory_updates`;
    const [caseCount] = await sql`SELECT COUNT(*) as count FROM legal_cases`;
    const [sourceCount] = await sql`SELECT COUNT(*) as count FROM data_sources WHERE is_active = true`;
    
    // Professional tier stats with real data
    const stats = {
      totalUpdates: Math.min(updateCount.count, 200), // Professional limit
      totalLegalCases: Math.min(caseCount.count, 50), // Professional limit  
      activeDataSources: Math.min(sourceCount.count, 20), // Professional limit
      monthlyUsage: Math.floor(updateCount.count * 0.45), // 45% of updates as usage
      usageLimit: 200,
      usagePercentage: Math.min((updateCount.count * 0.45 / 200) * 100, 100)
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

    // Professional tier gets top 20 real updates from database
    const filteredUpdates = allUpdates.slice(0, 20).map(update => ({
      id: update.id,
      title: update.title,
      agency: update.source,
      region: update.region,
      date: update.date_published,
      type: update.category?.toLowerCase() || 'regulatory',
      summary: update.summary || update.content?.substring(0, 150) + '...',
      impact: getImpactLevel(update.category),
      category: update.category,
      url: update.url
    }));

    console.log('[TENANT API] Returning real regulatory updates:', filteredUpdates.length);
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

    // Professional tier gets access to top 12 real cases
    const filteredCases = legalCases.slice(0, 12).map(legalCase => ({
      id: legalCase.id,
      title: legalCase.title,
      court: legalCase.court,
      date: legalCase.date_decided,
      outcome: legalCase.outcome,
      summary: legalCase.summary,
      caseNumber: legalCase.case_number,
      impact: getImpactLevel(legalCase.outcome)
    }));

    console.log('[TENANT API] Returning real legal cases:', filteredCases.length);
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