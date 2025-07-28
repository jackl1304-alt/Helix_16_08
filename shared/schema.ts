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
  index,
  decimal,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for dropshipping system
export const userRoleEnum = pgEnum("user_role", ["customer", "admin", "ai_assistant"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive", "out_of_stock", "discontinued"]);
export const supplierStatusEnum = pgEnum("supplier_status", ["active", "inactive", "under_review"]);
export const marketingCampaignStatusEnum = pgEnum("marketing_campaign_status", ["draft", "active", "paused", "completed"]);
export const aiTaskStatusEnum = pgEnum("ai_task_status", ["pending", "processing", "completed", "failed"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name").notNull(),
  role: userRoleEnum("role").default("customer"),
  passwordHash: varchar("password_hash"),
  phone: varchar("phone"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_role").on(table.role),
]);

// Customer addresses
export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  company: varchar("company"),
  street: varchar("street").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state"),
  postalCode: varchar("postal_code").notNull(),
  country: varchar("country").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  company: varchar("company"),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  country: varchar("country").notNull(),
  apiEndpoint: text("api_endpoint"),
  apiKey: varchar("api_key"),
  status: supplierStatusEnum("status").default("active"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  shippingCosts: jsonb("shipping_costs"),
  paymentTerms: text("payment_terms"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_suppliers_status").on(table.status),
  index("idx_suppliers_country").on(table.country),
]);

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  parentId: varchar("parent_id"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  seoTitle: varchar("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  categoryId: varchar("category_id").references(() => categories.id),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  sku: varchar("sku").notNull(),
  supplierSku: varchar("supplier_sku"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: jsonb("dimensions"),
  images: jsonb("images"),
  status: productStatusEnum("status").default("active"),
  inventory: integer("inventory").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  tags: jsonb("tags"),
  attributes: jsonb("attributes"),
  seoTitle: varchar("seo_title"),
  seoDescription: text("seo_description"),
  aiOptimized: boolean("ai_optimized").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_products_status").on(table.status),
  index("idx_products_category").on(table.categoryId),
  index("idx_products_supplier").on(table.supplierId),
  index("idx_products_sku").on(table.sku),
]);

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  status: orderStatusEnum("status").default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  currency: varchar("currency").default("EUR"),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  trackingNumber: varchar("tracking_number"),
  notes: text("notes"),
  aiProcessed: boolean("ai_processed").default(false),
  supplierOrderData: jsonb("supplier_order_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_orders_user").on(table.userId),
  index("idx_orders_status").on(table.status),
  index("idx_orders_created").on(table.createdAt),
]);

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  supplierStatus: varchar("supplier_status").default("pending"),
  supplierOrderId: varchar("supplier_order_id"),
  trackingNumber: varchar("tracking_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers (extends users with customer-specific data)
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique(),
  customerNumber: varchar("customer_number").unique(),
  totalOrders: integer("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default("0.00"),
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default("0.00"),
  firstOrderDate: timestamp("first_order_date"),
  lastOrderDate: timestamp("last_order_date"),
  preferredCategories: jsonb("preferred_categories"),
  marketingConsent: boolean("marketing_consent").default(false),
  loyaltyPoints: integer("loyalty_points").default(0),
  riskScore: decimal("risk_score", { precision: 3, scale: 2 }).default("0.00"),
  aiSegment: varchar("ai_segment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing campaigns table
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // email, social, ads, seo
  status: marketingCampaignStatusEnum("status").default("draft"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  targetAudience: jsonb("target_audience"),
  content: jsonb("content"),
  metrics: jsonb("metrics"),
  aiGenerated: boolean("ai_generated").default(false),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI tasks for automation
export const aiTasks = pgTable("ai_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // product_optimization, order_processing, customer_service, marketing
  status: aiTaskStatusEnum("status").default("pending"),
  priority: priorityEnum("priority").default("medium"),
  input: jsonb("input"),
  output: jsonb("output"),
  error: text("error"),
  processingTime: integer("processing_time"), // milliseconds
  scheduled: boolean("scheduled").default(false),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_ai_tasks_status").on(table.status),
  index("idx_ai_tasks_type").on(table.type),
  index("idx_ai_tasks_scheduled").on(table.scheduledFor),
]);

// Customer service conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  subject: varchar("subject"),
  status: varchar("status").default("open"), // open, closed, waiting
  priority: priorityEnum("priority").default("medium"),
  assignedToAi: boolean("assigned_to_ai").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages in conversations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: varchar("sender_type").notNull(), // customer, ai, admin
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics data
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // page_view, purchase, cart_add, etc.
  entityId: varchar("entity_id"),
  entityType: varchar("entity_type"),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_analytics_type").on(table.type),
  index("idx_analytics_user").on(table.userId),
  index("idx_analytics_created").on(table.createdAt),
]);

// System settings
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: jsonb("value"),
  category: varchar("category").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  customer: one(customers),
  addresses: many(addresses),
  orders: many(orders),
  sentMessages: many(messages),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  conversations: many(conversations),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  customer: one(customers, {
    fields: [conversations.customerId],
    references: [customers.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiTaskSchema = createInsertSchema(aiTasks).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

export type AiTask = typeof aiTasks.$inferSelect;
export type InsertAiTask = z.infer<typeof insertAiTaskSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Dropshipping specific types
export interface ProductImportData {
  supplierSku: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  images: string[];
  attributes: Record<string, any>;
  inventory: number;
}

export interface SupplierOrderData {
  supplierOrderId: string;
  items: {
    supplierSku: string;
    quantity: number;
    unitPrice: number;
  }[];
  shippingInfo: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
  status: string;
}

export interface AiAnalysis {
  sentiment: number;
  keywords: string[];
  categories: string[];
  recommendations: string[];
  confidence: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  criteria: Record<string, any>;
  size: number;
  characteristics: string[];
}