import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  pgEnum,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for Helix Regulatory Intelligence system
export const statusEnum = pgEnum("status", ["active", "inactive", "pending", "archived"]);
export const updateTypeEnum = pgEnum("update_type", ["regulation", "guidance", "standard", "approval", "alert"]);

// Users table for authentication and management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name"),
  role: varchar("role").default("user"),
  passwordHash: varchar("password_hash"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_email").on(table.email),
]);

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
}, (table) => [
  index("idx_sessions_expire").on(table.expire),
]);

// Data sources table (FDA, EMA, BfArM, etc.)
export const dataSources = pgTable("data_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  url: varchar("url"),
  apiEndpoint: varchar("api_endpoint"),
  country: varchar("country"),
  region: varchar("region"),
  type: varchar("type").notNull(), // "regulatory", "standards", "legal"
  category: varchar("category"),
  language: varchar("language").default("en"),
  isActive: boolean("is_active").default(true),
  isHistorical: boolean("is_historical").default(false),
  lastSync: timestamp("last_sync"),
  syncFrequency: varchar("sync_frequency").default("daily"),
  authRequired: boolean("auth_required").default(false),
  apiKey: varchar("api_key"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_data_sources_country").on(table.country),
  index("idx_data_sources_type").on(table.type),
  index("idx_data_sources_active").on(table.isActive),
]);

// Regulatory updates table
export const regulatoryUpdates = pgTable("regulatory_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").references(() => dataSources.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  type: updateTypeEnum("type").default("regulation"),
  category: varchar("category"),
  deviceType: varchar("device_type"),
  riskLevel: varchar("risk_level"),
  therapeuticArea: varchar("therapeutic_area"),
  documentUrl: varchar("document_url"),
  documentId: varchar("document_id"),
  publishedDate: timestamp("published_date"),
  effectiveDate: timestamp("effective_date"),
  jurisdiction: varchar("jurisdiction"),
  language: varchar("language").default("en"),
  tags: text("tags").array(),
  priority: integer("priority").default(1),
  isProcessed: boolean("is_processed").default(false),
  processingNotes: text("processing_notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_regulatory_updates_source").on(table.sourceId),
  index("idx_regulatory_updates_type").on(table.type),
  index("idx_regulatory_updates_published").on(table.publishedDate),
  index("idx_regulatory_updates_priority").on(table.priority),
]);

// Legal cases table - FIXED: Match actual database structure
export const legalCases = pgTable("legal_cases", {
  id: text("id").primaryKey(),
  caseNumber: text("case_number"),
  title: text("title").notNull(),
  court: text("court").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  decisionDate: timestamp("decision_date", { mode: "date" }),
  summary: text("summary"),
  content: text("content"),
  verdict: text("verdict"), // Urteilsspruch - Full court ruling/judgment text
  damages: text("damages"), // Schadensersatz - Compensation/damages awarded
  documentUrl: text("document_url"),
  impactLevel: text("impact_level"),
  keywords: text("keywords").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_legal_cases_jurisdiction").on(table.jurisdiction),
  index("idx_legal_cases_court").on(table.court),
  index("idx_legal_cases_decision").on(table.decisionDate),
]);

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  category: varchar("category"),
  tags: text("tags").array(),
  author: varchar("author"),
  status: statusEnum("status").default("active"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  lastReviewed: timestamp("last_reviewed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_knowledge_articles_category").on(table.category),
  index("idx_knowledge_articles_status").on(table.status),
  index("idx_knowledge_articles_published").on(table.publishedAt),
]);

// Newsletter system
export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  htmlContent: text("html_content"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  status: varchar("status").default("draft"), // draft, scheduled, sent, failed
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_newsletters_status").on(table.status),
  index("idx_newsletters_scheduled").on(table.scheduledAt),
]);

// Newsletter subscribers
export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name"),
  organization: varchar("organization"),
  interests: text("interests").array(),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  metadata: jsonb("metadata"),
}, (table) => [
  index("idx_subscribers_email").on(table.email),
  index("idx_subscribers_active").on(table.isActive),
]);

