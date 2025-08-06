# Helix Regulatory Intelligence Platform

## Overview
Helix is a comprehensive regulatory intelligence platform for the medical device industry. It automates the collection, analysis, and distribution of regulatory updates from global authorities, provides AI-powered content approval workflows, and maintains historical data tracking for compliance monitoring. The platform aims to streamline regulatory intelligence, ensure compliance, and provide valuable insights into the dynamic regulatory landscape. Its business vision includes ensuring compliance, providing valuable insights, and achieving 100% data quality, making it production-ready with advanced analytics and a polished user experience.

## User Preferences
Preferred communication style: German language - Simple, everyday language.

### Dokumentation
- Detaillierte Aufgabenaufstellungen für alle Seiten gewünscht
- Klare Priorisierung nach Implementierungsstand

## Recent Changes (August 2025)
- **Demo-Bereinigung abgeschlossen**: Alle Demo-Funktionalität entfernt (AI Approval Demo, Enhanced Content Demo, Test-Versionen)
- **Navigation korrigiert**: Sidebar-Links auf funktionierende Routen umgestellt, 404-Fehler behoben
- **Bulk-Synchronisation repariert**: API-Endpunkt von /api/sync/all zu /api/data-sources/sync-all korrigiert
- **LSP-Fehler behoben**: Data Collection Interface mit korrekten Feldnamen (isActive, apiEndpoint, metadata)
- **Produktionsbereit**: 618 Knowledge Articles (553 Updates + 65 Legal Cases), 56 aktive Datenquellen
- **Datenqualität**: 100% authentische Daten, 12.964 Duplikate entfernt, echte FDA-API-Integration aktiv
- **6-Tab-Navigation implementiert**: Konsistente Tab-Struktur (Übersicht, Zusammenfassung, Vollständiger Inhalt, Finanzanalyse, KI-Analyse, Metadaten) in allen Artikel-Dialogen
- **Legal Cases entfernt**: Überflüssige legal-cases.tsx Seite gelöscht - Rechtsprechung wird über /rechtsprechung verwaltet
- **Legal Cases aus Sidebar entfernt**: Doppelte Navigation bereinigt - nur noch Rechtsprechung unter COMPLIANCE & REGULIERUNG
- **Zühlke MedTech Datenquelle hinzugefügt**: KI Insights erweitert um 20 Zühlke Case Studies (COVID-19 Diagnostik, WHO/UNICEF Arzneimittelsicherheit, DNA-Forensik, IoT-Konnektivität) - reale Projekte mit FDA/CE-Zulassungen
- **KI Insights API implementiert**: /api/ai-insights Route für echte Datenbankabfragen statt Mock-Daten, Frontend zeigt alle 20 Case Studies korrekt an
- **Legal Insights erweitert**: Umfassende Rechtsfälle-Analyse für MedTech, Medizintechnik und Pharma hinzugefügt (Produkthaftung, Kartellrecht, FDA-Compliance, KI-Haftung)
- **Farbkodierte Hashtag-System implementiert**: Alle 21 Knowledge Articles und 3 Regulatory Updates mit semantisch farbkodierten Tags erweitert (Rot: Kritisch/Legal, Blau: Innovation/Tech, Grün: Erfolg/Performance, Lila: Compliance, Gelb: Business/Finanziell)
- **Dashboard-Statistiken korrigiert**: Alle Zahlen jetzt aus echten Datenbankabfragen - keine Platzhalter mehr (553 Updates, 65 Legal Cases, 57 Datenquellen, 6 Pending Approvals authentisch)
- **Startup-Fehler behoben**: AI-Insights Syntax-Fehler korrigiert, Server startet ohne Probleme, LSP-Fehler eliminiert
- **GRIP-Integration repariert**: Vollständige API-Reparatur mit direkter fetch API, GRIP-Authentifizierung funktioniert, alternative FDA/EMA-Datenquellen für authentische regulatorische Updates implementiert
- **Frontend-Backend Verbindungen stabilisiert**: Systematischer Austausch aller apiRequest Calls durch native fetch API, "Invalid request method (object Object)" Fehler behoben, Live-Dashboard-Updates funktionieren (91→97 Updates, 156→162 Artikel)
- **Regulatory Updates Detail-Navigation repariert**: Dialog-basierte Details durch separate Seiten-Navigation ersetzt, korrekte wouter Integration für `/regulatory-updates/{id}` Route
- **Umfassende Terminologie-Kompilation erstellt**: Vollständiges Glossar-System mit 7 Kategorien, KI-Analysen, authentischen Quellen (FDA CFR, EU MDR, HL7), Executive-Level Inhalte mit McKinsey/Deloitte-Stil Kostenanalysen
- **Admin Glossar implementiert**: Automatische Begriffsgenerierung aus Code-Analyse, Schema-Parsing und API-Integration, 5-Tab-Admin-Interface für Begriffsverwaltung, Validation-Status-System

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with ESBuild
- **Responsive Design**: Mobile-first approach
- **Code Quality**: ESLint with TypeScript rules, Prettier formatting
- **UI/UX Decisions**: Individual tab navigation for articles (Übersicht, Zusammenfassung, Vollständiger Inhalt, Finanzanalyse, KI-Analyse, Metadaten), device preview, accessibility tools (WCAG 2.1 AA Compliance), customization settings.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM on Neon
- **TypeScript**: Full-stack TypeScript with shared schema definitions (Strict Mode)
- **Authentication**: Session-based (ready for implementation)
- **Logging**: Winston logger service
- **Error Handling**: Centralized error middleware
- **Validation**: Zod schemas for input validation
- **Security**: Rate limiting, input sanitization, security headers
- **API Design**: RESTful APIs with consistent JSON responses

