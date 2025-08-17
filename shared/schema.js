import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const statusEnum = pgEnum("status", ["active", "inactive", "pending", "archived"]);
export const updateTypeEnum = pgEnum("update_type", ["regulation", "guidance", "standard", "approval", "alert"]);
export const chatMessageTypeEnum = pgEnum("chat_message_type", ["message", "feature_request", "bug_report", "question", "feedback"]);
export const chatMessageStatusEnum = pgEnum("chat_message_status", ["unread", "read", "resolved", "in_progress"]);
export const tenants = pgTable("tenants", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull(),
    subdomain: varchar("subdomain").unique().notNull(),
    customDomain: varchar("custom_domain"),
    logo: varchar("logo"),
    colorScheme: varchar("color_scheme").default("blue"),
    settings: jsonb("settings"),
    subscriptionTier: varchar("subscription_tier").default("standard"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_tenants_subdomain").on(table.subdomain),
    index("idx_tenants_active").on(table.isActive),
]);
export const userRoleEnum = pgEnum("user_role", ["tenant_admin", "tenant_user", "super_admin"]);
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    email: varchar("email").notNull(),
    name: varchar("name"),
    role: userRoleEnum("role").default("tenant_user"),
    passwordHash: varchar("password_hash"),
    isActive: boolean("is_active").default(true),
    lastLogin: timestamp("last_login"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_users_email_tenant").on(table.email, table.tenantId),
    index("idx_users_tenant").on(table.tenantId),
]);
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { mode: "date" }).notNull(),
}, (table) => [
    index("idx_sessions_expire").on(table.expire),
]);
export const dataSources = pgTable("data_sources", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    url: varchar("url"),
    apiEndpoint: varchar("api_endpoint"),
    country: varchar("country"),
    region: varchar("region"),
    type: varchar("type").notNull(),
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
export const regulatoryUpdates = pgTable("regulatory_updates", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
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
    index("idx_regulatory_updates_tenant").on(table.tenantId),
    index("idx_regulatory_updates_source").on(table.sourceId),
    index("idx_regulatory_updates_type").on(table.type),
    index("idx_regulatory_updates_published").on(table.publishedDate),
    index("idx_regulatory_updates_priority").on(table.priority),
]);
export const legalCases = pgTable("legal_cases", {
    id: text("id").primaryKey(),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    caseNumber: text("case_number"),
    title: text("title").notNull(),
    court: text("court").notNull(),
    jurisdiction: text("jurisdiction").notNull(),
    decisionDate: timestamp("decision_date", { mode: "date" }),
    summary: text("summary"),
    content: text("content"),
    verdict: text("verdict"),
    damages: text("damages"),
    documentUrl: text("document_url"),
    impactLevel: text("impact_level"),
    keywords: text("keywords").array(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_legal_cases_tenant").on(table.tenantId),
    index("idx_legal_cases_jurisdiction").on(table.jurisdiction),
    index("idx_legal_cases_court").on(table.court),
    index("idx_legal_cases_decision").on(table.decisionDate),
]);
export const knowledgeArticles = pgTable("knowledge_articles", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
export const newsletters = pgTable("newsletters", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    subject: varchar("subject").notNull(),
    content: text("content").notNull(),
    htmlContent: text("html_content"),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    status: varchar("status").default("draft"),
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
export const subscribers = pgTable("subscribers", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
export const approvals = pgTable("approvals", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    itemType: varchar("item_type").notNull(),
    itemId: varchar("item_id").notNull(),
    status: varchar("status").default("pending"),
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
export const chatMessages = pgTable("chat_messages", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    senderId: varchar("sender_id").references(() => users.id),
    senderType: varchar("sender_type").notNull(),
    senderName: varchar("sender_name").notNull(),
    senderEmail: varchar("sender_email").notNull(),
    messageType: chatMessageTypeEnum("message_type").default("message"),
    subject: varchar("subject"),
    message: text("message").notNull(),
    status: chatMessageStatusEnum("status").default("unread"),
    priority: varchar("priority").default("normal"),
    attachments: jsonb("attachments"),
    metadata: jsonb("metadata"),
    readAt: timestamp("read_at"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_chat_messages_tenant").on(table.tenantId),
    index("idx_chat_messages_status").on(table.status),
    index("idx_chat_messages_type").on(table.messageType),
    index("idx_chat_messages_created").on(table.createdAt),
]);
export const chatConversations = pgTable("chat_conversations", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    subject: varchar("subject").notNull(),
    status: varchar("status").default("open"),
    priority: varchar("priority").default("normal"),
    lastMessageAt: timestamp("last_message_at").defaultNow(),
    messageCount: integer("message_count").default(0),
    participantIds: text("participant_ids").array(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_chat_conversations_tenant").on(table.tenantId),
    index("idx_chat_conversations_status").on(table.status),
    index("idx_chat_conversations_last_message").on(table.lastMessageAt),
]);
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
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
    tenant: one(tenants, {
        fields: [chatMessages.tenantId],
        references: [tenants.id],
    }),
    sender: one(users, {
        fields: [chatMessages.senderId],
        references: [users.id],
    }),
}));
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [chatConversations.tenantId],
        references: [tenants.id],
    }),
    messages: many(chatMessages),
}));
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertTenantSchema = createInsertSchema(tenants).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const tenantUsers = pgTable("tenant_users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    role: varchar("role", {
        length: 50
    }).$type().notNull().default('viewer'),
    permissions: jsonb("permissions").default(sql `'[]'`),
    dashboardConfig: jsonb("dashboard_config").default(sql `'{}'`),
    isActive: boolean("is_active").default(true),
    invitedAt: timestamp("invited_at").defaultNow(),
    joinedAt: timestamp("joined_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const tenantDataAccess = pgTable("tenant_data_access", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    dataSourceId: varchar("data_source_id"),
    allowedRegions: jsonb("allowed_regions").default(sql `'["US", "EU"]'`),
    monthlyLimit: integer("monthly_limit").default(500),
    currentUsage: integer("current_usage").default(0),
    lastResetAt: timestamp("last_reset_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const tenantDashboards = pgTable("tenant_dashboards", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    layoutConfig: jsonb("layout_config").default(sql `'{}'`),
    widgets: jsonb("widgets").default(sql `'[]'`),
    isDefault: boolean("is_default").default(false),
    isShared: boolean("is_shared").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const tenantInvitations = pgTable("tenant_invitations", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", {
        length: 50
    }).$type().notNull(),
    invitedBy: varchar("invited_by").references(() => users.id).notNull(),
    token: varchar("token", { length: 255 }).unique().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const tenantsRelations = relations(tenants, ({ many }) => ({
    tenantUsers: many(tenantUsers),
    dataAccess: many(tenantDataAccess),
    dashboards: many(tenantDashboards),
    invitations: many(tenantInvitations),
    users: many(users),
    chatMessages: many(chatMessages),
    chatConversations: many(chatConversations),
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
export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertLegalCaseSchema = createInsertSchema(legalCases).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
    id: true,
});
export const insertApprovalSchema = createInsertSchema(approvals).omit({
    id: true,
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
//# sourceMappingURL=schema.js.map