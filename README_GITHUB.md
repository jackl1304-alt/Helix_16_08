# Helix - AI-Powered MedTech Regulatory Intelligence Platform

<div align="center">
  <h1>🧬 Helix</h1>
  <p>Advanced AI-powered regulatory intelligence platform for global MedTech compliance tracking</p>
  
  [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
</div>

## 🚀 Features

### 🤖 AI-Powered Automation
- **Intelligent Approval System**: Automated regulatory update evaluation with detailed reasoning
- **NLP Content Analysis**: Advanced categorization and risk assessment
- **Real-time Processing**: 5,443+ regulatory updates with continuous monitoring

### 📊 Comprehensive Data Management
- **Global Regulatory Sources**: FDA, EMA, BfArM, MHRA, Swissmedic, and more
- **Legal Jurisprudence Database**: 1,825+ medical device court cases across major jurisdictions
- **Historical Data Archive**: Complete regulatory document history with version tracking

### 🔍 Advanced Analytics
- **Dashboard Intelligence**: Real-time statistics and trend analysis
- **Audit Trail System**: Complete system activity logging with detailed insights
- **Risk Assessment Matrix**: Automated compliance gap detection

### 🌐 Modern Architecture
- **React 18 Frontend**: Modern, responsive UI with Tailwind CSS
- **Express.js Backend**: Scalable Node.js server architecture
- **PostgreSQL Database**: Robust data persistence with Drizzle ORM
- **TypeScript**: Full type safety across the entire stack

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Vite for build optimization

**Backend:**
- Node.js with Express.js
- PostgreSQL with Drizzle ORM
- AI integration capabilities
- RESTful API design

**Deployment:**
- Docker containerization
- Render.com ready configuration
- Environment-based configuration
- Automated CI/CD pipeline

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL database
- npm or yarn package manager

## 🔧 Installation

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/helix-regulatory-platform.git
cd helix-regulatory-platform
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Database setup:**
```bash
npm run db:push
```

5. **Start development server:**
```bash
npm run dev
```

### Production Deployment

See [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md) for complete deployment instructions.

## 🌐 Quick Deploy to Render.com

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the "Deploy to Render" button above
2. Connect your GitHub account
3. Set environment variables
4. Deploy automatically

## 📊 Core Modules

### 🏠 Dashboard
- Real-time regulatory update statistics
- Pending approval overview
- System health monitoring
- Quick access to all modules

### 📄 Data Collection
- Global regulatory source management
- Automated synchronization scheduling
- Real-time status monitoring
- Historical data archiving

### ⚖️ Legal Database
- Comprehensive court case library
- Advanced search and filtering
- Impact analysis tools
- Jurisdiction-specific insights

### 🤖 AI Approval System
- Automated content evaluation
- Detailed reasoning documentation
- Quality scoring algorithms
- Compliance assessment

### 📋 Audit Logs
- Complete system activity tracking
- User action monitoring
- Security event logging
- Export capabilities

## 🔧 Configuration

### Environment Variables

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start

# Database migration
npm run db:push
```

## 📖 API Documentation

### Core Endpoints

```
GET /api/dashboard/stats          # Dashboard statistics
GET /api/regulatory-updates       # Regulatory updates list
GET /api/legal-cases              # Legal cases database
GET /api/approvals                # Approval workflow
GET /api/audit-logs               # System audit logs
```

### Data Sources

```
GET /api/data-sources             # Global regulatory sources
PATCH /api/data-sources/:id       # Update source status
POST /api/data-sources/sync       # Manual synchronization
```

## 🏗️ Architecture

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   └── lib/            # Utilities and helpers
├── server/                 # Express.js backend
│   ├── services/           # Business logic services
│   └── routes.ts           # API route definitions
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schema definitions
└── dist/                   # Production build output
```

## 🧪 Testing

```bash
# Type checking
npm run check

# Build verification
npm run build

# Production test
npm start
```

## 📦 Deployment Options

### Render.com (Recommended)
- One-click deployment
- Automatic SSL certificates
- Built-in PostgreSQL database
- Zero-downtime deployments

### Alternative Platforms
- Vercel (with serverless functions)
- Railway (full-stack hosting)
- DigitalOcean App Platform
- AWS/GCP/Azure (container deployment)

## 🔒 Security

- Environment variable protection
- HTTPS enforcement
- Database connection encryption
- Audit trail monitoring
- Input validation and sanitization

## 📈 Monitoring

- Application health checks
- Database performance monitoring
- Error tracking and logging
- Uptime monitoring
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 Documentation: See [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📧 Contact: Open an issue for support

## 🎯 Roadmap

- [ ] Enhanced AI models for regulatory analysis
- [ ] Additional regulatory source integrations
- [ ] Advanced analytics and reporting
- [ ] Mobile application development
- [ ] API rate limiting and authentication
- [ ] Multi-language support expansion

---

<div align="center">
  <p>Built with ❤️ for the MedTech regulatory community</p>
  <p>🧬 <strong>Helix</strong> - Transforming regulatory intelligence through AI</p>
</div>