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

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name").notNull(),
  role: varchar("role").notNull().default("viewer"), // viewer, admin, expert
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data sources table
export const dataSources = pgTable("data_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // fda, ema, iso, pubmed
  endpoint: text("endpoint"),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  configData: jsonb("config_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Priority levels
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);
export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const updateTypeEnum = pgEnum("update_type", ["guidance", "standard", "recall", "approval", "variation"]);

// Regulatory updates table
export const regulatoryUpdates = pgTable("regulatory_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  sourceId: varchar("source_id").references(() => dataSources.id),
  sourceUrl: text("source_url"),
  region: varchar("region").notNull(), // US, EU, etc.
  updateType: updateTypeEnum("update_type").notNull(),
  priority: priorityEnum("priority").default("medium"),
  deviceClasses: jsonb("device_classes"), // Array of device classes
  categories: jsonb("categories"), // AI categorization results
  rawData: jsonb("raw_data"), // Original API response
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_regulatory_updates_region").on(table.region),
  index("idx_regulatory_updates_priority").on(table.priority),
  index("idx_regulatory_updates_published").on(table.publishedAt),
]);

// Approval workflow table
export const approvals = pgTable("approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemType: varchar("item_type").notNull(), // regulatory_update, newsletter
  itemId: varchar("item_id").notNull(),
  status: statusEnum("status").default("pending"),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  comments: text("comments"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletters table
export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content"),
  htmlContent: text("html_content"),
  status: statusEnum("status").default("pending"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdById: varchar("created_by_id").references(() => users.id),
  subscriberCount: integer("subscriber_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscribers table
export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name"),
  isActive: boolean("is_active").default(true),
  preferences: jsonb("preferences"), // Regions, categories, etc.
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

// Knowledge base table for custom knowledge
export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category"),
  tags: jsonb("tags"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  approvals: many(approvals),
  newsletters: many(newsletters),
  knowledgeEntries: many(knowledgeBase),
}));

export const dataSourcesRelations = relations(dataSources, ({ many }) => ({
  updates: many(regulatoryUpdates),
}));

export const regulatoryUpdatesRelations = relations(regulatoryUpdates, ({ one }) => ({
  source: one(dataSources, {
    fields: [regulatoryUpdates.sourceId],
    references: [dataSources.id],
  }),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  reviewer: one(users, {
    fields: [approvals.reviewerId],
    references: [users.id],
  }),
}));

export const newslettersRelations = relations(newsletters, ({ one }) => ({
  createdBy: one(users, {
    fields: [newsletters.createdById],
    references: [users.id],
  }),
}));

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  createdBy: one(users, {
    fields: [knowledgeBase.createdById],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
});

export const insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  subscribedAt: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type RegulatoryUpdate = typeof regulatoryUpdates.$inferSelect;
export type InsertRegulatoryUpdate = z.infer<typeof insertRegulatoryUpdateSchema>;
export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
