#!/usr/bin/env node

/**
 * Deployment Preparation Script for Helix
 * This script helps ensure all dependencies are properly configured for deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const log = (message) => console.log(`[DEPLOY-PREP] ${message}`);

async function prepareDeployment() {
  try {
    log('Starting deployment preparation...');
    
    // 1. Verify core dependencies are installed
    const requiredPackages = [
      'cors',
      'express',
      'drizzle-orm',
      'zod',
      '@tanstack/react-query',
      'nodemailer'
    ];
    
    log('Checking required packages...');
    for (const pkg of requiredPackages) {
      try {
        const packagePath = path.join(process.cwd(), 'node_modules', pkg);
        if (!fs.existsSync(packagePath)) {
          throw new Error(`Package ${pkg} not found`);
        }
        log(`✓ ${pkg} found`);
      } catch (error) {
        log(`✗ ${pkg} missing or invalid`);
        throw error;
      }
    }
    
    // 2. Build the application
    log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 3. Verify build output
    const buildPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(buildPath)) {
      throw new Error('Build output not found');
    }
    
    const indexPath = path.join(buildPath, 'index.js');
    if (!fs.existsSync(indexPath)) {
      throw new Error('Server bundle not found');
    }
    
    log('✓ Build completed successfully');
    
    // 4. Check if cors is properly imported in the build
    const buildContent = fs.readFileSync(indexPath, 'utf-8');
    if (!buildContent.includes('cors')) {
      throw new Error('CORS package not found in build output');
    }
    
    log('✓ CORS dependency verified in build');
    
    // 5. Create a package info file for debugging
    const packageInfo = {
      buildTime: new Date().toISOString(),
      nodeVersion: process.version,
      dependencies: requiredPackages,
      buildVerified: true
    };
    
    fs.writeFileSync(
      path.join(buildPath, 'package-info.json'),
      JSON.stringify(packageInfo, null, 2)
    );
    
    log('✓ Deployment preparation completed successfully');
    log('Your application is ready for deployment!');
    
  } catch (error) {
    log(`✗ Deployment preparation failed: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  prepareDeployment();
}