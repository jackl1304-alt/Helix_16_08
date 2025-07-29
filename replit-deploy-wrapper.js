#!/usr/bin/env node
// Wrapper script for Replit deployment

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🚀 Starting Replit deployment wrapper...');

// Set environment variables
process.env.NPM_CONFIG_CACHE = '/tmp/npm-deployment-cache';
process.env.NPM_CONFIG_TMP = '/tmp';
process.env.NPM_CONFIG_PREFIX = '/tmp/npm-prefix';
process.env.NPM_CONFIG_FUND = 'false';
process.env.NPM_CONFIG_AUDIT = 'false';
process.env.NPM_CONFIG_UPDATE_NOTIFIER = 'false';
process.env.NPM_CONFIG_PROGRESS = 'false';
process.env.NPM_CONFIG_PACKAGE_LOCK = 'false';
process.env.NPM_CONFIG_ENGINE_STRICT = 'false';

// Create cache directories
const dirs = [
  '/tmp/npm-deployment-cache',
  '/tmp/npm-prefix',
  '/tmp/npm-store',
  '/tmp/npm-logs'
];

dirs.forEach(dir => {
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
    console.log(`✅ Created: ${dir}`);
  } catch (err) {
    console.log(`⚠️ Directory exists: ${dir}`);
  }
});

// Run npm install
console.log('📦 Installing dependencies...');
const install = spawn('npm', ['install', '--no-package-lock', '--no-shrinkwrap', '--no-optional'], {
  stdio: 'inherit',
  env: process.env
});

install.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Dependencies installed successfully');
    
    // Run build
    console.log('🏗️ Building application...');
    const build = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      env: process.env
    });
    
    build.on('close', (buildCode) => {
      if (buildCode === 0) {
        console.log('✅ Build completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Build failed');
        process.exit(1);
      }
    });
  } else {
    console.error('❌ Dependency installation failed');
    process.exit(1);
  }
});