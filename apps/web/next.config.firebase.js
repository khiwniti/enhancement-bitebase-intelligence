/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for Firebase integration
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },

  // Environment variables
  env: {
    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  },

  // Image optimization for Firebase Storage
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile images
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for Firebase integration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Redirects for Firebase Functions
  async redirects() {
    return [
      {
        source: '/api/functions/:path*',
        destination: `${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/:path*`,
        permanent: false,
      },
    ];
  },

  // Rewrites for Firebase Functions integration
  async rewrites() {
    return [
      {
        source: '/api/restaurants/:path*',
        destination: `${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/searchRestaurants`,
      },
      {
        source: '/api/locations/:path*',
        destination: `${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/analyzeLocation`,
      },
      {
        source: '/api/reports/:path*',
        destination: `${process.env.NEXT_PUBLIC_FUNCTIONS_URL}/generateMarketReport`,
      },
    ];
  },

  // Webpack configuration for Firebase
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include server-side Firebase modules in client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

  // Output configuration for Firebase Hosting
  output: 'standalone',
  trailingSlash: false,

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // SWC minification
  swcMinify: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
