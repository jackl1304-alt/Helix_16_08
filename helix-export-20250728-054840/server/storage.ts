import {
  users,
  dataSources,
  regulatoryUpdates,
  approvals,
  newsletters,
  subscribers,
  knowledgeBase,
  type User,
  type InsertUser,
  type DataSource,
  type InsertDataSource,
  type RegulatoryUpdate,
  type InsertRegulatoryUpdate,
  type Approval,
  type InsertApproval,
  type Newsletter,
  type InsertNewsletter,
  type Subscriber,
  type InsertSubscriber,
  type KnowledgeBase,
  type InsertKnowledgeBase,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Data source operations
  getDataSources(): Promise<DataSource[]>;
  getDataSourceById(id: string): Promise<DataSource | undefined>;
  getDataSourceByType(type: string): Promise<DataSource | undefined>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  updateDataSourceLastSync(id: string, lastSyncAt: Date): Promise<void>;
  updateDataSource(id: string, updateData: Partial<InsertDataSource>): Promise<DataSource>;

  // Regulatory updates operations
  getRegulatoryUpdates(params: {
    region?: string;
    priority?: string;
    limit: number;
    offset: number;
  }): Promise<RegulatoryUpdate[]>;
  getRegulatoryUpdateById(id: string): Promise<RegulatoryUpdate | undefined>;
  createRegulatoryUpdate(update: InsertRegulatoryUpdate): Promise<RegulatoryUpdate>;

  // Approval operations
  getApprovals(params: {
    status?: string;
    itemType?: string;
  }): Promise<Approval[]>;
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(id: string, approval: Partial<InsertApproval>): Promise<Approval>;

  // Newsletter operations
  getNewsletters(): Promise<Newsletter[]>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  sendNewsletter(id: string): Promise<void>;

  // Subscriber operations
  getSubscribers(): Promise<Subscriber[]>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;

  // Knowledge base operations
  getKnowledgeBase(params: { category?: string }): Promise<KnowledgeBase[]>;
  createKnowledgeEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase>;

  // Dashboard and search operations
  getDashboardStats(): Promise<{
    activeSources: number;
    todayUpdates: number;
    pendingApprovals: number;
    subscribers: number;
    lastSync: string;
    sourceGrowth: number;
    subscriberGrowth: number;
    urgentApprovals: number;
  }>;
  search(query: string): Promise<any[]>;
  
  // Initialize data sources
  initializeDataSources(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getDataSources(): Promise<DataSource[]> {
    return await db.select().from(dataSources).orderBy(desc(dataSources.createdAt));
  }

  async getDataSourceById(id: string): Promise<DataSource | undefined> {
    const [source] = await db.select().from(dataSources).where(eq(dataSources.id, id));
    return source;
  }

  async getDataSourceByType(type: string): Promise<DataSource | undefined> {
    const [source] = await db.select().from(dataSources).where(eq(dataSources.type, type));
    return source;
  }

  async createDataSource(dataSourceData: InsertDataSource): Promise<DataSource> {
    const [dataSource] = await db
      .insert(dataSources)
      .values(dataSourceData)
      .returning();
    return dataSource;
  }

  async updateDataSourceLastSync(id: string, lastSyncAt: Date): Promise<void> {
    await db
      .update(dataSources)
      .set({ lastSyncAt })
      .where(eq(dataSources.id, id));
  }

  async updateDataSource(id: string, updateData: Partial<InsertDataSource>): Promise<DataSource> {
    const [dataSource] = await db
      .update(dataSources)
      .set(updateData)
      .where(eq(dataSources.id, id))
      .returning();
    return dataSource;
  }

  async getRegulatoryUpdates(params: {
    region?: string;
    priority?: string;
    limit: number;
    offset: number;
  }): Promise<RegulatoryUpdate[]> {
    let query = db.select().from(regulatoryUpdates);

    const conditions = [];
    if (params.region) {
      conditions.push(eq(regulatoryUpdates.region, params.region));
    }
    if (params.priority) {
      conditions.push(eq(regulatoryUpdates.priority, params.priority as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query
      .orderBy(desc(regulatoryUpdates.publishedAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async getRegulatoryUpdateById(id: string): Promise<RegulatoryUpdate | undefined> {
    const [update] = await db
      .select()
      .from(regulatoryUpdates)
      .where(eq(regulatoryUpdates.id, id));
    return update;
  }

  async createRegulatoryUpdate(updateData: InsertRegulatoryUpdate): Promise<RegulatoryUpdate> {
    const [update] = await db
      .insert(regulatoryUpdates)
      .values(updateData)
      .returning();
    return update;
  }

  async getApprovals(params: {
    status?: string;
    itemType?: string;
  }): Promise<Approval[]> {
    let query = db.select().from(approvals);

    const conditions = [];
    if (params.status) {
      conditions.push(eq(approvals.status, params.status as any));
    }
    if (params.itemType) {
      conditions.push(eq(approvals.itemType, params.itemType));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(approvals.createdAt));
  }

  async createApproval(approvalData: InsertApproval): Promise<Approval> {
    const [approval] = await db
      .insert(approvals)
      .values(approvalData)
      .returning();
    return approval;
  }

  async updateApproval(id: string, approvalData: Partial<InsertApproval>): Promise<Approval> {
    const [approval] = await db
      .update(approvals)
      .set({ ...approvalData, reviewedAt: new Date() })
      .where(eq(approvals.id, id))
      .returning();
    return approval;
  }

  async getNewsletters(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  async createNewsletter(newsletterData: InsertNewsletter): Promise<Newsletter> {
    const [newsletter] = await db
      .insert(newsletters)
      .values(newsletterData)
      .returning();
    return newsletter;
  }

  async sendNewsletter(id: string): Promise<void> {
    await db
      .update(newsletters)
      .set({ 
        status: 'approved' as any,
        sentAt: new Date()
      })
      .where(eq(newsletters.id, id));
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).where(eq(subscribers.isActive, true));
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db
      .insert(subscribers)
      .values(subscriberData)
      .returning();
    return subscriber;
  }

  async getKnowledgeBase(params: { category?: string }): Promise<KnowledgeBase[]> {
    let query = db.select().from(knowledgeBase);

    if (params.category) {
      query = query.where(eq(knowledgeBase.category, params.category)) as any;
    }

    return await query.orderBy(desc(knowledgeBase.updatedAt));
  }

  async createKnowledgeEntry(entryData: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [entry] = await db
      .insert(knowledgeBase)
      .values(entryData)
      .returning();
    return entry;
  }

  async getDashboardStats(): Promise<{
    activeSources: number;
    todayUpdates: number;
    pendingApprovals: number;
    subscribers: number;
    lastSync: string;
    sourceGrowth: number;
    subscriberGrowth: number;
    urgentApprovals: number;
  }> {
    // Get active data sources count
    const [activeSourcesResult] = await db
      .select({ count: count() })
      .from(dataSources)
      .where(eq(dataSources.isActive, true));

    // Get today's updates count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayUpdatesResult] = await db
      .select({ count: count() })
      .from(regulatoryUpdates)
      .where(sql`DATE(${regulatoryUpdates.createdAt}) = DATE(${today})`);

    // Get pending approvals count
    const [pendingApprovalsResult] = await db
      .select({ count: count() })
      .from(approvals)
      .where(eq(approvals.status, 'pending'));

    // Get urgent pending approvals count
    const [urgentApprovalsResult] = await db
      .select({ count: count() })
      .from(approvals)
      .where(and(
        eq(approvals.status, 'pending'),
        sql`${approvals.createdAt} < NOW() - INTERVAL '24 hours'`
      ));

    // Get subscribers count
    const [subscribersResult] = await db
      .select({ count: count() })
      .from(subscribers)
      .where(eq(subscribers.isActive, true));

    // Get last sync time
    const [lastSyncResult] = await db
      .select({ lastSync: dataSources.lastSyncAt })
      .from(dataSources)
      .where(eq(dataSources.isActive, true))
      .orderBy(desc(dataSources.lastSyncAt))
      .limit(1);

    const lastSyncTime = lastSyncResult?.lastSync;
    let lastSyncText = "Never";
    if (lastSyncTime) {
      const diffInMinutes = Math.floor((Date.now() - new Date(lastSyncTime).getTime()) / (1000 * 60));
      if (diffInMinutes < 1) lastSyncText = "Just now";
      else if (diffInMinutes < 60) lastSyncText = `${diffInMinutes} min ago`;
      else if (diffInMinutes < 1440) lastSyncText = `${Math.floor(diffInMinutes / 60)} hours ago`;
      else lastSyncText = `${Math.floor(diffInMinutes / 1440)} days ago`;
    }

    return {
      activeSources: activeSourcesResult.count,
      todayUpdates: todayUpdatesResult.count,
      pendingApprovals: pendingApprovalsResult.count,
      subscribers: subscribersResult.count,
      lastSync: lastSyncText,
      sourceGrowth: 2, // Mock for now, would calculate from historical data
      subscriberGrowth: 15, // Mock for now, would calculate from historical data
      urgentApprovals: urgentApprovalsResult.count,
    };
  }

  async search(query: string): Promise<any[]> {
    const searchTerm = `%${query}%`;
    
    // Search in regulatory updates
    const updates = await db
      .select()
      .from(regulatoryUpdates)
      .where(or(
        ilike(regulatoryUpdates.title, searchTerm),
        ilike(regulatoryUpdates.description, searchTerm)
      ))
      .limit(10);

    // Search in knowledge base
    const knowledge = await db
      .select()
      .from(knowledgeBase)
      .where(or(
        ilike(knowledgeBase.title, searchTerm),
        ilike(knowledgeBase.content, searchTerm)
      ))
      .limit(10);

    return [
      ...updates.map(u => ({ ...u, type: 'regulatory_update' })),
      ...knowledge.map(k => ({ ...k, type: 'knowledge' }))
    ];
  }

  async initializeDataSources(): Promise<void> {
    try {
      // Check if sources already exist
      const existingSources = await db.select().from(dataSources);
      if (existingSources.length > 0) {
        return; // Sources already initialized
      }

      // Initialize default data sources with category field
      const defaultSources = [
        {
          id: "fda_510k",
          name: "FDA 510(k) Database",
          type: "regulatory" as const,
          category: "current", // Aktuell (2025+)
          endpoint: "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm",
          region: "USA",
          isActive: true,
          lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          language: "en",
          syncFrequency: "daily"
        },
        {
          id: "ema_epar", 
          name: "EMA EPAR Database",
          type: "regulatory" as const,
          category: "current", // Aktuell (2025+)
          endpoint: "https://www.ema.europa.eu/en/medicines/download-medicine-data",
          region: "Europe",
          isActive: true,
          lastSyncAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          language: "en",
          syncFrequency: "daily"
        },
        {
          id: "bfarm_guidelines",
          name: "BfArM Leitfäden", 
          type: "guidelines" as const,
          category: "current", // Aktuell (2025+)
          endpoint: "https://www.bfarm.de/DE/Medizinprodukte/_node.html",
          region: "Deutschland",
          isActive: true,
          lastSyncAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          language: "de",
          syncFrequency: "weekly"
        },
        {
          id: "swissmedic_guidelines",
          name: "Swissmedic Guidelines",
          type: "guidelines" as const,
          category: "current", // Aktuell (2025+)
          endpoint: "https://www.swissmedic.ch/swissmedic/en/home/medical-devices.html",
          region: "Schweiz",
          isActive: true,
          lastSyncAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          language: "de",
          syncFrequency: "weekly"
        },
        {
          id: "fda_historical",
          name: "FDA Historical Archive",
          type: "regulatory" as const,
          category: "historical", // Historisch (bis 31.12.2024)
          endpoint: "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm",
          region: "USA",
          isActive: false,
          lastSyncAt: new Date("2024-12-31T23:59:59Z"), // Letzter Sync 31.12.2024
          language: "en",
          syncFrequency: "archived"
        },
        {
          id: "ema_historical",
          name: "EMA Historical Archive",
          type: "regulatory" as const,
          category: "historical", // Historisch (bis 31.12.2024)
          endpoint: "https://www.ema.europa.eu/en/medicines/download-medicine-data",
          region: "Europe",
          isActive: false,
          lastSyncAt: new Date("2024-12-31T23:59:59Z"), // Letzter Sync 31.12.2024
          language: "en",
          syncFrequency: "archived"
        }
      ];

      // Insert all sources
      await db.insert(dataSources).values(defaultSources);
      console.log("Initialized default data sources");
    } catch (error) {
      console.error("Error initializing data sources:", error);
    }
  }
}

export const storage = new DatabaseStorage();
