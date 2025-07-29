#!/bin/bash
# Enhanced deployment script for Replit with complete cache isolation

echo "🚀 Enhanced Replit Deployment - Complete Cache Isolation"

# Apply enhanced pre-build fixes
echo "🔧 Applying enhanced pre-build fixes..."
source enhanced-pre-build.sh

# Run enhanced build
echo "🏗️ Running enhanced build..."
source enhanced-build.sh

if [ $? -ne 0 ]; then
  echo "❌ Enhanced build failed"
  exit 1
fi

# Create environment file for deployment
echo "📝 Creating deployment environment file..."
cat > .env.deployment << 'EOF'
# Enhanced Replit deployment environment
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096 --max-semi-space-size=1024

# Enhanced npm cache configuration
NPM_CONFIG_CACHE=/tmp/.npm-deployment-cache
NPM_CONFIG_TMP=/tmp
NPM_CONFIG_INIT_CACHE=/tmp/.npm-deployment-init
NPM_CONFIG_PREFIX=/tmp/.npm-deployment-prefix
NPM_CONFIG_STORE_DIR=/tmp/.npm-deployment-store
NPM_CONFIG_GLOBALCONFIG=/tmp/.npmrc-deployment-global
NPM_CONFIG_USERCONFIG=/tmp/.npmrc-deployment-user

# Disable all problematic npm features
DISABLE_NPM_CACHE=true
DISABLE_OPENCOLLECTIVE=true
NPM_CONFIG_PROGRESS=false
NPM_CONFIG_LOGLEVEL=warn
NPM_CONFIG_AUDIT=false
NPM_CONFIG_FUND=false
NPM_CONFIG_UPDATE_NOTIFIER=false
NPM_CONFIG_PACKAGE_LOCK=false
NPM_CONFIG_SHRINKWRAP=false
NPM_CONFIG_SAVE=false
NPM_CONFIG_SAVE_DEV=false
NPM_CONFIG_SAVE_OPTIONAL=false
NPM_CONFIG_SAVE_EXACT=false
EOF

echo "✅ Deployment environment file created"

# Start the application with enhanced settings
echo "🌟 Starting application with enhanced settings..."
exec node dist/index.js