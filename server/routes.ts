import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertOrderSchema, 
  insertSupplierSchema,
  insertCategorySchema,
  insertCustomerSchema,
  insertMarketingCampaignSchema,
  insertAiTaskSchema,
  insertConversationSchema,
  insertMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard API routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const { role } = req.query;
      const users = role ? await storage.getUsersByRole(role as string) : [];
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/active", async (req, res) => {
    try {
      const suppliers = await storage.getActiveSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching active suppliers:", error);
      res.status(500).json({ message: "Failed to fetch active suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(req.params.id, req.body);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/active", async (req, res) => {
    try {
      const categories = await storage.getActiveCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching active categories:", error);
      res.status(500).json({ message: "Failed to fetch active categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, supplierId, status, limit = "20", offset = "0", search } = req.query;
      const products = await storage.getProducts({
        categoryId: categoryId as string,
        supplierId: supplierId as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const { limit = "10" } = req.query;
      const products = await storage.getFeaturedProducts(parseInt(limit as string));
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const { userId, status, limit = "20", offset = "0", dateFrom, dateTo } = req.query;
      const orders = await storage.getOrders({
        userId: userId as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/pending", async (req, res) => {
    try {
      const orders = await storage.getOrdersToProcess();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      res.status(500).json({ message: "Failed to fetch pending orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const orderItems = await storage.getOrderItems(req.params.id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const order = await storage.createOrder({
        ...orderData,
        orderNumber,
      });

      // Create order items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.createOrderItem({
            ...item,
            orderId: order.id,
          });
        }
      }

      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const { limit = "20", offset = "0", search } = req.query;
      const customers = await storage.getCustomers({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/top", async (req, res) => {
    try {
      const { limit = "10" } = req.query;
      const customers = await storage.getTopCustomers(parseInt(limit as string));
      res.json(customers);
    } catch (error) {
      console.error("Error fetching top customers:", error);
      res.status(500).json({ message: "Failed to fetch top customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Generate customer number
      const customerNumber = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const customer = await storage.createCustomer({
        ...customerData,
        customerNumber,
      });
      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // AI Tasks routes
  app.get("/api/ai-tasks", async (req, res) => {
    try {
      const { status, type, limit = "20", offset = "0" } = req.query;
      const tasks = await storage.getAiTasks({
        status: status as string,
        type: type as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching AI tasks:", error);
      res.status(500).json({ message: "Failed to fetch AI tasks" });
    }
  });

  app.get("/api/ai-tasks/pending", async (req, res) => {
    try {
      const tasks = await storage.getPendingAiTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching pending AI tasks:", error);
      res.status(500).json({ message: "Failed to fetch pending AI tasks" });
    }
  });

  app.post("/api/ai-tasks", async (req, res) => {
    try {
      const taskData = insertAiTaskSchema.parse(req.body);
      const task = await storage.createAiTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating AI task:", error);
      res.status(500).json({ message: "Failed to create AI task" });
    }
  });

  app.patch("/api/ai-tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateAiTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating AI task:", error);
      res.status(500).json({ message: "Failed to update AI task" });
    }
  });

  // Customer Service Conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const { customerId } = req.query;
      const conversations = await storage.getConversations(customerId as string);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/open", async (req, res) => {
    try {
      const conversations = await storage.getOpenConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching open conversations:", error);
      res.status(500).json({ message: "Failed to fetch open conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId: req.params.id,
      });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Marketing Campaigns
  app.get("/api/marketing-campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getMarketingCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching marketing campaigns:", error);
      res.status(500).json({ message: "Failed to fetch marketing campaigns" });
    }
  });

  app.get("/api/marketing-campaigns/active", async (req, res) => {
    try {
      const campaigns = await storage.getActiveCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching active campaigns:", error);
      res.status(500).json({ message: "Failed to fetch active campaigns" });
    }
  });

  app.post("/api/marketing-campaigns", async (req, res) => {
    try {
      const campaignData = insertMarketingCampaignSchema.parse(req.body);
      const campaign = await storage.createMarketingCampaign(campaignData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating marketing campaign:", error);
      res.status(500).json({ message: "Failed to create marketing campaign" });
    }
  });

  // Search routes
  app.get("/api/search/products", async (req, res) => {
    try {
      const { q, limit = "10" } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const products = await storage.searchProducts(q as string, parseInt(limit as string));
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.get("/api/search/customers", async (req, res) => {
    try {
      const { q, limit = "10" } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const customers = await storage.searchCustomers(q as string, parseInt(limit as string));
      res.json(customers);
    } catch (error) {
      console.error("Error searching customers:", error);
      res.status(500).json({ message: "Failed to search customers" });
    }
  });

  app.get("/api/search/orders", async (req, res) => {
    try {
      const { q, limit = "10" } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const orders = await storage.searchOrders(q as string, parseInt(limit as string));
      res.json(orders);
    } catch (error) {
      console.error("Error searching orders:", error);
      res.status(500).json({ message: "Failed to search orders" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const { category } = req.query;
      const settings = await storage.getSettings(category as string);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.patch("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // AI automation endpoints
  app.post("/api/ai/optimize-product", async (req, res) => {
    try {
      const { productId } = req.body;
      
      // Create AI task for product optimization
      const task = await storage.createAiTask({
        type: "product_optimization",
        input: { productId },
        priority: "medium",
      });

      res.json({ message: "Product optimization task created", taskId: task.id });
    } catch (error) {
      console.error("Error creating product optimization task:", error);
      res.status(500).json({ message: "Failed to create optimization task" });
    }
  });

  app.post("/api/ai/process-order", async (req, res) => {
    try {
      const { orderId } = req.body;
      
      // Create AI task for order processing
      const task = await storage.createAiTask({
        type: "order_processing",
        input: { orderId },
        priority: "high",
      });

      res.json({ message: "Order processing task created", taskId: task.id });
    } catch (error) {
      console.error("Error creating order processing task:", error);
      res.status(500).json({ message: "Failed to create order processing task" });
    }
  });

  app.post("/api/ai/generate-marketing", async (req, res) => {
    try {
      const { campaignType, targetAudience, budget } = req.body;
      
      // Create AI task for marketing generation
      const task = await storage.createAiTask({
        type: "marketing",
        input: { campaignType, targetAudience, budget },
        priority: "medium",
      });

      res.json({ message: "Marketing generation task created", taskId: task.id });
    } catch (error) {
      console.error("Error creating marketing generation task:", error);
      res.status(500).json({ message: "Failed to create marketing task" });
    }
  });

  app.post("/api/ai/handle-customer-service", async (req, res) => {
    try {
      const { conversationId, message } = req.body;
      
      // Create AI task for customer service
      const task = await storage.createAiTask({
        type: "customer_service",
        input: { conversationId, message },
        priority: "high",
      });

      res.json({ message: "Customer service task created", taskId: task.id });
    } catch (error) {
      console.error("Error creating customer service task:", error);
      res.status(500).json({ message: "Failed to create customer service task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}