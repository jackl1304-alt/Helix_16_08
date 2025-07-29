#!/bin/bash
# Start application with cache permission fixes
# This script ensures the application starts with all deployment fixes applied

echo "🚀 Starting Helix Regulatory Platform with cache permission fixes..."

# Apply all cache permission fixes
export NPM_CONFIG_CACHE=/tmp/.npm
export DISABLE_NPM_CACHE=true
export DISABLE_OPENCOLLECTIVE=true
export NODE_OPTIONS="--max-old-space-size=4096"
export KEEP_DEV_DEPENDENCIES=true
export NPM_CONFIG_PROGRESS=false
export NPM_CONFIG_LOGLEVEL=warn
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false
export NPM_CONFIG_UPDATE_NOTIFIER=false
export NODE_ENV=development
export PORT=5000

# Ensure cache directory exists with proper permissions
mkdir -p /tmp/.npm
chmod 755 /tmp/.npm

echo "✅ Cache permission fixes applied"
echo "🎯 Starting development server..."

# Start the development server
npm run dev