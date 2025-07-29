#!/bin/bash
# Replit.com Hosting-spezifische Fixes

echo "🚀 Replit.com Hosting Fix - Unterschied zwischen Tester und Production"

echo "📋 PROBLEM ANALYSE:"
echo "- Tester (Development): Läuft mit 'npm run dev' + Vite HMR"
echo "- Replit.com Hosting: Läuft mit 'npm run start' + Production Build"
echo "- Production braucht pre-built static files und optimierte Konfiguration"

# Fix 1: Sicherstellen dass dist/ Verzeichnis existiert und vollständig ist
echo "1️⃣ Checking production build..."
if [ ! -f "dist/index.js" ]; then
  echo "❌ Production build fehlt - erstelle Build..."
  source enhanced-pre-build.sh
  npm run build
else
  echo "✅ Production build vorhanden"
fi

# Fix 2: Port-Binding für Replit.com-Hosting anpassen
echo "2️⃣ Checking port configuration..."
if grep -q "0.0.0.0" server/index.ts; then
  echo "✅ Port-Binding korrekt konfiguriert"
else
  echo "⚠️ Port-Binding muss für Hosting angepasst werden"
fi

# Fix 3: Environment-Variable für Production setzen
echo "3️⃣ Setting production environment..."
export NODE_ENV=production
export PORT=${PORT:-5000}

# Fix 4: Static file serving für Production prüfen
echo "4️⃣ Checking static file configuration..."
if [ -d "dist/assets" ]; then
  echo "✅ Static assets vorhanden"
  ls -la dist/assets/ | head -3
else
  echo "❌ Static assets fehlen"
fi

# Fix 5: Datenbank-Verbindung für Production testen
echo "5️⃣ Database connection check..."
if [ -n "$DATABASE_URL" ]; then
  echo "✅ DATABASE_URL vorhanden"
else
  echo "⚠️ DATABASE_URL nicht gesetzt - Hosting braucht PostgreSQL"
fi

echo ""
echo "🎯 REPLIT.COM HOSTING STATUS:"
echo "Development (Tester): ✅ Funktioniert"
echo "Production (Hosting): Benötigt Anpassungen"
echo ""
echo "📝 LÖSUNGSSCHRITTE:"
echo "1. Build-Process für Production optimieren"
echo "2. Port-Binding für 0.0.0.0 konfigurieren"
echo "3. Static file serving anpassen"
echo "4. Environment variables für Hosting setzen"