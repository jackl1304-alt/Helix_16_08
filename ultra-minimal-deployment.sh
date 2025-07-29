#!/bin/bash
# Ultra minimal deployment avoiding all system conflicts

echo "Ultra minimal deployment - avoiding all system conflicts..."

# Only create safe directories
mkdir -p /tmp/npm-minimal-cache
chmod 777 /tmp/npm-minimal-cache

# Ultra minimal npm install
NPM_CONFIG_CACHE="/tmp/npm-minimal-cache" NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false npm install --production --no-optional

# Simple build
NPM_CONFIG_CACHE="/tmp/npm-minimal-cache" npm run build

# Copy files
cp -r dist/public/* server/public/ 2>/dev/null || true

echo "Minimal deployment completed"