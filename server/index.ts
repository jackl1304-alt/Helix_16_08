// Production-optimized logging: Only debug in development
if (process.env.NODE_ENV === 'development') {
  console.log(`[ENV DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[ENV DEBUG] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(`[ENV DEBUG] DATABASE_URL type: ${process.env.DATABASE_URL?.includes("neondb") ? "Production Neon" : "Development"}`);
  console.log(`[ENV DEBUG] REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);
}

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupCustomerAIRoutes } from "./temp-ai-routes";
import { setupVite, serveStatic, log } from "./vite";
import { emailService } from "./services/emailService";
import { historicalDataService } from "./services/historicalDataService";
import { legalDataService } from "./services/legalDataService";
import { Logger } from "./services/logger.service";
import fs from "fs";
import path from "path";

// Initialize structured logger for production-ready logging
const logger = new Logger('ServerMain');

// Increase EventEmitter limits to prevent memory leak warnings
process.setMaxListeners(15);

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
  // Production-optimized environment logging
  logger.info('Starting Helix Platform', {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    port: process.env.PORT,
    isReplitDeployment: !!process.env.REPLIT_DEPLOYMENT
  });
  
  // Initialize email service and verify connection
  logger.info("Initializing email service...");
  try {
    const { emailService } = await import("./services/emailService.js");
    await emailService.testConnection();
    logger.info("Email service initialized successfully");
  } catch (error) {
    logger.warn("Email service initialization failed", error);
  }
  
  // Optimized: Start background initialization without blocking server startup
  logger.info("Starting background data initialization...");
  const { storage } = await import("./storage.js");
  const { backgroundInitService } = await import("./services/backgroundInitService.js");
  
  // Start background init without waiting
  backgroundInitService.startBackgroundInit();
  
  // Initialize caching service
  logger.info("Initializing caching service...");
  const { cachingService } = await import("./services/cachingService.js");
  
  // Log successful startup
  logger.info("Helix Platform successfully initialized with background services");
  


  // REGISTER ALL API ROUTES FIRST - BEFORE ANY CATCH-ALL MIDDLEWARE
  console.log("[STARTUP] Registering all API routes...");
  
  // Register all primary API routes
  await registerRoutes(app);
  
  // Register customer AI routes
  setupCustomerAIRoutes(app);
  
  // Register all secondary API routes
  const { default: knowledgeExtractionRoutes } = await import("./routes/knowledge-extraction.routes");
  app.use("/api/knowledge-extraction", knowledgeExtractionRoutes);

  console.log("[STARTUP] All API routes registered successfully");
  
  // ONLY AFTER ALL ROUTES ARE REGISTERED: Add 404 handler for missing API routes
  app.use('/api/*', (req, res, next) => {
    console.log(`[API-404] Route not found: ${req.method} ${req.path}`);
    return res.status(404).json({ 
      error: `API endpoint not found: ${req.path}`,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });
  
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
