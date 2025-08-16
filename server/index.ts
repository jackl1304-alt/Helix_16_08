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

// ALLE API-ROUTEN MÜSSEN VOR VITE KOMMEN!

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

// Register AI-powered search and analysis routes (Admin only)
app.use('/api/ai', aiSearchRoutes);

// Weitere API-Routen
app.post("/api/webhook", (req: Request, res: Response) => {
  console.log("Webhook empfangen:", req.body);
  res.json({ received: true });
});

// 404-Handler ONLY für API - muss VOR Vite kommen
app.use("/api/*", (req, res) => {
  console.log(`[404-API] Route nicht gefunden: ${req.path}`);
  res.status(404).json({ error: `API nicht gefunden: ${req.path}` });
});

console.log('[MIDDLEWARE-ORDER] Alle API-Routen registriert, Vite Setup folgt...');

// Security middleware - NACH API-Routen, VOR Vite
app.use((req, res, next) => {
  // Nur für statische Assets, nicht für API
  if (!req.url.startsWith('/api/')) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

// FIXED: Serve compiled frontend directly mit korrekten MIME-Types
const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
console.log(`[FRONTEND-SERVING] Serving compiled assets from: ${distPath}`);

// FIXED: Express Static mit expliziten MIME-Types
app.use(express.static(distPath, {
  maxAge: 0,
  etag: false,
  setHeaders: (res, filePath) => {
    console.log(`[MIME-FIX] Serving file: ${filePath}`);
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      console.log('[MIME-FIX] Set Content-Type: application/javascript for JS file');
    }
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    // CORS-Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// SPA fallback for non-API routes
app.get("*", (req, res) => {
  if (req.url.startsWith('/api/')) {
    return; // API routes already handled above
  }
  
  console.log(`[SPA-FALLBACK] Serving index.html for: ${req.url}`);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.resolve(distPath, "index.html"));
});

// Globaler Error-Handler (MUST be AFTER Vite setup for proper SPA routing)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Server starten - FIXED Port 5000
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || "5000", 10); // FIXED: Standard Port 5000
  server.listen(port, '0.0.0.0', () => {
    console.log(`[SERVER] ✅ Server läuft auf Port ${port}`);
    console.log(`[SERVER] 🌐 Frontend: http://localhost:${port}`);
    console.log(`[SERVER] 🔧 Admin Login: admin / admin123`);
    console.log(`[FRONTEND-FIX] MIME-Types konfiguriert, Service Worker deaktiviert`);
  });
}
