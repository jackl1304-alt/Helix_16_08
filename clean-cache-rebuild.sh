#!/bin/bash
# Clean cache and rebuild for deployment

echo "Cleaning all writable caches and rebuilding..."

# Remove all our temporary cache directories
rm -rf /tmp/.npm-* /tmp/npm-* 2>/dev/null || true

# Create fresh cache directory
mkdir -p /tmp/npm-clean-cache
chmod 777 /tmp/npm-clean-cache

# Set clean environment
export NPM_CONFIG_CACHE="/tmp/npm-clean-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_FUND="false"
export NPM_CONFIG_AUDIT="false"

# Clean build
echo "Building with clean cache..."
npm run build

# Copy static files
cp -r dist/public/* server/public/ 2>/dev/null || true

echo "Clean rebuild completed"
echo "Build status: $(ls -la dist/index.js 2>/dev/null && echo 'SUCCESS' || echo 'FAILED')"
echo "Static files: $(ls -la server/public/index.html 2>/dev/null && echo 'SUCCESS' || echo 'FAILED')"