# Helix Regulatory Intelligence - Production Deployment Guide

## 🚀 Quick Start Deployment

### Prerequisites
- Docker & Docker Compose installed
- Kubernetes cluster (for K8s deployment)
- Domain name and SSL certificates
- Required API keys (see Security section)

### 1. Environment Setup

```bash
# Clone and prepare
git clone <repository-url>
cd helix-regulatory-intelligence

# Make deployment scripts executable
chmod +x scripts/deploy.sh scripts/backup.sh

# Create SSL certificate directory
mkdir -p ssl/
# Copy your SSL certificates to ssl/certificate.crt and ssl/private.key
```

### 2. Docker Compose Deployment (Recommended for small-medium scale)

```bash
# Set environment variables
export DATABASE_URL="postgresql://helix_user:PASSWORD@postgres:5432/helix_regulatory"
export POSTGRES_PASSWORD="your-secure-password"
export ANTHROPIC_API_KEY="your-anthropic-key"
export FDA_API_KEY="your-fda-key"  # Optional but recommended
export GRAFANA_PASSWORD="admin-password"

# Deploy
./scripts/deploy.sh latest docker
```

### 3. Kubernetes Deployment (For production scale)

```bash
# Update secrets in k8s/secrets.yaml (base64 encode all values)
echo -n "your-password" | base64

# Apply configurations
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml

# Deploy
./scripts/deploy.sh latest kubernetes
```

## 🏗️ Architecture Overview

```
Internet → Nginx (Load Balancer/SSL) → Helix App (3 replicas) → PostgreSQL
                                    ↓
                              Redis Cache
                                    ↓
                            Monitoring Stack
                         (Prometheus + Grafana)
```

## 🔒 Security Configuration

### Required API Keys
Use the secrets management system to configure these keys:

```bash
# Core AI Services
ANTHROPIC_API_KEY=sk-ant-...  # For content analysis

# Regulatory Data Sources
FDA_API_KEY=your-fda-key      # OpenFDA API (optional)
EMA_API_KEY=your-ema-key      # EMA PMS API (requires registration)
MHRA_API_KEY=your-mhra-key    # MHRA MORE Platform API

# GRIP Global Intelligence
GRIP_USERNAME=your-username
GRIP_PASSWORD=your-password

# Database & Security
DATABASE_URL=postgresql://...
JWT_SECRET=min-32-chars-secret
SESSION_SECRET=min-32-chars-secret
```

### SSL/TLS Setup
```bash
# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key -out ssl/certificate.crt

# Or use Let's Encrypt (production)
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/certificate.crt
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/private.key
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `GET /api/health` - Application health status
- `GET /api/metrics` - Prometheus metrics
- `GET /monitoring` - Grafana dashboard (credentials: admin/your-password)

### Monitoring Stack
```bash
# Access Grafana
http://your-domain.com:3001
# Default login: admin / admin (change immediately)

# Access Prometheus
http://your-domain.com:9090

# Key Metrics to Monitor:
- helix_app_status (0=down, 0.5=degraded, 1=healthy)
- helix_requests_total (request count by status)
- helix_response_time_seconds (average response time)
- helix_service_status (database, cache, APIs status)
```

## 🔄 Data Sources Configuration

### Automatic API Management
The platform includes an intelligent API management system that:

- **Prioritizes Official APIs**: FDA OpenFDA, EMA PMS, MHRA MORE Platform
- **Falls back to Web Scraping**: For sources without APIs (BfArM, Swissmedic)
- **Handles Rate Limiting**: Automatic backoff and retry logic
- **Monitors Health**: Real-time status monitoring and alerts

### API Registration Process
1. **FDA OpenFDA**: No registration required (public API)
2. **EMA PMS API**: Register at https://www.ema.europa.eu/en/about-us/how-we-work/big-data
3. **MHRA MORE Platform**: Register at https://www.gov.uk/guidance/register-a-medical-device

### Data Source Admin Interface
Access the admin interface at `/administration/data-sources` to:
- View all 46+ configured data sources
- Configure API keys and authentication
- Monitor sync status and health
- Trigger manual synchronization
- View regional data source distribution

## 📈 Performance Optimization

### Production Settings
```bash
# Application Performance
NODE_ENV=production
API_RATE_LIMIT=1000
DB_POOL_SIZE=20
CACHE_TTL=3600

