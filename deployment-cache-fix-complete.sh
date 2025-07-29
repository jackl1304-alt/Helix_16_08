#!/bin/bash
# Complete deployment cache fix script addressing all permission issues

set -e

echo "🔧 Applying complete deployment cache permission fixes..."

# Environment variables to fix npm cache and module access issues
export NPM_CONFIG_CACHE=/tmp/.npm
export NPM_CONFIG_TMP=/tmp
export NPM_CONFIG_INIT_CACHE=/tmp/.npm-init
export NPM_CONFIG_GLOBALCONFIG=/tmp/.npmrc-global
export NPM_CONFIG_USERCONFIG=/tmp/.npmrc-user
export DISABLE_NPM_CACHE=true
export DISABLE_OPENCOLLECTIVE=true
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"
export PORT=5000
export KEEP_DEV_DEPENDENCIES=true

# Additional environment variables for cache permission fixes
export NPM_CONFIG_PROGRESS=false
export NPM_CONFIG_LOGLEVEL=warn
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false
export NPM_CONFIG_UPDATE_NOTIFIER=false
export NPM_CONFIG_PACKAGE_LOCK=false
export NPM_CONFIG_SHRINKWRAP=false

echo "✅ All environment variables configured for cache permission fixes"

# Clear cache and create writable npm cache directory before building
echo "🧹 Clearing user cache directories (avoiding protected system files)..."

# Remove only user-accessible cache directories
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true
rm -rf /tmp/.npm 2>/dev/null || true
rm -rf /tmp/.npm-init 2>/dev/null || true

# Avoid touching protected replit cache directories completely
echo "⚠️  Protected Replit system directories preserved"

# Create all writable directories with proper permissions
mkdir -p /tmp/.npm
mkdir -p /tmp/.npm-init
mkdir -p /tmp/.npm-global
mkdir -p /tmp/.npm-user
chmod -R 755 /tmp/.npm*

# Create npm config files in writable locations
echo "📝 Creating npm configuration files in writable locations..."
echo "cache=/tmp/.npm" > /tmp/.npmrc-global
echo "tmp=/tmp" >> /tmp/.npmrc-global
echo "fund=false" >> /tmp/.npmrc-global
echo "audit=false" >> /tmp/.npmrc-global

echo "cache=/tmp/.npm" > /tmp/.npmrc-user
echo "tmp=/tmp" >> /tmp/.npmrc-user

echo "✅ Cache directories created and configured"

# Verify writable directory creation
echo "📁 Verifying writable directories..."
ls -la /tmp/.npm* 2>/dev/null || echo "Warning: Some cache directories may not be accessible"

# Clear npm cache safely
echo "🗑️  Clearing npm cache safely..."
npm cache clean --force 2>/dev/null || echo "Cache clean completed with warnings"

# Install dependencies with complete cache fixes
echo "📦 Installing dependencies with complete cache permission fixes..."
npm install \
  --cache=/tmp/.npm \
  --tmp=/tmp \
  --no-audit \
  --no-fund \
  --loglevel=warn \
  --userconfig=/tmp/.npmrc-user \
  --globalconfig=/tmp/.npmrc-global

# Build application with all fixes applied
echo "🏗️  Building application with complete cache fixes..."
npm run build

echo ""
echo "🎯 Complete deployment cache permission fixes applied successfully!"
echo ""
echo "📋 Applied fixes:"
echo "  ✅ Created .npmrc file to redirect npm cache to writable location"
echo "  ✅ Updated build command to clear cache and create writable directories"
echo "  ✅ Added environment variables to fix npm cache and module access"
echo "  ✅ Disabled all problematic npm features"
echo "  ✅ Created writable npm configuration files"
echo ""
echo "🚀 Application ready for deployment!"