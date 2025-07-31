# Helix Regulatory Intelligence Platform

## Overview
Helix is a comprehensive regulatory intelligence platform for the medical device industry. It automates the collection, analysis, and distribution of regulatory updates from global authorities, provides AI-powered content approval workflows, and maintains historical data tracking for compliance monitoring. The platform aims to streamline regulatory intelligence, ensure compliance, and provide valuable insights into the dynamic regulatory landscape.

## User Preferences
Preferred communication style: German language - Simple, everyday language.

### Dokumentation
- Detaillierte Aufgabenaufstellungen für alle Seiten gewünscht
- Klare Priorisierung nach Implementierungsstand
- Technische Schulden transparent dokumentieren

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with ESBuild
- **Responsive Design**: Mobile-first approach

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **TypeScript**: Full-stack TypeScript with shared schema definitions
- **Authentication**: Session-based (ready for implementation)
- **Logging**: Winston logger service with structured logging
- **Error Handling**: Centralized error middleware with proper error types
- **Validation**: Zod schemas for input validation
- **Environment**: Validated environment configuration with type safety

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