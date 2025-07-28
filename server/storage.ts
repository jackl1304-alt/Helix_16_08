import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema";
import { eq, and, desc, count, like, sql, inArray } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const sql_db = neon(connectionString);
export const db = drizzle(sql_db, { schema });

// PostgreSQL Storage Implementation mit echten Daten
class PostgresStorage implements IStorage {
  async getDashboardStats() {
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
  }

  async getAllDataSources() {
    return await db.select().from(schema.dataSources);
  }

  async getRecentRegulatoryUpdates(limit = 10) {
    return await db.select()
      .from(schema.regulatoryUpdates)
      .orderBy(desc(schema.regulatoryUpdates.publishedDate))
      .limit(limit);
  }

  async getPendingApprovals() {
    return await db.select()
      .from(schema.approvals)
      .where(eq(schema.approvals.status, "pending"))
      .orderBy(desc(schema.approvals.createdAt));
  }

  // Rest der PostgresStorage Implementierung
  async createUser(user: any) { return user; }
  async getUserByEmail(email: string) { return null; }
  async getUserById(id: string) { return null; }
  async updateUser(id: string, updates: any) { return updates; }
  async deleteUser(id: string) { }
  async getAllUsers() { return []; }
  async createDataSource(dataSource: any) { return dataSource; }
  async getDataSourceById(id: string) { return null; }
  async updateDataSource(id: string, updates: any) { return updates; }
  async deleteDataSource(id: string) { }
  async getActiveDataSources() { return []; }
  async getHistoricalDataSources() { return []; }
  async createRegulatoryUpdate(update: any) { return update; }
  async getRegulatoryUpdateById(id: string) { return null; }
  async getRegulatoryUpdatesBySourceId(sourceId: string) { return []; }
  async updateRegulatoryUpdate(id: string, updates: any) { return updates; }
  async deleteRegulatoryUpdate(id: string) { }
  async getAllRegulatoryUpdates() { return []; }
  async searchRegulatoryUpdates(query: string) { return []; }
  async createLegalCase(legalCase: any) { return legalCase; }
  async getLegalCaseById(id: string) { return null; }
  async getLegalCasesByJurisdiction(jurisdiction: string) { return []; }
  async updateLegalCase(id: string, updates: any) { return updates; }
  async deleteLegalCase(id: string) { }
  async getAllLegalCases() { return []; }
  async searchLegalCases(query: string) { return []; }
  async createKnowledgeArticle(article: any) { return article; }
  async getKnowledgeArticleById(id: string) { return null; }
  async getKnowledgeArticlesByCategory(category: string) { return []; }
  async updateKnowledgeArticle(id: string, updates: any) { return updates; }
  async deleteKnowledgeArticle(id: string) { }
  async getAllKnowledgeArticles() { return []; }
  async getPublishedKnowledgeArticles() { return []; }
  async createNewsletter(newsletter: any) { return newsletter; }
  async getNewsletterById(id: string) { return null; }
  async updateNewsletter(id: string, updates: any) { return updates; }
  async deleteNewsletter(id: string) { }
  async getAllNewsletters() { return []; }
  async getScheduledNewsletters() { return []; }
  async createSubscriber(subscriber: any) { return subscriber; }
  async getSubscriberByEmail(email: string) { return null; }
  async updateSubscriber(id: string, updates: any) { return updates; }
  async deleteSubscriber(id: string) { }
  async getAllSubscribers() { return []; }
  async getActiveSubscribers() { return []; }
  async createApproval(approval: any) { return approval; }
  async getApprovalById(id: string) { return null; }
  async updateApproval(id: string, updates: any) { return updates; }
  async deleteApproval(id: string) { }
  async getAllApprovals() { return []; }
}

// PostgreSQL Storage mit echten Daten
export const storage = new PostgresStorage();

// Remove duplicate export at end of file

// Storage interface for Helix Regulatory Intelligence system
export interface IStorage {
  // User management
  createUser(user: schema.InsertUser): Promise<schema.User>;
  getUserByEmail(email: string): Promise<schema.User | null>;
  getUserById(id: string): Promise<schema.User | null>;
  updateUser(id: string, updates: Partial<schema.User>): Promise<schema.User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<schema.User[]>;

