#!/usr/bin/env bash
# Per-boot startup: bring the PostgreSQL cluster online.
# The dev server itself runs as a named terminal (see environment.json).
set -euo pipefail

PG_VERSION=16
PG_PORT=5433

echo "==> Starting the PostgreSQL cluster"
sudo pg_ctlcluster "$PG_VERSION" main start 2>/dev/null || true

for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -p "$PG_PORT" >/dev/null 2>&1; then
    echo "==> PostgreSQL is ready on port ${PG_PORT}"
    exit 0
  fi
  sleep 1
done

echo "!! PostgreSQL did not become ready on port ${PG_PORT}" >&2
exit 1
