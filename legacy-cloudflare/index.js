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
        if (
          u.hostname === ORIGIN_HOST ||
          u.hostname === "43.205.7.101" ||
          u.hostname === "ec2-43-205-7-101.ap-south-1.compute.amazonaws.com" ||
          u.hostname === "127.0.0.1" ||
          u.protocol === "http:"
        ) {
          u.protocol = "https:";
          u.hostname = incoming.hostname;
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
