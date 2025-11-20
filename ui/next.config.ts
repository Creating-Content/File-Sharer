import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  async rewrites() {
    if (isProd) {
      // In production, Nginx handles routing
      return [
        {
          source: '/auth/:path*',
          destination: '/api/auth/:path*',
        },
        {
          source: '/files/:path*',
          destination: '/api/files/:path*',
        },
      ];
    }
    // Development
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8080/auth/:path*',
      },
      {
        source: '/files/:path*',
        destination: 'http://localhost:8080/files/:path*',
      },
    ];
  },
};

export default nextConfig;
