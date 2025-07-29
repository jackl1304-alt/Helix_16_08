#!/bin/bash
# Ultra-safe deployment script for Replit with complete cache isolation

echo "🛡️ Ultra-Safe Replit Deployment - Zero System Impact"

# Set comprehensive environment variables without system cleanup
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

# Node.js optimization
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"
export NODE_ENV="production"

echo "✅ Ultra-safe environment variables set"

# Create cache directories without aggressive cleanup
echo "📁 Creating deployment cache directories..."
mkdir -p /tmp/.npm-deployment-cache /tmp/.npm-deployment-init /tmp/.npm-deployment-prefix /tmp/.npm-deployment-store
chmod 755 /tmp/.npm-deployment* 2>/dev/null || true

# Create npm configuration files
cat > /tmp/.npmrc-deployment-global << 'EOF'
cache=/tmp/.npm-deployment-cache
tmp=/tmp
prefix=/tmp/.npm-deployment-prefix
store-dir=/tmp/.npm-deployment-store
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
loglevel=warn
package-lock=false
shrinkwrap=false
unsafe-perm=true
EOF

cat > /tmp/.npmrc-deployment-user << 'EOF'
cache=/tmp/.npm-deployment-cache
tmp=/tmp
fund=false
audit=false
EOF

echo "✅ Ultra-safe npm configuration created"

# Only clean project-local cache
if [ -d "node_modules/.cache" ]; then
  rm -rf "node_modules/.cache" 2>/dev/null || true
  echo "✅ Cleaned project cache"
fi

# Clear npm cache safely with our configuration
npm cache clean --force --userconfig=/tmp/.npmrc-deployment-user --globalconfig=/tmp/.npmrc-deployment-global 2>/dev/null || true
echo "✅ NPM cache cleared safely"

# Verify cache system
if [ -d "/tmp/.npm-deployment-cache" ] && [ -w "/tmp/.npm-deployment-cache" ]; then
  echo "✅ Deployment cache system verified"
else
  echo "❌ Deployment cache system verification failed"
  exit 1
fi

echo ""
echo "🎯 ULTRA-SAFE DEPLOYMENT SETUP COMPLETE"
echo "✅ Zero system impact - only project and /tmp directories used"
echo "✅ Complete cache isolation achieved"
echo "✅ All permission issues bypassed"
echo "🚀 Ready for safe Replit deployment"

# Now proceed with the build
echo "🏗️ Starting ultra-safe build process..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Ultra-safe build completed successfully"
  echo "🌟 Starting production server..."
  exec npm run start
else
  echo "❌ Build failed"
  exit 1
fi