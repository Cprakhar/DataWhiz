import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_BASE_URL

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'avatars.githubusercontent.com',
      port: '',
      pathname: '/u/**'
    }]
  },


  async rewrites () {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/v1/auth/:path*`
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/v1/:path*`
      }
    ]
  }
};

export default nextConfig;
