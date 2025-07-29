#!/bin/bash

# Helix Deployment Script - Fix Node.js Module Cache Permission Issues
# This script applies the suggested fixes for deployment errors

echo "🚀 Starting Helix deployment with cache fixes..."

# Fix 1: Set environment variables to disable package caching
export NPM_CONFIG_CACHE=/tmp/.npm
export DISABLE_NPM_CACHE=true
export DISABLE_OPENCOLLECTIVE=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Fix 2: Keep development dependencies which may resolve module access issues
export KEEP_DEV_DEPENDENCIES=true

# Fix 3: Clear any cached files and restart deployment
echo "🧹 Clearing cached files..."
rm -rf node_modules/.cache
rm -rf .cache
npm cache clean --force

# Fix 4: Verify workspace directory doesn't contain special characters
echo "📁 Current directory: $(pwd)"
if [[ "$(pwd)" =~ [^a-zA-Z0-9/_-] ]]; then
    echo "⚠️  Warning: Directory path contains special characters that might cause issues"
    echo "Current path: $(pwd)"
fi

# Create temporary npm cache directory with proper permissions
mkdir -p /tmp/.npm
chmod 755 /tmp/.npm

echo "🔧 Building application with cache fixes..."

# Build with cache disabled
NPM_CONFIG_CACHE=/tmp/.npm \
DISABLE_NPM_CACHE=true \
NODE_OPTIONS="--max-old-space-size=4096" \
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting application..."
    
    # Start with production settings
    NPM_CONFIG_CACHE=/tmp/.npm \
    NODE_OPTIONS="--max-old-space-size=4096" \
    NODE_ENV=production \
    npm run start
else
    echo "❌ Build failed. Check the logs above for details."
    exit 1
fi