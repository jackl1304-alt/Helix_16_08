#!/bin/bash
# Helix Regulatory Intelligence - Automated Backup Script

set -e

# Configuration
BACKUP_DIR="/backups"
DB_NAME="helix_regulatory"
DB_USER="${POSTGRES_USER:-helix_user}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
DATE=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Starting Helix database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Database backup
echo -e "${YELLOW}📊 Creating database backup...${NC}"
BACKUP_FILE="$BACKUP_DIR/helix_db_$DATE.sql"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --verbose --clean --no-owner --no-privileges > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Database backup created: $BACKUP_FILE${NC}"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup compressed: ${BACKUP_FILE}.gz${NC}"
else
    echo -e "${RED}❌ Database backup failed${NC}"
    exit 1
fi

# Application data backup (logs, configs, etc.)
echo -e "${YELLOW}📁 Creating application data backup...${NC}"
APP_BACKUP_FILE="$BACKUP_DIR/helix_app_$DATE.tar.gz"

tar -czf "$APP_BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='*.log' \
    /app/logs \
    /app/.env.production \
    /app/monitoring \
    2>/dev/null || true

echo -e "${GREEN}✅ Application data backup created: $APP_BACKUP_FILE${NC}"

# Clean up old backups
echo -e "${YELLOW}🧹 Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "helix_*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "helix_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Backup verification
echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
if gunzip -t "${BACKUP_FILE}.gz"; then
    echo -e "${GREEN}✅ Database backup integrity verified${NC}"
else
    echo -e "${RED}❌ Database backup integrity check failed${NC}"
    exit 1
fi

# Upload to cloud storage (if configured)
if [[ -n "$AWS_S3_BUCKET" ]]; then
    echo -e "${YELLOW}☁️ Uploading to AWS S3...${NC}"
    aws s3 cp "${BACKUP_FILE}.gz" "s3://$AWS_S3_BUCKET/helix-backups/"
    aws s3 cp "$APP_BACKUP_FILE" "s3://$AWS_S3_BUCKET/helix-backups/"
    echo -e "${GREEN}✅ Backups uploaded to S3${NC}"
fi

# Generate backup report
BACKUP_SIZE=$(du -sh "${BACKUP_FILE}.gz" | cut -f1)
APP_BACKUP_SIZE=$(du -sh "$APP_BACKUP_FILE" | cut -f1)

cat > "$BACKUP_DIR/backup_report_$DATE.txt" << EOF
Helix Regulatory Intelligence - Backup Report
===========================================
Date: $(date)
Database Backup: ${BACKUP_FILE}.gz ($BACKUP_SIZE)
Application Backup: $APP_BACKUP_FILE ($APP_BACKUP_SIZE)
Retention Policy: $RETENTION_DAYS days
Status: SUCCESS

Database Statistics:
$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
ORDER BY n_tup_ins DESC 
LIMIT 10;" 2>/dev/null || echo "Database statistics unavailable")

Disk Usage:
$(df -h "$BACKUP_DIR")

Available Backups:
$(ls -lh "$BACKUP_DIR"/helix_*.gz | tail -10)
EOF

echo -e "${GREEN}✅ Backup report generated: $BACKUP_DIR/backup_report_$DATE.txt${NC}"

echo ""
echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo -e "Database backup: ${BACKUP_FILE}.gz ($BACKUP_SIZE)"
echo -e "Application backup: $APP_BACKUP_FILE ($APP_BACKUP_SIZE)"
echo -e "Backup location: $BACKUP_DIR"
echo -e "Completed at: $(date)"