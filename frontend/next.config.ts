import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance and Bundle Optimization */

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
    // React strict mode optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['^data-testid$'] } : false,
  },

  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    resolveAlias: {
      '@': './src'
    }
  },

  // Experimental features for performance
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:52589", "localhost:58385", "localhost:56223"]
    },
    // Enable optimized loading
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'framer-motion',
      'd3',
      'chart.js',
      'recharts'
    ]
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:56223',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCfG9E3ggBc1ZBkhqTEDSBm0eYp152tMLk'
  },

  // Image optimization
  images: {
    domains: ['localhost', 'bitebase.app', 'api.bitebase.app'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|recharts|d3)[\\/]/,
            name: 'charts',
            priority: 20,
            reuseExistingChunk: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
            name: 'ui',
            priority: 20,
            reuseExistingChunk: true,
          },
          maps: {
            test: /[\\/]node_modules[\\/](mapbox-gl|leaflet|react-map-gl|react-leaflet)[\\/]/,
            name: 'maps',
            priority: 20,
            reuseExistingChunk: true,
          }
        }
      };
    }

    // Optimize imports for better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      // Optimize lodash imports
      'lodash': 'lodash-es',
    };

    return config;
  },

  // Performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ];
  },

  // API proxy for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` : 'http://localhost:56223/api/:path*',
      },
    ];
  },

  // Optimized output
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Disable ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