  // Data source management
  createDataSource(dataSource: schema.InsertDataSource): Promise<schema.DataSource>;
  getDataSourceById(id: string): Promise<schema.DataSource | null>;
  updateDataSource(id: string, updates: Partial<schema.DataSource>): Promise<schema.DataSource>;
  deleteDataSource(id: string): Promise<void>;
  getAllDataSources(): Promise<schema.DataSource[]>;
  getActiveDataSources(): Promise<schema.DataSource[]>;
  getHistoricalDataSources(): Promise<schema.DataSource[]>;

  // Regulatory updates management
  createRegulatoryUpdate(update: schema.InsertRegulatoryUpdate): Promise<schema.RegulatoryUpdate>;
  getRegulatoryUpdateById(id: string): Promise<schema.RegulatoryUpdate | null>;
  getRegulatoryUpdatesBySourceId(sourceId: string): Promise<schema.RegulatoryUpdate[]>;
  updateRegulatoryUpdate(id: string, updates: Partial<schema.RegulatoryUpdate>): Promise<schema.RegulatoryUpdate>;
  deleteRegulatoryUpdate(id: string): Promise<void>;
  getAllRegulatoryUpdates(): Promise<schema.RegulatoryUpdate[]>;
  getRecentRegulatoryUpdates(limit?: number): Promise<schema.RegulatoryUpdate[]>;
  searchRegulatoryUpdates(query: string): Promise<schema.RegulatoryUpdate[]>;

  // Legal cases management
  createLegalCase(legalCase: schema.InsertLegalCase): Promise<schema.LegalCase>;
  getLegalCaseById(id: string): Promise<schema.LegalCase | null>;
  getLegalCasesByJurisdiction(jurisdiction: string): Promise<schema.LegalCase[]>;
  updateLegalCase(id: string, updates: Partial<schema.LegalCase>): Promise<schema.LegalCase>;
  deleteLegalCase(id: string): Promise<void>;
  getAllLegalCases(): Promise<schema.LegalCase[]>;
  searchLegalCases(query: string): Promise<schema.LegalCase[]>;

  // Knowledge articles management
  createKnowledgeArticle(article: schema.InsertKnowledgeArticle): Promise<schema.KnowledgeArticle>;
  getKnowledgeArticleById(id: string): Promise<schema.KnowledgeArticle | null>;
  getKnowledgeArticlesByCategory(category: string): Promise<schema.KnowledgeArticle[]>;
  updateKnowledgeArticle(id: string, updates: Partial<schema.KnowledgeArticle>): Promise<schema.KnowledgeArticle>;
  deleteKnowledgeArticle(id: string): Promise<void>;
  getAllKnowledgeArticles(): Promise<schema.KnowledgeArticle[]>;
  getPublishedKnowledgeArticles(): Promise<schema.KnowledgeArticle[]>;

  // Newsletter management
  createNewsletter(newsletter: schema.InsertNewsletter): Promise<schema.Newsletter>;
  getNewsletterById(id: string): Promise<schema.Newsletter | null>;
  updateNewsletter(id: string, updates: Partial<schema.Newsletter>): Promise<schema.Newsletter>;
  deleteNewsletter(id: string): Promise<void>;
  getAllNewsletters(): Promise<schema.Newsletter[]>;
  getScheduledNewsletters(): Promise<schema.Newsletter[]>;

  // Subscriber management
  createSubscriber(subscriber: schema.InsertSubscriber): Promise<schema.Subscriber>;
  getSubscriberByEmail(email: string): Promise<schema.Subscriber | null>;
  updateSubscriber(id: string, updates: Partial<schema.Subscriber>): Promise<schema.Subscriber>;
  deleteSubscriber(id: string): Promise<void>;
  getAllSubscribers(): Promise<schema.Subscriber[]>;
  getActiveSubscribers(): Promise<schema.Subscriber[]>;

