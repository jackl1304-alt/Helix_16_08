# Helix API Reference Guide

## Übersicht
Vollständige API-Referenz für das Helix Regulatory Intelligence System mit allen verfügbaren Endpoints, Request/Response-Formaten und Beispielen.

---

## Basis-URL
```
Production: https://your-app.replit.app
Development: http://localhost:5000
```

---

## Authentifizierung

### Session-basierte Authentifizierung
```http
GET /api/login
# Weiterleitung zu Replit OpenID Connect

GET /api/callback
# OAuth Callback Handler

GET /api/logout
# Session beenden
```

### Geschützte Routen
Alle API-Endpoints außer Health-Check benötigen gültige Session.

---

## Knowledge Base API

### Alle Artikel abrufen
```http
GET /api/knowledge/articles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "67c3888a-93ac-43c1-ab1e-35a90a75df07",
      "title": "AI in Medical Device Regulation: A Systematic Review",
      "content": "This comprehensive review examines...",
      "category": "medtech_research",
      "tags": ["AI", "regulation", "systematic-review"],
      "authority": "JAMA",
      "region": "Global",
      "priority": "high",
      "language": "en",
      "published_at": "2025-08-01T11:00:00Z",
      "created_at": "2025-08-01T11:00:00Z",
      "status": "published",
      "source": "Knowledge Base: medtech_research",
      "summary": "This comprehensive review examines the current regulatory landscape for AI-power..."
    }
  ],
  "meta": {
    "totalArticles": 20,
    "totalUpdates": 0,
    "timestamp": "2025-08-01T11:21:41.018Z",
    "message": "20 real knowledge articles loaded from database",
    "dataSource": "knowledge_base"
  }
}
```

### Universal Knowledge Extraction
```http
POST /api/knowledge/extract-all-sources
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully extracted articles from 13/13 sources",
  "stats": {
    "processedSources": 13,
    "totalSources": 13,
    "articlesExtracted": 54,
    "timestamp": "2025-08-01T11:21:41.018Z"
  }
}
```

### JAMA Network Extraktion
```http
POST /api/knowledge/extract-jama
```

**Response:**
```json
{
  "success": true,
  "message": "JAMA Network articles successfully extracted and saved to knowledge base",
  "timestamp": "2025-08-01T11:21:41.018Z"
}
```

### Knowledge Sources Status
```http
GET /api/knowledge/sources-status
```

**Response:**
```json
{
  "success": true,
  "sources": [
    {
      "id": "jama_medical_devices",
      "name": "JAMA Network - Medical Devices",
      "status": "active",
      "lastSync": "2025-08-01T02:00:00Z",
      "articlesCount": 4,
      "priority": "high"
    },
    {
      "id": "fda_guidance",
      "name": "FDA - Guidance Documents",
      "status": "active",
      "lastSync": "2025-08-01T02:00:00Z",
      "articlesCount": 3,
      "priority": "high"
    }
  ]
}
```

---

## Regulatory Updates API

### Aktuelle Updates abrufen
```http
GET /api/regulatory-updates/recent?limit=50&region=all
```

**Query Parameters:**
- `limit` (optional): Anzahl der Ergebnisse (default: 50)
- `region` (optional): Region filtern (US, EU, Germany, UK, Switzerland)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "FDA Releases Updated Guidance on Software as Medical Device (SaMD)",
      "description": "New guidance document addressing AI/ML-enabled medical devices...",
      "content": "The FDA has released comprehensive guidance...",
      "source": "FDA",
      "source_id": "fda-guidance-samd-2025",
      "region": "US",
      "published_at": "2025-07-31T14:30:00Z",
      "created_at": "2025-07-31T15:00:00Z",
      "update_type": "guidance",
      "priority": "high",
      "device_classes": ["Class II", "Class III"],
      "tags": ["software", "AI", "guidance", "FDA"]
    }
  ],
  "timestamp": "2025-08-01T11:21:41.018Z"
}
```

### Alle Regulatory Updates
```http
GET /api/regulatory-updates
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Update Titel",
    "description": "Update Beschreibung",
    "content": "Vollständiger Inhalt",
    "source": "EMA",
    "region": "EU",
    "published_at": "2025-07-31T12:00:00Z",
    "update_type": "regulation",
    "priority": "medium",
    "device_classes": ["Class I"],
    "tags": ["MDR", "compliance"]
  }
]
```

---

## Legal Cases API

### Rechtsfälle abrufen
```http
GET /api/legal-cases/enhanced
```

**Response:**
```json
[
  {
    "id": "uuid",
    "caseNumber": "BGH-2024-001",
    "title": "BGH-Urteil: Haftung bei fehlerhaften Herzschrittmachern verschärft",
    "description": "Bundesgerichtshof verschärft Haftungsregeln für Medizinproduktehersteller",
    "jurisdiction": "Germany",
    "court": "Bundesgerichtshof",
    "dateDecided": "2024-03-15T00:00:00Z",
    "parties": {
      "plaintiff": "Geschädigter Patient",
      "defendant": "Herzschrittmacher GmbH"
    },
    "outcome": "Klage wird stattgegeben. Beklagte wird zur Zahlung von Schadensersatz verurteilt.",
    "damages": "€2.300.000 Schadensersatz plus Zinsen und Anwaltskosten",
    "verdict": "Klage wird stattgegeben. Beklagte wird zur Zahlung von Schadensersatz verurteilt.",
    "significance": "High",
    "precedentValue": "High",
    "deviceType": "Cardiac Implant",
    "relatedCases": [],
    "documentUrl": "https://legal-docs.example.com/germany/case_001",
    "lastUpdated": "2025-08-01T11:00:00Z"
  }
]
```

---

## Dashboard API

### Dashboard-Statistiken
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalUpdates": 11618,
  "uniqueUpdates": 507,
  "totalLegalCases": 2018,
  "uniqueLegalCases": 562,
  "totalArticles": 20,
  "recentUpdates": 5534,
  "recentLegalCases": 1,
  "activeDataSources": 45,
  "currentData": 11618,
  "archivedData": 0,
  "duplicatesRemoved": "5966 Regulatory + 10 Legal Cases",
  "dataQuality": "Bereinigt und optimiert",
  "totalSubscribers": 0,
  "pendingApprovals": 6,
  "totalNewsletters": 0
}
```

