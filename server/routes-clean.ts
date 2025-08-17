import express from "express";
import simpleApiRoutes from "./routes/simple-api";
import { Logger } from "./services/logger.service";

const logger = new Logger('CleanRoutes');

export function registerCleanRoutes(app: express.Application): void {
  // Register the new simple API routes
  app.use("/api", simpleApiRoutes);

  logger.info('Clean JSON-API routes registered successfully');
}