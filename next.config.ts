import { withReticle } from '@reticlehq/next';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public landing is app/page.tsx (poster system). Assets remain in /public.
  poweredByHeader: false,
  images: {
    qualities: [72, 75, 90, 100],
  },
  // Smaller runtime footprint for t3.micro EC2 deploys.
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async redirects() {
    return [
      { source: "/invent", destination: "/about", permanent: true },
      { source: "/iitb-invent", destination: "/about", permanent: true },
      { source: "/iitb_invent", destination: "/about", permanent: true },
      { source: "/iitbinvent", destination: "/about", permanent: true },
      { source: "/dsse", destination: "/dsse-day", permanent: true },
      { source: "/dsse-day-2027", destination: "/dsse-day", permanent: true },
    ];
  },
};

export default withReticle(nextConfig);
