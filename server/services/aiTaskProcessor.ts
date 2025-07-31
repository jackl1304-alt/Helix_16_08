import { storage } from "../storage";
import { aiService } from "./aiService";
import type { AiTask } from "@shared/schema";

export class AITaskProcessor {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessing();
  }

  private startProcessing() {
    // Process AI tasks every 10 seconds
    this.processingInterval = setInterval(() => {
      this.processPendingTasks();
    }, 10000);

    // Process immediately on startup
    this.processPendingTasks();
  }

  private async processPendingTasks() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Get pending tasks
      const pendingTasks = await storage.getPendingAiTasks();
      // console.log(`Processing ${pendingTasks.length} pending AI tasks`);

      for (const task of pendingTasks) {
        await this.processTask(task);
      }

      // Process scheduled tasks
      const scheduledTasks = await storage.getScheduledAiTasks();
      // console.log(`Processing ${scheduledTasks.length} scheduled AI tasks`);

      for (const task of scheduledTasks) {
        await this.processTask(task);
      }
    } catch (error) {
      // console.error("Error processing AI tasks:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processTask(task: AiTask) {
    const startTime = Date.now();
    
    try {
      // console.log(`Processing AI task ${task.id} of type ${task.type}`);
      
      // Update task status to processing
      await storage.updateAiTask(task.id, {
        status: "processing",
      });

      let result: any;

      // Route to appropriate AI service based on task type
      switch (task.type) {
        case "product_optimization":
          result = await this.handleProductOptimization(task);
          break;
        case "order_processing":
          result = await this.handleOrderProcessing(task);
          break;
        case "customer_service":
          result = await this.handleCustomerService(task);
          break;
        case "marketing":
          result = await this.handleMarketing(task);
          break;
        case "inventory_optimization":
          result = await this.handleInventoryOptimization(task);
          break;
        case "price_optimization":
          result = await this.handlePriceOptimization(task);
          break;
        case "customer_segmentation":
          result = await this.handleCustomerSegmentation(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      const processingTime = Date.now() - startTime;

      // Update task as completed
      await storage.updateAiTask(task.id, {
        status: "completed",
        output: result,
        processingTime,
        completedAt: new Date(),
      });

      // console.log(`AI task ${task.id} completed in ${processingTime}ms`);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // console.error(`Error processing AI task ${task.id}:`, error);
      
      // Update task as failed
      await storage.updateAiTask(task.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        processingTime,
        completedAt: new Date(),
      });
    }
  }

  private async handleProductOptimization(task: AiTask): Promise<any> {
    const { productId } = task.input as any;
    
    if (!productId) {
      throw new Error("Product ID is required for product optimization");
    }

    return await aiService.optimizeProduct(productId);
  }

  private async handleOrderProcessing(task: AiTask): Promise<any> {
    const { orderId } = task.input as any;
    
    if (!orderId) {
      throw new Error("Order ID is required for order processing");
    }

    return await aiService.processOrder(orderId);
  }

  private async handleCustomerService(task: AiTask): Promise<any> {
    const { conversationId, message } = task.input as any;
    
    if (!conversationId || !message) {
      throw new Error("Conversation ID and message are required for customer service");
    }

    return await aiService.handleCustomerService(conversationId, message);
  }

  private async handleMarketing(task: AiTask): Promise<any> {
    const { campaignType, targetAudience, budget } = task.input as any;
    
    if (!campaignType) {
      throw new Error("Campaign type is required for marketing");
    }

    return await aiService.generateMarketingCampaign(
      campaignType,
      targetAudience || {},
      budget || 1000
    );
  }

  private async handleInventoryOptimization(task: AiTask): Promise<any> {
    return await aiService.optimizeInventory();
  }

  private async handlePriceOptimization(task: AiTask): Promise<any> {
    return await aiService.optimizeProductPricing();
  }

  private async handleCustomerSegmentation(task: AiTask): Promise<any> {
    return await aiService.analyzeCustomerSegmentation();
  }

  // Schedule automated tasks
  async scheduleAutomatedTasks() {
    const now = new Date();
    
    // Schedule daily inventory optimization
    const inventoryTask = new Date(now);
    inventoryTask.setHours(2, 0, 0, 0); // 2 AM daily
    if (inventoryTask <= now) {
      inventoryTask.setDate(inventoryTask.getDate() + 1);
    }

    await storage.createAiTask({
      type: "inventory_optimization",
      input: {},
      priority: "medium",
      scheduled: true,
      scheduledFor: inventoryTask,
    });

    // Schedule weekly price optimization
    const priceTask = new Date(now);
    priceTask.setDate(priceTask.getDate() + (7 - priceTask.getDay())); // Next Sunday
    priceTask.setHours(3, 0, 0, 0); // 3 AM Sunday

    await storage.createAiTask({
      type: "price_optimization",
      input: {},
      priority: "medium",
      scheduled: true,
      scheduledFor: priceTask,
    });

    // Schedule monthly customer segmentation
    const segmentationTask = new Date(now);
    segmentationTask.setMonth(segmentationTask.getMonth() + 1);
    segmentationTask.setDate(1);
    segmentationTask.setHours(4, 0, 0, 0); // 4 AM on 1st of month

    await storage.createAiTask({
      type: "customer_segmentation",
      input: {},
      priority: "low",
      scheduled: true,
      scheduledFor: segmentationTask,
    });

    // console.log("Automated AI tasks scheduled successfully");
  }

  // Cleanup completed tasks (older than 30 days)
  async cleanupOldTasks() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // This would require a cleanup method in storage
      // console.log("Cleanup of old AI tasks completed");
    } catch (error) {
      // console.error("Error cleaning up old tasks:", error);
    }
  }

  // Get processing statistics
  async getProcessingStats(): Promise<any> {
    try {
      const allTasks = await storage.getAiTasks({ limit: 1000, offset: 0 });
      
      const stats = {
        total: allTasks.length,
        pending: allTasks.filter(t => t.status === "pending").length,
        processing: allTasks.filter(t => t.status === "processing").length,
        completed: allTasks.filter(t => t.status === "completed").length,
        failed: allTasks.filter(t => t.status === "failed").length,
        byType: {},
        averageProcessingTime: 0,
      };

      // Calculate stats by type
      const typeStats = {};
      let totalProcessingTime = 0;
      let completedCount = 0;

      for (const task of allTasks) {
        if (!typeStats[task.type]) {
          typeStats[task.type] = { total: 0, completed: 0, failed: 0 };
        }
        
        typeStats[task.type].total++;
        
        if (task.status === "completed") {
          typeStats[task.type].completed++;
          if (task.processingTime) {
            totalProcessingTime += task.processingTime;
            completedCount++;
          }
        } else if (task.status === "failed") {
          typeStats[task.type].failed++;
        }
      }

      stats.byType = typeStats;
      stats.averageProcessingTime = completedCount > 0 ? totalProcessingTime / completedCount : 0;

      return stats;
    } catch (error) {
      // console.error("Error getting processing stats:", error);
      return { error: "Failed to get processing stats" };
    }
  }

  // Stop processing (for graceful shutdown)
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    // console.log("AI task processor stopped");
  }
}

// Export singleton instance
export const aiTaskProcessor = new AITaskProcessor();