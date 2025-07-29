#!/bin/bash
# Replit environment setup for deployment cache fixes

echo "🔧 Setting up Replit environment variables for deployment..."

# Export all environment variables for cache redirection
export NPM_CONFIG_CACHE="/tmp/.npm-replit-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_INIT_CACHE="/tmp/.npm-replit-init"
export NPM_CONFIG_GLOBALCONFIG="/tmp/.npmrc-replit-global"
export NPM_CONFIG_USERCONFIG="/tmp/.npmrc-replit-user"
export NPM_CONFIG_PREFIX="/tmp/.npm-replit-prefix"
export NPM_CONFIG_STORE_DIR="/tmp/.npm-replit-store"

# Disable problematic npm features that cause permission issues
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

echo "✅ All environment variables exported"

# Write environment variables to a file for persistence
cat > .env.replit << 'EOF'
# Replit deployment cache fixes
NPM_CONFIG_CACHE=/tmp/.npm-replit-cache
NPM_CONFIG_TMP=/tmp
NPM_CONFIG_INIT_CACHE=/tmp/.npm-replit-init
NPM_CONFIG_GLOBALCONFIG=/tmp/.npmrc-replit-global
NPM_CONFIG_USERCONFIG=/tmp/.npmrc-replit-user
NPM_CONFIG_PREFIX=/tmp/.npm-replit-prefix
NPM_CONFIG_STORE_DIR=/tmp/.npm-replit-store

# Disable problematic features
DISABLE_NPM_CACHE=true
DISABLE_OPENCOLLECTIVE=true
NPM_CONFIG_PROGRESS=false
NPM_CONFIG_LOGLEVEL=warn
NPM_CONFIG_AUDIT=false
NPM_CONFIG_FUND=false
NPM_CONFIG_UPDATE_NOTIFIER=false
NPM_CONFIG_PACKAGE_LOCK=false
NPM_CONFIG_SHRINKWRAP=false

# Node.js optimization
NODE_OPTIONS=--max-old-space-size=4096 --max-semi-space-size=1024
EOF

echo "✅ Environment variables saved to .env.replit"