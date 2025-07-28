#!/bin/bash

# Helix Project Export Script
# Erstellt ein vollständiges Backup des Projekts für Deployment

echo "🚀 Helix Project Export gestartet..."

# Verzeichnis für Export erstellen
EXPORT_DIR="helix-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "📁 Exportiere Projektdateien..."

# Projektdateien kopieren (ohne node_modules, .git, dist)
tar -czf "$EXPORT_DIR/helix-source-code.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=.replit \
  --exclude=.upm \
  --exclude="*.log" \
  .

echo "🗄️ Exportiere Datenbank..."

# Datenbank exportieren (falls DATABASE_URL verfügbar)
if [ ! -z "$DATABASE_URL" ]; then
  echo "Exportiere vollständige Datenbank..."
  pg_dump "$DATABASE_URL" > "$EXPORT_DIR/helix-database-full.sql"
  
  echo "Exportiere nur Datenstruktur..."
  pg_dump "$DATABASE_URL" --schema-only > "$EXPORT_DIR/helix-database-schema.sql"
  
  echo "Exportiere nur Daten..."
  pg_dump "$DATABASE_URL" --data-only > "$EXPORT_DIR/helix-database-data.sql"
else
  echo "⚠️ DATABASE_URL nicht gefunden - Datenbank-Export übersprungen"
fi

echo "📋 Erstelle Deployment-Konfigurationen..."

# Vercel Konfiguration
cat > "$EXPORT_DIR/vercel.json" << 'EOF'
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
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

# Railway Konfiguration
cat > "$EXPORT_DIR/railway.json" << 'EOF'
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
EOF

# DigitalOcean App Platform Konfiguration
cat > "$EXPORT_DIR/.do-app.yaml" << 'EOF'
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
    value: your-secret-key-here
  - key: GMAIL_USER
    value: deltawaysnewsletter@gmail.com
  - key: GMAIL_PASS
    value: your-gmail-password
  
databases:
- name: helix-db
  engine: PG
  version: "13"
EOF

# Docker Konfiguration
cat > "$EXPORT_DIR/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Package files kopieren
COPY package*.json ./
RUN npm ci --only=production

# Source code kopieren
COPY . .

# Build das Projekt
RUN npm run build

# Port exposieren
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# App starten
CMD ["npm", "start"]
EOF

# Docker Compose für lokale Entwicklung
cat > "$EXPORT_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/helix
      - SESSION_SECRET=your-secret-key-here
      - GMAIL_USER=deltawaysnewsletter@gmail.com
      - GMAIL_PASS=2021!Emil@Serpha
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=helix
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./helix-database-full.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Environment Template erstellen
cat > "$EXPORT_DIR/.env.example" << 'EOF'
# Helix MedTech Regulatory Intelligence - Environment Variables

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Management
SESSION_SECRET=super-secret-key-minimum-32-characters

# Email Service (Gmail SMTP)
GMAIL_USER=deltawaysnewsletter@gmail.com
GMAIL_PASS=2021!Emil@Serpha

# Application Environment
NODE_ENV=production
PORT=5000

# Optional: AI Features (falls benötigt)
# ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional: External APIs
# PERPLEXITY_API_KEY=pplx-xxxxx
EOF

# Produktions-Package.json anpassen
cat > "$EXPORT_DIR/package-production.json" << 'EOF'
{
  "name": "helix-medtech-regulatory",
  "version": "1.0.0",
  "description": "AI-powered MedTech regulatory intelligence platform",
  "main": "dist/server/index.js",
  "scripts": {
    "start": "node dist/server/index.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p server/tsconfig.json",
    "postbuild": "cp -r server/static dist/server/ || true",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "drizzle-kit generate:pg && drizzle-kit push:pg",
    "health": "curl -f http://localhost:5000/api/health || exit 1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

# Deployment README erstellen
cp DEPLOYMENT_GUIDE.md "$EXPORT_DIR/"

# PM2 Ecosystem-Datei für Produktions-Management
cat > "$EXPORT_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'helix-medtech',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000
  }]
}
EOF

# Nginx Konfiguration für Reverse Proxy
cat > "$EXPORT_DIR/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Static files
    location / {
        root /var/www/helix/dist;
        try_files $uri $uri/ @backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Fallback to backend
    location @backend {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "📊 Erstelle Projekt-Statistiken..."

# Projekt-Statistiken sammeln
cat > "$EXPORT_DIR/project-stats.txt" << EOF
Helix MedTech Regulatory Intelligence - Projekt-Statistiken
===========================================================

Export erstellt am: $(date)
Export-Verzeichnis: $EXPORT_DIR

Projektdateien:
- TypeScript/JavaScript Dateien: $(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l)
- React Komponenten: $(find client -name "*.tsx" | wc -l) 
- Server Services: $(find server -name "*.ts" | wc -l)
- Shared Schemas: $(find shared -name "*.ts" | wc -l)

Datenbank-Tabellen:
$(if [ ! -z "$DATABASE_URL" ]; then psql "$DATABASE_URL" -c "\dt" --quiet 2>/dev/null | grep "public" | wc -l; else echo "Nicht verfügbar (DATABASE_URL fehlt)"; fi)

Geschätzte Projektgröße (ohne node_modules): $(du -sh . --exclude=node_modules 2>/dev/null | cut -f1)

Features:
- ✅ React Frontend mit TypeScript
- ✅ Node.js/Express Backend
- ✅ PostgreSQL Datenbank
- ✅ Regulatory Data Collection
- ✅ AI-powered Search (lokal)
- ✅ Legal Case Database (1800+ Fälle)
- ✅ Multi-language Support
- ✅ Email Service Integration
- ✅ Responsive Design
- ✅ Global Data Sources (6 aktive)

Deployment-Ready:
- ✅ Vercel Konfiguration
- ✅ Railway Konfiguration  
- ✅ DigitalOcean App Platform
- ✅ Docker Container
- ✅ PM2 Produktions-Setup
- ✅ Nginx Reverse Proxy
EOF

echo "🎯 Erstelle Quick-Start-Anleitung..."

cat > "$EXPORT_DIR/QUICK-START.md" << 'EOF'
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
EOF

# Finale Komprimierung aller Export-Dateien
echo "📦 Erstelle finales Export-Paket..."
tar -czf "${EXPORT_DIR}.tar.gz" "$EXPORT_DIR"

# Aufräumen
rm -rf "$EXPORT_DIR"

echo ""
echo "✅ Export abgeschlossen!"
echo "📁 Export-Paket: ${EXPORT_DIR}.tar.gz"
echo "📊 Größe: $(du -h "${EXPORT_DIR}.tar.gz" | cut -f1)"
echo ""
echo "📋 Das Paket enthält:"
echo "   • Kompletter Source Code"
echo "   • Datenbank-Backup (falls verfügbar)"
echo "   • Deployment-Konfigurationen für alle Plattformen"
echo "   • Docker Container Setup"
echo "   • Nginx Konfiguration"
echo "   • PM2 Produktions-Setup"
echo "   • Detaillierte Deployment-Anleitung"
echo "   • Quick-Start Guide"
echo ""
echo "🚀 Bereit für Deployment auf Ihrer gewünschten Plattform!"
EOF

chmod +x export-project.sh