// Approval workflow
export const approvals = pgTable("approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemType: varchar("item_type").notNull(), // "newsletter", "article", "update"
  itemId: varchar("item_id").notNull(),
  status: varchar("status").default("pending"), // pending, approved, rejected
  requestedBy: varchar("requested_by").references(() => users.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  requestedAt: timestamp("requested_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  comments: text("comments"),
  metadata: jsonb("metadata"),
}, (table) => [
  index("idx_approvals_status").on(table.status),
  index("idx_approvals_type").on(table.itemType),
  index("idx_approvals_requested").on(table.requestedAt),
]);

// Relations
export const dataSourcesRelations = relations(dataSources, ({ many }) => ({
  regulatoryUpdates: many(regulatoryUpdates),
}));

export const regulatoryUpdatesRelations = relations(regulatoryUpdates, ({ one }) => ({
  dataSource: one(dataSources, {
    fields: [regulatoryUpdates.sourceId],
    references: [dataSources.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  approvalsRequested: many(approvals, { relationName: "requestedApprovals" }),
  approvalsReviewed: many(approvals, { relationName: "reviewedApprovals" }),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  requestedBy: one(users, {
    fields: [approvals.requestedBy],
    references: [users.id],
    relationName: "requestedApprovals",
  }),
  reviewedBy: one(users, {
    fields: [approvals.reviewedBy],
    references: [users.id],
    relationName: "reviewedApprovals",
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Multi-Tenant SaaS Schema
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  subscriptionPlan: varchar("subscription_plan", { 
    length: 50 
  }).$type<'starter' | 'professional' | 'enterprise'>().notNull().default('starter'),
  subscriptionStatus: varchar("subscription_status", {
    length: 50
  }).$type<'active' | 'suspended' | 'cancelled' | 'trial'>().notNull().default('trial'),
  settings: jsonb("settings").default(sql`'{}'`),
  billingEmail: varchar("billing_email", { length: 255 }),
  maxUsers: integer("max_users").default(5),
  maxDataSources: integer("max_data_sources").default(10),
  apiAccessEnabled: boolean("api_access_enabled").default(false),
  customBrandingEnabled: boolean("custom_branding_enabled").default(false),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantUsers = pgTable("tenant_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role", { 
    length: 50 
  }).$type<'admin' | 'compliance_officer' | 'analyst' | 'viewer'>().notNull().default('viewer'),
  permissions: jsonb("permissions").default(sql`'[]'`),
  dashboardConfig: jsonb("dashboard_config").default(sql`'{}'`),
  isActive: boolean("is_active").default(true),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantDataAccess = pgTable("tenant_data_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  dataSourceId: varchar("data_source_id"),
  allowedRegions: jsonb("allowed_regions").default(sql`'["US", "EU"]'`),
  monthlyLimit: integer("monthly_limit").default(500),
  currentUsage: integer("current_usage").default(0),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantDashboards = pgTable("tenant_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  layoutConfig: jsonb("layout_config").default(sql`'{}'`),
  widgets: jsonb("widgets").default(sql`'[]'`),
  isDefault: boolean("is_default").default(false),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantInvitations = pgTable("tenant_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { 
    length: 50 
  }).$type<'admin' | 'compliance_officer' | 'analyst' | 'viewer'>().notNull(),
  invitedBy: varchar("invited_by").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for Multi-Tenant Schema
export const tenantsRelations = relations(tenants, ({ many }) => ({
  tenantUsers: many(tenantUsers),
  dataAccess: many(tenantDataAccess),
  dashboards: many(tenantDashboards),
  invitations: many(tenantInvitations),
}));

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantUsers.userId],
    references: [users.id],
  }),
}));

export const tenantDashboardsRelations = relations(tenantDashboards, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantDashboards.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantDashboards.userId],
    references: [users.id],
  }),
}));

// Types for Multi-Tenant
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;
export type TenantDashboard = typeof tenantDashboards.$inferSelect;
export type InsertTenantDashboard = typeof tenantDashboards.$inferInsert;
export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = typeof tenantInvitations.$inferInsert;

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DataSource = typeof dataSources.$inferSelect;

export const insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRegulatoryUpdate = z.infer<typeof insertRegulatoryUpdateSchema>;
export type RegulatoryUpdate = typeof regulatoryUpdates.$inferSelect;

export const insertLegalCaseSchema = createInsertSchema(legalCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLegalCase = z.infer<typeof insertLegalCaseSchema>;
export type LegalCase = typeof legalCases.$inferSelect;

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
});
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true,
});
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvals.$inferSelect;