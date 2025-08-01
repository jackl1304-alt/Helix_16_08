# Helix Deployment Guide

## Übersicht
Umfassender Leitfaden für das Deployment des Helix Regulatory Intelligence Systems auf Replit und anderen Plattformen.

---

## Replit Deployment (Empfohlen)

### Voraussetzungen
- ✅ Replit Account
- ✅ PostgreSQL Datenbank (Neon oder Replit Database)
- ✅ Environment Variables konfiguriert

### 1. Repository Setup
```bash
# In Replit importieren
# Repository URL: https://github.com/your-repo/helix-regulatory

# Oder manuell hochladen
# Alle Projektdateien in Replit Workspace kopieren
```

### 2. Environment Configuration
Erstelle `.env` Datei in Replit:
```env
# Datenbank
DATABASE_URL=postgresql://username:password@host:5432/database

# Session Management
SESSION_SECRET=your-very-secure-session-secret-here

# Replit Specific
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-app-name.replit.app

# Environment
NODE_ENV=production

# Optional: External APIs
ANTHROPIC_API_KEY=your-anthropic-key
SENDGRID_API_KEY=your-sendgrid-key
```

### 3. Database Setup
```bash
# In Replit Console
npm run db:push

# Prüfen ob Tabellen erstellt wurden
npm run db:status
```

### 4. Dependencies Installation
```bash
# Replit installiert automatisch, manuell:
npm install

# Build für Production
npm run build
```

### 5. Start Configuration
Erstelle `start.js` (bereits vorhanden):
```javascript
const { spawn } = require('child_process');

console.log('🚀 Starting Helix Regulatory Intelligence Platform...');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

server.on('close', (code) => {
  console.log(`🔄 Server process exited with code ${code}`);
});
```

### 6. Replit Configuration
`.replit` Datei:
```toml
run = "node start.js"
modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "node start.js"]

[[ports]]
localPort = 5000
externalPort = 80
```

### 7. Deployment ausführen
1. **Replit Deploy Button** klicken
2. **Domain konfigurieren** (optional Custom Domain)
3. **Health Check** durchführen: `https://your-app.replit.app/api/health`

---

## Production Readiness Checklist

### ✅ Sicherheit
- [x] **Environment Variables** sicher konfiguriert
- [x] **Session Secret** stark und eindeutig
- [x] **Rate Limiting** aktiviert (100 req/15min)
- [x] **Input Validation** mit Zod Schemas
- [x] **XSS Protection** implementiert
- [x] **HTTPS** erzwungen (Replit automatisch)

### ✅ Performance
- [x] **Database Indizes** optimiert
- [x] **Query Optimization** mit Drizzle ORM
- [x] **Caching Strategien** implementiert
- [x] **Compression** für API Responses
- [x] **Lazy Loading** für große Datensätze

### ✅ Monitoring
- [x] **Winston Logging** strukturiert
- [x] **Health Check Endpoint** verfügbar
- [x] **Error Tracking** implementiert
- [x] **Performance Metrics** erfasst

### ✅ Data Integrity
- [x] **Backup Strategy** (Neon automatisch)
- [x] **Migration Scripts** getestet
- [x] **Data Validation** umfassend
- [x] **Rollback Capability** vorhanden

---

## Alternative Deployment Optionen

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Package files kopieren
COPY package*.json ./
RUN npm ci --only=production

# Source code kopieren
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["node", "start.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  helix-app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: helix
      POSTGRES_USER: helix_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Vercel Deployment

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "SESSION_SECRET": "@session-secret"
  }
}
```

---

## SSL/TLS Configuration

### Replit (Automatisch)
- ✅ **Automatisches HTTPS** für alle .replit.app Domains
- ✅ **Let's Encrypt Zertifikate** für Custom Domains
- ✅ **HTTP zu HTTPS Redirect** automatisch

### Custom Domain Setup
1. **Domain konfigurieren** in Replit Dashboard
2. **DNS CNAME Record** erstellen: `your-domain.com` → `your-app.replit.app`
3. **SSL Zertifikat** wird automatisch generiert

---

## Monitoring und Logging

### Production Logging
```javascript
// Winston Configuration für Production
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'helix-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Console output nur in Development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Monitoring
```javascript
// Health Check mit detaillierter Systeminfo
app.get('/api/health', async (req, res) => {
  try {
    // Database Health Check
    const dbHealth = await checkDatabaseConnection();
    
    // Service Health Checks
    const servicesHealth = await checkServicesHealth();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: dbHealth,
      services: servicesHealth,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
    
    res.json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## Backup und Recovery

### Automatische Neon Backups
- ✅ **Daily Backups** automatisch
- ✅ **Point-in-Time Recovery** verfügbar
- ✅ **Cross-Region Replication** möglich

### Manual Backup Script
```bash
#!/bin/bash
# backup.sh

