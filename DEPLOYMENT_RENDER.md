# Helix zu Render.com Deployment Guide

## Schritt 1: GitHub Repository Setup

### 1.1 Repository erstellen
```bash
# In Replit Shell/Terminal:
git init
git add .
git commit -m "Initial commit: Helix regulatory platform"
git branch -M main
git remote add origin https://github.com/IHR_USERNAME/helix-regulatory-platform.git
git push -u origin main
```

### 1.2 Environment Variables für GitHub
Erstellen Sie `.env.example` für andere Entwickler:
```
DATABASE_URL=postgresql://username:password@hostname:port/database
NODE_ENV=production
PORT=5000
```

## Schritt 2: Render.com Setup

### 2.1 Account erstellen
1. Gehen Sie zu [render.com](https://render.com)
2. Registrieren Sie sich mit GitHub Account
3. Verbinden Sie Ihr GitHub Repository

### 2.2 PostgreSQL Datenbank erstellen
1. **Dashboard → New → PostgreSQL**
2. **Einstellungen:**
   - Name: `helix-postgres`
   - Database: `helix_db` 
   - User: `helix_user`
   - Region: `Frankfurt (eu-central)` (für deutsche Nutzer)
   - Plan: `Starter ($7/monat)` oder `Free` für Tests

3. **Nach Erstellung:** Notieren Sie sich die Connection Details

### 2.3 Web Service erstellen
1. **Dashboard → New → Web Service**
2. **Repository:** Ihr `helix-regulatory-platform` repo auswählen
3. **Einstellungen:**

**Basic Settings:**
- Name: `helix-regulatory-platform`
- Region: `Frankfurt (eu-central)`
- Branch: `main`
- Root Directory: ` ` (leer lassen)
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Advanced Settings:**
- Node Version: `18.x` oder `20.x`
- Plan: `Starter ($7/monat)` oder `Free` für Tests

### 2.4 Environment Variables setzen
In Render.com Web Service → Environment:

```
DATABASE_URL = [Ihre PostgreSQL Connection String von Schritt 2.2]
NODE_ENV = production
PORT = 5000
```

**PostgreSQL Connection String Format:**
```
postgresql://helix_user:PASSWORD@dpg-xxxxx.frankfurt-postgres.render.com/helix_db
```

## Schritt 3: Datenbank Migration

### 3.1 Lokale Datenbank exportieren (aus Replit)
```bash
# In Replit Shell:
pg_dump $DATABASE_URL > helix_backup.sql
```

### 3.2 Schema zu Render PostgreSQL übertragen
**Option A - Via Render Dashboard:**
1. Render PostgreSQL → Connect → External Connection
2. Use psql mit Connection String
3. Import Schema: `\i helix_backup.sql`

**Option B - Via Code (automatisch):**
```bash
# Nach erstem Deployment in Render Shell:
npm run db:push
```

## Schritt 4: Build und Deployment

### 4.1 Automatisches Deployment
- Bei Git Push zu `main` Branch startet automatisch Render Build
- Build dauert ~3-5 Minuten
- Logs in Render Dashboard einsehbar

### 4.2 Manuelles Deployment
1. Render Dashboard → Ihr Service → Manual Deploy
2. Build Logs überwachen
3. Bei Erfolg: URL verfügbar

## Schritt 5: Domain und SSL

### 5.1 Render Domain
- Automatisch: `helix-regulatory-platform.onrender.com`
- SSL automatisch aktiviert

### 5.2 Custom Domain (optional)
1. Render Dashboard → Settings → Custom Domains
2. Domain hinzufügen: `ihr-domain.com`
3. DNS Records setzen:
   - CNAME: `helix-regulatory-platform.onrender.com`

## Schritt 6: Monitoring und Logs

### 6.1 Health Checks
Render überwacht automatisch:
- HTTP 200 Response auf `/`
- Process uptime
- Memory usage

### 6.2 Logs einsehen
- Render Dashboard → Logs Tab
- Real-time log streaming
- Error tracking

## Troubleshooting

### Häufige Probleme:

**1. Build Fehler:**
```bash
# Lösung: Dependencies prüfen
npm install
npm run build
```

**2. Database Connection:**
```bash
# Connection String prüfen:
echo $DATABASE_URL
```

**3. Port Issues:**
```javascript
// server/index.ts sollte haben:
const port = process.env.PORT || 5000;
```

**4. Static Files:**
```javascript
// Ensure Express serves built files:
app.use(express.static('dist/public'));
```

## Kosten Übersicht

### Render.com Pricing:
- **Free Tier:** 
  - Web Service: 512MB RAM, schläft nach 15min Inaktivität
  - PostgreSQL: 1GB, 30 Tage verfügbar

- **Starter ($7/monat):**
  - Web Service: 512MB RAM, dauerhaft aktiv
  - PostgreSQL: 1GB, Production-ready

- **Professional ($25/monat):**
  - Web Service: 2GB RAM, Auto-scaling
  - PostgreSQL: 4GB mit Backups

### Empfehlung:
- **Development:** Free Tier
- **Production:** Starter ($14/monat total)
- **Enterprise:** Professional ($50/monat total)

## Post-Deployment Checklist

✅ **Funktionalität testen:**
- Dashboard lädt korrekt
- 5.443 Regulatory Updates sichtbar
- KI-Approval System funktional
- Legal Cases Database verfügbar
- Audit Logs zeigen aktuelle Daten

✅ **Performance:**
- Ladezeiten unter 3 Sekunden
- Database Queries optimiert
- Static Assets cached

✅ **Security:**
- HTTPS aktiviert
- Environment Variables gesetzt
- Database Access restricted

✅ **Monitoring:**
- Health Checks aktiv
- Error Logging konfiguriert
- Uptime Monitoring eingerichtet

## Support

Bei Problemen:
1. Render Dashboard → Logs prüfen
2. GitHub Issues für Code-Probleme
3. Render Community Forum
4. Render Support (Paid Plans)

**Your Helix Platform ist jetzt live auf Render.com! 🚀**