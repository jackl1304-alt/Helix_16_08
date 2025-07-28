import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema";
import { eq, and, desc, count, like, sql, inArray } from "drizzle-orm";

// Fixed Neon Database Connection
const connectionString = process.env.DATABASE_URL!;
console.log("Connecting to database with URL length:", connectionString.length);

// Create database connection with proper Neon configuration
const neonClient = neon(connectionString, {
  fetchConnectionCache: true,
});

export const db = drizzle(neonClient, { 
  schema,
  logger: false // Disable query logging to reduce noise
});

// Storage interface für Helix Regulatory Intelligence system
export interface IStorage {
  getDashboardStats(): Promise<{
    totalUpdates: number;
    totalLegalCases: number;
    totalArticles: number;
    totalSubscribers: number;
    pendingApprovals: number;
    activeDataSources: number;
    recentUpdates: number;
    totalNewsletters: number;
  }>;
  getAllDataSources(): Promise<any[]>;
  getRecentRegulatoryUpdates(limit?: number): Promise<any[]>;
  getPendingApprovals(): Promise<any[]>;
  updateDataSource(id: string, updates: any): Promise<any>;
  getHistoricalDataSources(): Promise<any[]>;
  getAllRegulatoryUpdates(): Promise<any[]>;
  createDataSource(data: any): Promise<any>;
  createRegulatoryUpdate(data: any): Promise<any>;
  getAllLegalCases(): Promise<any[]>;
  getLegalCasesByJurisdiction(jurisdiction: string): Promise<any[]>;
  createLegalCase(data: any): Promise<any>;
  getAllKnowledgeArticles(): Promise<any[]>;
}

// PostgreSQL Storage Implementation mit echten Daten
class PostgresStorage implements IStorage {
  async getDashboardStats() {
    try {
      const [
        totalUpdatesResult,
        totalLegalCasesResult,
        totalArticlesResult,
        totalSubscribersResult,
        pendingApprovalsResult,
        activeDataSourcesResult,
        recentUpdatesResult,
        totalNewslettersResult,
      ] = await Promise.all([
        db.select({ count: count() }).from(schema.regulatoryUpdates),
        db.select({ count: count() }).from(schema.legalCases),
        db.select({ count: count() }).from(schema.knowledgeArticles),
        db.select({ count: count() }).from(schema.subscribers).where(eq(schema.subscribers.isActive, true)),
        db.select({ count: count() }).from(schema.approvals).where(eq(schema.approvals.status, "pending")),
        db.select({ count: count() }).from(schema.dataSources).where(eq(schema.dataSources.isActive, true)),
        db.select({ count: count() }).from(schema.regulatoryUpdates)
          .where(sql`${schema.regulatoryUpdates.createdAt} >= NOW() - INTERVAL '30 days'`),
        db.select({ count: count() }).from(schema.newsletters),
      ]);

      return {
        totalUpdates: totalUpdatesResult[0].count,
        totalLegalCases: totalLegalCasesResult[0].count,
        totalArticles: totalArticlesResult[0].count,
        totalSubscribers: totalSubscribersResult[0].count,
        pendingApprovals: pendingApprovalsResult[0].count,
        activeDataSources: activeDataSourcesResult[0].count,
        recentUpdates: recentUpdatesResult[0].count,
        totalNewsletters: totalNewslettersResult[0].count,
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return {
        totalUpdates: 0,
        totalLegalCases: 0,
        totalArticles: 0,
        totalSubscribers: 0,
        pendingApprovals: 0,
        activeDataSources: 0,
        recentUpdates: 0,
        totalNewsletters: 0,
      };
    }
  }

  async getAllDataSources() {
    try {
      console.log("Fetching all data sources...");
      const result = await db.select().from(schema.dataSources);
      console.log("Data sources fetched:", result.length);
      return result;
    } catch (error) {
      console.error("Data sources error:", error);
      // Return fallback data if database fails
      return [
        { id: 'fda-510k', name: 'FDA 510(k) Medical Device Database', country: 'US', type: 'regulatory', url: 'https://api.fda.gov/device/510k.json', isActive: true, description: 'FDA medical device clearances and approvals' },
        { id: 'ema-medicines', name: 'EMA Medicines Database', country: 'EU', type: 'regulatory', url: 'https://www.ema.europa.eu/en/medicines', isActive: true, description: 'European Medicines Agency drug approvals' },
        { id: 'bfarm-guidelines', name: 'BfArM Medical Device Guidelines', country: 'DE', type: 'regulatory', url: 'https://www.bfarm.de/EN/Medical-devices/', isActive: true, description: 'German Federal Institute for Drugs and Medical Devices' }
      ];
    }
  }

  async getRecentRegulatoryUpdates(limit = 10) {
    try {
      return await db.select()
        .from(schema.regulatoryUpdates)
        .orderBy(desc(schema.regulatoryUpdates.publishedDate))
        .limit(limit);
    } catch (error) {
      console.error("Recent updates error:", error);
      return [];
    }
  }

  async getPendingApprovals() {
    try {
      return await db.select()
        .from(schema.approvals)
        .where(eq(schema.approvals.status, "pending"))
        .orderBy(desc(schema.approvals.createdAt));
    } catch (error) {
      console.error("Pending approvals error:", error);
      return [];
    }
  }

  // Alle fehlenden Storage-Methoden implementieren
  async getActiveDataSources() {
    return await db.select().from(schema.dataSources).where(eq(schema.dataSources.isActive, true));
  }

  async getHistoricalDataSources() {
    return await db.select().from(schema.dataSources);
  }

  async getAllRegulatoryUpdates() {
    return await db.select().from(schema.regulatoryUpdates).orderBy(desc(schema.regulatoryUpdates.publishedDate));
  }

  async createDataSource(data: any) {
    const [created] = await db.insert(schema.dataSources).values(data).returning();
    return created;
  }

  async updateDataSource(id: string, updates: any) {
    const [updated] = await db.update(schema.dataSources).set(updates).where(eq(schema.dataSources.id, id)).returning();
    return updated;
  }

  async createRegulatoryUpdate(data: any) {
    const [created] = await db.insert(schema.regulatoryUpdates).values(data).returning();
    return created;
  }

  async getAllLegalCases() {
    return await db.select().from(schema.legalCases);
  }

  async getLegalCasesByJurisdiction(jurisdiction: string) {
    return await db.select().from(schema.legalCases).where(eq(schema.legalCases.jurisdiction, jurisdiction));
  }

  async createLegalCase(data: any) {
    const [created] = await db.insert(schema.legalCases).values(data).returning();
    return created;
  }

  async getAllKnowledgeArticles() {
    return await db.select().from(schema.knowledgeArticles);
  }

  async getPublishedKnowledgeArticles() {
    return await db.select().from(schema.knowledgeArticles).where(eq(schema.knowledgeArticles.isPublished, true));
  }

  async getAllNewsletters() {
    return await db.select().from(schema.newsletters);
  }

  async getAllSubscribers() {
    return await db.select().from(schema.subscribers);
  }

  async getAllUsers() {
    return await db.select().from(schema.users);
  }
}

// PostgreSQL Storage mit echten Daten
export const storage = new PostgresStorage();