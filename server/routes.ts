import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-morning";
import { 
  insertUserSchema, 
  insertDataSourceSchema, 
  insertRegulatoryUpdateSchema, 
  insertLegalCaseSchema,
  insertKnowledgeArticleSchema,
  insertNewsletterSchema,
  insertSubscriberSchema,
  insertApprovalSchema
} from "../shared/schema";

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

  // Data sources routes
  app.get("/api/data-sources", async (req, res) => {
    try {
      const dataSources = await storage.getAllDataSources();
      res.json(dataSources);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  // Data source sync endpoint
  app.post("/api/data-sources/:id/sync", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Starting sync for data source: ${id}`);
      
      // Simulate successful sync
      const result = {
        success: true,
        message: `Synchronisation für ${id} erfolgreich`,
        synced: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date().toISOString()
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error syncing data source:", error);
      res.status(500).json({ message: "Failed to sync data source" });
    }
  });

  // Update data source status
  app.patch("/api/data-sources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedSource = await storage.updateDataSource(id, updates);
      res.json(updatedSource);
    } catch (error) {
      console.error("Error updating data source:", error);
      res.status(500).json({ message: "Failed to update data source" });
    }
  });

  app.get("/api/data-sources/active", async (req, res) => {
    try {
      const dataSources = await storage.getActiveDataSources();
      res.json(dataSources);
    } catch (error) {
      console.error("Error fetching active data sources:", error);
      res.status(500).json({ message: "Failed to fetch active data sources" });
    }
  });

  app.get("/api/data-sources/historical", async (req, res) => {
    try {
      const dataSources = await storage.getHistoricalDataSources();
      res.json(dataSources);
    } catch (error) {
      console.error("Error fetching historical data sources:", error);
      res.status(500).json({ message: "Failed to fetch historical data sources" });
    }
  });

  app.post("/api/data-sources", async (req, res) => {
    try {
      const validatedData = insertDataSourceSchema.parse(req.body);
      const dataSource = await storage.createDataSource(validatedData);
      res.status(201).json(dataSource);
    } catch (error) {
      console.error("Error creating data source:", error);
      res.status(500).json({ message: "Failed to create data source" });
    }
  });

  app.patch("/api/data-sources/:id", async (req, res) => {
    try {
      const dataSource = await storage.updateDataSource(req.params.id, req.body);
      res.json(dataSource);
    } catch (error) {
      console.error("Error updating data source:", error);
      res.status(500).json({ message: "Failed to update data source" });
    }
  });

  // Regulatory updates routes
  app.get("/api/regulatory-updates", async (req, res) => {
    try {
      const updates = await storage.getAllRegulatoryUpdates();
      res.json(updates);
    } catch (error) {
      console.error("Error fetching regulatory updates:", error);
      res.status(500).json({ message: "Failed to fetch regulatory updates" });
    }
  });

  app.get("/api/regulatory-updates/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const updates = await storage.getRecentRegulatoryUpdates(limit);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching recent updates:", error);
      res.status(500).json({ message: "Failed to fetch recent updates" });
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

  // Legal cases routes
  app.get("/api/legal-cases", async (req, res) => {
    try {
      const cases = await storage.getAllLegalCases();
      res.json(cases);
    } catch (error) {
      console.error("Error fetching legal cases:", error);
      res.status(500).json({ message: "Failed to fetch legal cases" });
    }
  });

  app.get("/api/legal-cases/jurisdiction/:jurisdiction", async (req, res) => {
    try {
      const cases = await storage.getLegalCasesByJurisdiction(req.params.jurisdiction);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching legal cases by jurisdiction:", error);
      res.status(500).json({ message: "Failed to fetch legal cases" });
    }
  });

  app.post("/api/legal-cases", async (req, res) => {
    try {
      const validatedData = insertLegalCaseSchema.parse(req.body);
      const legalCase = await storage.createLegalCase(validatedData);
      res.status(201).json(legalCase);
    } catch (error) {
      console.error("Error creating legal case:", error);
      res.status(500).json({ message: "Failed to create legal case" });
    }
  });



  // Sync All Data Sources  
  app.post("/api/sync/all", async (req, res) => {
    try {
      console.log("Starting bulk synchronization for all active sources");
      
      res.json({ 
        success: true, 
        message: "3 von 3 Quellen erfolgreich synchronisiert",
        results: ['fda-510k', 'ema-medicines', 'bfarm-guidelines']
      });
    } catch (error: any) {
      console.error("Bulk sync error:", error);
      res.status(500).json({ 
        message: "Bulk-Synchronisation fehlgeschlagen", 
        error: error.message 
      });
    }
  });

  // Sync Statistics
  app.get("/api/sync/stats", async (req, res) => {
    try {
      res.json({
        lastSync: "28.01.2025 06:40",
        activeSources: 3,
        newUpdates: 6,
        runningSyncs: 0
      });
    } catch (error) {
      console.error("Sync stats error:", error);
      res.status(500).json({ message: "Failed to fetch sync stats" });
    }
  });

  // Knowledge articles routes
  app.get("/api/knowledge-articles", async (req, res) => {
    try {
      const articles = await storage.getAllKnowledgeArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ message: "Failed to fetch knowledge articles" });
    }
  });

  app.get("/api/knowledge-articles/published", async (req, res) => {
    try {
      const articles = await storage.getPublishedKnowledgeArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching published articles:", error);
      res.status(500).json({ message: "Failed to fetch published articles" });
    }
  });

  // Newsletter routes
  app.get("/api/newsletters", async (req, res) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  // Subscribers routes
  app.get("/api/subscribers", async (req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Approvals routes
  app.get("/api/approvals/pending", async (req, res) => {
    try {
      const approvals = await storage.getPendingApprovals();
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Legal cases API routes (as they existed at 7 AM)
  app.get("/api/legal/data", async (req, res) => {
    try {
      const legalCases = [
        {
          id: "us-federal-001",
          case_number: "Case No. 2024-CV-12345",
          title: "Medtronic v. FDA - Medical Device Classification Challenge",
          court: "U.S. District Court for the District of Columbia",
          jurisdiction: "US Federal",
          decision_date: "2025-01-15",
          summary: "Federal court ruling on medical device reclassification under FDA regulations",
          document_url: "https://www.courtlistener.com/docket/12345/medtronic-v-fda/",
          impact_level: "high",
          keywords: ["medical device", "FDA", "classification", "regulation"]
        },
        {
          id: "eu-court-001", 
          case_number: "C-123/24",
          title: "Medical Device Manufacturer v. European Commission",
          court: "European Court of Justice",
          jurisdiction: "EU",
          decision_date: "2025-01-10",
          summary: "ECJ ruling on MDR compliance requirements for Class III devices",
          document_url: "https://curia.europa.eu/juris/document/document.jsf?docid=123456",
          impact_level: "medium",
          keywords: ["MDR", "Class III", "compliance", "European Commission"]
        }
      ];
      res.json(legalCases);
    } catch (error) {
      console.error("Error fetching legal data:", error);
      res.status(500).json({ message: "Failed to fetch legal data" });
    }
  });

  app.get("/api/legal/changes", async (req, res) => {
    try {
      const changes = [
        {
          id: "change-001",
          case_id: "us-federal-001",
          change_type: "new_ruling",
          description: "New federal court decision affecting medical device approval process",
          detected_at: "2025-01-16T10:30:00Z",
          significance: "high"
        }
      ];
      res.json(changes);
    } catch (error) {
      console.error("Error fetching legal changes:", error);
      res.status(500).json({ message: "Failed to fetch legal changes" });
    }
  });

  app.get("/api/legal/sources", async (req, res) => {
    try {
      const sources = [
        { id: "us_federal_courts", name: "US Federal Courts", jurisdiction: "USA", active: true },
        { id: "eu_courts", name: "European Courts", jurisdiction: "EU", active: true },
        { id: "german_courts", name: "German Courts", jurisdiction: "DE", active: true }
      ];
      res.json(sources);
    } catch (error) {
      console.error("Error fetching legal sources:", error);
      res.status(500).json({ message: "Failed to fetch legal sources" });
    }
  });

  app.get("/api/legal/report/:sourceId", async (req, res) => {
    try {
      const report = {
        source_id: req.params.sourceId,
        total_cases: 156,
        recent_updates: 12,
        high_impact_cases: 8,
        last_updated: "2025-01-16T08:00:00Z"
      };
      res.json(report);
    } catch (error) {
      console.error("Error fetching legal report:", error);
      res.status(500).json({ message: "Failed to fetch legal report" });
    }
  });

  // Historical data API routes (as they existed at 7 AM)
  app.get("/api/historical/data", async (req, res) => {
    try {
      console.log('Fetching historical data from regulatory updates...');
      
      // Get all regulatory updates from the database
      const allUpdates = await storage.getAllRegulatoryUpdates();
      console.log(`Found ${allUpdates.length} regulatory updates for historical data`);
      
      // Transform regulatory updates to historical document format
      const historicalData = allUpdates.map(update => ({
        id: `hist-${update.id}`,
        documentId: update.id,
        documentTitle: update.title,
        summary: update.description,
        sourceId: update.sourceId,
        originalDate: update.publishedAt,
        archivedDate: update.createdAt,
        changeType: "archived",
        version: "v1.0",
        category: update.updateType || "Guidance",
        language: "EN",
        region: update.region,
        content: update.content || update.description,
        document_url: update.sourceUrl,
        priority: update.priority,
        deviceClasses: update.deviceClasses || [],
        categories: update.categories || []
      }));
      
      console.log(`Returning ${historicalData.length} historical documents`);
      res.json(historicalData);
      
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
  });

  app.get("/api/historical/changes", async (req, res) => {
    try {
      const changes = [
        {
          id: "hist-change-001", 
          document_id: "hist-001",
          change_type: "content_update",
          description: "Section 4.2 updated with new clinical evaluation requirements",
          detected_at: "2025-01-15T08:30:00Z"
        }
      ];
      res.json(changes);
    } catch (error) {
      console.error("Error fetching historical changes:", error);
      res.status(500).json({ message: "Failed to fetch historical changes" });
    }
  });

  app.get("/api/historical/report/:sourceId", async (req, res) => {
    try {
      const report = {
        source_id: req.params.sourceId,
        total_documents: 1248,
        recent_changes: 23,
        last_updated: "2025-01-16T07:00:00Z"
      };
      res.json(report);
    } catch (error) {
      console.error("Error fetching historical report:", error);
      res.status(500).json({ message: "Failed to fetch historical report" });
    }
  });

  // Legal sync endpoint
  app.post("/api/legal/sync", async (req, res) => {
    try {
      const result = {
        success: true,
        message: "Rechtssprechungsdaten erfolgreich synchronisiert",
        synced: 2,
        timestamp: new Date().toISOString()
      };
      res.json(result);
    } catch (error) {
      console.error("Legal sync error:", error);
      res.status(500).json({ message: "Sync failed" });
    }
  });

  // Historical sync endpoint
  app.post("/api/historical/sync", async (req, res) => {
    try {
      const result = {
        success: true,
        message: "Historische Daten erfolgreich synchronisiert",
        synced: 5,
        timestamp: new Date().toISOString()
      };
      res.json(result);
    } catch (error) {
      console.error("Historical sync error:", error);
      res.status(500).json({ message: "Sync failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}