const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for faster development
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'chart.js',
      'recharts'
    ]
  },

  // Skip middleware URL normalization (moved out of experimental in Next.js 15)
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,

  // TypeScript configuration - skip type checking in dev for speed
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development'
  },

  // ESLint configuration - skip in dev for speed
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development'
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.bitebase.app',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      }
    ],
    formats: ['image/avif', 'image/webp']
  },

  // API rewrites for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*'
      }
    ]
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          }
        ]
      },
      // SEO headers for different locales
      {
        source: '/:locale(th|es|fr|de|it|pt|zh|ja|ko|ar)/:path*',
        headers: [
          {
            key: 'Content-Language',
            value: ':locale'
          }
        ]
      }
    ]
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Disable x-powered-by header
  poweredByHeader: false
}

module.exports = withNextIntl(nextConfig)