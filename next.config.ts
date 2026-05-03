import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* output is managed by @netlify/plugin-nextjs — do NOT set output: "standalone" or "export" */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
