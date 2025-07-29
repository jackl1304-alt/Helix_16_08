#!/usr/bin/env node

// Pre-build script for Replit Deployment
// This ensures static files are correctly placed for production

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('🔧 Replit Pre-build: Preparing static files...');

// Ensure server/public directory exists
const publicDir = path.join(__dirname, 'server', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created server/public directory');
}

// Check if dist/public exists (after vite build)
const distPublic = path.join(__dirname, 'dist', 'public');
if (fs.existsSync(distPublic)) {
  console.log('📁 Copying dist/public/* to server/public/...');
  copyRecursiveSync(distPublic, publicDir);
  console.log('✅ Static files copied successfully');
} else {
  console.log('⚠️  dist/public not found - build may not be complete');
}

console.log('🎉 Pre-build complete - Production deployment ready!');