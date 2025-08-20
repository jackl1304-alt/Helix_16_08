# Helix Regulatory Intelligence Platform

## Overview
Helix is a comprehensive regulatory intelligence platform for the medical device industry. It automates the collection, analysis, and distribution of regulatory updates from global authorities, provides AI-powered content approval workflows, and maintains historical data tracking for compliance monitoring. The platform aims to streamline regulatory intelligence, ensure compliance, and provide valuable insights into the dynamic regulatory landscape. Its business vision includes ensuring compliance, providing valuable insights, and achieving 100% data quality, making it production-ready with advanced analytics and a polished user experience.

## Recent Changes (August 2025)
- **Complete Architecture Simplification**: Vollständige Umstellung auf einfache JSON-basierte Architektur (20. August 2025)
- **Frontend Rebuild**: Neue, saubere App.tsx ohne wouter-Dependencies und komplexe Routing-Systeme
- **Backend Stability**: Stabiles Express-Backend mit funktionierenden JSON-APIs (/api/health, /api/dashboard/stats)
- **Eliminated Dependencies**: Entfernung aller problematischen wouter, navigation-context Dependencies
- **Simplified Navigation**: Direkte prop-basierte Navigation statt komplexer Router-Systeme
- **Working Dashboard**: Funktionsfähiges Dashboard mit echten Backend-Daten und Live-Status-Anzeige
- **Production Ready**: Stabile Basis für weitere Entwicklung mit klarer Trennung Frontend/Backend

## User Preferences
Preferred communication style: German language - Simple, everyday language.

### Dokumentation
- Detaillierte Aufgabenaufstellungen für alle Seiten gewünscht
- Klare Priorisierung nach Implementierungsstand

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with ESBuild
- **Responsive Design**: Mobile-first approach
- **Code Quality**: ESLint with TypeScript rules, Prettier formatting
- **UI/UX Decisions**: Individual tab navigation for articles (Übersicht, Zusammenfassung, Vollständiger Inhalt, Finanzanalyse, KI-Analyse, Metadaten), device preview, accessibility tools (WCAG 2.1 AA Compliance), customization settings, premium executive dashboard look with gradient icons, live statistics, color-coded status badges, and comprehensive customer theme system with three color schemes (blue, purple, green) for personalized branding.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM on Neon
- **TypeScript**: Full-stack TypeScript with shared schema definitions (Strict Mode)
- **Authentication**: Session-based
- **Logging**: Winston logger service
- **Error Handling**: Centralized error middleware
- **Validation**: Zod schemas for input validation
- **Security**: Rate limiting, input sanitization, security headers
- **API Design**: RESTful APIs with consistent JSON responses

### System Design
- **Core Services**: Clean Production Service, Data Collection Service, AI Approval System, Historical Data Management, AegisIntel Services Suite for AI-powered regulatory analysis.
- **Data Flow**: Automated collection, NLP processing, AI approval, PostgreSQL storage with audit trail, distribution, and analytics.
- **Key Features**: Multi-tenant SaaS architecture with subscription management and customer-specific dashboards, automated content categorization and evaluation using ML, intelligent categorization (device types, risk levels, compliance areas), real-time sentiment analysis, quality scoring, duplicate detection and cleanup, real-time monitoring, predictive analytics, data visualization, universal PDF export, comprehensive financial analysis (implementation costs, ROI, market impacts, risk assessments), advanced AI analysis (ML-based precedent analysis, success probabilities), intelligent search, color-coded hashtag system, comprehensive terminology compilation, global medical device approvals system, ongoing approvals management with project tracking, comprehensive customer portal theming system with three customizable color schemes (blue, purple, green), logo upload functionality, company branding customization, and full customer AI insights integration with real-time analysis capabilities.
- **Integration**: Secure connection to Pure Global's GRIP platform with encrypted credentials and automated data extraction.
- **Production Infrastructure**: Docker, Kubernetes, Prometheus, Grafana for automated deployment, health checks, and rollbacks.
- **Code Quality**: Comprehensive code optimization completed with Drizzle ORM migration, structured logging, and TypeScript error resolution. All admin routes converted from direct SQL to ORM for better maintainability and security.

## External Dependencies

### Database
- **Neon PostgreSQL**
- **Drizzle ORM**

### Email Services
- **Gmail SMTP** (deltawayshelixinfo@gmail.com) - Production Ready with App Password
- **Nodemailer** for Gmail integration
- **6 Professional Templates**: Onboarding, Offboarding, Billing, Alerts, Digest, Trial
- **SendGrid** (optional fallback)

### AI Services
- **Anthropic Claude**
- **Custom NLP Service**

### Data Sources
- **GRIP Global Intelligence Platform**
- **OpenFDA API** (510k, PMA, Recalls, Enforcement Actions)
- **MEDITECH FHIR API**
- **MEDITECH Device Registry**
- **MEDITECH Interoperability Services (IOPS)**
- **FDA Device Classification Database**
- **FDA UDI Database**
- **Web Scraping Framework** (BfArM, Swissmedic, Health Canada, MedTech newsletters)
- **Medical Design and Outsourcing**
- **Medtech Big 100 Companies**
- **JAMA Network**
- **Zühlke MedTech Case Studies**
- **Authentic Regulatory Data** (Australia TGA, IMDRF working groups, WHO GAMD indicators, FDA Cybersecurity, Post-Market Surveillance)

### Collaboration Tools
- **Pieces API**

### Frontend Libraries
- **React Ecosystem**
- **Radix UI primitives** with **shadcn/ui**
- **Recharts**
- **React Hook Form** with **Zod validation**