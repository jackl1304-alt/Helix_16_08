# Helix - Quick Start Guide

## 🚀 Sofortige Deployment-Optionen

### Option 1: Vercel (Empfohlen für Schnellstart)
```bash
# 1. GitHub Repository erstellen und Code hochladen
# 2. Vercel Account verbinden
# 3. Neon Database erstellen: https://neon.tech
# 4. Environment Variables in Vercel setzen
# 5. Deploy!
```

### Option 2: Railway (Full-Stack)
```bash
# 1. Railway Account: https://railway.app
# 2. GitHub Repository verbinden
# 3. PostgreSQL Service hinzufügen
# 4. Environment Variables setzen
# 5. Automatisches Deployment
```

### Option 3: Docker (Lokal/Server)
```bash
# 1. Docker und Docker Compose installieren
# 2. .env Datei erstellen (siehe .env.example)
# 3. Datenbank importieren:
docker-compose up -d db
docker-compose exec db psql -U postgres -d helix < helix-database-full.sql

# 4. Vollständige App starten:
docker-compose up -d
```

## 🔧 Environment Variables (Essentiell)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=min-32-zeichen-secret-key
GMAIL_USER=deltawaysnewsletter@gmail.com
GMAIL_PASS=2021!Emil@Serpha
NODE_ENV=production
```

## 📋 Nach dem Deployment
1. Datenbank-Migrationen ausführen
2. SSL-Zertifikat einrichten
3. Domain konfigurieren
4. Monitoring aktivieren

## 🆘 Support
Bei Problemen: Deployment-Guide und Nginx-Konfiguration prüfen
