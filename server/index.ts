// DEBUG ENVIRONMENT VARIABLES AT STARTUP
console.log(`[ENV DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[ENV DEBUG] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
console.log(`[ENV DEBUG] DATABASE_URL first 30 chars: ${process.env.DATABASE_URL?.substring(0, 30)}`);
console.log(`[ENV DEBUG] REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { emailService } from "./services/emailService";
import { historicalDataService } from "./services/historicalDataService";
import { legalDataService } from "./services/legalDataService";
import fs from "fs";
import path from "path";

const app = express();
// Increase payload size limits for duplicate deletion operations
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Debug environment variables
  console.log(`[ENV] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[ENV] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(`[ENV] PORT: ${process.env.PORT}`);
  console.log(`[ENV] REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);
  
  // Initialize email service and verify connection
  console.log("Initializing email service...");
  await emailService.verifyConnection();
  
  // CRITICAL: Force initialize data sources for production deployment
  console.log("PRODUCTION DEPLOYMENT: Initializing data sources...");
  const { storage } = await import("./storage.js");
  
  try {
    const existingSources = await storage.getAllDataSources();
    console.log(`Found ${existingSources.length} existing data sources`);
    
    // ALWAYS ensure minimum 21+ data sources exist for production
    const requiredSources = [
      // North America - FDA & Health Canada
      { id: 'fda_510k', name: 'FDA 510(k) Database', endpoint: 'https://api.fda.gov/device/510k.json', country: 'US', region: 'North America', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'fda_pma', name: 'FDA PMA Database', endpoint: 'https://api.fda.gov/device/pma.json', country: 'US', region: 'North America', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'fda_recalls', name: 'FDA Device Recalls', endpoint: 'https://api.fda.gov/device/recall.json', country: 'US', region: 'North America', type: 'safety', category: 'recalls', isActive: true },
      { id: 'fda_guidance', name: 'FDA Guidance Documents', endpoint: 'https://www.fda.gov/medical-devices/guidance-documents-medical-devices-and-radiation-emitting-products', country: 'US', region: 'North America', type: 'guidance', category: 'guidelines', isActive: true },
      { id: 'health_canada', name: 'Health Canada', endpoint: 'https://www.canada.ca/en/health-canada', country: 'CA', region: 'North America', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'health_canada_recalls', name: 'Health Canada Recalls', endpoint: 'https://recalls-rappels.canada.ca/en/search/site', country: 'CA', region: 'North America', type: 'safety', category: 'recalls', isActive: true },
      
      // Europe - EMA & National Authorities
      { id: 'ema_epar', name: 'EMA EPAR', endpoint: 'https://www.ema.europa.eu/en/medicines', country: 'EU', region: 'Europe', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'ema_guidelines', name: 'EMA Guidelines', endpoint: 'https://www.ema.europa.eu/en/human-regulatory/research-development/scientific-guidelines', country: 'EU', region: 'Europe', type: 'guidance', category: 'guidelines', isActive: true },
      { id: 'bfarm_guidelines', name: 'BfArM Leitfäden', endpoint: 'https://www.bfarm.de', country: 'DE', region: 'Europe', type: 'guidelines', category: 'guidelines', isActive: true },
      { id: 'bfarm_approvals', name: 'BfArM Zulassungen', endpoint: 'https://www.bfarm.de/DE/Medizinprodukte/_node.html', country: 'DE', region: 'Europe', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'swissmedic_guidelines', name: 'Swissmedic Guidelines', endpoint: 'https://www.swissmedic.ch', country: 'CH', region: 'Europe', type: 'guidelines', category: 'guidelines', isActive: true },
      { id: 'swissmedic_approvals', name: 'Swissmedic Approvals', endpoint: 'https://www.swissmedic.ch/swissmedic/en/home/medical-devices', country: 'CH', region: 'Europe', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'mhra_guidance', name: 'MHRA Guidance', endpoint: 'https://www.gov.uk/mhra', country: 'UK', region: 'Europe', type: 'guidance', category: 'guidelines', isActive: true },
      { id: 'mhra_alerts', name: 'MHRA Safety Alerts', endpoint: 'https://www.gov.uk/drug-device-alerts', country: 'UK', region: 'Europe', type: 'safety', category: 'alerts', isActive: true },
      { id: 'ansm_france', name: 'ANSM France', endpoint: 'https://ansm.sante.fr/Produits-de-sante/Dispositifs-medicaux-et-dispositifs-medicaux-de-diagnostic-in-vitro', country: 'FR', region: 'Europe', type: 'regulatory', category: 'approvals', isActive: true },
      
      // Asia-Pacific
      { id: 'tga_australia', name: 'TGA Australia', endpoint: 'https://www.tga.gov.au', country: 'AU', region: 'Asia-Pacific', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'pmda_japan', name: 'PMDA Japan', endpoint: 'https://www.pmda.go.jp/english/review-services/outline/devices/0002.html', country: 'JP', region: 'Asia-Pacific', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'nmpa_china', name: 'NMPA China', endpoint: 'https://www.nmpa.gov.cn/datasearch/search-info.html', country: 'CN', region: 'Asia-Pacific', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'cdsco_india', name: 'CDSCO India', endpoint: 'https://cdsco.gov.in/opencms/opencms/en/Home/', country: 'IN', region: 'Asia-Pacific', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'hsa_singapore', name: 'HSA Singapore', endpoint: 'https://www.hsa.gov.sg/medical-devices', country: 'SG', region: 'Asia-Pacific', type: 'regulatory', category: 'approvals', isActive: true },
      
      // South America
      { id: 'anvisa_brazil', name: 'ANVISA Brazil', endpoint: 'https://www.gov.br/anvisa/pt-br', country: 'BR', region: 'South America', type: 'regulatory', category: 'approvals', isActive: true },
      { id: 'anmat_argentina', name: 'ANMAT Argentina', endpoint: 'https://www.argentina.gob.ar/anmat', country: 'AR', region: 'South America', type: 'regulatory', category: 'approvals', isActive: true },
      
      // International Standards & Others
      { id: 'iso_standards', name: 'ISO Medical Device Standards', endpoint: 'https://www.iso.org/committee/54892.html', country: 'INTL', region: 'International', type: 'standards', category: 'standards', isActive: true },
      { id: 'iec_standards', name: 'IEC Medical Standards', endpoint: 'https://www.iec.ch/dyn/www/f?p=103:7:0::::FSP_ORG_ID:1316', country: 'INTL', region: 'International', type: 'standards', category: 'standards', isActive: true },
      { id: 'who_prequalification', name: 'WHO Prequalification', endpoint: 'https://extranet.who.int/pqweb/medical-devices', country: 'INTL', region: 'International', type: 'qualification', category: 'approvals', isActive: true }
    ];
    
    for (const source of requiredSources) {
      try {
        await storage.createDataSource(source);
        console.log(`✓ Created/Updated data source: ${source.name}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.log(`ℹ Data source ${source.name} already exists or error: ${errorMessage}`);
      }
    }
    
    const finalCount = await storage.getAllDataSources();
    console.log(`PRODUCTION READY: ${finalCount.length} data sources available`);
    
  } catch (error) {
    console.error("CRITICAL: Error initializing data sources:", error);
  }

  // Initialize historical data service
  console.log("Initializing historical data collection...");
  
  // Initialize legal/jurisprudence data
  console.log("Initializing legal jurisprudence database...");
  
  // CRITICAL: Force Production database initialization based on environment
  const isProductionDB = process.env.REPLIT_DEPLOYMENT === "1" || 
                         process.env.NODE_ENV === "production" ||
                         process.env.DATABASE_URL?.includes("neondb") ||
                         !process.env.DATABASE_URL?.includes("localhost");
                         
  // Additional Production detection for replit.app domain
  const isReplitApp = process.env.REPLIT_DEPLOYMENT === "1" || 
                      process.env.DATABASE_URL?.includes("@ep-") ||
                      process.env.DATABASE_URL?.includes(".replit.app") ||
                      typeof process !== 'undefined' && process.env.HOSTNAME?.includes("replit");
  
  console.log(`ENVIRONMENT DETECTION: isProductionDB=${isProductionDB}`);
  console.log(`REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`DATABASE_URL type: ${process.env.DATABASE_URL?.includes("neondb") ? "Production Neon" : "Development"}`);
  
  try {
    const currentLegalCases = await storage.getAllLegalCases();
    console.log(`Current legal cases in database: ${currentLegalCases.length}`);
    
    // CRITICAL: More aggressive detection for replit.app live deployment
    const isLiveDeployment = process.env.DATABASE_URL?.includes("neondb") || 
                           process.env.DATABASE_URL?.includes("@ep-") ||
                           process.env.DATABASE_URL?.includes(".replit.app") ||
                           !process.env.DATABASE_URL?.includes("localhost");

    // AGGRESSIVELY FORCE INITIALIZATION - ALWAYS initialize if 0 legal cases
    if (currentLegalCases.length === 0) {
      console.log("🚨 ZERO LEGAL CASES DETECTED: Triggering IMMEDIATE FORCE initialization...");
      await legalDataService.initializeLegalData();
      
      const updatedLegalCount = await storage.getAllLegalCases();
      console.log(`✅ ZERO CASE FIX: After forced initialization: ${updatedLegalCount.length} legal cases`);
    } else if ((isProductionDB || isReplitApp || isLiveDeployment) && currentLegalCases.length < 2000) {
      console.log("🚨 LIVE DEPLOYMENT DETECTED: Insufficient legal cases, triggering IMMEDIATE initialization...");
      await legalDataService.initializeLegalData();
      
      const updatedLegalCount = await storage.getAllLegalCases();
      console.log(`✅ LIVE DEPLOYMENT: After forced initialization: ${updatedLegalCount.length} legal cases`);
    } else if (currentLegalCases.length < 500) {
      console.log("PRODUCTION/REPLIT DETECTED: Insufficient legal cases, triggering FORCED initialization...");
      await legalDataService.initializeLegalData();
      
      const updatedLegalCount = await storage.getAllLegalCases();
      console.log(`PRODUCTION: After forced initialization: ${updatedLegalCount.length} legal cases`);
    } else if (currentLegalCases.length < 100) {
      console.log("DEVELOPMENT: Database has insufficient legal cases, triggering initialization...");
      await legalDataService.initializeLegalData();
      
      const updatedLegalCount = await storage.getAllLegalCases();
      console.log(`DEVELOPMENT: After initialization: ${updatedLegalCount.length} legal cases`);
    } else {
      console.log(`DATABASE STATUS: Contains ${currentLegalCases.length} legal cases - skipping initialization`);
    }
  } catch (error) {
    console.error("CRITICAL: Error with legal data initialization:", error);
    // Force initialization on any error
    console.log("FALLBACK: Forcing legal data initialization due to error...");
    await legalDataService.initializeLegalData();
  }
  
  // CRITICAL: Force initialize regulatory updates for production  
  console.log("CHECKING REGULATORY UPDATES for Production/Development...");
  try {
    const { dataCollectionService } = await import("./services/dataCollectionService.js");
    
    // Check current regulatory updates count
    const currentUpdates = await storage.getAllRegulatoryUpdates();
    console.log(`Current regulatory updates in database: ${currentUpdates.length}`);
    
    // Force initialization if production OR if insufficient data  
    if ((isProductionDB || isReplitApp) && currentUpdates.length === 0) {
      console.log("🚨 LIVE DEPLOYMENT DETECTED: ZERO regulatory updates, triggering IMMEDIATE collection...");
      await dataCollectionService.performInitialDataCollection();
      
      const updatedCount = await storage.getAllRegulatoryUpdates();
      console.log(`✅ LIVE DEPLOYMENT: After forced collection: ${updatedCount.length} regulatory updates`);
    } else if (currentUpdates.length < 1000) {
      console.log("PRODUCTION/REPLIT DETECTED: Insufficient regulatory updates, triggering FORCED collection...");
      await dataCollectionService.performInitialDataCollection();
      
      const updatedCount = await storage.getAllRegulatoryUpdates();
      console.log(`PRODUCTION: After forced collection: ${updatedCount.length} regulatory updates`);
    } else if (currentUpdates.length < 100) {
      console.log("DEVELOPMENT: Database has insufficient updates, triggering data collection...");
      await dataCollectionService.performInitialDataCollection();
      
      const updatedCount = await storage.getAllRegulatoryUpdates();
      console.log(`DEVELOPMENT: After collection: ${updatedCount.length} regulatory updates`);
    } else {
      console.log(`DATABASE STATUS: Contains ${currentUpdates.length} regulatory updates - skipping collection`);
    }
    
  } catch (error) {
    console.error("CRITICAL: Error with regulatory updates initialization:", error);
    // Force collection on any error
    console.log("FALLBACK: Forcing regulatory data collection due to error...");
    try {
      const { dataCollectionService } = await import("./services/dataCollectionService.js");
      await dataCollectionService.performInitialDataCollection();
    } catch (fallbackError) {
      console.error("FALLBACK FAILED:", fallbackError);
    }
  }
  


  // CRITICAL: Block HTML fallback for ALL API routes - FORCE JSON ONLY
  app.use('/api/*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    console.log(`[CRITICAL] API ROUTE DETECTED: ${req.path} - FORCING JSON ONLY`);
    next();
  });

  // REGISTER API ROUTES FIRST - HIGHEST PRIORITY
  const { default: knowledgeExtractionRoutes } = await import("./routes/knowledge-extraction.routes");
  app.use("/api/knowledge-extraction", knowledgeExtractionRoutes);
  
  registerRoutes(app);
  
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Test both modes: use actual environment detection
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1" || app.get("env") !== "development";
  
  console.log(`Environment: ${app.get("env")}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`Using production mode: ${isProduction}`);
  
  if (!isProduction) {
    console.log("Setting up Vite development server");
    await setupVite(app, server);
  } else {
    console.log("Setting up CUSTOM static file serving to preserve API routes");
    const distPath = path.resolve(import.meta.dirname, "public");
    console.log(`Static files path: ${distPath}`);
    console.log(`Static files exist: ${fs.existsSync(distPath)}`);
    if (fs.existsSync(distPath)) {
      console.log(`Static files content: ${fs.readdirSync(distPath)}`);
      
      // CRITICAL FIX: Serve static files WITHOUT overriding API routes
      app.use(express.static(distPath));
      
      // ONLY fallback to index.html for NON-API routes
      app.use((req, res, next) => {
        if (req.path.startsWith('/api/')) {
          console.log(`API ROUTE BLOCKED from HTML fallback: ${req.path}`);
          return res.status(404).json({ error: `API route not found: ${req.path}` });
        }
        // Fallback to SPA for all non-API routes
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      console.warn("Static files not found, serving API only");
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
