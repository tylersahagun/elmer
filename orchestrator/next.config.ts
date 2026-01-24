import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable instrumentation hook to auto-start the background worker
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
