# Software-Dokumentation: Helix Regulatory Intelligence Platform

## Inhaltsverzeichnis
1. [Überblick](#überblick)
2. [Systemarchitektur](#systemarchitektur)
3. [Technische Spezifikationen](#technische-spezifikationen)
4. [Installation und Setup](#installation-und-setup)
5. [API-Dokumentation](#api-dokumentation)
6. [Datenbank-Schema](#datenbank-schema)
7. [Sicherheit und Compliance](#sicherheit-und-compliance)
8. [Wartung und Überwachung](#wartung-und-überwachung)
9. [Troubleshooting](#troubleshooting)

---

## Überblick

### Zweck
Helix ist eine umfassende KI-gestützte Plattform für regulatorische Compliance-Überwachung im Bereich Medizintechnik. Das System automatisiert die Sammlung, Analyse und Verteilung von regulatorischen Updates von internationalen Behörden.

### Hauptfunktionen
- **Automatische Datensammlung** von 13 internationalen Regulierungsbehörden
- **KI-gestützte Inhaltsanalyse** und Klassifizierung
- **Knowledge Base** mit über 20 hochwertigen Fachartikeln
- **Mehrsprachige Unterstützung** (Deutsch/Englisch)
- **Real-time Überwachung** regulatorischer Änderungen
- **Comprehensive Dashboard** für Compliance-Monitoring

### Datenquellen
- **JAMA Network** - Medical Devices Collection
- **FDA** - US Food and Drug Administration
- **EMA** - European Medicines Agency
- **BfArM** - Bundesinstitut für Arzneimittel und Medizinprodukte
- **MHRA** - UK Medicines and Healthcare products Regulatory Agency
- **Swissmedic** - Swiss Agency for Therapeutic Products
- **ISO/IEC Standards** - International Standards Organization
- **Johner Institute** - Regulatory Intelligence
- **MTD Medizintechnik** - German Medical Technology
- **PubMed** - Medical Research Database

---

## Systemarchitektur

### Frontend (Client)
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui Komponenten
│   │   ├── dashboard/       # Dashboard-spezifische Komponenten
│   │   ├── knowledge/       # Knowledge Base Komponenten
│   │   └── legal/           # Rechtsfälle Komponenten
│   ├── pages/
│   │   ├── dashboard.tsx    # Haupt-Dashboard
│   │   ├── knowledge-base.tsx # Knowledge Base Seite
│   │   ├── legal-cases.tsx  # Rechtsfälle Übersicht
│   │   └── data-sources.tsx # Datenquellen Management
│   ├── hooks/               # Custom React Hooks
│   ├── lib/                 # Utility Funktionen
│   └── App.tsx             # Haupt-App Komponente
```

### Backend (Server)
```
server/
├── routes.ts               # API-Routen Definition
├── storage.ts              # Datenbank-Abstraktionsschicht
├── services/
│   ├── universalKnowledgeExtractor.ts  # Knowledge Extraction Service
│   ├── jamaNetworkScrapingService.ts   # JAMA Network Integration
│   ├── knowledge-extraction.service.ts # Knowledge Article Service
│   ├── logger.service.ts               # Logging Service
│   └── dataCollectionService.ts       # Data Collection Service
├── validators/             # Zod Validierung Schemas
└── db.ts                  # Datenbankverbindung
```

### Datenbank (PostgreSQL)
```sql
-- Haupttabellen
knowledge_base          # Knowledge Articles
regulatory_updates      # Regulatorische Updates
legal_cases            # Rechtsfälle
data_sources           # Datenquellen Konfiguration
sessions               # Session Management
users                  # Benutzer (Replit Auth)
```

---

## Technische Spezifikationen

### Technology Stack
- **Frontend**: React 18+ mit TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Datenbank**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM mit Type Safety
- **Validation**: Zod für Runtime Type Checking
- **Logging**: Winston Structured Logging
- **Authentication**: Replit OpenID Connect
- **Build Tools**: Vite, ESBuild
- **Quality**: ESLint, Prettier, TypeScript Strict Mode

### Performance Optimierungen
- **Lazy Loading** für große Datensätze
- **Query Optimization** mit Drizzle ORM
- **Caching Strategien** für häufig abgerufene Daten
- **Rate Limiting** (100 Requests/15min)
- **Compression** für API Responses

### Sicherheitsfeatures
- **Input Sanitization** mit Zod Schemas
- **XSS Protection** durch sanitize-html
- **CSRF Protection** für Session-basierte Auth
- **Environment Validation** mit Zod
- **Structured Error Handling** ohne sensible Datenleaks

---

## Installation und Setup

### Voraussetzungen
```bash
Node.js >= 18.0.0
PostgreSQL Database
Environment Variables konfiguriert
```

### Installation
```bash
# Repository klonen
git clone <repository-url>

# Dependencies installieren
npm install

# Environment Variables setzen
cp .env.example .env
# DATABASE_URL, SESSION_SECRET konfigurieren

# Datenbank Schema erstellen
npm run db:push

# Development Server starten
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://...          # Neon PostgreSQL Connection
SESSION_SECRET=your-session-secret     # Session Encryption Key
NODE_ENV=development                   # Environment Mode
REPL_ID=your-repl-id                  # Replit App ID
REPLIT_DOMAINS=your-domain.replit.app # Allowed Domains
```

---

## API-Dokumentation

### Knowledge Base Endpoints

#### GET /api/knowledge/articles
Lädt alle Knowledge Base Artikel
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Artikel Titel",
      "content": "Artikel Inhalt",
      "category": "regulatory_guidance",
      "tags": ["FDA", "approval"],
      "authority": "FDA",
      "published_at": "2025-08-01T...",
      "language": "de"
    }
  ],
  "meta": {
    "totalArticles": 20,
    "dataSource": "knowledge_base"
  }
}
```

#### POST /api/knowledge/extract-all-sources
Startet Universal Knowledge Extraction
```json
{
  "success": true,
  "message": "Successfully extracted from 13/13 sources",
  "stats": {
    "processedSources": 13,
    "totalSources": 13,
    "articlesExtracted": 54
  }
}
```

### Regulatory Updates Endpoints

#### GET /api/regulatory-updates/recent
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Regulatory Update Titel",
      "description": "Update Beschreibung",
      "source": "FDA",
      "region": "US",
      "published_at": "2025-08-01T...",
      "priority": "high"
    }
  ]
}
```

### Dashboard Endpoints

#### GET /api/dashboard/stats
```json
{
  "totalUpdates": 11618,
  "totalLegalCases": 2018,
  "totalArticles": 20,
  "activeDataSources": 45,
  "recentUpdates": 5534,
  "pendingApprovals": 6
}
```

---

## Datenbank-Schema

### Knowledge Base Tabelle
```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR NOT NULL,
  tags JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX idx_knowledge_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_published ON knowledge_base(is_published);
CREATE INDEX idx_knowledge_created ON knowledge_base(created_at);
```

### Regulatory Updates Tabelle
```sql
CREATE TABLE regulatory_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  content TEXT,
  source VARCHAR NOT NULL,
  source_id VARCHAR,
  region VARCHAR,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  update_type VARCHAR DEFAULT 'general',
  priority VARCHAR DEFAULT 'medium',
  device_classes JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]'
);
```

### Data Sources Tabelle
```sql
CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  endpoint VARCHAR,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Sicherheit und Compliance

### Datenschutz (DSGVO Compliance)
- **Data Minimization**: Nur notwendige Daten werden gespeichert
- **Purpose Limitation**: Daten nur für regulatorische Intelligence verwendet
- **Storage Limitation**: Automatische Archivierung alter Daten
- **Security**: Verschlüsselung in Transit und at Rest

### Authentifizierung und Autorisierung
- **Replit OpenID Connect** für sichere Benutzeranmeldung
- **Session-basierte Authentifizierung** mit sicheren Cookies
- **Role-based Access Control** (zukünftige Erweiterung)

### API Sicherheit
- **Rate Limiting**: 100 Requests pro 15 Minuten
- **Input Validation**: Zod Schemas für alle Eingaben
- **Output Sanitization**: XSS-Schutz für alle Ausgaben
- **Error Handling**: Keine sensiblen Informationen in Fehlermeldungen

---

## Wartung und Überwachung

### Logging und Monitoring
```typescript
// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Automatische Wartungsaufgaben
- **Daily Sync**: Täglich um 02:00 UTC neue Daten sammeln
- **Weekly Cleanup**: Wöchentlich veraltete Daten archivieren
- **Monthly Reports**: Monatliche Compliance-Berichte generieren

### Health Checks
```typescript
// GET /api/health
{
  "status": "healthy",
  "database": "connected",
  "lastSync": "2025-08-01T02:00:00Z",
  "activeServices": 13,
  "uptime": "24h 15m"
}
```

---

## Troubleshooting

### Häufige Probleme und Lösungen

#### Knowledge Base zeigt keine Artikel
**Problem**: Frontend zeigt "0 Artikel gefunden"
**Lösung**: 
```bash
# Prüfen ob Artikel in Datenbank vorhanden
curl http://localhost:5000/api/knowledge/articles

# Datenbank-Check
SELECT COUNT(*) FROM knowledge_base;

# API-Route neu starten
npm run dev
```

#### Datenbank-Verbindungsfehler
**Problem**: "Database connection failed"
**Lösung**:
```bash
# Environment Variables prüfen
echo $DATABASE_URL

# Datenbankverbindung testen
npm run db:push

# Service-Status prüfen
curl http://localhost:5000/api/health
```

#### Performance-Probleme
**Problem**: Langsame API-Antworten
**Lösung**:
```sql
-- Query Performance analysieren
EXPLAIN ANALYZE SELECT * FROM regulatory_updates 
WHERE created_at > NOW() - INTERVAL '30 days';

-- Indizes prüfen
\di knowledge_base

-- Cache leeren
-- Server neu starten
```

### Debugging-Tools
```bash
# Logs anzeigen
tail -f logs/combined.log

# Database Queries debuggen
NODE_ENV=development npm run dev

# API Endpoints testen
curl -X GET http://localhost:5000/api/knowledge/articles | jq

# Performance Monitoring
npm run analyze
```

---

## Support und Weiterentwicklung

### Kontakt
- **Entwicklung**: Replit AI Assistant
- **Dokumentation**: Diese Datei regelmäßig aktualisieren
- **Issues**: GitHub Issues oder Replit Chat

### Roadmap
- [ ] Advanced AI Content Analysis
- [ ] Multi-tenancy Support
- [ ] Advanced Dashboard Analytics
- [ ] Mobile App Development
- [ ] Third-party Integrations (Slack, Teams)

### Mitwirkende Guidelines
1. TypeScript Strict Mode verwenden
2. Zod Validation für alle Eingaben
3. Winston Logging statt console.log
4. ESLint und Prettier befolgen
5. Tests für neue Features schreiben

---

*Letzte Aktualisierung: 1. August 2025*
*Version: 1.0.0*