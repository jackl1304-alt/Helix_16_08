#!/bin/bash
# Deployment Environment Setup für Replit

echo "🔧 Setting deployment environment variables..."

# Set all cache environment variables
export NPM_CONFIG_CACHE="/tmp/npm-safe-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_FUND="false"
export NPM_CONFIG_AUDIT="false"
export NPM_CONFIG_UPDATE_NOTIFIER="false"
export NPM_CONFIG_PROGRESS="false"
export NPM_CONFIG_PACKAGE_LOCK="false"
export NPM_CONFIG_ENGINE_STRICT="false"
export NPM_CONFIG_TIMEOUT="120000"
export NPM_CONFIG_REGISTRY="https://registry.npmjs.org/"

# Create cache directory
mkdir -p /tmp/npm-safe-cache
chmod 777 /tmp/npm-safe-cache

echo "✅ Deployment environment configured"