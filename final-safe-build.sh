#!/bin/bash
# Final safe build after dependency fix

echo "Running final safe build..."

# Simple cache directory
mkdir -p /tmp/npm-final-cache
chmod 777 /tmp/npm-final-cache

# Build with minimal cache
echo "Building application..."
NPM_CONFIG_CACHE="/tmp/npm-final-cache" npm run build

# Copy static files
echo "Copying static files for production..."
cp -r dist/public/* server/public/ 2>/dev/null || true

echo "Build completed - checking status..."
ls -la dist/index.js
ls -la server/public/index.html

echo "Final build ready for deployment"