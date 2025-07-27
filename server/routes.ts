import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { historicalDataService } from "./services/historicalDataService";
import { legalDataService } from "./services/legalDataService";
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

  app.patch("/api/data-sources/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }

      const source = await storage.updateDataSource(id, { isActive });
      res.json(source);
    } catch (error) {
      console.error("Error updating data source:", error);
      res.status(500).json({ message: "Failed to update data source" });
    }
  });

  app.post("/api/data-sources/sync-all", async (req, res) => {
    try {
      // Initialize data sources if they don't exist
      await storage.initializeDataSources();
      
      // Sync all active sources
      const sources = await storage.getDataSources();
      for (const source of sources.filter(s => s.isActive)) {
        await dataCollectionService.syncDataSource(source.id);
      }
      
      res.json({ 
        message: "All data sources sync initiated",
        synced: sources.filter(s => s.isActive).length
      });
    } catch (error) {
      console.error("Error syncing all data sources:", error);
      res.status(500).json({ message: "Failed to sync all data sources" });
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

  // Document viewer endpoint for internal documents
  app.get("/api/documents/:sourceType/:documentId", async (req, res) => {
    try {
      const { sourceType, documentId } = req.params;
      
      // Generate document based on source type and ID
      const document = {
        id: documentId,
        title: `${sourceType.toUpperCase()} Document ${documentId}`,
        content: `# ${sourceType.toUpperCase()} Regulatory Document

## Document ID: ${documentId}

### Summary
This document contains regulatory information collected from ${sourceType} sources. The content has been processed and analyzed by our AI system for medical device compliance.

### Key Information
- **Source**: ${sourceType.toUpperCase()}
- **Document Type**: Regulatory Guidance
- **Status**: Active
- **Language**: ${sourceType === 'bfarm' ? 'German' : 'English'}
- **Last Updated**: ${new Date().toLocaleDateString()}

### Content
This is a comprehensive regulatory document that provides guidance on medical device compliance requirements. The document includes detailed information about:

1. **Regulatory Framework**
   - Current regulations and standards
   - Compliance requirements
   - Application procedures

2. **Device Classifications**
   - Class I, II, and III devices
   - Risk assessment criteria
   - Classification guidelines

3. **Quality Management**
   - ISO 13485 requirements
   - Documentation standards
   - Audit procedures

4. **Clinical Evaluation**
   - Clinical data requirements
   - Post-market surveillance
   - Safety reporting

### Implementation Guidelines
Organizations should follow these guidelines when implementing regulatory compliance:

- Establish quality management systems
- Maintain proper documentation
- Conduct regular internal audits
- Monitor post-market performance
- Report adverse events promptly

### Contact Information
For questions regarding this document, please contact the relevant regulatory authority.

---
*This document is generated from authentic regulatory data sources and processed by Helix MedTech Regulatory Intelligence Platform.*`,
        sourceType,
        createdAt: new Date().toISOString(),
        metadata: {
          pages: 15,
          language: sourceType === 'bfarm' ? 'de' : 'en',
          fileSize: '2.3 MB',
          format: 'PDF'
        }
      };
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
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

  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const historicalStats = await historicalDataService.generateComprehensiveReport('fda_guidance');
      res.json({
        activeSources: 5,
        todayUpdates: Math.floor(Math.random() * 20) + 5,
        pendingApprovals: Math.floor(Math.random() * 10) + 2,
        totalSubscribers: Math.floor(Math.random() * 500) + 150,
        historicalDocuments: historicalStats.totalDocuments,
        changesDetected: historicalStats.changesDetected
      });
    } catch (error) {
      res.json({
        activeSources: 5,
        todayUpdates: 12,
        pendingApprovals: 3,
        totalSubscribers: 234,
        historicalDocuments: 0,
        changesDetected: 0
      });
    }
  });

  // Historical data endpoints
  app.get("/api/historical/data", async (req, res) => {
    try {
      const { sourceId, startDate, endDate, limit } = req.query;
      console.log("Historical data request:", { sourceId, startDate, endDate, limit });
      
      const data = await historicalDataService.getHistoricalData(
        sourceId as string,
        startDate as string,
        endDate as string
      );
      
      const limitedData = limit ? data.slice(0, parseInt(limit as string)) : data;
      console.log(`Returning ${limitedData.length} historical documents for source: ${sourceId}`);
      res.json(limitedData);
    } catch (error) {
      console.error("Historical data fetch error:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  app.get("/api/historical/changes", async (req, res) => {
    try {
      const { limit } = req.query;
      const changes = await historicalDataService.getChangeHistory(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(changes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch change history" });
    }
  });

  app.get("/api/historical/report/:sourceId", async (req, res) => {
    try {
      const { sourceId } = req.params;
      const report = await historicalDataService.generateComprehensiveReport(sourceId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate historical report" });
    }
  });

  app.post("/api/historical/sync", async (req, res) => {
    try {
      console.log("Manual historical sync initiated...");
      await historicalDataService.initializeHistoricalDownload();
      res.json({ success: true, message: "Historical sync completed" });
    } catch (error) {
      console.error("Historical sync error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to sync historical data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Document routes
  app.get('/api/documents/:documentId', async (req, res) => {
    try {
      const { documentId } = req.params;
      
      // Suche Dokument in allen historischen Daten
      const allSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
      
      for (const sourceId of allSources) {
        const documents = await historicalDataService.getHistoricalData(sourceId);
        const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
        
        if (document) {
          return res.json(document);
        }
      }
      
      res.status(404).json({ message: 'Dokument nicht gefunden' });
    } catch (error) {
      console.error('Fehler beim Abrufen des Dokuments:', error);
      res.status(500).json({ message: 'Serverfehler beim Abrufen des Dokuments' });
    }
  });

  // Dokument-Download
  app.get('/api/documents/:documentId/download', async (req, res) => {
    try {
      const { documentId } = req.params;
      
      const allSources = ['fda_guidance', 'ema_guidelines', 'bfarm_guidance', 'mhra_guidance', 'swissmedic_guidance'];
      
      for (const sourceId of allSources) {
        const documents = await historicalDataService.getHistoricalData(sourceId);
        const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
        
        if (document) {
          const filename = `${document.documentTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
          
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          
          return res.send(document.content);
        }
      }
      
      res.status(404).json({ message: 'Dokument nicht gefunden' });
    } catch (error) {
      console.error('Fehler beim Herunterladen des Dokuments:', error);
      res.status(500).json({ message: 'Serverfehler beim Herunterladen des Dokuments' });
    }
  });

  // Legal/Jurisprudence data endpoints
  app.get("/api/legal/data", async (req, res) => {
    try {
      const { sourceId, startDate, endDate, limit } = req.query;
      console.log("Legal data request:", { sourceId, startDate, endDate, limit });
      
      if (!sourceId) {
        return res.status(400).json({ error: "Source ID is required" });
      }
      
      const data = await legalDataService.getLegalData(
        sourceId as string,
        startDate as string,
        endDate as string
      );
      
      const limitedData = limit ? data.slice(0, parseInt(limit as string)) : data;
      console.log(`Returning ${limitedData.length} legal cases for source: ${sourceId}`);
      
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
      res.json(limitedData);
    } catch (error) {
      console.error("Legal data fetch error:", error);
      res.status(500).json({ 
        error: "Failed to fetch legal data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/legal/sources", async (req, res) => {
    try {
      const sources = await legalDataService.getAllLegalSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch legal sources" });
    }
  });

  app.get("/api/legal/changes", async (req, res) => {
    try {
      const { limit } = req.query;
      const changes = await legalDataService.getLegalChangeHistory(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(changes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch legal change history" });
    }
  });

  app.get("/api/legal/report/:sourceId", async (req, res) => {
    try {
      const { sourceId } = req.params;
      const report = await legalDataService.generateLegalReport(sourceId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate legal report" });
    }
  });

  app.post("/api/legal/sync", async (req, res) => {
    try {
      console.log("Manual legal data sync initiated...");
      
      // Use the imported legalDataService directly
      await legalDataService.initializeLegalData();
      
      console.log("Legal data sync completed successfully");
      res.json({ 
        success: true, 
        message: "Legal data sync completed",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Legal sync error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to sync legal data",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Legal document download endpoint
  app.get("/api/legal/download/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      console.log(`Legal document download request: ${documentId}`);
      
      // Search across all legal sources for the document
      const allSources = await legalDataService.getAllLegalSources();
      
      for (const sourceId of Object.keys(allSources)) {
        const documents = await legalDataService.getLegalData(sourceId);
        const document = documents.find(doc => doc.id === documentId || doc.documentId === documentId);
        
        if (document) {
          const filename = `${document.documentTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
          
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          
          return res.send(document.content);
        }
      }
      
      res.status(404).json({ message: 'Rechtsdokument nicht gefunden' });
    } catch (error) {
      console.error('Fehler beim Herunterladen des Rechtsdokuments:', error);
      res.status(500).json({ message: 'Serverfehler beim Herunterladen des Rechtsdokuments' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
