import express from "express";
import { gripService } from "../services/gripService";
import { logger } from "../services/logger.service";

const router = express.Router();

// Test GRIP connection
router.get("/test-connection", async (req, res) => {
  try {
    logger.info("Testing GRIP connection");
    const isConnected = await gripService.testConnection();
    
    res.json({
      success: isConnected,
      message: isConnected ? "GRIP connection successful" : "GRIP connection failed",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error testing GRIP connection", { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      message: "Error testing GRIP connection",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Extract data from GRIP
router.post("/extract", async (req, res) => {
  try {
    logger.info("Starting GRIP data extraction");
    const extractedData = await gripService.extractRegulatoryData();
    
    res.json({
      success: true,
      message: `Successfully extracted ${extractedData.length} items from GRIP`,
      count: extractedData.length,
      data: extractedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error extracting GRIP data", { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      message: "Error extracting GRIP data",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get GRIP extraction status
router.get("/status", async (req, res) => {
  try {
    const isConnected = await gripService.testConnection();
    
    res.json({
      status: isConnected ? "connected" : "disconnected",
      platform: "GRIP Regulatory Intelligence",
      endpoint: "https://grip-app.pureglobal.com",
      lastCheck: new Date().toISOString(),
      authenticated: isConnected
    });
  } catch (error) {
    logger.error("Error getting GRIP status", { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      status: "error",
      message: "Error checking GRIP status",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;