import {
  users,
  addresses,
  suppliers,
  categories,
  products,
  orders,
  orderItems,
  customers,
  marketingCampaigns,
  aiTasks,
  conversations,
  messages,
  analytics,
  settings,
  type User,
  type InsertUser,
  type Address,
  type InsertAddress,
  type Supplier,
  type InsertSupplier,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Customer,
  type InsertCustomer,
  type MarketingCampaign,
  type InsertMarketingCampaign,
  type AiTask,
  type InsertAiTask,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Analytics,
  type InsertAnalytics,
  type Setting,
  type InsertSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or, sql, count, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;

  // Address operations
  getAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address>;
  deleteAddress(id: string): Promise<void>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplierById(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  getActiveSuppliers(): Promise<Supplier[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  getActiveCategories(): Promise<Category[]>;

  // Product operations
  getProducts(params: {
    categoryId?: string;
    supplierId?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getProductsBySupplier(supplierId: string): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getLowStockProducts(): Promise<Product[]>;

  // Order operations
  getOrders(params: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  getOrdersForUser(userId: string): Promise<Order[]>;
  getOrdersToProcess(): Promise<Order[]>;

  // Order Item operations
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: string, orderItem: Partial<InsertOrderItem>): Promise<OrderItem>;

  // Customer operations
  getCustomers(params: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  getCustomerByUserId(userId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  getTopCustomers(limit?: number): Promise<Customer[]>;

  // Marketing Campaign operations
  getMarketingCampaigns(): Promise<MarketingCampaign[]>;
  getMarketingCampaignById(id: string): Promise<MarketingCampaign | undefined>;
  createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign>;
  updateMarketingCampaign(id: string, campaign: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign>;
  getActiveCampaigns(): Promise<MarketingCampaign[]>;

  // AI Task operations
  getAiTasks(params: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<AiTask[]>;
  getAiTaskById(id: string): Promise<AiTask | undefined>;
  createAiTask(task: InsertAiTask): Promise<AiTask>;
  updateAiTask(id: string, task: Partial<InsertAiTask>): Promise<AiTask>;
  getPendingAiTasks(): Promise<AiTask[]>;
  getScheduledAiTasks(): Promise<AiTask[]>;

  // Conversation operations
  getConversations(customerId?: string): Promise<Conversation[]>;
  getConversationById(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation>;
  getOpenConversations(): Promise<Conversation[]>;

  // Message operations
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Analytics operations
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalytics(params: {
    type?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Analytics[]>;

  // Settings operations
  getSettings(category?: string): Promise<Setting[]>;
  getSettingByKey(key: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: any): Promise<Setting>;

  // Dashboard operations
  getDashboardStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    pendingOrders: number;
    lowStockProducts: number;
    activeSuppliers: number;
    openConversations: number;
  }>;

  // Search operations
  searchProducts(query: string, limit?: number): Promise<Product[]>;
  searchCustomers(query: string, limit?: number): Promise<Customer[]>;
  searchOrders(query: string, limit?: number): Promise<Order[]>;
}

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  // Address operations
  async getAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const result = await db.insert(addresses).values(address).returning();
    return result[0];
  }

  async updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address> {
    const result = await db.update(addresses).set(address).where(eq(addresses.id, id)).returning();
    return result[0];
  }

  async deleteAddress(id: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return result[0];
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const result = await db.insert(suppliers).values(supplier).returning();
    return result[0];
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const result = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return result[0];
  }

  async getActiveSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).where(eq(suppliers.status, 'active'));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async getActiveCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  // Product operations
  async getProducts(params: {
    categoryId?: string;
    supplierId?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products);

    const conditions = [];
    if (params.categoryId) conditions.push(eq(products.categoryId, params.categoryId));
    if (params.supplierId) conditions.push(eq(products.supplierId, params.supplierId));
    if (params.status) conditions.push(eq(products.status, params.status as any));
    if (params.search) {
      conditions.push(
        or(
          ilike(products.name, `%${params.search}%`),
          ilike(products.description, `%${params.search}%`),
          ilike(products.sku, `%${params.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(products.createdAt));

    if (params.limit) query = query.limit(params.limit);
    if (params.offset) query = query.offset(params.offset);

    return await query;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.supplierId, supplierId));
  }

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.status, 'active'))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(sql`${products.inventory} <= ${products.lowStockThreshold}`);
  }

  // Order operations
  async getOrders(params: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Order[]> {
    let query = db.select().from(orders);

    const conditions = [];
    if (params.userId) conditions.push(eq(orders.userId, params.userId));
    if (params.status) conditions.push(eq(orders.status, params.status as any));
    if (params.dateFrom) conditions.push(sql`${orders.createdAt} >= ${params.dateFrom}`);
    if (params.dateTo) conditions.push(sql`${orders.createdAt} <= ${params.dateTo}`);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(orders.createdAt));

    if (params.limit) query = query.limit(params.limit);
    if (params.offset) query = query.offset(params.offset);

    return await query;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const result = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async getOrdersForUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersToProcess(): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.status, 'pending'))
      .orderBy(asc(orders.createdAt));
  }

  // Order Item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  async updateOrderItem(id: string, orderItem: Partial<InsertOrderItem>): Promise<OrderItem> {
    const result = await db.update(orderItems).set(orderItem).where(eq(orderItems.id, id)).returning();
    return result[0];
  }

  // Customer operations
  async getCustomers(params: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Customer[]> {
    let query = db.select().from(customers);

    if (params.search) {
      query = query.where(
        or(
          ilike(customers.customerNumber, `%${params.search}%`),
          ilike(customers.aiSegment, `%${params.search}%`)
        )
      );
    }

    query = query.orderBy(desc(customers.createdAt));

    if (params.limit) query = query.limit(params.limit);
    if (params.offset) query = query.offset(params.offset);

    return await query;
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async getCustomerByUserId(userId: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.userId, userId)).limit(1);
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const result = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return result[0];
  }

  async getTopCustomers(limit = 10): Promise<Customer[]> {
    return await db.select().from(customers)
      .orderBy(desc(customers.totalSpent))
      .limit(limit);
  }

  // Marketing Campaign operations
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return await db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.createdAt));
  }

  async getMarketingCampaignById(id: string): Promise<MarketingCampaign | undefined> {
    const result = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id)).limit(1);
    return result[0];
  }

  async createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const result = await db.insert(marketingCampaigns).values(campaign).returning();
    return result[0];
  }

  async updateMarketingCampaign(id: string, campaign: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign> {
    const result = await db.update(marketingCampaigns).set(campaign).where(eq(marketingCampaigns.id, id)).returning();
    return result[0];
  }

  async getActiveCampaigns(): Promise<MarketingCampaign[]> {
    return await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.status, 'active'));
  }

  // AI Task operations
  async getAiTasks(params: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<AiTask[]> {
    let query = db.select().from(aiTasks);

    const conditions = [];
    if (params.status) conditions.push(eq(aiTasks.status, params.status as any));
    if (params.type) conditions.push(eq(aiTasks.type, params.type));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(aiTasks.createdAt));

    if (params.limit) query = query.limit(params.limit);
    if (params.offset) query = query.offset(params.offset);

    return await query;
  }

  async getAiTaskById(id: string): Promise<AiTask | undefined> {
    const result = await db.select().from(aiTasks).where(eq(aiTasks.id, id)).limit(1);
    return result[0];
  }

  async createAiTask(task: InsertAiTask): Promise<AiTask> {
    const result = await db.insert(aiTasks).values(task).returning();
    return result[0];
  }

  async updateAiTask(id: string, task: Partial<InsertAiTask>): Promise<AiTask> {
    const result = await db.update(aiTasks).set(task).where(eq(aiTasks.id, id)).returning();
    return result[0];
  }

  async getPendingAiTasks(): Promise<AiTask[]> {
    return await db.select().from(aiTasks).where(eq(aiTasks.status, 'pending'));
  }

  async getScheduledAiTasks(): Promise<AiTask[]> {
    return await db.select().from(aiTasks)
      .where(and(
        eq(aiTasks.scheduled, true),
        sql`${aiTasks.scheduledFor} <= NOW()`
      ));
  }

  // Conversation operations
  async getConversations(customerId?: string): Promise<Conversation[]> {
    let query = db.select().from(conversations);
    
    if (customerId) {
      query = query.where(eq(conversations.customerId, customerId));
    }

    return await query.orderBy(desc(conversations.createdAt));
  }

  async getConversationById(id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation> {
    const result = await db.update(conversations).set(conversation).where(eq(conversations.id, id)).returning();
    return result[0];
  }

  async getOpenConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.status, 'open'));
  }

  // Message operations
  async getMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  // Analytics operations
  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const result = await db.insert(analytics).values(analytics).returning();
    return result[0];
  }

  async getAnalytics(params: {
    type?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Analytics[]> {
    let query = db.select().from(analytics);

    const conditions = [];
    if (params.type) conditions.push(eq(analytics.type, params.type));
    if (params.userId) conditions.push(eq(analytics.userId, params.userId));
    if (params.dateFrom) conditions.push(sql`${analytics.createdAt} >= ${params.dateFrom}`);
    if (params.dateTo) conditions.push(sql`${analytics.createdAt} <= ${params.dateTo}`);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(analytics.createdAt));
  }

  // Settings operations
  async getSettings(category?: string): Promise<Setting[]> {
    let query = db.select().from(settings);
    
    if (category) {
      query = query.where(eq(settings.category, category));
    }

    return await query;
  }

  async getSettingByKey(key: string): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result[0];
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const result = await db.insert(settings).values(setting).returning();
    return result[0];
  }

  async updateSetting(key: string, value: any): Promise<Setting> {
    const result = await db.update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return result[0];
  }

  // Dashboard operations
  async getDashboardStats() {
    const [
      totalProductsResult,
      totalOrdersResult,
      totalCustomersResult,
      totalRevenueResult,
      pendingOrdersResult,
      lowStockProductsResult,
      activeSuppliersResult,
      openConversationsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(products),
      db.select({ count: count() }).from(orders),
      db.select({ count: count() }).from(customers),
      db.select({ sum: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` }).from(orders).where(eq(orders.paymentStatus, 'paid')),
      db.select({ count: count() }).from(orders).where(eq(orders.status, 'pending')),
      db.select({ count: count() }).from(products).where(sql`${products.inventory} <= ${products.lowStockThreshold}`),
      db.select({ count: count() }).from(suppliers).where(eq(suppliers.status, 'active')),
      db.select({ count: count() }).from(conversations).where(eq(conversations.status, 'open')),
    ]);

    return {
      totalProducts: totalProductsResult[0]?.count || 0,
      totalOrders: totalOrdersResult[0]?.count || 0,
      totalCustomers: totalCustomersResult[0]?.count || 0,
      totalRevenue: totalRevenueResult[0]?.sum || 0,
      pendingOrders: pendingOrdersResult[0]?.count || 0,
      lowStockProducts: lowStockProductsResult[0]?.count || 0,
      activeSuppliers: activeSuppliersResult[0]?.count || 0,
      openConversations: openConversationsResult[0]?.count || 0,
    };
  }

  // Search operations
  async searchProducts(query: string, limit = 10): Promise<Product[]> {
    return await db.select().from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(products.sku, `%${query}%`)
        )
      )
      .limit(limit);
  }

  async searchCustomers(query: string, limit = 10): Promise<Customer[]> {
    return await db.select().from(customers)
      .where(
        or(
          ilike(customers.customerNumber, `%${query}%`),
          ilike(customers.aiSegment, `%${query}%`)
        )
      )
      .limit(limit);
  }

  async searchOrders(query: string, limit = 10): Promise<Order[]> {
    return await db.select().from(orders)
      .where(
        or(
          ilike(orders.orderNumber, `%${query}%`),
          ilike(orders.trackingNumber, `%${query}%`)
        )
      )
      .limit(limit);
  }
}

// Export storage instance
export const storage = new PostgresStorage();