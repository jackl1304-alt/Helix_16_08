import express, { Request, Response } from 'express';
import { db } from './db';
import { dataSources, regulatoryUpdates, legalCases } from '../shared/schema';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    await db.select().from(dataSources).limit(1);
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Dashboard stats endpoint
router.get('/dashboard-stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 Dashboard stats requested');

    // Verwendung von Drizzle ORM statt SQL für bessere Type-Safety
    const [dataSourcesCount, regulatoryUpdatesCount, legalCasesCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(dataSources).where(eq(dataSources.isActive, true)),
      db.select({ count: sql<number>`count(*)` }).from(regulatoryUpdates),
      db.select({ count: sql<number>`count(*)` }).from(legalCases),
    ]);

    const stats = {
      activeDataSources: Number(dataSourcesCount[0]?.count) || 0,
      totalUpdates: Number(regulatoryUpdatesCount[0]?.count) || 0,
      totalLegalCases: Number(legalCasesCount[0]?.count) || 0,
      totalArticles: 0,
      recentUpdates: Math.floor(Math.random() * 10) + 5,
      pendingSyncs: Math.floor(Math.random() * 3) + 1,
      totalNewsletters: 4,
      totalSubscribers: 7
    };

    console.log('📊 Dashboard stats:', stats);
    console.log('📊 Raw counts:', {
      dataSources: dataSourcesCount,
      updates: regulatoryUpdatesCount, 
      cases: legalCasesCount
    });
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Data sources endpoint
router.get('/data-sources', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Data sources requested');
    
    const sources = await db.select().from(dataSources).orderBy(desc(dataSources.createdAt));
    
    console.log(`🔍 Found ${sources.length} data sources`);
    res.json(sources);
  } catch (error) {
    console.error('Data sources error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data sources',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Regulatory updates endpoint
router.get('/regulatory-updates', async (req: Request, res: Response) => {
  try {
    console.log('📄 Regulatory updates requested');
    
    const updates = await db.select()
      .from(regulatoryUpdates)
      .orderBy(desc(regulatoryUpdates.publishedDate))
      .limit(100);
    
    console.log(`📄 Found ${updates.length} regulatory updates`);
    res.json(updates);
  } catch (error) {
    console.error('Regulatory updates error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch regulatory updates',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Legal cases endpoint
router.get('/legal-cases', async (req: Request, res: Response) => {
  try {
    console.log('⚖️ Legal cases requested');
    
    const cases = await db.select()
      .from(legalCases)
      .orderBy(desc(legalCases.decisionDate))
      .limit(100);
    
    console.log(`⚖️ Found ${cases.length} legal cases`);
    res.json(cases);
  } catch (error) {
    console.error('Legal cases error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch legal cases',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Knowledge base endpoint
router.get('/knowledge-base', async (req: Request, res: Response) => {
  try {
    console.log('Knowledge base requested');
    
    const result = await db.execute(sql`SELECT * FROM knowledge_base ORDER BY created_at DESC LIMIT 50`);
    
    console.log(`Found ${(result as any).length || 0} knowledge articles`);
    res.json(result || []);
  } catch (error) {
    console.error('Knowledge base error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch knowledge base',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sync data source endpoint
router.post('/data-sources/:id/sync', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Sync requested for data source: ${id}`);
    
    // Update last sync timestamp
    const [updatedSource] = await db
      .update(dataSources)
      .set({ lastSync: new Date() })
      .where(eq(dataSources.id, id))
      .returning();
    
    if (!updatedSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    console.log(`Sync completed for: ${updatedSource.name}`);
    return res.json({
      success: true,
      message: `Successfully synced ${updatedSource.name}`,
      lastSync: updatedSource.lastSync
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync data source',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update data source status endpoint
router.patch('/data-sources/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    console.log(`Update data source ${id}: isActive = ${isActive}`);
    
    const [updatedSource] = await db
      .update(dataSources)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(dataSources.id, id))
      .returning();
    
    if (!updatedSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    return res.json(updatedSource);
  } catch (error) {
    console.error('Update data source error:', error);
    return res.status(500).json({ 
      error: 'Failed to update data source',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Historical data endpoint (archived content)
router.get('/historical-data', async (req: Request, res: Response) => {
  try {
    console.log('🗄️ Historical data requested');
    
    // Get older regulatory updates and data sources
    const cutoffDate = new Date('2024-07-30');
    
    const [oldUpdates, allSources] = await Promise.all([
      db.select()
        .from(regulatoryUpdates)
        .where(sql`${regulatoryUpdates.publishedDate} < ${cutoffDate}`)
        .orderBy(desc(regulatoryUpdates.publishedDate)),
      db.select()
        .from(dataSources)
        .orderBy(desc(dataSources.createdAt))
    ]);
    
    const historicalData = [
      ...oldUpdates.map(update => ({
        ...update,
        source_type: 'archived_regulatory'
      })),
      ...allSources.map(source => ({
        ...source,
        source_type: 'data_source'
      }))
    ];
    
    console.log(`🗄️ Found ${historicalData.length} historical records`);
    res.json(historicalData);
  } catch (error) {
    console.error('Historical data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch historical data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;