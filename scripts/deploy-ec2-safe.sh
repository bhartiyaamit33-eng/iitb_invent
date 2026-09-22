#!/usr/bin/env bash
set -euo pipefail

# Run from the checkout this script lives in, so the deploy does not depend on
# the app sitting at one hardcoded path. Override with APP_DIR=/path if needed.
app_dir="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$app_dir"
echo "Deploying from: $app_dir"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Git revision: $(git rev-parse --short HEAD) — $(git log -1 --format=%s)"
else
  echo "This directory is not a git checkout. Refusing to deploy." >&2
  exit 1
fi

pg_container="${PG_CONTAINER:-invent-postgres}"
backup_dir="${BACKUP_DIR:-$HOME/invent-backups}"
mkdir -p "$backup_dir"
backup_file="$backup_dir/invent-$(date -u +%Y%m%dT%H%M%SZ).dump"

echo "Creating pre-deployment database backup: $backup_file"
if ! docker exec "$pg_container" pg_dump -U invent -d invent -Fc >"$backup_file"; then
  rm -f "$backup_file"
  echo "Backup FAILED: could not pg_dump from container '$pg_container'." >&2
  echo "Check 'docker ps' and re-run with PG_CONTAINER=<name>. Refusing to deploy without a backup." >&2
  exit 1
fi
# A truncated or empty dump is not a backup, and deploying past one is how a
# bad migration becomes unrecoverable.
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
