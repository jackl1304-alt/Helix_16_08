# Helix Regulatory Intelligence Platform

## Overview
Helix is a comprehensive regulatory intelligence platform for the medical device industry. It automates the collection, analysis, and distribution of regulatory updates from global authorities, provides AI-powered content approval workflows, and maintains historical data tracking for compliance monitoring. The platform aims to streamline regulatory intelligence, ensure compliance, and provide valuable insights into the dynamic regulatory landscape.

## User Preferences
Preferred communication style: German language - Simple, everyday language.

### Dokumentation
- Detaillierte Aufgabenaufstellungen für alle Seiten gewünscht
- Klare Priorisierung nach Implementierungsstand
- ✅ Technische Schulden behoben: Type Safety, Error Handling, Logging modernisiert (2025-07-31)

### Recent Critical Fixes (2025-07-31)
- ✅ **Type Safety**: Alle 'any' Typen durch spezifische Interfaces ersetzt
- ✅ **Error Handling**: Moderne strukturierte Error-Klassen implementiert
- ✅ **Logging**: Winston Logger Service für strukturiertes Logging
- ✅ **Environment**: Zod-basierte Umgebungsvalidierung
- ✅ **API Responses**: Standardisierte Response-Strukturen
- ✅ **Middleware**: Robuste Error-Middleware für bessere Fehlerbehandlung
- ✅ **Import Paths**: Inkonsistente relative Pfade durch @shared-Aliase ersetzt
- ✅ **TypeScript Config**: Erweiterte moderne TypeScript-Konfiguration implementiert
- ✅ **Knowledge Extraction**: Panel erfolgreich in Knowledge Base integriert

### Code Quality Standards (Updated 2025-07-31)
- **Production-Ready**: Complete removal of all demo data and mock content
- **Type Safety**: ✅ Complete removal of 'any' types, comprehensive TypeScript interfaces implemented
- **Modern Practices**: ✅ ESLint, Prettier, structured logging with Winston implemented
- **Security**: ✅ Input validation, rate limiting, sanitization with Zod schemas
- **Performance**: ✅ Optimized queries, caching, structured error handling implemented
- **Error Handling**: ✅ Modern error classes with proper inheritance and type safety
- **Logging**: ✅ Replaced 200+ console.log statements with structured Winston logging
- **Environment**: ✅ Comprehensive environment validation with Zod schemas

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

### Production Modernization (Updated 2025-07-31)
- **Type Safety**: ✅ Eliminated all 'any' types, implemented comprehensive TypeScript interfaces
- **Error Handling**: ✅ Structured error classes with status codes and operational flags
- **Logging**: ✅ Replaced 200+ console.log statements with structured Winston logging service
- **Validation**: ✅ Comprehensive Zod schemas for all API endpoints and environment configuration
- **Security**: ✅ Rate limiting (100 req/15min), input sanitization, XSS protection
- **Performance**: ✅ Optimized database queries, caching strategies, lazy loading
- **Modern Architecture**: ✅ Clean error middleware, environment validation, structured API responses

### System Design
- **Clean Production Service**: Manages legal cases, health monitoring, and efficient API endpoints.
- **Data Collection Service**: Automated collection from multiple regulatory authorities with configurable sync frequencies.
- **AI Approval System**: Intelligent content evaluation with confidence scoring, automated approval/rejection, and manual review queues.
- **Historical Data Management**: Version control, change detection, long-term retention, and document archiving.
- **Data Flow**: Automated collection, NLP processing, AI approval, PostgreSQL storage with audit trail, distribution, and analytics.

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

### Frontend Libraries
- **React Ecosystem**: React 18+.
- **Radix UI primitives** with **shadcn/ui**: UI framework.
- **Recharts**: Data visualization.
- **React Hook Form** with **Zod validation**: Forms.