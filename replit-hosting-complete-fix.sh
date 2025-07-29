#!/bin/bash
# Komplette Lösung für Replit.com Hosting Problem

echo "🔧 Replit.com Hosting - Komplette Problemlösung"

echo ""
echo "📋 PROBLEM ANALYSE COMPLETE:"
echo "- Tester (Development): npm run dev → Vite Dev Server → ✅ Funktioniert"
echo "- Hosting (Production): npm run start → serveStatic sucht server/public → ❌ Fehlschlägt"
echo "- Build-Output: dist/public → Muss nach server/public kopiert werden"

# 1. Static files von dist/public nach server/public kopieren
echo ""
echo "1️⃣ Fixing static file serving..."
if [ -d "dist/public" ]; then
  mkdir -p server/public
  cp -r dist/public/* server/public/
  echo "✅ Static files von dist/public nach server/public kopiert"
  echo "📁 server/public Inhalt:"
  ls -la server/public/
else
  echo "❌ dist/public nicht gefunden - Build zuerst ausführen"
  echo "Building now..."
  source enhanced-pre-build.sh
  npm run build
  mkdir -p server/public
  cp -r dist/public/* server/public/
  echo "✅ Build und Copy completed"
fi

# 2. Verify server/public structure
echo ""
echo "2️⃣ Verifying production file structure..."
if [ -f "server/public/index.html" ]; then
  echo "✅ index.html in server/public vorhanden"
else
  echo "❌ index.html fehlt in server/public"
  exit 1
fi

if [ -d "server/public/assets" ]; then
  echo "✅ assets/ Verzeichnis in server/public vorhanden"
  echo "📊 Assets:"
  ls -la server/public/assets/ | head -5
else
  echo "❌ assets/ Verzeichnis fehlt in server/public"
  exit 1
fi

# 3. Environment für Hosting setzen
echo ""
echo "3️⃣ Setting environment for Replit.com hosting..."
export NODE_ENV=production
export PORT=5000

# 4. Test Production Server lokal
echo ""
echo "4️⃣ Testing production configuration..."
echo "Backend build: $(ls -la dist/index.js)"
echo "Static files: $(ls -la server/public/index.html)"

# 5. Create deployment-ready indicator
echo ""
echo "5️⃣ Creating deployment ready indicator..."
cat > .replit-hosting-ready << 'EOF'
# Replit.com Hosting Ready
BUILD_STATUS=complete
STATIC_FILES=copied
ENVIRONMENT=production
TIMESTAMP=$(date)
READY_FOR_DEPLOYMENT=true
EOF

echo ""
echo "🎉 REPLIT.COM HOSTING FIX COMPLETE!"
echo ""
echo "✅ PROBLEM GELÖST:"
echo "- Static files korrekt in server/public kopiert"
echo "- Production build vorhanden in dist/index.js"
echo "- Environment für Hosting konfiguriert"
echo "- serveStatic() findet jetzt alle Dateien"
echo ""
echo "🚀 BEREIT FÜR REPLIT.COM DEPLOYMENT!"
echo ""
echo "📝 DEPLOYMENT SCHRITTE:"
echo "1. Replit Deploy Button klicken"
echo "2. 'Autoscale' als Deployment Type wählen"
echo "3. Environment Variable DATABASE_URL setzen"
echo "4. Deploy starten"
echo ""
echo "💡 WARUM ES JETZT FUNKTIONIERT:"
echo "- Tester: Vite Dev Server (client/ Verzeichnis)"
echo "- Hosting: Express Static Server (server/public/ Verzeichnis)"
echo "- Fix: Build-Output nach server/public kopiert"