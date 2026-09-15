/**
 * Cloudflare edge proxy → EC2 Next.js origin (iitbinvent.com cutover).
 * SSL terminates at Cloudflare; origin is HTTP.
 *
 * Workers cannot fetch() a raw IP (error 1003). Origin must be a hostname
 * on this Cloudflare zone as a DNS-only (grey cloud) A record, e.g.:
 *   origin.iitbinvent.com  A  43.205.7.101  (DNS only, not proxied)
 */
const ORIGIN_HOST = "origin.iitbinvent.com";
const ORIGIN = `http://${ORIGIN_HOST}`;

function isOnlinePayHost(hostname) {
  return (
    hostname === "newtestasc.iitb.ac.in" ||
    hostname === "portal.iitb.ac.in" ||
    hostname === "onlinepay.iitb.ac.in"
  );
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** OP rejects navigations with no Referer (pasted URL or a bare 303). */
function onlinePayHandoffHtml(opUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="origin" />
  <title>IIT Bombay Online Pay</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 3rem auto; padding: 0 1.25rem; color: #17333a; line-height: 1.5; }
    a.btn { display: inline-block; margin-top: 1rem; background: #1a6b6b; color: #fff; padding: 0.75rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <p>INVENT · Research Conference</p>
  <h1>Opening IIT Bombay Online Pay</h1>
  <p>Stay on this page for a moment. The gateway must see a Referer from iitbinvent.com.</p>
  <p><a class="btn" href="${escapeHtml(opUrl)}" referrerpolicy="origin">Continue to IIT Bombay Online Pay</a></p>
  <script>
    window.setTimeout(function () {
      window.location.assign(${JSON.stringify(opUrl)});
    }, 400);
  </script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, ORIGIN);

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.set("X-Forwarded-Host", incoming.hostname);
    headers.set("X-Forwarded-Proto", "https");
    headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") || "");

    /** @type {RequestInit & { duplex?: string }} */
    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }

    const upstream = await fetch(target.toString(), init);
    const outHeaders = new Headers(upstream.headers);

    const loc = outHeaders.get("Location");
    if (loc) {
      try {
        const u = new URL(loc, ORIGIN);
        if (isOnlinePayHost(u.hostname)) {
          const html = onlinePayHandoffHtml(u.toString());
          const handoff = new Headers();
          handoff.set("Content-Type", "text/html; charset=utf-8");
          handoff.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
          handoff.set("Referrer-Policy", "origin");
          const cookies =
            typeof outHeaders.getSetCookie === "function"
              ? outHeaders.getSetCookie()
              : [];
          for (const cookie of cookies) {
            handoff.append("Set-Cookie", cookie);
          }
          return new Response(html, { status: 200, headers: handoff });
        }
        if (
          u.hostname === ORIGIN_HOST ||
          u.hostname === "43.205.7.101" ||
          u.hostname === "ec2-43-205-7-101.ap-south-1.compute.amazonaws.com" ||
          u.hostname === "127.0.0.1" ||
          u.hostname === "localhost" ||
          u.protocol === "http:"
        ) {
          u.protocol = "https:";
          u.hostname = incoming.hostname;
          u.port = "";
          outHeaders.set("Location", u.toString());
        }
      } catch {
        /* leave Location as-is */
      }
    }

    // Never let Cloudflare keep the old static homepage cached at the edge
    outHeaders.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
    outHeaders.set("CDN-Cache-Control", "no-store");
    outHeaders.delete("ETag");
    outHeaders.delete("Last-Modified");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  },
};
