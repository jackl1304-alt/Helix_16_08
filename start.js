#!/usr/bin/env node

// Production start script for Render.com deployment
// This ensures proper environment setup and graceful startup

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 5000;

// Log startup info
console.log('🚀 Starting Helix Regulatory Platform...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔌 Port: ${process.env.PORT}`);
console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'No DATABASE_URL found'}`);

// Import and start the main application
try {
  await import('./dist/index.js');
  console.log('✅ Helix Platform started successfully');
} catch (error) {
  console.error('❌ Failed to start Helix Platform:', error);
  process.exit(1);
}