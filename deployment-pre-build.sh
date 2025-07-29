#!/bin/bash
# Pre-build script for Replit deployment

echo "Preparing deployment environment..."

# Create all required directories
mkdir -p /tmp/npm-deployment-cache
mkdir -p /tmp/npm-prefix
mkdir -p /tmp/npm-store
mkdir -p /tmp/npm-logs
mkdir -p /tmp/npm-init
chmod 777 /tmp/npm-* 2>/dev/null || true

# Set all environment variables
export NPM_CONFIG_CACHE="/tmp/npm-deployment-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_PREFIX="/tmp/npm-prefix"
export NPM_CONFIG_STORE_DIR="/tmp/npm-store"
export NPM_CONFIG_LOGS_DIR="/tmp/npm-logs"
export NPM_CONFIG_INIT_CACHE="/tmp/npm-init"
export NPM_CONFIG_USERCONFIG="/tmp/.npmrc-user"
export NPM_CONFIG_GLOBALCONFIG="/tmp/.npmrc-global"
export NPM_CONFIG_FUND="false"
export NPM_CONFIG_AUDIT="false"
export NPM_CONFIG_UPDATE_NOTIFIER="false"
export NPM_CONFIG_PROGRESS="false"
export NPM_CONFIG_PACKAGE_LOCK="false"
export NPM_CONFIG_SHRINKWRAP="false"
export NPM_CONFIG_OPTIONAL="false"
export NPM_CONFIG_ENGINE_STRICT="false"
export NPM_CONFIG_REGISTRY="https://registry.npmjs.org/"
export NPM_CONFIG_TIMEOUT="300000"

# Create user and global config files
touch /tmp/.npmrc-user /tmp/.npmrc-global
chmod 666 /tmp/.npmrc-* 2>/dev/null || true

# Remove problematic files
rm -f package-lock.json npm-shrinkwrap.json .pnpm-lock.yaml yarn.lock 2>/dev/null || true

echo "Environment prepared for deployment"