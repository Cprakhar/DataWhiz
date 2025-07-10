/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:provider',
        destination: `${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080'}/auth/:provider`,
      },
      {
        source: '/api/auth/:provider/callback',
        destination: `${process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080'}/auth/:provider/callback`,
      },
    ]
  },
}

export default nextConfig
