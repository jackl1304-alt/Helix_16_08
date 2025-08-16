// MINIMALER FUNKTIONSFÄHIGER SERVER
import express from "express";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS für Replit
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Minimal API routes
registerRoutes(app);

// FIXED: Serve frontend mit korrekten MIME-Types  
const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
app.use(express.static(distPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// SPA fallback
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) return;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.resolve(distPath, 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`[SIMPLE-SERVER] ✅ Server läuft auf Port ${port}`);
  console.log(`[SIMPLE-SERVER] 🌐 Frontend: http://localhost:${port}`);
  console.log(`[SIMPLE-SERVER] 🔧 Admin Login: admin / admin123`);
});