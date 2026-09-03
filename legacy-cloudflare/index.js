/**
 * Cloudflare edge proxy → EC2 Next.js origin (iitbinvent.com cutover).
 * SSL terminates at Cloudflare; origin is HTTP on Elastic IP.
 */
const ORIGIN = "http://43.205.7.101";

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, ORIGIN);

    const headers = new Headers(request.headers);
    headers.set("Host", incoming.hostname);
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

    // Keep visitors on the public hostname if origin redirects to the IP/http
    const loc = outHeaders.get("Location");
    if (loc) {
      try {
        const u = new URL(loc, ORIGIN);
        if (
          u.hostname === "43.205.7.101" ||
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

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders,
    });
  },
};
