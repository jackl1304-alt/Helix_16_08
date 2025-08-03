#!/bin/bash
# Helix Regulatory Intelligence - Production Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="helix-regulatory"
IMAGE_NAME="helix-regulatory"
VERSION=${1:-latest}
DEPLOYMENT_ENV=${2:-production}

echo -e "${BLUE}🚀 Starting Helix Regulatory Intelligence Deployment${NC}"
echo -e "Version: ${VERSION}"
echo -e "Environment: ${DEPLOYMENT_ENV}"
echo ""

# Pre-deployment checks
echo -e "${YELLOW}📋 Running pre-deployment checks...${NC}"

# Check if required files exist
required_files=("Dockerfile" "docker-compose.yml" "package.json" ".env.production")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}❌ Required file missing: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required files present${NC}"

# Check environment variables
if [[ -z "$DATABASE_URL" ]]; then
    echo -e "${RED}❌ DATABASE_URL environment variable not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Build Application
echo -e "${YELLOW}🔨 Building application...${NC}"
docker build -t ${IMAGE_NAME}:${VERSION} .

if [[ $? -ne 0 ]]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Application built successfully${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
docker run --rm ${IMAGE_NAME}:${VERSION} npm test

if [[ $? -ne 0 ]]; then
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All tests passed${NC}"

# Database migration
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
npm run db:push

if [[ $? -ne 0 ]]; then
    echo -e "${RED}❌ Database migration failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database migrated successfully${NC}"

# Deploy based on environment
case $DEPLOYMENT_ENV in
    "docker")
        echo -e "${YELLOW}🐳 Deploying with Docker Compose...${NC}"
        docker-compose down
        docker-compose up -d --build
        ;;
    "kubernetes")
        echo -e "${YELLOW}☸️ Deploying to Kubernetes...${NC}"
        kubectl apply -f k8s/
        kubectl rollout status deployment/${APP_NAME}
        ;;
    "production")
        echo -e "${YELLOW}🏭 Deploying to production...${NC}"
        # Tag and push to registry
        docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}
        docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}
        
        # Update production deployment
        kubectl set image deployment/${APP_NAME} ${APP_NAME}=${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}
        kubectl rollout status deployment/${APP_NAME}
        ;;
    *)
        echo -e "${RED}❌ Unknown deployment environment: $DEPLOYMENT_ENV${NC}"
        exit 1
        ;;
esac

# Health check
echo -e "${YELLOW}🏥 Performing health checks...${NC}"
sleep 30

case $DEPLOYMENT_ENV in
    "docker")
        health_url="http://localhost:3000/api/health"
        ;;
    "kubernetes"|"production")
        health_url="http://$(kubectl get service ${APP_NAME}-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/api/health"
        ;;
esac

for i in {1..10}; do
    echo "Health check attempt $i/10..."
    if curl -f -s "$health_url" > /dev/null; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
        break
    fi
    
    if [[ $i -eq 10 ]]; then
        echo -e "${RED}❌ Health check failed after 10 attempts${NC}"
        exit 1
    fi
    
    sleep 10
done

# Cleanup old images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

# Success notification
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "Application URL: ${health_url%/api/health}"
echo -e "Health Check: $health_url"
echo -e "Monitoring: ${health_url%/api/health}/monitoring"
echo ""

# Post-deployment verification
echo -e "${YELLOW}🔍 Running post-deployment verification...${NC}"

# Check critical endpoints
endpoints=(
    "/api/health"
    "/api/dashboard/stats"
    "/api/data-sources"
    "/api/regulatory-updates/recent"
)

for endpoint in "${endpoints[@]}"; do
    full_url="${health_url%/api/health}$endpoint"
    if curl -f -s "$full_url" > /dev/null; then
        echo -e "${GREEN}✅ $endpoint - OK${NC}"
    else
        echo -e "${RED}❌ $endpoint - FAILED${NC}"
    fi
done

echo ""
echo -e "${GREEN}🚀 Helix Regulatory Intelligence successfully deployed!${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Environment: ${DEPLOYMENT_ENV}${NC}"
echo -e "${BLUE}Deployment completed at: $(date)${NC}"