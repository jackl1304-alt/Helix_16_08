#!/bin/bash
# Fix Rollup Dependencies Issue

echo "🔧 Fixing Rollup Dependencies Issue..."

# Set environment
source deployment-environment-setup.sh

# Clean everything
rm -rf node_modules package-lock.json npm-shrinkwrap.json 2>/dev/null

# Install with specific rollup fix
echo "📦 Installing dependencies with rollup fix..."
npm install --no-package-lock --no-optional --no-shrinkwrap

# Manually install missing rollup binary
echo "🛠️ Installing missing rollup binary..."
npm install @rollup/rollup-linux-x64-gnu --save-dev --no-package-lock

# Verify rollup installation
echo "✅ Verifying rollup installation..."
npx rollup --version || echo "Rollup not working"

echo "🏗️ Attempting build..."
npm run build

echo "✅ Rollup dependencies fixed"