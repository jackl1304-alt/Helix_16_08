# Helix Regulatory Intelligence Platform

## Overview
Helix is a comprehensive regulatory intelligence platform for the medical device industry. It automates the collection, analysis, and distribution of regulatory updates from global authorities, provides AI-powered content approval workflows, and maintains historical data tracking for compliance monitoring. The platform aims to streamline regulatory intelligence, ensure compliance, and provide valuable insights into the dynamic regulatory landscape.

## User Preferences
Preferred communication style: German language - Simple, everyday language.

### Dokumentation
- Detaillierte Aufgabenaufstellungen für alle Seiten gewünscht
- Klare Priorisierung nach Implementierungsstand

## Recent Changes (August 3, 2025)
### Individual Tab Navigation Successfully Implemented
- **Problem Resolved**: User required individual tabs per article instead of global tabs or modal dialogs
- **Solution**: Complete restructuring of regulatory updates page with individual tab navigation for each article
- **Implementation**: Each of the 662 regulatory updates now has its own 6-tab navigation (Übersicht, Zusammenfassung, Vollständiger Inhalt, Finanzanalyse, KI-Analyse, Metadaten)
- **Data Processing**: All tab contents are generated from authentic article data with article-specific information
- **User Feedback**: "unser problem vorher funktioniert zur vollsten zufriedenheit" - confirmed working perfectly
- **Technical Details**: Frontend-backend data connection fixed, individual tab content generation, authentic data processing

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with ESBuild
- **Responsive Design**: Mobile-first approach
- **Code Quality**: ESLint with TypeScript rules, Prettier formatting

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **TypeScript**: Full-stack TypeScript with shared schema definitions (Strict Mode)
- **Authentication**: Session-based (ready for implementation)
- **Logging**: Winston logger service with structured logging
- **Error Handling**: Centralized error middleware with proper error types
- **Validation**: Zod schemas for input validation and runtime type safety
- **Environment**: Validated environment configuration with type safety
- **Security**: Rate limiting, input sanitization, security headers
- **API Design**: RESTful APIs with consistent JSON responses and error handling

### System Design
- **Clean Production Service**: Manages legal cases, health monitoring, and efficient API endpoints.
- **Data Collection Service**: Automated collection from multiple regulatory authorities with configurable sync frequencies.
- **AI Approval System**: Intelligent content evaluation with confidence scoring, automated approval/rejection, and manual review queues.
- **Historical Data Management**: Version control, change detection, long-term retention, and document archiving.
- **AegisIntel Services Suite**: Comprehensive AI-powered regulatory analysis including content analysis, legal case evaluation, trend analysis, NLP processing, and historical data management.
- **GRIP Platform Integration**: Secure connection to Pure Global's GRIP platform (grip-app.pureglobal.com) with encrypted credentials, multiple authentication methods, and automated data extraction for regulatory intelligence.
- **Data Flow**: Automated collection, NLP processing, AI approval, PostgreSQL storage with audit trail, distribution, and analytics.
- **Production Infrastructure**: Docker, Kubernetes, Prometheus, Grafana, automated deployment with health checks and rollbacks.

## External Dependencies

### Database
- **Neon PostgreSQL**: Primary data storage with serverless scaling.
- **Drizzle ORM**: Type-safe database operations.

### Email Services
- **SendGrid**: Primary production email delivery.
- **Nodemailer**: Fallback with SMTP configuration.

### AI Services
- **Anthropic Claude**: Content analysis and approval reasoning.
- **Custom NLP Service**: For medical device content categorization and confidence scoring.

### Data Sources
- **GRIP Global Intelligence Platform**: For regulatory intelligence.
- **OpenFDA API**: For 510(k), PMA, Recalls, and Enforcement Actions.
- **Web Scraping Framework**: For BfArM, Swissmedic, Health Canada, and authentic MedTech newsletters.
- **JAMA Network**: For article extraction.

### Frontend Libraries
- **React Ecosystem**: React 18+.
- **Radix UI primitives** with **shadcn/ui**: UI framework.
- **Recharts**: Data visualization.
- **React Hook Form** with **Zod validation**: Forms.