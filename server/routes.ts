import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dataCollectionService } from "./services/dataCollectionService";
import "./services/schedulerService";
import { insertRegulatoryUpdateSchema, insertApprovalSchema, insertNewsletterSchema, insertKnowledgeBaseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize scheduler for data collection
  // Scheduler will auto-start when the service is imported

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

  // Data sources routes
  app.get("/api/data-sources", async (req, res) => {
    try {
      const sources = await storage.getDataSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  app.post("/api/data-sources/:id/sync", async (req, res) => {
    try {
      const { id } = req.params;
      await dataCollectionService.syncDataSource(id);
      res.json({ message: "Data source sync initiated" });
    } catch (error) {
      console.error("Error syncing data source:", error);
      res.status(500).json({ message: "Failed to sync data source" });
    }
  });

  // Regulatory updates routes
  app.get("/api/regulatory-updates", async (req, res) => {
    try {
      const { region, priority, limit = "50", offset = "0" } = req.query;
      const updates = await storage.getRegulatoryUpdates({
        region: region as string,
        priority: priority as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(updates);
    } catch (error) {
      console.error("Error fetching regulatory updates:", error);
      res.status(500).json({ message: "Failed to fetch regulatory updates" });
    }
  });

  app.get("/api/regulatory-updates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const update = await storage.getRegulatoryUpdateById(id);
      if (!update) {
        return res.status(404).json({ message: "Regulatory update not found" });
      }
      res.json(update);
    } catch (error) {
      console.error("Error fetching regulatory update:", error);
      res.status(500).json({ message: "Failed to fetch regulatory update" });
    }
  });

  app.post("/api/regulatory-updates", async (req, res) => {
    try {
      const validatedData = insertRegulatoryUpdateSchema.parse(req.body);
      const update = await storage.createRegulatoryUpdate(validatedData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating regulatory update:", error);
      res.status(500).json({ message: "Failed to create regulatory update" });
    }
  });

  // Approval workflow routes
  app.get("/api/approvals", async (req, res) => {
    try {
      const { status, itemType } = req.query;
      const approvals = await storage.getApprovals({
        status: status as string,
        itemType: itemType as string,
      });
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  app.post("/api/approvals", async (req, res) => {
    try {
      const validatedData = insertApprovalSchema.parse(req.body);
      const approval = await storage.createApproval(validatedData);
      res.status(201).json(approval);
    } catch (error) {
      console.error("Error creating approval:", error);
      res.status(500).json({ message: "Failed to create approval" });
    }
  });

  app.patch("/api/approvals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comments, reviewerId } = req.body;
      const approval = await storage.updateApproval(id, { status, comments, reviewerId });
      res.json(approval);
    } catch (error) {
      console.error("Error updating approval:", error);
      res.status(500).json({ message: "Failed to update approval" });
    }
  });

  // Newsletter routes
  app.get("/api/newsletters", async (req, res) => {
    try {
      const newsletters = await storage.getNewsletters();
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.post("/api/newsletters", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const newsletter = await storage.createNewsletter(validatedData);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error creating newsletter:", error);
      res.status(500).json({ message: "Failed to create newsletter" });
    }
  });

  app.post("/api/newsletters/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.sendNewsletter(id);
      res.json({ message: "Newsletter sent successfully" });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ message: "Failed to send newsletter" });
    }
  });

  // Knowledge base routes
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const { category } = req.query;
      const entries = await storage.getKnowledgeBase({ category: category as string });
      res.json(entries);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/knowledge-base", async (req, res) => {
    try {
      const validatedData = insertKnowledgeBaseSchema.parse(req.body);
      const entry = await storage.createKnowledgeEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating knowledge entry:", error);
      res.status(500).json({ message: "Failed to create knowledge entry" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const results = await storage.search(q as string);
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
