#!/bin/bash
# Ultra-Safe Deployment für Replit - Zero System Impact

echo "🛡️ Ultra-Safe Deployment - Zero System Directory Impact"

# Umgebung komplett isolieren 
unset NPM_CONFIG_PREFIX
unset NPM_CONFIG_INIT_CACHE

# Nur absolute Minimum-Cache-Settings
export NPM_CONFIG_CACHE="/tmp/npm-isolated-cache"
export NPM_CONFIG_TMP="/tmp"

# Erstelle minimale Cache-Verzeichnisse
mkdir -p /tmp/npm-isolated-cache
chmod 755 /tmp/npm-isolated-cache

# Minimale .npmrc ohne problematische Settings
cat > .npmrc << 'EOF'
cache=/tmp/npm-isolated-cache
tmp=/tmp
fund=false
audit=false
update-notifier=false
progress=false
EOF

echo "✅ Ultra-Safe Cache-Isolation aktiviert"

# Build-Prozess
echo "🔧 Starte Build-Prozess..."
npm run build

# Static File Fix
echo "📁 Kopiere Static Files für Production..."
cp -r dist/public/* server/public/ 2>/dev/null || true

echo "🚀 Ultra-Safe Deployment Ready"