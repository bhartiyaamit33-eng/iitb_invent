# INVENT — DSSE Day · IIT Bombay

Event site for **INVENT** (Desai Sethi School of Entrepreneurship foundation day) on **31 January 2027**.

- Live: [iitbinvent.com](https://iitbinvent.com)
- Queries: [support@iitbinvent.com](mailto:support@iitbinvent.com)

## Stack

Cloudflare Worker + static assets (`public/`), deployed with Wrangler.

## Local

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Requires Cloudflare auth (`npx wrangler login`) on the account that owns `iitbinvent.com`.
