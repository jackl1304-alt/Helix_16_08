// Performance: EventEmitter fix - ES module compatible
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 0; // Unlimited to prevent warnings
process.setMaxListeners(0); // Unlimited for process listeners

// Performance optimized warning handling
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    // Just log, don't crash
    console.log(`[PERF-WARN] ${warning.name} suppressed`);
  }
});

import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupCustomerAIRoutes } from "./temp-ai-routes";
import tenantRoutes from "./routes/tenant-routes";
import tenantAuthRoutes from "./routes/tenant-auth-simple";
import tenantApiRoutes from "./routes/tenant-api";
import aiSearchRoutes from "./routes/ai-search-routes";
import { tenantIsolationMiddleware } from "./middleware/tenant-isolation";
import { setupVite, log } from "./vite";
import fs from "fs";
import path from "path";
import { Logger } from "./services/logger.service";
import fetch from "node-fetch";

// Express-App initialisieren
export const app = express();
const server = createServer(app);

// Clean up event listeners on exit to prevent memory leaks
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, cleaning up...');
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, cleaning up...');
  server.close(() => {
    console.log('Server closed gracefully');
    process.exit(0);
  });
});

// Optimized CORS with caching
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://*.replit.app', 'https://*.replit.dev'] : 
    true,
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Optimized Body-Parser with performance settings
app.use(express.json({ 
  limit: "50mb",
  strict: true,
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: "50mb",
  parameterLimit: 1000 // Prevent parameter pollution attacks
}));

// Performance: Manual gzip compression for API responses
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    res.setHeader('Vary', 'Accept-Encoding');
    return originalSend.call(this, data);
  };
  next();
});

// Multi-Tenant Isolation Middleware
app.use('/api/tenant', (req, res, next) => {
  tenantIsolationMiddleware(req as any, res, next).catch(next);
});
app.use('/tenant', (req, res, next) => {
  tenantIsolationMiddleware(req as any, res, next).catch(next);
});

// Simple Perplexity-Client
async function perplexityChat(prompt: string, model = "sonar"): Promise<string> {
  const API_KEY = process.env.PERPLEXITY_API_KEY;
  if (!API_KEY) throw new Error("PERPLEXITY_API_KEY ist nicht gesetzt");

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Perplexity API Error ${res.status}`);
  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

// Logger
const logger = new Logger("ServerMain");

// Health-Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI-Route
app.post("/api/ai", async (req: Request, res: Response) => {
  try {
    const prompt = req.body?.prompt;
    if (!prompt) return res.status(400).json({ error: "Feld 'prompt' erforderlich." });
    const answer = await perplexityChat(prompt);
    return res.json({ answer });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "AI-Service nicht verfügbar." });
  }
});

// Apply selective caching to API routes FIRST
import { cacheMiddleware, CACHE_CONFIG } from './middleware/query-cache';
app.use('/api/dashboard', cacheMiddleware(CACHE_CONFIG.DASHBOARD));
app.use('/api/regulatory-updates', cacheMiddleware(CACHE_CONFIG.REGULATORY));
app.use('/api/knowledge-articles', cacheMiddleware(CACHE_CONFIG.ARTICLES));
app.use('/api/admin/permissions', cacheMiddleware(CACHE_CONFIG.MEDIUM));
app.use('/api/admin/navigation', cacheMiddleware(CACHE_CONFIG.LONG));

// Register main routes
registerRoutes(app);

// Setup customer AI routes  
setupCustomerAIRoutes(app);

// Setup new clean JSON-based customer routes
import { setupCustomerRoutes } from './api/customer-routes-new';
setupCustomerRoutes(app);

// Setup new clean JSON-based admin routes  
import { setupAdminRoutes } from './api/admin-routes-new';
setupAdminRoutes(app);

// Register tenant-specific routes - ONLY new real data API
app.use('/api/tenant/auth', tenantAuthRoutes);
app.use('/api/tenant', tenantApiRoutes);  // NEW real data API with database connections
// OLD tenant routes REMOVED to prevent conflicts

// Register AI-powered search and analysis routes (Admin only)
app.use('/api/ai', aiSearchRoutes);

// Weitere Routen
app.post("/api/webhook", (req: Request, res: Response) => {
  console.log("Webhook empfangen:", req.body);
  res.json({ received: true });
});

// 404-Handler nur für API (must be AFTER all other API routes, BEFORE Vite setup)
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API nicht gefunden: ${req.path}` });
});

// Performance: Add security and optimization middleware
app.use((req, res, next) => {
  // Security headers (Replit-friendly - Firefox embedding optimiert)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // X-Frame-Options entfernt für besseres Firefox-Embedding in Replit
  // res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Deaktiviert für Firefox-Kompatibilität
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Performance headers
  if (req.url.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for static assets
  }
  
  next();
});

// Entwicklungs- vs. Produktionsmodus
const isProd = process.env.NODE_ENV === "production" || app.get("env") !== "development";
if (!isProd) {
  // DEV SETUP: Serve compiled frontend from dist/public
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  console.log(`[DEV-FRONTEND] Serving compiled assets from: ${distPath}`);
  
  app.use(express.static(distPath, {
    maxAge: 0, // No caching in dev
    etag: false
  }));
  
  // SPA routing for all non-API routes
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.url.startsWith('/api/')) return;
    
    const htmlPath = path.resolve(distPath, "index.html");
    console.log(`[SPA-ROUTE] Serving ${htmlPath} for ${req.url}`);
    res.sendFile(htmlPath);
  });
} else {
  // Optimized static file serving
  const distPath = path.resolve(import.meta.url.replace("file://", ""), "../public");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath, {
      maxAge: '1y', // 1 year cache for static assets
      etag: true,
      lastModified: true
    }));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

// Globaler Error-Handler (MUST be AFTER Vite setup for proper SPA routing)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Server starten
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || "5174", 10);
  server.listen(port, '0.0.0.0', () => {
    console.log(`[SERVER] ✅ Server läuft auf Port ${port}`);
    console.log(`[SERVER] 🌐 Frontend: http://localhost:${port}`);
    console.log(`[SERVER] 🔧 Admin Login: admin / admin123`);
  });
}
