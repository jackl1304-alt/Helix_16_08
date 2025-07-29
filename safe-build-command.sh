#!/bin/bash
# Safe Build Command mit allen Cache-Fixes

echo "🔧 Starting safe build with all cache fixes..."

# Set deployment environment
source deployment-environment-setup.sh

# Clear problematic files
rm -f package-lock.json npm-shrinkwrap.json 2>/dev/null || true

# Safe npm install first  
echo "📦 Running safe npm install..."
npm install --no-package-lock --no-shrinkwrap --no-optional --force

# Build with cache isolation
echo "🏗️ Building with cache isolation..."
NPM_CONFIG_CACHE="/tmp/npm-safe-cache" npm run build

# Copy static files
echo "📁 Copying static files..."
cp -r dist/public/* server/public/ 2>/dev/null || true

echo "✅ Safe build completed successfully"