---

## Data Sources API

### Aktive Datenquellen
```http
GET /api/data-sources/active
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "FDA Guidance Documents",
    "type": "fda_guidance",
    "endpoint": "https://www.fda.gov/api/guidance",
    "isActive": true,
    "lastSync": "2025-08-01T02:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Neue Datenquelle erstellen
```http
POST /api/data-sources
Content-Type: application/json

{
  "name": "Custom Source",
  "type": "custom",
  "endpoint": "https://api.example.com",
  "isActive": true
}
```

### Datenquelle aktualisieren
```http
PATCH /api/data-sources/:id
Content-Type: application/json

{
  "isActive": false
}
```

---

## Sync API

### Sync-Statistiken
```http
GET /api/sync/stats
```

**Response:**
```json
{
  "lastSync": "01.08.2025 11:21",
  "activeSources": 45,
  "newUpdates": 12,
  "runningSyncs": 0
}
```

### Manueller Sync
```http
POST /api/sync/manual
```

**Response:**
```json
{
  "success": true,
  "message": "Manual synchronization completed successfully",
  "data": {
    "legalCases": 2018,
    "regulatoryUpdates": 11618,
    "timestamp": "2025-08-01T11:21:41.018Z",
    "forceSync": true
  }
}
```

---

## System API

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "lastSync": "2025-08-01T02:00:00Z",
  "activeServices": 13,
  "uptime": "24h 15m",
  "timestamp": "2025-08-01T11:21:41.018Z"
}
```

### System Report
```http
GET /api/system/report
```

**Response:**
```json
{
  "timestamp": "2025-08-01T11:21:41.018Z",
  "system": {
    "version": "1.0.0",
    "environment": "development",
    "uptime": "24h 15m"
  },
  "database": {
    "status": "connected",
    "totalTables": 8,
    "totalRecords": 33636
  },
  "services": {
    "knowledgeExtractor": "active",
    "dataCollection": "active",
    "monitoring": "active"
  },
  "performance": {
    "avgResponseTime": "120ms",
    "memoryUsage": "256MB",
    "cpuUsage": "15%"
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-01T11:21:41.018Z"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Authentication Required)
- `403` - Forbidden (Insufficient Permissions)
- `404` - Not Found
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

### Validation Errors
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "category",
      "message": "Invalid category"
    }
  ]
}
```

---

## Rate Limiting

### Limits
- **General API**: 100 Requests pro 15 Minuten
- **Knowledge Extraction**: 10 Requests pro Stunde
- **Manual Sync**: 1 Request pro Stunde

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1722516101
```

---

## Beispiel-Requests mit cURL

### Knowledge Articles abrufen
```bash
curl -X GET "http://localhost:5000/api/knowledge/articles" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-id"
```

### Knowledge Extraction starten
```bash
curl -X POST "http://localhost:5000/api/knowledge/extract-all-sources" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-id"
```

### Dashboard Stats abrufen
```bash
curl -X GET "http://localhost:5000/api/dashboard/stats" \
  -H "Content-Type: application/json"
```

---

*Letzte Aktualisierung: 1. August 2025*
*API Version: 1.0.0*