#!/usr/bin/env node

/**
 * Alternative production build script for Helix
 * This script creates a more self-contained build for deployment
 */

import { build } from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const log = (message) => console.log(`[PROD-BUILD] ${message}`);

async function buildForProduction() {
  try {
    log('Starting production build...');
    
    // 1. First build the frontend with Vite
    log('Building frontend...');
    execSync('npx vite build', { stdio: 'inherit' });
    
    // 2. Build the backend with selective bundling
    log('Building backend...');
    
    // Bundle common problematic packages but keep Node.js built-ins external
    const bundlePackages = [
      'cors',
      'express',
      'drizzle-orm',
      'drizzle-zod', 
      'zod',
      'nanoid',
      'memoizee',
      'archiver',
      'cheerio',
      'axios',
      'node-fetch'
    ];
    
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outdir: 'dist',
      external: [
        // Keep Node.js built-ins external
        'fs',
        'path',
        'http',
        'https',
        'crypto',
        'os',
        'url',
        'util',
        'events',
        'stream',
        'buffer',
        'querystring',
        'child_process',
        // Keep large/complex packages external but ensure they're in dependencies
        'nodemailer',
        '@anthropic-ai/sdk',
        'openai',
        '@sendgrid/mail',
        'winston',
        'pg',
        '@neondatabase/serverless',
        'passport',
        'passport-local',
        'express-session',
        'connect-pg-simple',
        'memorystore'
      ],
      define: {
        'import.meta.url': 'import.meta.url'
      },
      banner: {
        js: `
// Production build banner
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
        `.trim()
      }
    });
    
    // 3. Create a minimal package.json for production
    log('Creating production package.json...');
    
    const originalPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    
    // Only include essential runtime dependencies
    const prodDependencies = {
      'nodemailer': originalPkg.dependencies.nodemailer,
      '@anthropic-ai/sdk': originalPkg.dependencies['@anthropic-ai/sdk'],
      'openai': originalPkg.dependencies.openai,
      '@sendgrid/mail': originalPkg.dependencies['@sendgrid/mail'],
      'winston': originalPkg.dependencies.winston,
      'pg': originalPkg.dependencies.pg || '^8.11.3',
      '@neondatabase/serverless': originalPkg.dependencies['@neondatabase/serverless'],
      'passport': originalPkg.dependencies.passport,
      'passport-local': originalPkg.dependencies['passport-local'],
      'express-session': originalPkg.dependencies['express-session'],
      'connect-pg-simple': originalPkg.dependencies['connect-pg-simple'],
      'memorystore': originalPkg.dependencies.memorystore
    };
    
    const prodPackage = {
      name: originalPkg.name,
      version: originalPkg.version,
      type: 'module',
      scripts: {
        start: 'node index.js'
      },
      dependencies: prodDependencies
    };
    
    fs.writeFileSync(
      path.join('dist', 'package.json'),
      JSON.stringify(prodPackage, null, 2)
    );
    
    // 4. Create deployment info
    const deployInfo = {
      buildTime: new Date().toISOString(),
      buildType: 'production-optimized',
      bundledPackages: bundlePackages,
      externalPackages: Object.keys(prodDependencies),
      nodeVersion: process.version
    };
    
    fs.writeFileSync(
      path.join('dist', 'deploy-info.json'),
      JSON.stringify(deployInfo, null, 2)
    );
    
    log('✅ Production build completed successfully!');
    log('📦 Build artifacts:');
    log('  - dist/index.js (server bundle)');
    log('  - dist/public/ (frontend assets)');
    log('  - dist/package.json (production dependencies)');
    log('  - dist/deploy-info.json (build information)');
    
  } catch (error) {
    log(`❌ Production build failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildForProduction();
}