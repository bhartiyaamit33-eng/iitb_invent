# INV.ENT on the LAN host — https://www.som.iitb.ac.in/invent

Served from http://10.127.1.23/invent, which www.som.iitb.ac.in reverse-proxies
for testing. The public address is `SITE_URL`/`AUTH_URL` in `.env.lan.local`
(read at runtime; change it and run `up -d` again). Log in through the public
address: login cookies require HTTPS, so signing in on the raw IP does not stick.

A development copy of the site on the department server, for trying changes
before they go anywhere near iitbinvent.com. It has **its own empty database**
(`invent-lan-db`) and never connects to production.

| Piece | Where |
| --- | --- |
| App | Docker container `invent-lan-web`, built with `basePath=/invent`, on `127.0.0.1:3040` |
| Database | Docker container `invent-lan-db` (Postgres 16), volume `invent-lan_invent-lan-pgdata` |
| Uploaded abstracts | volume `invent-lan_invent-lan-abstracts` (no S3 here) |
| Proxy | Apache forwards `/invent` to the container: `.htaccess` rule or vhost `<Location>` (step 2 below) |
| Settings and secrets | `.env.lan.local` in the repo root (mode 600, gitignored, not copied into the image) |

## Run or update

```bash
cd /srv/www/invent
docker compose -f deploy/lan/compose.yml up -d --build   # build and (re)start
docker compose -f deploy/lan/compose.yml logs -f web     # logs
docker compose -f deploy/lan/compose.yml down            # stop (data volumes are kept)
```

The web container applies pending Prisma migrations to its own database on start.

## First-time setup

1. Seed sample data and the admin login (only ever on this empty LAN database):

   ```bash
   docker compose -f deploy/lan/compose.yml exec -e NODE_ENV=development \
     -e ALLOW_DESTRUCTIVE_SEED=RESET_LOCAL_DATA web npx prisma db seed
   ```

   Admin: `admin@iitbinvent.com`, password `ADMIN_SEED_PASSWORD` in `.env.lan.local`.

2. Publish it at `/invent`. Apache owns port 80 on this host, so it has to
   forward `/invent` to the container. Use **one** of:

   - **No root:** a proxy rule at the top of the WordPress docroot `.htaccess`
     (the vhost allows `AllowOverride FileInfo`):

     ```bash
     bash deploy/lan/htaccess-proxy.sh install    # ... remove to unpublish
     ```

     It backs up `.htaccess`, then checks that the WordPress home page and
     `/invent` both answer 200, and restores the backup if not.

   - **Root, the acadxai way:** a `<Location /invent>` block in the vhost:

     ```bash
     sudo bash deploy/lan/install-apache.sh
     ```

     It backs up `wordpress.conf`, adds the block, runs `apache2ctl configtest`,
     and only then reloads Apache. If the test fails it restores the backup.

## What does not work here

- **Email**: there are no AWS SES credentials on this host, so proforma invoices,
  receipts and status emails are recorded as failed in the `AuditLog` table and not delivered.
- **Online payment** runs against IIT Bombay OnlinePay's TEST host with TEST app
  10172 (settings in `.env.lan.local`). The TEST host and this server are both
  on the IITB network, so the payer's browser must be on it too. ASC needs these
  registered for app 10172:
  - Validation URL: `https://www.som.iitb.ac.in/invent/api/onlinepay/validate`
  - Return URL: `https://www.som.iitb.ac.in/invent/api/onlinepay/payack`
