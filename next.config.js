/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  output: 'standalone',
  transpilePackages: [
    '@tanstack/react-table',
    '@tanstack/table-core',
    '@emoji-mart/data',
    '@emoji-mart/react',
  ],
  
  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'react-day-picker',
      'recharts',
      'apexcharts',
    ],
    optimizeCss: true,
  },

  // Security headers for better SEO and security
  async headers() {
    return [
      {
        source: '/:path*',
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
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Fix webpack cache locking issue on Windows
    if (dev) {
      const cacheDir = path.resolve(process.cwd(), '.next/cache/webpack');
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: cacheDir,
      };
      // Use a more reliable cache strategy for Windows
      if (process.platform === 'win32') {
        config.cache.compression = false; // Disable compression to reduce file locking issues
      }
    }

    // Exclude DND packages from server-side bundle to avoid SSR issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@dnd-kit/core': 'commonjs @dnd-kit/core',
        '@dnd-kit/sortable': 'commonjs @dnd-kit/sortable',
        '@dnd-kit/utilities': 'commonjs @dnd-kit/utilities',
        '@dnd-kit/modifiers': 'commonjs @dnd-kit/modifiers',
      });
    }

    // Add rule to properly handle ES modules from node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
