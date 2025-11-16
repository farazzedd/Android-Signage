#!/bin/bash

# Backup script for Elvision
# Run this daily to backup database and uploads

BACKUP_DIR="/backups/elvision"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "🔄 Starting Elvision backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "📊 Backing up database..."
docker compose exec -T backend tar czf - /app/db.sqlite | gzip > $BACKUP_DIR/db_$DATE.tar.gz

# Backup uploads
echo "📁 Backing up uploads..."
tar czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/elvision/uploads/ || true

# Delete old backups
echo "🗑️  Cleaning up old backups..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup complete"
echo "Backups stored in: $BACKUP_DIR"

# Optional: Upload to S3
# aws s3 sync $BACKUP_DIR s3://your-bucket/backups/

ls -lh $BACKUP_DIR | tail -10
