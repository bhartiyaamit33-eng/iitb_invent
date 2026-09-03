import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static landing assets live in /public (hero must remain visually unchanged).
  poweredByHeader: false,
  // Smaller runtime footprint for t3.micro EC2 deploys.
  output: "standalone",
};

export default nextConfig;
