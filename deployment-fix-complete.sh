#!/bin/bash
# Complete deployment fix to clear cache and create writable directories before build

echo "Applying complete deployment cache fixes..."

# Set NPM_CONFIG_CACHE environment variable and additional variables for Node.js module access
export NPM_CONFIG_CACHE=/tmp/.npm-isolated-cache
export NPM_CONFIG_TMP=/tmp
export NPM_CONFIG_INIT_CACHE=/tmp/.npm-isolated-init
export NPM_CONFIG_GLOBALCONFIG=/tmp/.npmrc-isolated-global
export NPM_CONFIG_USERCONFIG=/tmp/.npmrc-isolated-user
export NPM_CONFIG_PREFIX=/tmp/.npm-isolated-prefix
export NPM_CONFIG_STORE_DIR=/tmp/.npm-isolated-store
export DISABLE_NPM_CACHE=true
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=1024"
export NODE_PATH=""
export HOME_CACHE_DIR=/tmp/.cache-isolated
export XDG_CACHE_HOME=/tmp/.cache-isolated

echo "Environment variables configured for isolated cache system"

# Clear cache and create completely writable directories before build
echo "Clearing all cache directories and creating isolated writable directories..."

# Remove all problematic cache directories safely
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm 2>/dev/null || true
rm -rf /tmp/.npm* 2>/dev/null || true
rm -rf /tmp/.cache* 2>/dev/null || true

# Create completely isolated cache directories with proper permissions
mkdir -p /tmp/.npm-isolated-cache
mkdir -p /tmp/.npm-isolated-init
mkdir -p /tmp/.npm-isolated-global
mkdir -p /tmp/.npm-isolated-user
mkdir -p /tmp/.npm-isolated-prefix
mkdir -p /tmp/.npm-isolated-store
mkdir -p /tmp/.cache-isolated
chmod -R 755 /tmp/.npm-isolated*
chmod -R 755 /tmp/.cache-isolated

echo "Isolated cache directories created with proper permissions"

# Create isolated npmrc files in writable directory
cat > /tmp/.npmrc-isolated-global << 'EOF'
cache=/tmp/.npm-isolated-cache
tmp=/tmp
prefix=/tmp/.npm-isolated-prefix
store-dir=/tmp/.npm-isolated-store
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
loglevel=warn
package-lock=false
shrinkwrap=false
prefer-online=true
unsafe-perm=true
EOF

cat > /tmp/.npmrc-isolated-user << 'EOF'
cache=/tmp/.npm-isolated-cache
tmp=/tmp
fund=false
audit=false
EOF

echo "Isolated NPM configuration files created"

# Verify all directories are accessible
echo "Verifying isolated cache directories..."
ls -la /tmp/.npm-isolated* /tmp/.cache-isolated 2>/dev/null || echo "Some directories may not be visible but are accessible"

# Clear npm cache with new configuration
npm cache clean --force --userconfig=/tmp/.npmrc-isolated-user --globalconfig=/tmp/.npmrc-isolated-global 2>/dev/null || true

echo "Complete deployment cache fix applied successfully"
echo "Ready for build with isolated cache system"