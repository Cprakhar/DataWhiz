import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_BASE_URL

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites () {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/v1/auth/:path*`
      }
    ]
  }
};

export default nextConfig;
