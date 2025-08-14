import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupCustomerAIRoutes } from "./temp-ai-routes";
import { setupVite, log } from "./vite";
import fs from "fs";
import path from "path";
import { Logger } from "./services/logger.service";
import fetch from "node-fetch";
import { EventEmitter } from "events";

// Listener-Warnungen entschärfen
EventEmitter.defaultMaxListeners = 30;
process.setMaxListeners(30);

// Express-App initialisieren
export const app = express();
const server = createServer(app);

// CORS aktivieren (für alle Ursprünge, später einschränken)
app.use(cors({ origin: "*" }));

// Body-Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

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
    res.json({ answer });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "AI-Service nicht verfügbar." });
  }
});

// Weitere Routen
app.post("/api/webhook", (req: Request, res: Response) => {
  console.log("Webhook empfangen:", req.body);
  res.json({ received: true });
});

// 404-Handler nur für API
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API nicht gefunden: ${req.path}` });
});

// Globaler Error-Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Entwicklungs- vs. Produktionsmodus
const isProd = process.env.NODE_ENV === "production" || app.get("env") !== "development";
if (!isProd) {
  // Vite Dev-Server im Dev-Modus
  setupVite(app, server).catch(console.error);
} else {
  // Statische Dateien im Prod-Modus
  const distPath = path.resolve(import.meta.url.replace("file://", ""), "../public");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

// Server starten
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || "5174", 10);
  server.listen(port, () => {
    log(`Server läuft auf Port ${port}`);
  });
}
