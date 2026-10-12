# INV.ENT on the department LAN host: http://10.127.1.23/invent
# Built with basePath=/invent; Apache proxies /invent here (see deploy/lan/README.md).
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund
COPY . .
ARG NEXT_PUBLIC_BASE_PATH=/invent
ARG NEXT_PUBLIC_SITE_URL=https://www.som.iitb.ac.in/invent
# The build never reaches a database; the sitemap tolerates that.
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL=postgresql://build:build@127.0.0.1:1/build
RUN npx prisma generate && npx next build

FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*
# next start reads next.config.ts again at runtime, so basePath must be set here too.
ARG NEXT_PUBLIC_BASE_PATH=/invent
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=build /app /app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/invent/robots.txt >/dev/null 2>&1 || exit 1
# Additive migrations only ever run against this instance's own database.
CMD ["sh", "-c", "npx prisma migrate deploy && exec npx next start -H 0.0.0.0 -p 3000"]
