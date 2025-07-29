#!/bin/bash
# Safe NPM Install für Replit Deployment

echo "🔧 Safe NPM Install mit isolierten Cache-Einstellungen"

# Environment variables für sicheren NPM install
export NPM_CONFIG_CACHE="/tmp/npm-safe-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_FUND="false"
export NPM_CONFIG_AUDIT="false"
export NPM_CONFIG_UPDATE_NOTIFIER="false"
export NPM_CONFIG_PROGRESS="false"
export NPM_CONFIG_PACKAGE_LOCK="false"
export NPM_CONFIG_ENGINE_STRICT="false"
export NPM_CONFIG_TIMEOUT="120000"

# Cache-Verzeichnisse erstellen
mkdir -p /tmp/npm-safe-cache
chmod 777 /tmp/npm-safe-cache

# Clear existing problematic files
rm -f package-lock.json npm-shrinkwrap.json 2>/dev/null || true

# Safe npm install
echo "📦 Starting safe npm install..."
npm install --no-package-lock --no-shrinkwrap --no-optional --force

echo "✅ Safe NPM install completed"