import { withReticle } from '@reticlehq/next';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static landing assets live in /public (hero must remain visually unchanged).
  poweredByHeader: false,
  // Smaller runtime footprint for t3.micro EC2 deploys.
  output: "standalone",
  experimental: {
    // Extended abstracts are PDFs up to 10 MB.
    // allowedOrigins: the public site is served via Cloudflare Worker while
    // Next.js sees Host: origin.iitbinvent.com. Without this, Server Actions
    // fail CSRF and the browser can sit on "Submitting…" forever.
    serverActions: {
      bodySizeLimit: "12mb",
      allowedOrigins: [
        "iitbinvent.com",
        "www.iitbinvent.com",
        "origin.iitbinvent.com",
      ],
    },
  },
};

export default withReticle(nextConfig);
