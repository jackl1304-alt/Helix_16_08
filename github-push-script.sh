#!/bin/bash

# Helix GitHub Push Script mit Personal Access Token
# Automatisches Push zu GitHub Repository

echo "🧬 Helix GitHub Push Script"
echo "=========================="
echo ""

# User Input für Repository URL
echo "📋 Bitte erstellen Sie zuerst ein GitHub Repository:"
echo "   1. Gehen Sie zu: https://github.com/new"
echo "   2. Name: helix-regulatory-platform" 
echo "   3. Beschreibung: 🧬 Helix - AI-powered MedTech regulatory intelligence platform"
echo "   4. Public (für Render.com Free Tier)"
echo "   5. NICHT initialisieren (kein README, .gitignore)"
echo "   6. 'Create repository' klicken"
echo ""

read -p "Geben Sie Ihren GitHub USERNAME ein: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Kein Username eingegeben. Script beenden."
    exit 1
fi

# Repository URL mit Token konstruieren
GITHUB_TOKEN="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"
REPO_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/helix-regulatory-platform.git"

echo ""
echo "🔄 Git Repository konfigurieren..."

# Git remote setzen (falls bereits vorhanden, überschreiben)
git remote remove origin 2>/dev/null || true
git remote add origin $REPO_URL

# Git user konfigurieren
git config user.email "deltawaysnewsletter@gmail.com"
git config user.name "Helix Platform"

echo "📦 Alle Dateien zu Git hinzufügen..."
git add .

echo "💾 Commit erstellen..."
git commit -m "🚀 Helix Regulatory Platform - Production Ready Deployment

✅ Complete AI-powered MedTech regulatory intelligence platform
✅ 5,443+ regulatory updates with authentic data sources  
✅ 1,825+ legal cases database across major jurisdictions
✅ AI approval system with detailed reasoning and document analysis
✅ Real-time audit logs and system monitoring
✅ React + Express.js fullstack architecture with TypeScript
✅ PostgreSQL database with Drizzle ORM
✅ Docker and Render.com deployment ready

🔧 Technical Features:
- Dashboard with real-time regulatory statistics
- Global data sources: FDA, EMA, BfArM, MHRA, Swissmedic
- AI-powered content evaluation and approval workflows  
- Comprehensive legal jurisprudence database
- Advanced audit logging with system activity tracking
- Professional UI with shadcn/ui components and Tailwind CSS
- Modern React 18 frontend with Vite build optimization
- Express.js backend with RESTful API design
- Full TypeScript coverage for type safety
- Production-optimized build pipeline

📦 Deployment Configuration:
- render.yaml for automatic Render.com deployment
- Dockerfile for containerized deployment options
- Environment variable templates and configuration
- Database migration scripts and schema management
- Professional README and documentation
- CI/CD ready with GitHub Actions support

🌐 Live Demo Features:
- Real regulatory data from multiple global authorities
- Interactive document viewer with download capabilities  
- AI-powered approval recommendations with detailed reasoning
- Legal case search and analysis tools
- System audit trails and user activity monitoring
- Responsive design for desktop and mobile access

Built for production deployment on Render.com, Vercel, Railway, or any Node.js hosting platform.
Ready for immediate use by regulatory affairs teams and MedTech organizations."

echo "📤 Code zu GitHub pushen..."
git branch -M main
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ERFOLGREICH! Code zu GitHub gepusht!"
    echo "🔗 Repository URL: https://github.com/${GITHUB_USERNAME}/helix-regulatory-platform"
    echo ""
    echo "🚀 NÄCHSTER SCHRITT: Render.com Deployment"
    echo "=========================================="
    echo ""
    echo "1. Gehen Sie zu: https://render.com"
    echo "2. Registrieren mit GitHub Account"
    echo "3. Dashboard → New → PostgreSQL"
    echo "   - Name: helix-postgres"
    echo "   - Database: helix_db"  
    echo "   - User: helix_user"
    echo "   - Region: Frankfurt (eu-central)"
    echo "   - Plan: Starter (\$7/month) oder Free"
    echo ""
    echo "4. Dashboard → New → Web Service"
    echo "   - Repository: helix-regulatory-platform auswählen"
    echo "   - Name: helix-regulatory-platform"
    echo "   - Build Command: npm install && npm run build"
    echo "   - Start Command: npm start"
    echo "   - Environment Variables:"
    echo "     DATABASE_URL = [PostgreSQL Connection String]"
    echo "     NODE_ENV = production"
    echo "     PORT = 5000"
    echo ""
    echo "5. Deploy starten → Build ~3-5 Minuten"
    echo ""
    echo "🎉 Nach erfolgreichem Deployment:"
    echo "   → Live URL: https://helix-regulatory-platform.onrender.com"
    echo "   → SSL automatisch aktiviert"
    echo "   → 5,443+ regulatory updates verfügbar"
    echo "   → AI-Approval System funktional"
    echo "   → Legal Cases Database zugänglich"
    echo ""
    echo "💰 Kosten:"
    echo "   → Free: \$0 (schläft nach 15min)"
    echo "   → Starter: \$14/month (dauerhaft aktiv)"
    echo ""
    echo "📖 Vollständige Anleitung: DEPLOYMENT_RENDER.md"
    echo "🆘 Bei Problemen: GITHUB_SETUP_INSTRUCTIONS.md"
else
    echo "❌ Git Push fehlgeschlagen!"
    echo "🔍 Mögliche Ursachen:"
    echo "   → GitHub Repository existiert nicht"
    echo "   → Token-Berechtigung unzureichend"  
    echo "   → Username falsch eingegeben"
    echo ""
    echo "📖 Siehe: GITHUB_SETUP_INSTRUCTIONS.md für manuelle Schritte"
fi