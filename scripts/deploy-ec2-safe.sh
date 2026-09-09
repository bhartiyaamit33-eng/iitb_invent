#!/usr/bin/env bash
set -euo pipefail

cd /opt/invent

backup_dir="${BACKUP_DIR:-$HOME/invent-backups}"
mkdir -p "$backup_dir"
backup_file="$backup_dir/invent-$(date -u +%Y%m%dT%H%M%SZ).dump"

echo "Creating pre-deployment database backup: $backup_file"
docker exec invent-postgres pg_dump -U invent -d invent -Fc >"$backup_file"
test -s "$backup_file"

echo "Stopping the application for a clean build"
sudo systemctl stop invent
trap 'sudo systemctl start invent' EXIT

npm ci
npm run db:deploy
rm -rf .next
npm run build

sudo systemctl start invent
trap - EXIT
sudo systemctl --no-pager --full status invent

echo "Deployment complete. Database backup: $backup_file"