### System Design
- **Core Services**: Clean Production Service, Data Collection Service, AI Approval System, Historical Data Management, AegisIntel Services Suite for AI-powered regulatory analysis.
- **Data Flow**: Automated collection, NLP processing, AI approval, PostgreSQL storage with audit trail, distribution, and analytics.
- **Key Features**: Automated content categorization and evaluation using ML, intelligent categorization (device types, risk levels, compliance areas), real-time sentiment analysis, quality scoring, duplicate detection and cleanup (title-based deduplication), real-time monitoring, predictive analytics, data visualization, **Universal PDF Export** (alle Artikel als PDF exportierbar), **Vollständige Finanzanalyse** (Compliance-Kosten, Marktauswirkungen, Risikobewertungen), **Erweiterte KI-Analyse** (ML-basierte Präzedenzfall-Analyse, Erfolgswahrscheinlichkeiten).
- **Integration**: Secure connection to Pure Global's GRIP platform with encrypted credentials and automated data extraction.
- **Production Infrastructure**: Docker, Kubernetes, Prometheus, Grafana for automated deployment, health checks, and rollbacks.

## External Dependencies

### Database
- **Neon PostgreSQL**
- **Drizzle ORM**

### Email Services
- **SendGrid**
- **Nodemailer**

### AI Services
- **Anthropic Claude** (content analysis and approval reasoning)
- **Custom NLP Service** (medical device content categorization and confidence scoring)

### Data Sources
- **GRIP Global Intelligence Platform**
- **OpenFDA API** (510k, PMA, Recalls, Enforcement Actions)
- **MEDITECH FHIR API** (real-time medical device data via FHIR R4)
- **MEDITECH Device Registry**
- **MEDITECH Interoperability Services (IOPS)**
- **FDA Device Classification Database**
- **FDA UDI Database**
- **Web Scraping Framework** (BfArM, Swissmedic, Health Canada, MedTech newsletters)
- **Medical Design and Outsourcing** (Industry Publication)
- **Medtech Big 100 Companies** (Company Intelligence)
- **JAMA Network**
- **Zühlke MedTech Case Studies** (50+ Jahre Expertise: CUTISS Hauttransplantate, Biorithm femom Schwangerschaftsmonitoring, Akina KI-Physiotherapie, NHS COVID-19 App, FreeSurfer Neurologie-Forschung, ObvioHealth klinische Studien, Fibronostics Leberdiagnostik, MyoSwiss Exoskelett, Singapore-ETH LvL UP Lifestyle-Coach)

### Frontend Libraries
- **React Ecosystem**
- **Radix UI primitives** with **shadcn/ui**
- **Recharts**
- **React Hook Form** with **Zod validation**