# INVENT — DSSE Day · IIT Bombay

Multi-year event platform for **INVENT** (Desai Sethi School of Entrepreneurship foundation day). First target edition: **Sunday 31 January 2027**, Asia/Kolkata.

- Live (Cloudflare edge; origin on EC2 EIP): [iitbinvent.com](https://iitbinvent.com)
- AWS preview (EC2): [http://43.205.7.101](http://43.205.7.101)
- Queries: [support@iitbinvent.com](mailto:support@iitbinvent.com)
- Venue: Desai Sethi School of Entrepreneurship · **DSSE Building** · IIT Bombay · Powai, Mumbai 400076

Campus partners: [E-Cell](https://ecell.in) · [SINE](https://sineiitb.org)

---

## Stack (M1)

| Layer | Choice |
| --- | --- |
| Runtime | **Node.js 22** (see `.nvmrc` / `.node-version`) |
| App | Next.js 15 App Router + TypeScript (strict) + Tailwind v4 (`output: "standalone"`) |
| Data | Prisma + PostgreSQL (Docker on EC2 / local) |
| **AWS runtime (now)** | **EC2 `t3.micro`** `i-011126e849f5cbeb6` · `15.206.84.172` · `ap-south-1` |
| Email | **AWS SES** FROM `conference@iitbinvent.com` (`ap-south-1`) |
| Optional later | Amplify Hosting · RDS; S3 `invent-m1-uploads-221237747582` (5 GB cap) |
| Legacy | Cloudflare Worker in `legacy-cloudflare/` until DNS cutover |

The homepage at `/` serves `public/index.html` **unchanged** (hero visuals untouched). React pixel-match of the landing is **M2**.

---

## Prerequisites

- **Node.js 22.x** (`nvm use` / `fnm use` / Homebrew `node@22`)
- Docker (Postgres)
- npm 10+

```bash
node -v   # must be v22.x
```

---

## Local development

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env

# 3. Postgres (maps host :5433 → container :5432)
docker compose up -d

# 4. Migrate + generate client + seed
npm run db:migrate
npm run db:seed

# 5. Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Inv.ent landing (hero identical to production).

Useful stubs: `/programme` · `/login` · `/dashboard` · `/admin` (admin requires sign-in)

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev (Turbopack) |
| `npm run build` | Production build + copy `public` / static into standalone |
| `npm run prepare:standalone` | Re-copy assets into `.next/standalone` (idempotent) |
| `npm run start` | Serve production build |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` (EC2 / CI) |
| `npm run db:seed` | Seed editions + admin (`passwordHash` bcrypt; optional `ADMIN_SEED_PASSWORD`) |
| `npm run db:studio` | Prisma Studio |
| `npm run cf:dev` / `cf:deploy` | Legacy Cloudflare (optional) |

---

## EC2 deploy (primary AWS runtime)

**Instance:** `i-011126e849f5cbeb6` · **t3.micro** · **ap-south-1** · public IP **15.206.84.172**  
**SG:** `iitb-invent-sg` (SSH/HTTP/HTTPS open — **SHOULD** restrict SSH to your IP later)  
**Key:** `~/.ssh/first_time.pem` (never commit `.pem` files)

```bash
ssh -i ~/.ssh/first_time.pem ec2-user@15.206.84.172
```

### Layout on the box

| Piece | How |
| --- | --- |
| App | Node 22 · Next standalone · systemd `invent` on `:3000` |
| DB | Docker Postgres 16 · `127.0.0.1:5433` only |
| Proxy | nginx `:80` → `127.0.0.1:3000` |
| Code | `/opt/invent` · branch from GitHub `bhartiyaamit33-eng/iitb_invent` |

Secrets live in `/opt/invent/.env` on the server only (gitignored).

### Redeploy (after push)

```bash
ssh -i ~/.ssh/first_time.pem ec2-user@15.206.84.172
cd /opt/invent
git pull
npm ci
npx prisma migrate deploy
npm run db:seed
npm run build   # includes prepare-standalone (public/assets + .next/static)
sudo systemctl restart invent
```

Do **not** run `cp -r public .next/standalone/public` after build — that nests `public/public` and breaks `/assets/*`. Use `npm run prepare:standalone` (or the post-build step above).

### Security hardening (SHOULD)

1. Restrict SSH (`22`) in `iitb-invent-sg` to your public IP `/32` (keep HTTP/HTTPS open or put Cloudflare in front later).
2. Keep Postgres bound to `127.0.0.1` (already in `docker-compose.yml`).
3. Do not commit `.env`, `.pem`, or DB passwords.
4. When DNS eventually moves off Cloudflare, terminate TLS (ACM + ALB, or nginx + Let’s Encrypt) — not required while Cloudflare remains live.

**DNS:** leave `iitbinvent.com` on Cloudflare. EC2 IP is preview only until M2 landing acceptance.

---

## Admin allowlist

Only **`admin@iitbinvent.com`** (override with `ADMIN_EMAILS=…` comma-separated) may hold role `ADMIN` or open `/admin`.

- Seed upserts that user as `ADMIN` with a **bcrypt `passwordHash`** (plaintext password is never committed; rotate via `ADMIN_SEED_PASSWORD` when seeding).
- Sign in at `/login` (email + password). Admins are redirected to `/admin`.
- `requireRole('ADMIN')` / admin layout reject everyone else with **401/403**.
- Attendees, speakers, volunteers, and non-allowlisted users never reach admin UI or admin mutations.

---

## AWS SES (`conference@iitbinvent.com`)

Region: **ap-south-1** (sandbox until production access is approved). EC2 uses instance profile **`invent-ec2-profile`** (`ses:SendEmail` / `ses:SendRawEmail`).

**FROM:** `EMAIL_FROM=conference@iitbinvent.com`

### Cloudflare DNS to add (do **not** remove existing website records)

| Type | Name | Target / value |
| --- | --- | --- |
| **CNAME** | `vzjmoypemjbwtaf5ffgg35ugb5b4dd2m._domainkey` | `vzjmoypemjbwtaf5ffgg35ugb5b4dd2m.dkim.amazonses.com` |
| **CNAME** | `56wo6hcl4p6knou6va6zgei3qv23apz6._domainkey` | `56wo6hcl4p6knou6va6zgei3qv23apz6.dkim.amazonses.com` |
| **CNAME** | `aum3yoagdlvct35cchbqvolnz6zsneuu._domainkey` | `aum3yoagdlvct35cchbqvolnz6zsneuu.dkim.amazonses.com` |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@iitbinvent.com` |
| **TXT** | `@` (SPF) | Merge `include:amazonses.com` into existing SPF, e.g. `v=spf1 include:amazonses.com ~all` |

Also created SES identities: `conference@iitbinvent.com`, `admin@iitbinvent.com`, domain `iitbinvent.com` (pending until DKIM CNAMEs propagate).

**Sandbox:** you can only send **to** verified identities. Click-verify those mailboxes in SES Console (or wait for domain DKIM), then request production access. Failed sends are logged to `AuditLog` and do not crash the request.

### Transactional triggers (wired)

| Action | Helper / route |
| --- | --- |
| Registration confirmed | `POST /api/registration` → SES |
| Profile created/updated | `POST /api/profile` → SES |
| Magic-link stub | `POST /api/auth/magic-link` → SES |
| Admin SES test | `POST /api/admin/ses-test` (allowlisted ADMIN only) |

Templates: `emails/templates.ts`. Sender: `lib/email/ses.ts` (`@aws-sdk/client-sesv2`).

---

## Seed data

`npm run db:seed` creates:

| Edition | Status | `isCurrent` | Notes |
| --- | --- | --- | --- |
| **2026** | `ARCHIVED` | `false` | Minimal archive placeholder |
| **2027** | `ANNOUNCED` | `true` | Sun 31 Jan 2027, Asia/Kolkata |

Venue: **DSSE Building**, Powai lat/lng. Placeholder content flagged **`TODO: confirm with organisers`**.

---

## Approximate AWS monthly cost (ap-south-1)

| Service | Notes | Ballpark |
| --- | --- | --- |
| **EC2 t3.micro** | Always-on app + Docker Postgres | ~$7–10/mo (or free-tier eligible) |
| **EBS** | Root volume ~8–30 GB | ~$0.5–3/mo |
| **S3** | Cap **5 GB** uploads | ~$0.12/mo at 5 GB |
| **Amplify / RDS** | Optional later — not required for current runtime | skip until needed |
| **SES** | Placeholder | ~$0 until mail volume |

**Realistic now:** about **$8–15/month** for EC2+EBS quietly. Amplify SSR + always-on RDS would add ~$15–25 more — deferred.

**Controls:** billing alarms at $10 and $30; S3 alarm ~4 GB; no Multi-AZ; no App Runner.

---

## Amplify (optional / later)

Amplify app **invent-m1** (`d3byxpkqpnux8m`) exists in `ap-south-1` but is **not** the live runtime. To finish GitHub connect later:

1. Amplify Console → **invent-m1** → Hosting → Connect repository → GitHub → `bhartiyaamit33-eng/iitb_invent`.
2. Complete OAuth if prompted; pick branch; keep `amplify.yml` (Node 22).
3. Set env vars (`DATABASE_URL` only if using RDS, `AUTH_SECRET`, `S3_BUCKET`, …). Do **not** set keys starting with `AWS_` (reserved).
4. Do **not** attach custom domain `iitbinvent.com` until M2.

Default domain (after a successful branch build): `https://main.d3byxpkqpnux8m.amplifyapp.com`.

---

## Edition rollover (stub — admin action in M6)

Rolling to a new year is **data**, not a redeploy: clone drafts → set year/slug/dates → flip `isCurrent` → archive previous. Until admin UI exists, use Prisma Studio / SQL carefully.

---

## DNS cutover checklist (Cloudflare → AWS)

Do **not** cut `iitbinvent.com` until **M2** pixel-match of the landing is accepted.

1. Decide target: keep EC2 (+ TLS) or move to Amplify custom domain.
2. Preview URL matches landing visually (hero unchanged intent).
3. Migrations + seed/content verified.
4. Lower Cloudflare DNS TTL ahead of time.
5. Point apex + `www`; keep `legacy-cloudflare/` for rollback.
6. Confirm HTTPS + monitor 24–48 h.

---

## Design tokens

Live tokens from `public/index.html` (Sora, teal hero palette) live in `app/globals.css` `@theme` for **future** app chrome. **Do not** adopt PRD Section 16 (Archivo / IBM Plex / `#0B4F9E`). The static landing keeps its own embedded CSS.

---

## Repository layout

```
app/                    → Route Handler `/` + route-group stubs
lib/db.ts               → Prisma client
prisma/                 → schema, migrations, seed
public/                 → landing HTML + assets (hero source of truth)
legacy-cloudflare/      → Worker until DNS cutover
amplify.yml             → optional Amplify build (Node 22)
docker-compose.yml      → Postgres (local + EC2)
```

---

## Milestone boundary

**M1 (this):** foundation — scaffold, tokens, Prisma, seed, **EC2 runtime**.  
**Not in M1:** auth UI, registration, admin CMS, React landing rewrite, DNS cutover.
