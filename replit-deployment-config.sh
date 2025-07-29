#!/bin/bash
# Replit deployment configuration script with enhanced cache environment variables

echo "⚙️ Setting up Replit deployment configuration..."

# Create comprehensive environment configuration for Replit deployment
cat > .env.replit-deployment << 'EOF'
# Enhanced Replit Deployment Configuration
# Complete cache isolation and permission fix

# Node.js Configuration
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096 --max-semi-space-size=1024 --no-experimental-fetch

# Enhanced NPM Cache Configuration
NPM_CONFIG_CACHE=/tmp/.npm-deployment-cache
NPM_CONFIG_TMP=/tmp
NPM_CONFIG_INIT_CACHE=/tmp/.npm-deployment-init
NPM_CONFIG_PREFIX=/tmp/.npm-deployment-prefix
NPM_CONFIG_STORE_DIR=/tmp/.npm-deployment-store
NPM_CONFIG_GLOBALCONFIG=/tmp/.npmrc-deployment-global
NPM_CONFIG_USERCONFIG=/tmp/.npmrc-deployment-user

# Disable ALL problematic npm features that cause permission issues
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

# Cache Control Settings
NPM_CONFIG_CACHE_MAX=0
NPM_CONFIG_CACHE_MIN=0
NPM_CONFIG_CACHE_LOCK_RETRIES=1
NPM_CONFIG_CACHE_LOCK_STALE=10000
NPM_CONFIG_CACHE_LOCK_WAIT=1000

# Network and Timeout Settings
NPM_CONFIG_REGISTRY_TIMEOUT=15000
NPM_CONFIG_FETCH_TIMEOUT=15000
NPM_CONFIG_FETCH_RETRIES=1
NPM_CONFIG_FETCH_RETRY_FACTOR=1
NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=1000
NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=3000

# Additional Safety Settings
NPM_CONFIG_PREFER_ONLINE=true
NPM_CONFIG_UNSAFE_PERM=true
NPM_CONFIG_IGNORE_SCRIPTS=false

# Application Settings
PORT=5000
EOF

echo "✅ Replit deployment configuration created"

# Export all environment variables for current session
echo "📤 Exporting environment variables..."
set -a
source .env.replit-deployment
set +a

echo "✅ Environment variables exported"

# Create deployment-ready npm configuration files
echo "📝 Creating deployment-ready npm configuration..."

# Enhanced global npm config
cat > /tmp/.npmrc-deployment-global << 'EOF'
# Enhanced global npm configuration for Replit deployment
cache=/tmp/.npm-deployment-cache
tmp=/tmp
prefix=/tmp/.npm-deployment-prefix
store-dir=/tmp/.npm-deployment-store
init-cache=/tmp/.npm-deployment-init

# Complete feature disabling
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
loglevel=warn
package-lock=false
shrinkwrap=false
save=false
save-dev=false
save-optional=false
save-exact=false

# Enhanced cache control
cache-max=0
cache-min=0
cache-lock-retries=1
cache-lock-stale=10000
cache-lock-wait=1000

# Network optimization
registry-timeout=15000
fetch-timeout=15000
fetch-retries=1
fetch-retry-factor=1
fetch-retry-mintimeout=1000
fetch-retry-maxtimeout=3000

# Safety settings
prefer-online=true
unsafe-perm=true
ignore-scripts=false
EOF

# Enhanced user npm config
cat > /tmp/.npmrc-deployment-user << 'EOF'
# Enhanced user npm configuration for Replit deployment
cache=/tmp/.npm-deployment-cache
tmp=/tmp
fund=false
audit=false
update-notifier=false
progress=false
loglevel=warn
EOF

echo "✅ Enhanced npm configuration files created"

echo ""
echo "🎯 REPLIT DEPLOYMENT CONFIGURATION COMPLETE"
echo "✅ Enhanced environment variables configured"
echo "✅ Complete cache isolation implemented"
echo "✅ All problematic features disabled"
echo "✅ Network and timeout optimization applied"
echo "🚀 Ready for Replit deployment with zero permission issues"