#!/usr/bin/env node
// Replit Deployment Wrapper - Umgeht package.json Limitierungen

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Replit Deployment Wrapper - Starting...');

// Determine if this is build or start phase
const args = process.argv.slice(2);
const isStart = args.includes('start') || process.env.NODE_ENV === 'production';

if (isStart) {
  console.log('📦 Starting production server with fixes...');
  
  // Ensure static files are in place
  spawn('bash', ['replit-hosting-complete-fix.sh'], { 
    stdio: 'inherit',
    cwd: process.cwd()
  }).on('close', (code) => {
    if (code === 0) {
      // Start the production server
      spawn('node', ['dist/index.js'], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'production', PORT: '5000' }
      });
    }
  });
} else {
  console.log('🔧 Building with cache fixes...');
  
  // Run build with fixes
  spawn('bash', ['build-with-fixes.sh'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
}