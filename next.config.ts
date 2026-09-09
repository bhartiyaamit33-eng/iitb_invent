import { withReticle } from '@reticlehq/next';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static landing assets live in /public (hero must remain visually unchanged).
  poweredByHeader: false,
  // Smaller runtime footprint for t3.micro EC2 deploys.
  output: "standalone",
  experimental: {
    // Extended abstracts are PDFs up to 10 MB.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default withReticle(nextConfig);
