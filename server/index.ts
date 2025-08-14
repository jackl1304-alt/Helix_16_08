// Debug only in development
if (process.env.NODE_ENV === "development") {
  console.log(`[ENV DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[ENV DEBUG] DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  console.log(
    `[ENV DEBUG] DATABASE_URL type: ${
      process.env.DATABASE_URL?.includes("neondb") ? "Production Neon" : "Development"
    }`
  );
  console.log(`[ENV DEBUG] REPLIT_DEPLOYMENT: ${process.env.REPLIT_DEPLOYMENT}`);
}

import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupCustomerAIRoutes } from "./temp-ai-routes";
import { setupVite, log } from "./vite";
import fs from "fs";
import path from "path";
import { Logger } from "./services/logger.service";
import fetch from "node-fetch";
import { EventEmitter } from "events";

// Raise listener caps (avoid noisy warnings; ideally ensure global listeners are registered only once elsewhere)
EventEmitter.defaultMaxListeners = 30;
process.setMaxListeners(30);

// Simple Perplexity API client
async function perplexityChat(prompt: string, model = "sonar"): Promise<string> {
  const API_KEY = process.env.PERPLEXITY_API_KEY;
  if (!API_KEY) throw new Error("PERPLEXITY_API_KEY ist nicht gesetzt");

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Perplexity API Error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Unerwartetes Antwortformat von Perplexity");
  return content;
}

const logger = new Logger("ServerMain");

const app = express();
const server = createServer(app);

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// API request logger
app.use((req, res, next) => {
  const start = Date.now();
  const urlPath = req.path;
  let captured: unknown;
  const original = res.json;
  // @ts-ignore
  res.json = function (body: unknown, ...args: any[]) {
    captured = body;
    // @ts-ignore
    return original.apply(this, [body, ...args]);
  };
  res.on("finish", () => {
    const ms = Date.now() - start;
    if (urlPath.startsWith("/api")) {
      let line = `${req.method} ${urlPath} ${res.statusCode} in ${ms}ms`;
      if (captured) {
        try {
          const text = JSON.stringify(captured);
          if (text.length < 300) line += ` :: ${text}`;
        } catch {}
      }
      log(line);
    }
  });
  next();
});

(async () => {
  // Startup info
  logger.info("Starting Helix Platform", {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    port: process.env.PORT,
    isReplitDeployment: !!process.env.REPLIT_DEPLOYMENT,
  });

  // Background init (non-blocking)
  try {
    const { backgroundInitService } = await import("./services/backgroundInitService.js");
    backgroundInitService.startBackgroundInit();
  } catch (e) {
    logger.warn("Background init failed", e as any);
  }

  // Register primary routes
  console.log("[STARTUP] Registering all API routes...");
  await registerRoutes(app);
  setupCustomerAIRoutes(app);

  // Perplexity AI endpoint
  app.post("/api/ai", async (req: Request, res: Response) => {
    try {
      const prompt = req.body?.prompt;
      const model = req.body?.model ?? "sonar";
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Feld 'prompt' (string) ist erforderlich." });
      }
      const answer = await perplexityChat(prompt, model);
      return res.json({ answer });
    } catch (err: any) {
      console.error("AI route error:", err?.message || err);
      return res.status(500).json({ error: "AI-Service momentan nicht verfügbar." });
    }
  });

  console.log("[STARTUP] All API routes registered successfully");

  // 404 only for API
  app.use("/api/*", (req, res) => {
    return res.status(404).json({
      error: `API endpoint not found: ${req.path}`,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Environment detection (no inadvertent assignments)
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.REPLIT_DEPLOYMENT === "1" ||
    app.get("env") !== "development";

  console.log(`Environment: ${app.get("env")}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`Using production mode: ${isProduction}`);

  if (!isProduction) {
    console.log("Setting up Vite development server");
    await setupVite(app, server);
  } else {
    console.log("Setting up static file serving (production)");
    const distPath = path.resolve(import.meta.dirname, "public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use((req, res) => {
        if (req.path.startsWith("/api/")) {
          return res.status(404).json({ error: `API route not found: ${req.path}` });
        }
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      console.warn("No static files found, API only.");
    }
  }

  // Port handling: prefer env PORT (Replit supplies this), fallback to 5174 (avoid 5000)
  const port = parseInt(process.env.PORT || "5174", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
