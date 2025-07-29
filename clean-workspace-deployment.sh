#!/bin/bash
# Clean workspace and prepare safe deployment

echo "Cleaning workspace for safe deployment..."

# Only remove safe, non-system files
rm -rf helix-export-20250728-054840 2>/dev/null || true
# Skip .cache directory - it's system protected

# Clean npm related files that might cause conflicts
rm -f package-lock.json npm-shrinkwrap.json .pnpm-lock.yaml yarn.lock 2>/dev/null || true

# Create safe temporary directories
mkdir -p /tmp/npm-safe-cache
mkdir -p /tmp/npm-temp
chmod 777 /tmp/npm-* 2>/dev/null || true

# Set safe environment variables
export NPM_CONFIG_CACHE="/tmp/npm-safe-cache"
export NPM_CONFIG_TMP="/tmp/npm-temp"
export NPM_CONFIG_FUND="false"
export NPM_CONFIG_AUDIT="false"
export NPM_CONFIG_UPDATE_NOTIFIER="false"
export NPM_CONFIG_PROGRESS="false"
export NPM_CONFIG_PACKAGE_LOCK="false"
export NPM_CONFIG_ENGINE_STRICT="false"

echo "Workspace cleaned and safe environment prepared"