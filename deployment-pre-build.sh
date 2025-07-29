#!/bin/bash
# Pre-build script to setup cache directories with proper permissions for deployment

echo "Setting up deployment cache directories..."

# Create deployment-specific cache directories with proper permissions
mkdir -p /tmp/.npm-deployment-cache
mkdir -p /tmp/.npm-deployment-init
mkdir -p /tmp/.npm-deployment-global
mkdir -p /tmp/.npm-deployment-user
chmod -R 755 /tmp/.npm-deployment*

echo "Cache directories created with proper permissions"

# Create deployment-optimized npm configuration files
cat > /tmp/.npmrc-deployment-global << 'EOF'
cache=/tmp/.npm-deployment-cache
tmp=/tmp
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
loglevel=warn
package-lock=false
shrinkwrap=false
EOF

cat > /tmp/.npmrc-deployment-user << 'EOF'
cache=/tmp/.npm-deployment-cache
tmp=/tmp
fund=false
audit=false
EOF

echo "Deployment npm configuration files created"

# Set deployment environment variables
export NPM_CONFIG_CACHE=/tmp/.npm-deployment-cache
export NPM_CONFIG_TMP=/tmp
export NPM_CONFIG_INIT_CACHE=/tmp/.npm-deployment-init
export NPM_CONFIG_GLOBALCONFIG=/tmp/.npmrc-deployment-global
export NPM_CONFIG_USERCONFIG=/tmp/.npmrc-deployment-user
export DISABLE_NPM_CACHE=true
export NODE_OPTIONS="--max-old-space-size=4096"

echo "Deployment environment variables configured"

# Clean any problematic cache without touching protected system directories
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true

echo "Deployment pre-build setup completed successfully"