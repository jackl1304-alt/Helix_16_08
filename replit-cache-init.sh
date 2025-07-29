#!/bin/bash
# Radikale Cache-Umgehung für Replit Deployment

echo "🛡️ Radikale Cache-Umgehung - Keine System-Verzeichnisse"

# Setze alle Cache-Pfade auf vollständig isolierte /tmp Verzeichnisse
export NPM_CONFIG_CACHE="/tmp/npm-isolated-cache"
export NPM_CONFIG_TMP="/tmp"
export NPM_CONFIG_PREFIX="/tmp/npm-isolated-prefix"
export NPM_CONFIG_STORE_DIR="/tmp/npm-isolated-store"
export NPM_CONFIG_INIT_CACHE="/tmp/npm-isolated-init"

# Erstelle isolierte Cache-Verzeichnisse
mkdir -p /tmp/npm-isolated-cache /tmp/npm-isolated-prefix /tmp/npm-isolated-store /tmp/npm-isolated-init
chmod 777 /tmp/npm-isolated-* 2>/dev/null || true

# Erstelle .npmrc die System-Cache komplett umgeht
cat > .npmrc << 'EOF'
cache=/tmp/npm-isolated-cache
tmp=/tmp
prefix=/tmp/npm-isolated-prefix
store-dir=/tmp/npm-isolated-store
init-cache=/tmp/npm-isolated-init
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
package-lock=false
shrinkwrap=false
EOF

echo "✅ Cache vollständig isoliert - keine System-Verzeichnisse mehr"