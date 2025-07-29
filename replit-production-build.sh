#!/bin/bash
# Replit.com Production Build Script - Lösung für Hosting-Problem

echo "🔧 Replit.com Production Build - Hosting Fix"

echo "📋 PROBLEM IDENTIFIZIERT:"
echo "- Development (Tester): npm run dev → Vite Dev Server → Funktioniert ✅"
echo "- Production (Hosting): npm run start → Static Files → Fehlschlägt ❌"
echo ""
echo "💡 LÖSUNG: Production Build mit korrekter Static File Konfiguration"

# Pre-build mit allen Cache-Fixes
echo "1️⃣ Applying cache fixes..."
source enhanced-pre-build.sh

# Build mit Production-Optimierungen
echo "2️⃣ Building for Replit.com hosting..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build fehlgeschlagen"
  exit 1
fi

echo "✅ Build erfolgreich"

# Static files für Production vorbereiten
echo "3️⃣ Preparing static files for hosting..."

# Sicherstellen dass server/public existiert für serveStatic
mkdir -p server/public

# Frontend-Build-Output nach server/public kopieren
if [ -d "dist/public" ]; then
  cp -r dist/public/* server/public/
  echo "✅ Static files nach server/public kopiert"
else
  echo "❌ Frontend Build Output fehlt"
  exit 1
fi

# Index.html für SPA-Routing vorbereiten
if [ -f "server/public/index.html" ]; then
  echo "✅ index.html für Production vorhanden"
else
  echo "❌ index.html fehlt"
  exit 1
fi

# Production-Server Test
echo "4️⃣ Testing production configuration..."
if [ -f "dist/index.js" ]; then
  echo "✅ Backend build vorhanden: dist/index.js"
  ls -la dist/index.js
else
  echo "❌ Backend build fehlt"
  exit 1
fi

# Environment für Production setzen
echo "5️⃣ Setting production environment..."
export NODE_ENV=production
export PORT=5000

echo ""
echo "🎯 REPLIT.COM HOSTING FIX COMPLETE"
echo "✅ Production build erstellt"
echo "✅ Static files konfiguriert"
echo "✅ Backend build vorbereitet"
echo "✅ Environment für Hosting gesetzt"
echo ""
echo "🚀 Bereit für Replit.com Deployment!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Replit Deploy Button verwenden"
echo "2. 'Autoscale' als Deployment Type wählen"
echo "3. Environment Variables setzen (DATABASE_URL)"
echo "4. Deployment starten"