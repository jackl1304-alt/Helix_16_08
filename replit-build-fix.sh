#!/bin/bash
# Replit-spezifischer Build-Fix für Cache-Permission-Probleme

echo "🔧 Replit-Build-Optimierung wird angewendet..."

# Replit-spezifische Umgebungsvariablen setzen
export NPM_CONFIG_CACHE=/tmp/.npm-cache-replit
export NPM_CONFIG_TMP=/tmp
export NPM_CONFIG_INIT_CACHE=/tmp/.npm-init-replit
export DISABLE_NPM_CACHE=true
export NODE_OPTIONS="--max-old-space-size=4096"
export NPM_CONFIG_PROGRESS=false
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false

echo "✅ Replit-Cache-Variablen gesetzt"

# Replit-sichere Cache-Verzeichnisse erstellen
mkdir -p /tmp/.npm-cache-replit
mkdir -p /tmp/.npm-init-replit
mkdir -p /tmp/.npm-global-replit
mkdir -p /tmp/.npm-user-replit
chmod -R 755 /tmp/.npm*replit

echo "✅ Replit-sichere Cache-Verzeichnisse erstellt"

# Replit-optimierte .npmrc erstellen
cat > /tmp/.npmrc-replit << 'EOF'
cache=/tmp/.npm-cache-replit
tmp=/tmp
init-cache=/tmp/.npm-init-replit
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
loglevel=warn
prefer-offline=false
unsafe-perm=true
cache-max=0
cache-min=0
package-lock=false
shrinkwrap=false
globalconfig=/tmp/.npmrc-global-replit
userconfig=/tmp/.npmrc-user-replit
EOF

# Benutzer-NPM-Config auf Replit-Version verweisen  
echo "cache=/tmp/.npm-cache-replit" > /tmp/.npmrc-global-replit
echo "tmp=/tmp" >> /tmp/.npmrc-global-replit
echo "fund=false" >> /tmp/.npmrc-global-replit

echo "✅ Replit-optimierte NPM-Konfiguration erstellt"

# Problematische Cache-Verzeichnisse sicher entfernen (nur User-zugängliche)  
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true

echo "✅ User-Cache sicher geleert"

# NPM-Cache leeren mit Replit-Config
npm cache clean --force --userconfig=/tmp/.npmrc-replit 2>/dev/null || true

echo "✅ NPM-Cache mit Replit-Config geleert"

echo "🎯 Replit-Build-Optimierung abgeschlossen!"
echo "Verwendung: NPM_CONFIG_USERCONFIG=/tmp/.npmrc-replit npm run build"