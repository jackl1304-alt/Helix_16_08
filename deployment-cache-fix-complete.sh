#!/bin/bash
# Complete Cache Permission Fix für Replit Deployment

echo "🔧 Applying ALL suggested deployment cache fixes..."

# 1. Disable package caching completely 
export NPM_CONFIG_CACHE=false
export NPM_CONFIG_PACKAGE_LOCK=false
export NPM_CONFIG_SHRINKWRAP=false

# 2. Force NPM to use writable /tmp directory
export NPM_CONFIG_CACHE="/tmp/npm-deployment-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_TMPDIR="/tmp"

# 3. Add all cache environment variables
export NPM_CONFIG_STORE_DIR="/tmp/npm-store"
export NPM_CONFIG_LOGS_DIR="/tmp/npm-logs"
export NPM_CONFIG_INIT_CACHE="/tmp/npm-init"
export YARN_CACHE_FOLDER="/tmp/yarn-cache"
export NODE_OPTIONS="--max-old-space-size=2048"

# 4. Create cache directories before building
mkdir -p /tmp/npm-deployment-cache
mkdir -p /tmp/npm-store
mkdir -p /tmp/npm-logs
mkdir -p /tmp/npm-init
mkdir -p /tmp/yarn-cache
chmod 777 /tmp/npm-* /tmp/yarn-* 2>/dev/null || true

# 5. Create deployment-specific .npmrc
cat > .npmrc << 'EOF'
cache=false
package-lock=false
shrinkwrap=false
fund=false
audit=false
update-notifier=false
progress=false
optional=false
save-exact=false
package-lock-only=false
EOF

echo "✅ All deployment cache fixes applied"
echo "🚀 Starting deployment build..."

# Build with cache fixes
npm run build

# Static file fix
cp -r dist/public/* server/public/ 2>/dev/null || true

echo "✅ Deployment ready with complete cache isolation"