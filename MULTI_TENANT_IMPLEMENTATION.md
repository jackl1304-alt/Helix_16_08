# Multi-Tenant Customer Portal Implementation

## Übersicht
Jeder Kunde erhält sein eigenes individuelles Portal mit tenant-spezifischen URLs.

## URL-Struktur

### Standard Tenant URLs (Empfohlen)
```
/tenant/{tenantId}/dashboard           - Hauptdashboard
/tenant/{tenantId}/regulatory-updates  - Regulatory Updates
/tenant/{tenantId}/ai-insights         - KI-Insights
/tenant/{tenantId}/settings            - Einstellungen
/tenant/{tenantId}/legal-cases         - Rechtsfälle
/tenant/{tenantId}/knowledge-base      - Wissensdatenbank
/tenant/{tenantId}/newsletters         - Newsletter
/tenant/{tenantId}/analytics           - Analytics
/tenant/{tenantId}/advanced-analytics  - Erweiterte Analytics
/tenant/{tenantId}/global-sources      - Globale Quellen
/tenant/{tenantId}/data-collection     - Datensammlung
/tenant/{tenantId}/historical-data     - Historische Daten
```

### Legacy URLs (Fallback)
```
/customer-dashboard                    - Wird weitergeleitet
/customer/regulatory-updates           - Wird weitergeleitet
/customer-ai-insights                  - Wird weitergeleitet
/customer-settings                     - Wird weitergeleitet
```

## Aktuelle Tenants

### Tenant 1: USI
- **ID**: `030d3e01-32c4-4f95-8d54-98be948e8d4b`
- **Name**: usi
- **URL**: `/tenant/030d3e01-32c4-4f95-8d54-98be948e8d4b/dashboard`
- **Status**: ✅ Funktionsfähig mit echten Daten

### Tenant 2: Customer Portal User
- **ID**: `b616d190-c5ca-4f7f-b0c0-affa2b93783b`
- **Name**: Customer Portal User
- **URL**: `/tenant/b616d190-c5ca-4f7f-b0c0-affa2b93783b/dashboard`
- **Status**: ✅ Neu erstellt und funktionsfähig

## Berechtigungen pro Tenant
Jeder Tenant hat individuelle Berechtigungen in der `customer_permissions` JSON-Spalte:

```json
{
  "dashboard": true,
  "regulatoryUpdates": true,
  "aiInsights": true,
  "systemSettings": true,
  "userManagement": true,
  "auditLogs": true,
  "legalCases": false,
  "newsletters": false,
  "globalSources": false,
  "knowledgeBase": false,
  "administration": false,
  "dataCollection": false,
  "historicalData": false,
  "analytics": false,
  "advancedAnalytics": false,
  "reports": false
}
```

## Technische Implementierung

### Frontend Routing
- **App.tsx**: Multi-Tenant Route `/tenant/:tenantId/*`
- **CustomerRouter**: Dynamisches Routing basierend auf tenantId Parameter
- **CustomerNavigation**: Tenant-spezifische URL-Generierung

### URL-Generierung
```typescript
const buildTenantUrl = (path: string) => {
  if (params.tenantId) {
    return `/tenant/${params.tenantId}${path}`;
  }
  return path;
};
```

### Tenant-Erkennung
```typescript
const params = useParams();
const tenantId = params.tenantId || mockTenantId;
```

## E-Mail Links
E-Mail-Links sollten das folgende Format verwenden:
```
https://helixV1-delta.replit.app/tenant/{TENANT_ID}/regulatory-updates
```

## Nächste Schritte
1. ✅ Multi-Tenant URL-System implementiert
2. ✅ Beide Tenants erstellt und funktionsfähig 
3. ✅ Dynamische Navigation implementiert
4. ✅ API-Integration für tenant-spezifische Daten
5. 🔄 E-Mail-Templates auf neue URL-Struktur aktualisieren
6. 🔄 Admin-Interface für Tenant-Verwaltung erweitern

## Datum
Implementiert: 11. August 2025