echo "🔄 Starting Helix Database Backup..."

# Environment laden
source .env

# Backup Ordner erstellen
mkdir -p backups/$(date +%Y-%m-%d)

# Database Dump
pg_dump $DATABASE_URL > backups/$(date +%Y-%m-%d)/helix_backup_$(date +%H%M%S).sql

# Komprimieren
gzip backups/$(date +%Y-%m-%d)/helix_backup_*.sql

echo "✅ Backup completed: backups/$(date +%Y-%m-%d)/"
```

---

## Performance Optimization

### Database Optimization
```sql
-- Performance Indizes erstellen
CREATE INDEX CONCURRENTLY idx_regulatory_updates_published 
ON regulatory_updates(published_at DESC);

CREATE INDEX CONCURRENTLY idx_knowledge_base_category 
ON knowledge_base(category) WHERE is_published = true;

CREATE INDEX CONCURRENTLY idx_legal_cases_jurisdiction 
ON legal_cases(jurisdiction, date_decided DESC);

-- Query Performance analysieren
EXPLAIN ANALYZE SELECT * FROM regulatory_updates 
WHERE published_at > NOW() - INTERVAL '30 days'
ORDER BY published_at DESC LIMIT 50;
```

### Caching Strategy
```javascript
// Redis-ähnliches In-Memory Caching
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 Minuten

// Cache Middleware
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usage
app.get('/api/dashboard/stats', cacheMiddleware(60), getDashboardStats);
```

---

## Troubleshooting

### Deployment Probleme

#### "Module not found" Errors
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# TypeScript Build prüfen
npm run build
```

#### Database Connection Issues
```bash
# Environment Variables prüfen
echo $DATABASE_URL

# Database Erreichbarkeit testen
psql $DATABASE_URL -c "SELECT 1;"

# Schema Status prüfen
npm run db:push
```

#### Memory Issues
```javascript
// Memory Monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Memory Usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
  
  if (usage.heapUsed > 500 * 1024 * 1024) { // 500MB
    console.warn('⚠️ High memory usage detected');
  }
}, 30000);
```

### Performance Issues
```bash
# Query Performance analysieren
npm run db:analyze

# Slow Query Log aktivieren
# In Production Database Settings

# Memory Profile erstellen
node --inspect server/index.js
```

---

## Security Hardening

### Production Security Headers
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### API Key Management
```javascript
// Environment-basierte API Key Rotation
const getApiKey = (service) => {
  const key = process.env[`${service.toUpperCase()}_API_KEY`];
  if (!key) {
    throw new Error(`API key for ${service} not configured`);
  }
  return key;
};

// Usage
const anthropicKey = getApiKey('anthropic');
```

---

## Maintenance Tasks

### Daily Tasks (Automated)
```bash
#!/bin/bash
# daily_maintenance.sh

# Data Cleanup
npm run cleanup:old-data

# Cache Reset
npm run cache:reset

# Health Check
curl -f http://localhost:5000/api/health

# Log Rotation
logrotate /etc/logrotate.d/helix
```

### Weekly Tasks
```bash
#!/bin/bash
# weekly_maintenance.sh

# Database Optimization
npm run db:optimize

# Backup Verification
npm run backup:verify

# Security Updates
npm audit
npm update
```

---

*Letzte Aktualisierung: 1. August 2025*
*Deployment Guide Version: 1.0.0*