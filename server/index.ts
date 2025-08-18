import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import path from "path";
import { Logger } from "./services/logger.service";

// Simple Express-App ohne komplexe Middleware
export const app = express();
const server = createServer(app);
const logger = new Logger('HelixServer');

// Basic Middleware - NO complex tenant isolation
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Security headers for iframe embedding - AGGRESSIVE OVERRIDE
app.use((req, res, next) => {
  // Override X-Frame-Options completely
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Override response headers after they're set
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    this.removeHeader('X-Frame-Options');
    return originalEnd.apply(this, args);
  };
  
  next();
});

// Simple Error Handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Server error', { error: error.message, path: req.path });
  res.status(500).json({ error: 'Internal server error' });
});

// Register Simple JSON-API Routes  
registerRoutes(app);

// Setup Vite in development
if (process.env.NODE_ENV !== "production") {
  setupVite(app, server);
} else {
  // Production static file serving
  app.use(express.static("dist/public"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("dist/public/index.html"));
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server  
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 HELIX Simple JSON-API Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔧 API Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});