#!/bin/bash
# Pre-build script to create cache directory with proper permissions

echo "🔧 Pre-build: Creating cache directories with proper permissions..."

# Environment variables to disable npm caching and redirect to writable temporary directory
export NPM_CONFIG_CACHE=/tmp/.npm-cache
export NPM_CONFIG_TMP=/tmp
export NPM_CONFIG_INIT_CACHE=/tmp/.npm-init
export NPM_CONFIG_GLOBALCONFIG=/tmp/.npmrc-global
export NPM_CONFIG_USERCONFIG=/tmp/.npmrc-user
export DISABLE_NPM_CACHE=true
export DISABLE_OPENCOLLECTIVE=true
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"
export PORT=5000

echo "✅ Environment variables configured"

# Create cache directory with proper permissions
mkdir -p /tmp/.npm-cache
mkdir -p /tmp/.npm-init  
mkdir -p /tmp/.npm-global
mkdir -p /tmp/.npm-user
chmod -R 755 /tmp/.npm*

echo "✅ Cache directories created with proper permissions:"
ls -la /tmp/.npm*

# Create .npmrc files in writable locations
echo "cache=/tmp/.npm-cache" > /tmp/.npmrc-global
echo "tmp=/tmp" >> /tmp/.npmrc-global
echo "fund=false" >> /tmp/.npmrc-global
echo "audit=false" >> /tmp/.npmrc-global
echo "update-notifier=false" >> /tmp/.npmrc-global

echo "cache=/tmp/.npm-cache" > /tmp/.npmrc-user
echo "tmp=/tmp" >> /tmp/.npmrc-user

echo "✅ NPM configuration files created in writable locations"

# Clear any problematic cache directories (avoiding protected Replit files)
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true

echo "✅ Pre-build setup complete - ready for deployment"