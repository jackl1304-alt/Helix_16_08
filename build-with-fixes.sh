#!/bin/bash
# Enhanced build script with comprehensive cache permission fixes

echo "🔧 Applying enhanced deployment fixes..."

# Environment variables to disable npm caching and redirect cache to writable directory
export NPM_CONFIG_CACHE=/tmp/.npm
export NPM_CONFIG_TMP=/tmp
export NPM_CONFIG_INIT_CACHE=/tmp/.npm-init
export DISABLE_NPM_CACHE=true
export DISABLE_OPENCOLLECTIVE=true

# NODE_OPTIONS environment variable to increase memory limit for build process
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"

# PORT environment variable to match internal port configuration
export PORT=5000

# Additional cache and build environment variables
export NPM_CONFIG_PROGRESS=false
export NPM_CONFIG_LOGLEVEL=warn
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false
export NPM_CONFIG_UPDATE_NOTIFIER=false
export KEEP_DEV_DEPENDENCIES=true

echo "✅ Environment variables configured"

# Clear cache and create writable directories before building
echo "🧹 Clearing cache and creating writable directories..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true
rm -rf /tmp/.npm 2>/dev/null || true
rm -rf /tmp/.npm-init 2>/dev/null || true

# Create writable directories with proper permissions
mkdir -p /tmp/.npm
mkdir -p /tmp/.npm-init
chmod 755 /tmp/.npm
chmod 755 /tmp/.npm-init

echo "✅ Cache cleared and writable directories created"

# Verify directory permissions
echo "📁 Verifying directory permissions..."
ls -la /tmp/.npm 2>/dev/null || echo "Warning: /tmp/.npm not accessible"
ls -la /tmp/.npm-init 2>/dev/null || echo "Warning: /tmp/.npm-init not accessible"

# Install dependencies with enhanced cache settings
echo "📦 Installing dependencies with enhanced cache fixes..."
npm install --cache=/tmp/.npm --tmp=/tmp --no-audit --no-fund --loglevel=warn

# Build with all fixes applied
echo "🏗️ Building application with cache fixes..."
npm run build

echo "🎯 Enhanced build completed successfully!"