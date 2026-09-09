#!/usr/bin/env bash
# Idempotent dev-environment bootstrap for the INVENT platform.
# Installs PostgreSQL, prepares the database, installs node deps, and
# runs Prisma migrate + seed. Safe to run repeatedly.
set -euo pipefail

cd "$(dirname "$0")/.."

PG_VERSION=16
PG_PORT=5433
PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"

echo "==> Ensuring PostgreSQL ${PG_VERSION} is installed"
if ! command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
fi

echo "==> Binding the cluster to port ${PG_PORT} (matches .env DATABASE_URL)"
if [ -f "$PG_CONF" ]; then
  sudo sed -i "s/^port = 5432/port = ${PG_PORT}/" "$PG_CONF" || true
fi

echo "==> Starting the PostgreSQL cluster"
sudo pg_ctlcluster "$PG_VERSION" main start 2>/dev/null || true
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -p "$PG_PORT" >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Ensuring the 'invent' role and database exist"
if ! sudo -u postgres psql -p "$PG_PORT" -tAc "SELECT 1 FROM pg_roles WHERE rolname='invent'" | grep -q 1; then
  sudo -u postgres psql -p "$PG_PORT" -c "CREATE ROLE invent WITH LOGIN PASSWORD 'invent' CREATEDB;"
fi
if ! sudo -u postgres psql -p "$PG_PORT" -tAc "SELECT 1 FROM pg_database WHERE datname='invent'" | grep -q 1; then
  sudo -u postgres psql -p "$PG_PORT" -c "CREATE DATABASE invent OWNER invent;"
fi

echo "==> Ensuring a local .env exists"
if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(openssl rand -base64 32)"
  sed -i "s|AUTH_SECRET=\"replace-me-with-a-long-random-string\"|AUTH_SECRET=\"${SECRET}\"|" .env
  echo "    created .env with a generated AUTH_SECRET"
fi

echo "==> Installing node dependencies"
npm install

echo "==> Generating Prisma client and applying migrations"
npx prisma generate
npx prisma migrate deploy

echo "==> Seeding the database"
npm run db:seed

echo "==> Install complete"
