import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema";
import { eq, and, desc, count, like, sql, inArray } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const sql_db = neon(connectionString);
export const db = drizzle(sql_db, { schema });

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
      return await db.select().from(schema.dataSources);
    } catch (error) {
      console.error("Data sources error:", error);
      return [];
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
}

// PostgreSQL Storage mit echten Daten
export const storage = new PostgresStorage();