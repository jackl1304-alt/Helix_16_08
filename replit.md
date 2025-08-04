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

### Frontend Libraries
- **React Ecosystem**
- **Radix UI primitives** with **shadcn/ui**
- **Recharts**
- **React Hook Form** with **Zod validation**