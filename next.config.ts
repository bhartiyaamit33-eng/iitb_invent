import { withReticle } from '@reticlehq/next';
import type { NextConfig } from "next";

/**
 * Extra hosts allowed to POST Server Actions, comma-separated, for review or
 * tunnel URLs that are not known at build time.
 * e.g. SERVER_ACTION_ORIGINS="preview.example.com,foo.trycloudflare.com"
 */
const extraServerActionOrigins = (process.env.SERVER_ACTION_ORIGINS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Static landing assets live in /public (hero must remain visually unchanged).
  poweredByHeader: false,
  images: {
    qualities: [72, 75, 90, 100],
  },
  // Smaller runtime footprint for t3.micro EC2 deploys.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/conference/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/research",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/logout",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // The call for papers now lives on the Research tab. /conference keeps
      // working because registrations are already open against those links —
      // only the landing page of the old route moves. /conference/pay/* and
      // /conference/thanks are untouched, so live payment links still resolve.
      { source: "/conference", destination: "/research", permanent: false },
      { source: "/colloquium", destination: "/research", permanent: true },
      {
        source: "/colloquium/:path*",
        destination: "/conference/:path*",
        permanent: true,
      },
      { source: "/invent", destination: "/about", permanent: true },
      { source: "/iitb-invent", destination: "/about", permanent: true },
      { source: "/iitb_invent", destination: "/about", permanent: true },
      { source: "/iitbinvent", destination: "/about", permanent: true },
      { source: "/dsse", destination: "/about", permanent: true },
      { source: "/dsse-day", destination: "/about", permanent: true },
      { source: "/dsse-day-2027", destination: "/about", permanent: true },
      { source: "/ventures", destination: "/", permanent: false },
      { source: "/ventures/:path*", destination: "/", permanent: false },
      { source: "/:year(\\d{4})/attendees", destination: "/dashboard", permanent: false },
      { source: "/:year(\\d{4})/attendees/:path*", destination: "/dashboard", permanent: false },
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
    // fail CSRF and the browser can sit on "Submitting…" forever — which is
    // also what happens behind any preview/staging host, hence EXTRA_ORIGINS.
    serverActions: {
      bodySizeLimit: "12mb",
      allowedOrigins: [
        "iitbinvent.com",
        "www.iitbinvent.com",
        "origin.iitbinvent.com",
        ...extraServerActionOrigins,
      ],
    },
  },
};

export default withReticle(nextConfig);
