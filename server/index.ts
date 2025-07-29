// DEBUG ENVIRONMENT VARIABLES AT STARTUP
console.log(`[ENV DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[ENV DEBUG] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
console.log(`[ENV DEBUG] DATABASE_URL first 30 chars: ${process.env.DATABASE_URL?.substring(0, 30)}`);
console.log(`[ENV DEBUG] REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { emailService } from "./services/emailService";
import { historicalDataService } from "./services/historicalDataService";
import { legalDataService } from "./services/legalDataService";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  
  // Initialize data sources for production deployment
  console.log("Initializing data sources...");
  const { storage } = await import("./storage-morning.js");
  
  try {
    const existingSources = await storage.getAllDataSources();
    console.log(`Found ${existingSources.length} existing data sources`);
    
    if (existingSources.length === 0) {
      console.log("Creating default data sources for production...");
      
      const defaultSources = [
        {
          id: 'fda_510k',
          name: 'FDA 510(k) Database',
          endpoint: 'https://api.fda.gov/device/510k.json',
          country: 'US',
          region: 'North America',
          type: 'regulatory',
          category: 'approvals',
          isActive: true
        },
        {
          id: 'ema_epar',
          name: 'EMA EPAR',
          endpoint: 'https://www.ema.europa.eu/en/medicines',
          country: 'EU',
          region: 'Europe',
          type: 'regulatory',
          category: 'approvals', 
          isActive: true
        },
        {
          id: 'bfarm_guidelines',
          name: 'BfArM Leitfäden',
          endpoint: 'https://www.bfarm.de',
          country: 'DE',
          region: 'Europe',
          type: 'guidelines',
          category: 'guidelines',
          isActive: true
        }
      ];
      
      for (const source of defaultSources) {
        await storage.createDataSource(source);
        console.log(`Created data source: ${source.name}`);
      }
      
      console.log("Default data sources created successfully");
    }
  } catch (error) {
    console.error("Error initializing data sources:", error);
  }

  // Initialize historical data service
  console.log("Initializing historical data collection...");
  await historicalDataService.initializeHistoricalDownload();
  await historicalDataService.setupContinuousMonitoring();
  
  // Initialize legal/jurisprudence data
  console.log("Initializing legal jurisprudence database...");
  await legalDataService.initializeLegalData();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Force production mode for hosting
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1" || app.get("env") !== "development";
  
  console.log(`Environment: ${app.get("env")}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`Using production mode: ${isProduction}`);
  
  if (!isProduction) {
    console.log("Setting up Vite development server");
    await setupVite(app, server);
  } else {
    console.log("Setting up static file serving for production");
    const distPath = path.resolve(import.meta.dirname, "public");
    console.log(`Static files path: ${distPath}`);
    console.log(`Static files exist: ${fs.existsSync(distPath)}`);
    if (fs.existsSync(distPath)) {
      console.log(`Static files content: ${fs.readdirSync(distPath)}`);
    }
    serveStatic(app);
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
