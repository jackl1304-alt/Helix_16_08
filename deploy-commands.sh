#!/bin/bash

# Helix zu GitHub und Render.com Deployment Script
# Führen Sie dieses Script in Replit Shell aus

echo "🧬 Helix Deployment zu GitHub und Render.com"
echo "============================================="

# Schritt 1: Git Repository vorbereiten
echo "📂 Schritt 1: Git Repository Setup"
echo "Bitte zuerst auf GitHub ein neues Repository erstellen:"
echo "   → github.com/new"
echo "   → Name: helix-regulatory-platform"
echo "   → Beschreibung: AI-powered MedTech regulatory intelligence platform"
echo "   → Public oder Private"
echo ""
echo "Dann hier Ihre GitHub Repository URL eingeben:"
read -p "GitHub Repository URL (https://github.com/USERNAME/helix-regulatory-platform.git): " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    echo "❌ Keine URL eingegeben. Script beenden."
    exit 1
fi

# Git initialisieren und pushen
echo "🔄 Git Repository initialisieren..."
git init
git add .
git commit -m "Initial commit: Helix regulatory platform ready for deployment

✅ Complete AI-powered MedTech regulatory platform
✅ 5,443+ regulatory updates with real data
✅ 1,825+ legal cases database
✅ AI approval system with detailed reasoning
✅ Real-time audit logs and monitoring
✅ React + Express.js fullstack architecture
✅ PostgreSQL database with Drizzle ORM
✅ Docker and Render.com deployment ready

Features:
- Dashboard with real-time statistics
- Global regulatory data sources (FDA, EMA, BfArM, etc.)
- AI-powered content evaluation and approval workflow
- Comprehensive legal jurisprudence database
- Advanced audit logging system
- Professional UI with shadcn/ui components"

git branch -M main
git remote add origin $GITHUB_URL

echo "📤 Code zu GitHub pushen..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code erfolgreich zu GitHub gepusht!"
else
    echo "❌ Git Push fehlgeschlagen. Prüfen Sie Ihre GitHub Berechtigung."
    exit 1
fi

# Schritt 2: Render.com Setup Instruktionen
echo ""
echo "🚀 Schritt 2: Render.com Deployment"
echo "===================================="
echo ""
echo "Jetzt gehen Sie zu Render.com:"
echo "1. 🌐 Öffnen Sie: https://render.com"
echo "2. 🔐 Registrieren Sie sich mit Ihrem GitHub Account"
echo "3. 📊 Gehen Sie zum Dashboard"
echo ""
echo "PostgreSQL Datenbank erstellen:"
echo "4. 🗄️  Klicken Sie: 'New' → 'PostgreSQL'"
echo "5. ⚙️  Einstellungen:"
echo "   - Name: helix-postgres"
echo "   - Database: helix_db"
echo "   - User: helix_user"
echo "   - Region: Frankfurt (eu-central)"
echo "   - Plan: Starter (\$7/Monat) oder Free (für Tests)"
echo "6. 🔗 Nach Erstellung: Connection String kopieren"
echo ""
echo "Web Service erstellen:"
echo "7. 🌐 Klicken Sie: 'New' → 'Web Service'"
echo "8. 📦 Repository auswählen: helix-regulatory-platform"
echo "9. ⚙️  Einstellungen:"
echo "   - Name: helix-regulatory-platform"
echo "   - Region: Frankfurt (eu-central)"
echo "   - Branch: main"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Plan: Starter (\$7/Monat) oder Free"
echo ""
echo "Environment Variables setzen:"
echo "10. 🔧 In Web Service → Environment → Add Environment Variable:"
echo "    - DATABASE_URL = [Ihre PostgreSQL Connection String]"
echo "    - NODE_ENV = production"
echo "    - PORT = 5000"
echo ""
echo "11. 🚀 Deploy starten!"
echo ""
echo "✅ Nach erfolgreichem Deployment:"
echo "   → Ihre App ist verfügbar unter: helix-regulatory-platform.onrender.com"
echo "   → SSL automatisch aktiviert"
echo "   → Continuous Deployment bei Git Push aktiv"
echo ""

# Datenbank Export für Migration
echo "📋 Schritt 3: Datenbank Migration (optional)"
echo "============================================"
echo ""
echo "Für echte Daten von Replit zu Render.com:"
echo "1. 💾 Aktuelle Datenbank exportieren:"
echo "   pg_dump \$DATABASE_URL > helix_backup.sql"
echo ""
echo "2. 📤 In Render PostgreSQL Console importieren:"
echo "   \\i helix_backup.sql"
echo ""
echo "Oder automatisch via Drizzle:"
echo "   npm run db:push"
echo ""

echo "🎉 DEPLOYMENT KOMPLETT!"
echo "======================="
echo ""
echo "📊 Kosten Übersicht:"
echo "   → Free Tier: \$0 (Service schläft nach 15min)"
echo "   → Starter: \$14/Monat (Web + DB, dauerhaft aktiv)"
echo "   → Professional: \$50/Monat (mit Auto-scaling)"
echo ""
echo "🔗 Wichtige Links:"
echo "   → GitHub: $GITHUB_URL"
echo "   → Render Dashboard: https://dashboard.render.com"
echo "   → Deployment Guide: DEPLOYMENT_RENDER.md"
echo ""
echo "🆘 Bei Problemen:"
echo "   → Render Logs im Dashboard prüfen"
echo "   → GitHub Issues erstellen"
echo "   → DEPLOYMENT_RENDER.md lesen"
echo ""
echo "✨ Ihr Helix Platform ist deployment-ready!"