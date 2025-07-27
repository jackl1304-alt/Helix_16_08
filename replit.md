# Helix MedTech Regulatory Intelligence Platform

## Overview

Helix is a comprehensive regulatory intelligence platform designed for the MedTech industry. It provides real-time monitoring of global regulatory landscapes, automated data collection from regulatory bodies, AI-powered content categorization, and streamlined approval workflows. The platform serves as a centralized hub for tracking regulatory updates, managing newsletters, and maintaining institutional knowledge.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript, utilizing a modern component-based architecture:
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom Helix branding
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and building

### Backend Architecture
The backend follows a Node.js/Express RESTful architecture:
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js for API routes
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Services**: Modular service architecture for business logic

### Key Design Decisions
1. **Monorepo Structure**: Client, server, and shared code in a single repository for easier development
2. **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
3. **Component Library**: shadcn/ui chosen for consistent, accessible UI components
4. **Serverless-Ready**: Database configured for serverless PostgreSQL (Neon)

## Key Components

### Data Collection Service
- **Purpose**: Automated collection from regulatory data sources (FDA, EMA, etc.)
- **Features**: Scheduled synchronization, API integration, error handling
- **Implementation**: Service-based architecture with configurable data sources

### NLP Service  
- **Purpose**: AI-powered content categorization and analysis
- **Features**: Device type classification, risk level assessment, therapeutic area identification
- **Implementation**: Keyword-based categorization with confidence scoring

### Email Service
- **Purpose**: Newsletter distribution and notifications
- **Features**: SendGrid integration, template management, subscriber management
- **Implementation**: Abstracted email service with fallback handling

### Scheduler Service
- **Purpose**: Automated task scheduling and job management
- **Features**: Daily data collection, weekly newsletters, urgent approval notifications
- **Implementation**: Node.js intervals with error handling and admin notifications

## Data Flow

### Data Collection Pipeline
1. **Scheduled Collection**: Scheduler triggers data source synchronization
2. **API Integration**: Services fetch data from regulatory APIs (FDA, EMA)  
3. **Content Processing**: NLP service categorizes and analyzes content
4. **Database Storage**: Processed data stored via Drizzle ORM
5. **Notification**: Users notified of new high-priority updates

### Approval Workflow
1. **Content Submission**: New regulatory updates or newsletters submitted
2. **Approval Queue**: Items added to pending approvals table
3. **Review Process**: Reviewers approve/reject with comments
4. **Publication**: Approved content made available to subscribers
5. **Audit Trail**: All approval actions logged with timestamps

### Newsletter Generation
1. **Content Aggregation**: System collects approved regulatory updates
2. **Template Application**: Content formatted using email templates
3. **Subscriber Targeting**: Newsletter sent to active subscribers
4. **Delivery Tracking**: Email delivery status monitored and logged

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via Neon serverless
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection Pooling**: Neon serverless connection pooling

### Third-Party APIs
- **FDA API**: Device clearances and regulatory updates
- **EMA API**: European medicines and device approvals  
- **SendGrid**: Email delivery service for newsletters
- **Public Data Sources**: Additional regulatory information sources

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent iconography
- **TanStack Query**: Server state management and caching

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Fast development with HMR
- **TypeScript Compilation**: Real-time type checking
- **Database Migrations**: Drizzle Kit for schema management

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: esbuild bundles Node.js server for production  
- **Static Assets**: Served from dist/public directory
- **Environment Variables**: Database URL and API keys via environment

### Replit Integration
- **Development Banner**: Replit-specific development tools
- **Cartographer Plugin**: Replit file system integration
- **Runtime Error Overlay**: Enhanced development debugging

The platform is designed for easy deployment on Replit with minimal configuration, requiring only database provisioning and environment variable setup.