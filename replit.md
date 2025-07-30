# Helix Regulatory Intelligence Platform

## Overview

Helix is a comprehensive regulatory intelligence platform designed for the medical device industry. It automates the collection, analysis, and distribution of regulatory updates from global authorities (FDA, EMA, BfArM, MHRA, Swissmedic), provides AI-powered content approval workflows, and maintains historical data tracking for compliance monitoring.

## User Preferences

Preferred communication style: German language - Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with ESBuild for production builds
- **Responsive Design**: Mobile-first approach with device detection hooks

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **TypeScript**: Full-stack TypeScript with shared schema definitions
- **Authentication**: Session-based (ready for implementation)

### Recent Changes

#### July 30, 2025
- ✅ **CLEAN SYSTEM REDESIGN**: Komplett neues System ohne Code-Leichen erstellt
- ✅ **PRODUCTION SERVICE**: Sauberer ProductionService für Legal Cases Management implementiert
- ✅ **SIMPLIFIED APIS**: Neue, saubere API-Endpunkte ohne HTML-Probleme
  * `/api/admin/initialize-production` - Initialisiert 2025 Legal Cases
  * `/api/admin/health` - Überwacht System-Status
  * `/api/admin/sync-legal-cases` - Synchronisiert Legal Cases
- ✅ **TIEFENPRÜFUNG ABGESCHLOSSEN**: Alle Legacy-Files, Shell-Scripts und -fixed Referenzen entfernt
- ✅ **FRONTEND BEREINIGT**: App.tsx auf saubere Komponenten ohne veraltete Suffixe aktualisiert
- ✅ **IMPORT-FEHLER BEHOBEN**: Alle storage-morning Referenzen auf storage aktualisiert
- ✅ **LOKALES SYSTEM OPTIMAL**: 2025 Legal Cases, 5654 Updates, System Status "optimal"
- ✅ **PRODUCTION-READY**: System bereit für Live-Deployment ohne veraltete Dependencies

## Key Components

### Clean Production Service
- Direct database access for Legal Cases initialization
- Health monitoring with status levels (optimal/healthy/degraded)
- Simple, efficient API endpoints without legacy code
- 2025 Legal Cases generation across 6 jurisdictions

### Data Collection Service
- Automated data collection from multiple regulatory authorities
- Configurable sync frequencies (hourly, daily, weekly)
- Real-time status monitoring and error handling
- Support for multiple data formats (JSON, XML, CSV)

### AI Approval System
- Intelligent content evaluation with confidence scoring
- Automated approval/rejection based on quality metrics
- Manual review queue for edge cases
- Detailed reasoning and audit trails

### Historical Data Management
- Version control for regulatory documents
- Change detection and comparison tools
- Long-term data retention (7+ years)
- Document archiving and retrieval

## Data Flow

1. **Collection**: Automated data collectors fetch updates from regulatory sources
2. **Processing**: NLP service categorizes and enriches content
3. **Approval**: AI system evaluates content quality and compliance
4. **Storage**: Approved content stored in PostgreSQL with full audit trail
5. **Distribution**: Newsletters and notifications sent to subscribers
6. **Analytics**: Performance metrics and compliance reporting

## External Dependencies

### Database
- **Neon PostgreSQL**: Primary data storage with serverless scaling
- **Connection Pooling**: Optimized for production workloads
- **Drizzle ORM**: Type-safe database operations with migrations

### Email Services
- **Primary**: SendGrid for production email delivery
- **Fallback**: Nodemailer with SMTP configuration
- **Features**: Template support, tracking, and analytics

### AI Services
- **Anthropic Claude**: Content analysis and approval reasoning
- **NLP Processing**: Custom service for medical device content categorization
- **Confidence Scoring**: Machine learning-based quality assessment

### Frontend Dependencies
- **React Ecosystem**: React 18+ with modern hooks and patterns
- **UI Framework**: Radix UI primitives with shadcn/ui styling
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `/dist/public`
2. **Backend**: ESBuild bundles server code to `/dist/index.js`
3. **Assets**: Static files served from Express with fallback to SPA

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Optimized builds with caching and compression
- **Environment Variables**: Secure handling of API keys and database URLs

### Scaling Considerations
- **Database**: Neon PostgreSQL auto-scales based on demand
- **Caching**: In-memory caching for frequently accessed data
- **CDN**: Static asset delivery optimization
- **Monitoring**: Built-in logging and error tracking

### Security
- **Data Validation**: Zod schemas for all API inputs
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **CORS**: Configured for production domains
- **Rate Limiting**: API endpoint protection (ready for implementation)