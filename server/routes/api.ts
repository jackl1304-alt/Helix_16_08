import express from "express";

const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.json({
    status: "online",
    message: "Backend-Verbindung erfolgreich",
    timestamp: new Date().toISOString()
  });
});

// Data Endpoint
router.get('/data', (req, res) => {
  res.json({
    message: "JSON-Daten erfolgreich geladen",
    data: {
      connections: "aktiv",
      system: "bereit",
      format: "json"
    },
    timestamp: new Date().toISOString()
  });
});

// Config Endpoint
router.get('/config', (req, res) => {
  res.json({
    system_name: "JSON System",
    version: "1.0.0",
    backend_status: "active",
    frontend_status: "active",
    connections: {
      database: false,
      api: true,
      json: true
    }
  });
});

export default router;