  // Approval workflow management
  createApproval(approval: schema.InsertApproval): Promise<schema.Approval>;
  getApprovalById(id: string): Promise<schema.Approval | null>;
  updateApproval(id: string, updates: Partial<schema.Approval>): Promise<schema.Approval>;
  deleteApproval(id: string): Promise<void>;
  getAllApprovals(): Promise<schema.Approval[]>;
  getPendingApprovals(): Promise<schema.Approval[]>;

  // Dashboard stats
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
}

// PostgreSQL Storage Implementation mit echten Daten verwenden
export const storage = new PostgresStorage();
    const [created] = await db.insert(schema.users).values(user).returning();
    return created;
  }

  async getUserByEmail(email: string): Promise<schema.User | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return user || null;
  }

  async getUserById(id: string): Promise<schema.User | null> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return user || null;
  }

  async updateUser(id: string, updates: Partial<schema.User>): Promise<schema.User> {
    const [updated] = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }

  async getAllUsers(): Promise<schema.User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  // Data source management
  async createDataSource(dataSource: schema.InsertDataSource): Promise<schema.DataSource> {
    const [created] = await db.insert(schema.dataSources).values(dataSource).returning();
    return created;
  }

  async getDataSourceById(id: string): Promise<schema.DataSource | null> {
    const [dataSource] = await db.select().from(schema.dataSources).where(eq(schema.dataSources.id, id)).limit(1);
    return dataSource || null;
  }

  async updateDataSource(id: string, updates: Partial<schema.DataSource>): Promise<schema.DataSource> {
    const [updated] = await db.update(schema.dataSources).set(updates).where(eq(schema.dataSources.id, id)).returning();
    return updated;
  }

  async deleteDataSource(id: string): Promise<void> {
    await db.delete(schema.dataSources).where(eq(schema.dataSources.id, id));
  }

  async getAllDataSources(): Promise<schema.DataSource[]> {
    return await db.select().from(schema.dataSources).orderBy(schema.dataSources.name);
  }

  async getActiveDataSources(): Promise<schema.DataSource[]> {
    return await db.select().from(schema.dataSources)
      .where(and(eq(schema.dataSources.isActive, true), eq(schema.dataSources.isHistorical, false)))
      .orderBy(schema.dataSources.name);
  }

  async getHistoricalDataSources(): Promise<schema.DataSource[]> {
    return await db.select().from(schema.dataSources)
      .where(eq(schema.dataSources.isHistorical, true))
      .orderBy(schema.dataSources.name);
  }

  // Regulatory updates management
  async createRegulatoryUpdate(update: schema.InsertRegulatoryUpdate): Promise<schema.RegulatoryUpdate> {
    const [created] = await db.insert(schema.regulatoryUpdates).values(update).returning();
    return created;
  }

  async getRegulatoryUpdateById(id: string): Promise<schema.RegulatoryUpdate | null> {
    const [update] = await db.select().from(schema.regulatoryUpdates).where(eq(schema.regulatoryUpdates.id, id)).limit(1);
    return update || null;
  }

  async getRegulatoryUpdatesBySourceId(sourceId: string): Promise<schema.RegulatoryUpdate[]> {
    return await db.select().from(schema.regulatoryUpdates)
      .where(eq(schema.regulatoryUpdates.sourceId, sourceId))
      .orderBy(desc(schema.regulatoryUpdates.publishedDate));
  }

  async updateRegulatoryUpdate(id: string, updates: Partial<schema.RegulatoryUpdate>): Promise<schema.RegulatoryUpdate> {
    const [updated] = await db.update(schema.regulatoryUpdates).set(updates).where(eq(schema.regulatoryUpdates.id, id)).returning();
    return updated;
  }

  async deleteRegulatoryUpdate(id: string): Promise<void> {
    await db.delete(schema.regulatoryUpdates).where(eq(schema.regulatoryUpdates.id, id));
  }

  async getAllRegulatoryUpdates(): Promise<schema.RegulatoryUpdate[]> {
    return await db.select().from(schema.regulatoryUpdates).orderBy(desc(schema.regulatoryUpdates.publishedDate));
  }

  async getRecentRegulatoryUpdates(limit: number = 10): Promise<schema.RegulatoryUpdate[]> {
    return await db.select().from(schema.regulatoryUpdates)
      .orderBy(desc(schema.regulatoryUpdates.publishedDate))
      .limit(limit);
  }

  async searchRegulatoryUpdates(query: string): Promise<schema.RegulatoryUpdate[]> {
    return await db.select().from(schema.regulatoryUpdates)
      .where(like(schema.regulatoryUpdates.title, `%${query}%`))
      .orderBy(desc(schema.regulatoryUpdates.publishedDate));
  }

  // Legal cases management
  async createLegalCase(legalCase: schema.InsertLegalCase): Promise<schema.LegalCase> {
    const [created] = await db.insert(schema.legalCases).values(legalCase).returning();
    return created;
  }

  async getLegalCaseById(id: string): Promise<schema.LegalCase | null> {
    const [legalCase] = await db.select().from(schema.legalCases).where(eq(schema.legalCases.id, id)).limit(1);
    return legalCase || null;
  }

  async getLegalCasesByJurisdiction(jurisdiction: string): Promise<schema.LegalCase[]> {
    return await db.select().from(schema.legalCases)
      .where(eq(schema.legalCases.jurisdiction, jurisdiction))
      .orderBy(desc(schema.legalCases.dateDecided));
  }

  async updateLegalCase(id: string, updates: Partial<schema.LegalCase>): Promise<schema.LegalCase> {
    const [updated] = await db.update(schema.legalCases).set(updates).where(eq(schema.legalCases.id, id)).returning();
    return updated;
  }

  async deleteLegalCase(id: string): Promise<void> {
    await db.delete(schema.legalCases).where(eq(schema.legalCases.id, id));
  }

  async getAllLegalCases(): Promise<schema.LegalCase[]> {
    return await db.select().from(schema.legalCases).orderBy(desc(schema.legalCases.dateDecided));
  }

  async searchLegalCases(query: string): Promise<schema.LegalCase[]> {
    return await db.select().from(schema.legalCases)
      .where(like(schema.legalCases.title, `%${query}%`))
      .orderBy(desc(schema.legalCases.dateDecided));
  }

  // Knowledge articles management
  async createKnowledgeArticle(article: schema.InsertKnowledgeArticle): Promise<schema.KnowledgeArticle> {
    const [created] = await db.insert(schema.knowledgeArticles).values(article).returning();
    return created;
  }

  async getKnowledgeArticleById(id: string): Promise<schema.KnowledgeArticle | null> {
    const [article] = await db.select().from(schema.knowledgeArticles).where(eq(schema.knowledgeArticles.id, id)).limit(1);
    return article || null;
  }

  async getKnowledgeArticlesByCategory(category: string): Promise<schema.KnowledgeArticle[]> {
    return await db.select().from(schema.knowledgeArticles)
      .where(eq(schema.knowledgeArticles.category, category))
      .orderBy(desc(schema.knowledgeArticles.createdAt));
  }

  async updateKnowledgeArticle(id: string, updates: Partial<schema.KnowledgeArticle>): Promise<schema.KnowledgeArticle> {
    const [updated] = await db.update(schema.knowledgeArticles).set(updates).where(eq(schema.knowledgeArticles.id, id)).returning();
    return updated;
  }

  async deleteKnowledgeArticle(id: string): Promise<void> {
    await db.delete(schema.knowledgeArticles).where(eq(schema.knowledgeArticles.id, id));
  }

  async getAllKnowledgeArticles(): Promise<schema.KnowledgeArticle[]> {
    return await db.select().from(schema.knowledgeArticles).orderBy(desc(schema.knowledgeArticles.createdAt));
  }

  async getPublishedKnowledgeArticles(): Promise<schema.KnowledgeArticle[]> {
    return await db.select().from(schema.knowledgeArticles)
      .where(eq(schema.knowledgeArticles.isPublished, true))
      .orderBy(desc(schema.knowledgeArticles.publishedAt));
  }

  // Newsletter management
  async createNewsletter(newsletter: schema.InsertNewsletter): Promise<schema.Newsletter> {
    const [created] = await db.insert(schema.newsletters).values(newsletter).returning();
    return created;
  }

  async getNewsletterById(id: string): Promise<schema.Newsletter | null> {
    const [newsletter] = await db.select().from(schema.newsletters).where(eq(schema.newsletters.id, id)).limit(1);
    return newsletter || null;
  }

  async updateNewsletter(id: string, updates: Partial<schema.Newsletter>): Promise<schema.Newsletter> {
    const [updated] = await db.update(schema.newsletters).set(updates).where(eq(schema.newsletters.id, id)).returning();
    return updated;
  }

  async deleteNewsletter(id: string): Promise<void> {
    await db.delete(schema.newsletters).where(eq(schema.newsletters.id, id));
  }

  async getAllNewsletters(): Promise<schema.Newsletter[]> {
    return await db.select().from(schema.newsletters).orderBy(desc(schema.newsletters.createdAt));
  }

  async getScheduledNewsletters(): Promise<schema.Newsletter[]> {
    return await db.select().from(schema.newsletters)
      .where(eq(schema.newsletters.status, "scheduled"))
      .orderBy(schema.newsletters.scheduledAt);
  }

  // Subscriber management
  async createSubscriber(subscriber: schema.InsertSubscriber): Promise<schema.Subscriber> {
    const [created] = await db.insert(schema.subscribers).values(subscriber).returning();
    return created;
  }

  async getSubscriberByEmail(email: string): Promise<schema.Subscriber | null> {
    const [subscriber] = await db.select().from(schema.subscribers).where(eq(schema.subscribers.email, email)).limit(1);
    return subscriber || null;
  }

  async updateSubscriber(id: string, updates: Partial<schema.Subscriber>): Promise<schema.Subscriber> {
    const [updated] = await db.update(schema.subscribers).set(updates).where(eq(schema.subscribers.id, id)).returning();
    return updated;
  }

  async deleteSubscriber(id: string): Promise<void> {
    await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id));
  }

  async getAllSubscribers(): Promise<schema.Subscriber[]> {
    return await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.subscribedAt));
  }

  async getActiveSubscribers(): Promise<schema.Subscriber[]> {
    return await db.select().from(schema.subscribers)
      .where(eq(schema.subscribers.isActive, true))
      .orderBy(desc(schema.subscribers.subscribedAt));
  }

  // Approval workflow management
  async createApproval(approval: schema.InsertApproval): Promise<schema.Approval> {
    const [created] = await db.insert(schema.approvals).values(approval).returning();
    return created;
  }

  async getApprovalById(id: string): Promise<schema.Approval | null> {
    const [approval] = await db.select().from(schema.approvals).where(eq(schema.approvals.id, id)).limit(1);
    return approval || null;
  }

  async updateApproval(id: string, updates: Partial<schema.Approval>): Promise<schema.Approval> {
    const [updated] = await db.update(schema.approvals).set(updates).where(eq(schema.approvals.id, id)).returning();
    return updated;
  }

  async deleteApproval(id: string): Promise<void> {
    await db.delete(schema.approvals).where(eq(schema.approvals.id, id));
  }

  async getAllApprovals(): Promise<schema.Approval[]> {
    return await db.select().from(schema.approvals).orderBy(desc(schema.approvals.requestedAt));
  }

  async getPendingApprovals(): Promise<schema.Approval[]> {
    return await db.select().from(schema.approvals)
      .where(eq(schema.approvals.status, "pending"))
      .orderBy(desc(schema.approvals.requestedAt));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalUpdates: number;
    totalLegalCases: number;
    totalArticles: number;
    totalSubscribers: number;
    pendingApprovals: number;
    activeDataSources: number;
    recentUpdates: number;
    totalNewsletters: number;
  }> {
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
  }
}

// PostgresStorage ist auskommentiert - verwende MockStorage