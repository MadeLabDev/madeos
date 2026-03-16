import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Enable image optimization (currently disabled with unoptimized: true)
    unoptimized: false,

    // Configure image domains for external images using remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-d404c3e8309d449483f8e66fea8de769.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'app.madelab.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'os.madelab.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'madelab.io',
        port: '',
        pathname: '/**',
      },
    ],

    // Optimize image formats
    formats: ['image/webp', 'image/avif'],

    // Set device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Set image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Enable image optimization for local images
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },

  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        pg: false,
        'pg-connection-string': false,
        pgpass: false,
      };
    }

    return config;
  },

  // Turbopack configuration for Next.js 16
  turbopack: {},

  // Add headers for better caching
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
