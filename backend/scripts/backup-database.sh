#!/bin/bash
# Daily PostgreSQL backup for NyayaOne — keeps the last 7 days locally.
# For real disaster protection, also copy backups off-server (see note at bottom).

set -e

BACKUP_DIR="$HOME/nyayaone-backups"
DATE=$(date +%F)
FILENAME="nyayaone-backup-$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

# --- Development (docker-compose.yml) ---
# docker exec nyayaone_postgres pg_dump -U nyayaone nyayaone_db | gzip > "$BACKUP_DIR/$FILENAME"

# --- Production (docker-compose.prod.yml) ---
docker exec nyayaone_postgres_prod pg_dump -U "${DB_USER:-nyayaone}" "${DB_NAME:-nyayaone_db}" | gzip > "$BACKUP_DIR/$FILENAME"

echo "Backup saved: $BACKUP_DIR/$FILENAME"

# Delete backups older than 7 days — keeps disk usage bounded.
find "$BACKUP_DIR" -name "nyayaone-backup-*.sql.gz" -mtime +7 -delete

echo "Old backups (>7 days) cleaned up."

# ------------------------------------------------------------------
# IMPORTANT: This backs up to the SAME server's disk. If the server
# itself fails (disk crash, provider issue), local backups are lost
# too. For real protection, also copy backups to a SEPARATE location —
# e.g. add this line after the gzip step:
#
#   rclone copy "$BACKUP_DIR/$FILENAME" remote:nyayaone-backups/
#
# (rclone supports Backblaze B2, Cloudflare R2, AWS S3, Google Drive,
# etc. — set up whichever is cheapest once you're ready; free tiers on
# B2/R2 cover this easily for a while.)
# ------------------------------------------------------------------
