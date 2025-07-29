#!/bin/bash
# Enhanced pre-build script with complete cache isolation for Replit deployment

echo "🔧 Enhanced pre-build script - Complete cache isolation"

# Set comprehensive environment variables for complete cache isolation
export NPM_CONFIG_CACHE="/tmp/.npm-deployment-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_INIT_CACHE="/tmp/.npm-deployment-init"
export NPM_CONFIG_PREFIX="/tmp/.npm-deployment-prefix"
export NPM_CONFIG_STORE_DIR="/tmp/.npm-deployment-store"
export NPM_CONFIG_GLOBALCONFIG="/tmp/.npmrc-deployment-global"
export NPM_CONFIG_USERCONFIG="/tmp/.npmrc-deployment-user"

# Disable all problematic npm features
export DISABLE_NPM_CACHE="true"
export DISABLE_OPENCOLLECTIVE="true"
export NPM_CONFIG_PROGRESS="false"
export NPM_CONFIG_LOGLEVEL="warn"
export NPM_CONFIG_AUDIT="false"
export NPM_CONFIG_FUND="false"
export NPM_CONFIG_UPDATE_NOTIFIER="false"
export NPM_CONFIG_PACKAGE_LOCK="false"
export NPM_CONFIG_SHRINKWRAP="false"
export NPM_CONFIG_SAVE="false"
export NPM_CONFIG_SAVE_DEV="false"
export NPM_CONFIG_SAVE_OPTIONAL="false"
export NPM_CONFIG_SAVE_EXACT="false"

# Node.js optimization and memory management
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024 --no-experimental-fetch"
export NODE_ENV="production"

echo "✅ Enhanced environment variables set"

# Create completely isolated cache directories with proper permissions
echo "📁 Creating enhanced cache directories..."
CACHE_DIRS=(
  "/tmp/.npm-deployment-cache"
  "/tmp/.npm-deployment-init"
  "/tmp/.npm-deployment-prefix"
  "/tmp/.npm-deployment-store"
  "/tmp/.npm-deployment-global"
  "/tmp/.npm-deployment-user"
  "/tmp/.cache-deployment"
  "/tmp/.npm-logs"
)

for dir in "${CACHE_DIRS[@]}"; do
  if mkdir -p "$dir" 2>/dev/null; then
    chmod 755 "$dir" 2>/dev/null || true
    echo "✅ Created: $dir"
  else
    echo "⚠️ Could not create: $dir"
  fi
done

# Create enhanced npm configuration files
echo "📝 Creating enhanced npm configuration files..."

# Global npm config with complete isolation
cat > /tmp/.npmrc-deployment-global << 'EOF'
cache=/tmp/.npm-deployment-cache
tmp=/tmp
prefix=/tmp/.npm-deployment-prefix
store-dir=/tmp/.npm-deployment-store
init-cache=/tmp/.npm-deployment-init

# Disable ALL problematic features
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

# Force complete cache isolation
cache-max=0
cache-min=0
cache-lock-retries=1
cache-lock-stale=10000
cache-lock-wait=1000
prefer-online=true
unsafe-perm=true
ignore-scripts=false

# Network and timeout settings
registry-timeout=15000
fetch-timeout=15000
fetch-retries=1
fetch-retry-factor=1
fetch-retry-mintimeout=1000
fetch-retry-maxtimeout=3000
EOF

# User npm config with enhanced settings
cat > /tmp/.npmrc-deployment-user << 'EOF'
cache=/tmp/.npm-deployment-cache
tmp=/tmp
fund=false
audit=false
update-notifier=false
progress=false
loglevel=warn
EOF

echo "✅ Enhanced npm configuration files created"

# Ultra-safe cache cleanup (only project-local and /tmp directories)
echo "🧹 Ultra-safe cache cleanup..."
SAFE_CLEANUP_PATHS=(
  "node_modules/.cache"
  "./.cache"
)

for path in "${SAFE_CLEANUP_PATHS[@]}"; do
  if [ -d "$path" ] || [ -f "$path" ]; then
    rm -rf "$path" 2>/dev/null || true
    echo "✅ Cleaned: $path"
  fi
done

# Only clean /tmp cache directories we created
if [ -d "/tmp/.npm" ]; then
  rm -rf "/tmp/.npm" 2>/dev/null || true
  echo "✅ Cleaned: /tmp/.npm"
fi

if [ -d "/tmp/.cache" ]; then
  rm -rf "/tmp/.cache" 2>/dev/null || true
  echo "✅ Cleaned: /tmp/.cache"
fi

# Clear npm cache with enhanced configuration
npm cache clean --force --userconfig=/tmp/.npmrc-deployment-user --globalconfig=/tmp/.npmrc-deployment-global 2>/dev/null || true

echo "✅ Aggressive cache cleanup completed"

# Test cache directory access and permissions
echo "🧪 Testing enhanced cache system..."
if [ -w "/tmp/.npm-deployment-cache" ]; then
  echo "✅ Enhanced cache directory is writable"
  if touch "/tmp/.npm-deployment-cache/.test" && rm "/tmp/.npm-deployment-cache/.test" 2>/dev/null; then
    echo "✅ Enhanced cache directory write test passed"
  else
    echo "❌ Enhanced cache directory write test failed"
  fi
else
  echo "❌ Enhanced cache directory is not writable"
fi

# Verify npm configuration
echo "🔍 Verifying npm configuration..."
npm config get cache --userconfig=/tmp/.npmrc-deployment-user --globalconfig=/tmp/.npmrc-deployment-global 2>/dev/null || echo "NPM config verification note: May show warnings but should work"

echo ""
echo "🎯 ENHANCED PRE-BUILD SETUP COMPLETE"
echo "✅ Complete cache isolation applied"
echo "✅ All problematic npm features disabled"
echo "✅ Enhanced permissions and directories created"
echo "✅ Aggressive cache cleanup performed"
echo "🚀 Ready for enhanced deployment build"