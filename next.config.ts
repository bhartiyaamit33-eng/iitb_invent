import { withReticle } from '@reticlehq/next';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static landing assets live in /public (hero must remain visually unchanged).
  poweredByHeader: false,
  images: {
    qualities: [72, 75, 90, 100],
  },
  // Smaller runtime footprint for t3.micro EC2 deploys.
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/colloquium/:path*",
        destination: "/conference/:path*",
        permanent: true,
      },
      { source: "/invent", destination: "/about", permanent: true },
      { source: "/iitb-invent", destination: "/about", permanent: true },
      { source: "/iitb_invent", destination: "/about", permanent: true },
      { source: "/iitbinvent", destination: "/about", permanent: true },
      { source: "/dsse", destination: "/dsse-day", permanent: true },
      { source: "/dsse-day-2027", destination: "/dsse-day", permanent: true },
    ];
  },
  // Keep AWS SDK / sharp as Node requires. Webpack-splitting them into
  // `.next/server/chunks/*.js` is what produced "Cannot find module './chunks/6181.js'"
  // on EC2 when a status-update email ran (status saved, SES send then failed).
  serverExternalPackages: [
    "@aws-sdk/client-sesv2",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "sharp",
  ],
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