# Data Collection
SYNC_INTERVAL_HOURS=6
BATCH_SIZE=1000
MAX_RETRIES=3
```

### Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_regulatory_updates_date ON regulatory_updates(last_updated);
CREATE INDEX CONCURRENTLY idx_legal_cases_date ON legal_cases(decision_date);
CREATE INDEX CONCURRENTLY idx_data_sources_active ON data_sources(is_active);
```

### Caching Strategy
- **API Responses**: 1 hour TTL
- **Dashboard Data**: 5 minutes TTL
- **Static Assets**: 1 year TTL (with versioning)
- **Database Queries**: Intelligent caching based on data freshness

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Schedule daily backups (crontab)
0 2 * * * /path/to/helix/scripts/backup.sh

# Manual backup
./scripts/backup.sh

# Restore from backup
psql -h localhost -U helix_user -d helix_regulatory < backup_file.sql
```

### Backup Strategy
- **Daily Database Backups**: Compressed SQL dumps
- **Weekly Application Backups**: Configuration and logs
- **30-day Retention**: Automatic cleanup of old backups
- **Cloud Storage**: Optional S3 integration for off-site backups

## 🚦 Deployment Verification

### Post-Deployment Checklist
```bash
# 1. Health Check
curl -f https://your-domain.com/api/health

# 2. API Endpoints
curl -f https://your-domain.com/api/dashboard/stats
curl -f https://your-domain.com/api/data-sources
curl -f https://your-domain.com/api/regulatory-updates/recent

# 3. Admin Interface
curl -f https://your-domain.com/api/admin/data-sources

# 4. Monitoring
curl -f https://your-domain.com/api/metrics
```

### Expected Response Formats
```json
// Health Check Response
{
  "status": "healthy",
  "timestamp": "2025-08-03T07:49:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": {"status": "up", "responseTime": 45},
    "cache": {"status": "up", "responseTime": 12},
    "externalAPIs": {"status": "up", "responseTime": 234},
    "dataCollection": {"status": "up"}
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database status
docker logs helix-postgres
kubectl logs postgres-pod-name

# Test connection
psql -h your-db-host -U helix_user -d helix_regulatory
```

#### 2. API Rate Limiting
```bash
# Check API status
curl -I https://api.fda.gov/device/recall.json
# Expected: 200 OK with rate limit headers

# Check logs
docker logs helix-app | grep "rate limit"
```

#### 3. SSL Certificate Issues
```bash
# Verify certificate
openssl x509 -in ssl/certificate.crt -text -noout

# Test SSL
curl -I https://your-domain.com
```

### Performance Issues
```bash
# Monitor resource usage
docker stats
kubectl top pods

# Check database performance
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Monitor API response times
curl -w "@curl-format.txt" https://your-domain.com/api/health
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review monitoring dashboards and alerts
- **Monthly**: Update dependencies and security patches  
- **Quarterly**: Performance optimization and capacity planning
- **Annually**: SSL certificate renewal and security audit

### Log Analysis
```bash
# Application logs
docker logs helix-app | tail -100
kubectl logs -f deployment/helix-app

# Database logs
docker logs helix-postgres | grep ERROR

# Nginx access logs
docker logs helix-nginx | grep "POST\|PUT\|DELETE"
```

### Emergency Procedures
```bash
# Scale up quickly (Kubernetes)
kubectl scale deployment helix-app --replicas=10

# Emergency rollback
kubectl rollout undo deployment/helix-app

# Database backup before emergency maintenance
./scripts/backup.sh emergency
```

## 🎯 Success Metrics

### Key Performance Indicators
- **Availability**: >99.9% uptime
- **Response Time**: <2s for 95th percentile
- **Data Freshness**: <6 hours for regulatory updates
- **API Success Rate**: >99.5% for critical endpoints
- **Security**: Zero security incidents

### Business Metrics
- **Data Sources**: 46+ active regulatory authorities
- **Coverage**: Global regulatory intelligence
- **Processing**: 1000+ regulatory updates daily
- **Analysis**: AI-powered content categorization and compliance detection

---

**🚀 Helix Regulatory Intelligence is now production-ready with:**
- ✅ Enterprise-grade deployment infrastructure
- ✅ Comprehensive monitoring and alerting
- ✅ Automated backup and recovery
- ✅ Advanced API management system
- ✅ Real-time health checks and metrics
- ✅ Scalable architecture (Docker + Kubernetes)
- ✅ Security hardening and SSL/TLS
- ✅ 46+ global regulatory data sources