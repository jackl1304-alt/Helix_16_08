# Helix MedTech Regulatory Intelligence - Deployment Guide

## Projektübersicht
Helix ist eine vollständige TypeScript/React/Node.js Anwendung mit PostgreSQL-Datenbank für MedTech-Regulatory Intelligence.

## 🗂️ Projektstruktur
```
helix-project/
├── client/                 # React Frontend (TypeScript)
├── server/                 # Node.js Backend (Express, TypeScript)
├── shared/                 # Gemeinsame Schemas und Types
├── package.json           # Dependencies und Scripts
├── tsconfig.json          # TypeScript Konfiguration
├── vite.config.ts         # Vite Build-Konfiguration
├── tailwind.config.ts     # Styling-Konfiguration
└── drizzle.config.ts      # Datenbank-Migrations-Konfiguration
```

## 📦 Export-Vorbereitung

### 1. Code-Export
```bash
# Alle Projektdateien (außer node_modules und .git)
tar -czf helix-project.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=.replit \
  .
```

### 2. Datenbank-Export
```bash
# PostgreSQL Datenbank exportieren
pg_dump $DATABASE_URL > helix_database_backup.sql

# Oder mit spezifischen Tabellen
pg_dump $DATABASE_URL \
  --table=users \
  --table=sessions \
  --table=regulatory_updates \
  --table=data_sources \
  --table=newsletters \
  --table=approvals \
  --table=subscribers \
  --table=knowledge_articles \
  --table=legal_cases \
  > helix_database_selective.sql
```

## 🚀 Deployment-Optionen

### Option 1: Vercel (Empfohlen für Frontend + Serverless)

#### Vorbereitung:
1. **Vercel Account** erstellen: https://vercel.com
2. **GitHub Repository** erstellen und Code hochladen

#### Konfiguration:
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

#### Environment Variables (Vercel Dashboard):
```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secret-key
GMAIL_USER=deltawaysnewsletter@gmail.com
GMAIL_PASS=2021!Emil@Serpha
NODE_ENV=production
```

### Option 2: Railway (Empfohlen für Full-Stack)

#### Schritte:
1. **Railway Account**: https://railway.app
2. **GitHub verbinden** und Repository auswählen
3. **PostgreSQL Service** hinzufügen
4. **Environment Variables** setzen

#### railway.json:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### Option 3: DigitalOcean App Platform

#### Deployment YAML:
```yaml
# .do/app.yaml
name: helix-medtech
services:
- name: web
  source_dir: /
  github:
    repo: ihr-username/helix-project
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: SESSION_SECRET
    value: your-secret-key
  
databases:
- name: helix-db
  engine: PG
  version: "13"
```

### Option 4: AWS (Komplett-Lösung)

#### Services:
- **EC2**: Server-Hosting
- **RDS**: PostgreSQL-Datenbank
- **S3**: Static Assets
- **CloudFront**: CDN

#### EC2 Setup:
```bash
# Server vorbereiten (Ubuntu)
sudo apt update
sudo apt install nodejs npm postgresql-client

# Projekt übertragen
scp helix-project.tar.gz ubuntu@your-ec2-ip:~/
tar -xzf helix-project.tar.gz
cd helix-project

# Dependencies installieren
npm install
npm run build

# PM2 für Process Management
npm install -g pm2
pm2 start npm --name "helix" -- start
pm2 startup
pm2 save
```

## 🗄️ Datenbank-Migration

### PostgreSQL Setup (beliebiger Provider):
```sql
-- Datenbank erstellen
CREATE DATABASE helix_production;

-- Backup importieren
psql postgresql://username:password@host:port/helix_production < helix_database_backup.sql

-- Oder mit Drizzle Migrationen
npm run db:push
```

### Neon (Serverless PostgreSQL):
1. **Neon Account**: https://neon.tech
2. **Neue Datenbank** erstellen
3. **Connection String** kopieren
4. **Backup importieren**:
```bash
psql "postgresql://user:pass@ep-xxx.neon.tech/neondb" < helix_database_backup.sql
```

## 🔧 Build-Konfiguration

### package.json Scripts anpassen:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p server/tsconfig.json",
    "start": "node dist/server/index.js",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "drizzle-kit generate:pg && drizzle-kit push:pg"
  }
}
```

## 🔐 Environment Variables

### Produktions-Umgebung:
```env
# Datenbank
DATABASE_URL=postgresql://user:password@host:port/database

# Session Management
SESSION_SECRET=super-secret-key-min-32-zeichen

# Email Service
GMAIL_USER=deltawaysnewsletter@gmail.com
GMAIL_PASS=2021!Emil@Serpha

# Produktions-Modus
NODE_ENV=production

# Optional: API Keys für erweiterte Features
ANTHROPIC_API_KEY=sk-ant-xxx (wenn AI-Features benötigt)
```

## 📋 Checkliste für Deployment

### Vor dem Deployment:
- [ ] Code in Git Repository hochgeladen
- [ ] Environment Variables konfiguriert
- [ ] Datenbank-Backup erstellt
- [ ] Build-Process getestet (`npm run build`)
- [ ] Produktions-URLs angepasst

### Nach dem Deployment:
- [ ] Datenbank-Migration durchgeführt
- [ ] SSL-Zertifikat aktiviert
- [ ] Domain konfiguriert
- [ ] Monitoring eingerichtet
- [ ] Backup-Strategie implementiert

## 🎯 Empfohlene Kombinationen

### Für Startups/kleine Teams:
**Vercel (Frontend) + Neon (Datenbank)**
- Kostenlos bis moderate Nutzung
- Einfaches Setup
- Automatische Skalierung

### Für Unternehmen:
**Railway (Full-Stack) + Eigene PostgreSQL**
- Volle Kontrolle
- Bessere Performance
- Compliance-freundlich

### Für Enterprise:
**AWS/Azure (Komplett-Lösung)**
- Maximale Skalierbarkeit
- Compliance-zertifiziert
- Professioneller Support

## 📞 Support und Wartung

### Monitoring:
- Logs über PM2 oder Platform-Tools
- Database Performance überwachen
- Error Tracking (Sentry empfohlen)

### Updates:
```bash
# Code Updates
git pull origin main
npm install
npm run build
pm2 restart helix

# Datenbank Updates
npm run db:push
```

Möchten Sie bei einer spezifischen Deployment-Option detailliertere Hilfe?