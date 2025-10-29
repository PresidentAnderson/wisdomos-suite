/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'framer-motion']
  },
  
  // Build optimizations
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for production build
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 30,
            },
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer',
              chunks: 'all',
              priority: 30,
            }
          }
        }
      };
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Performance settings
  poweredByHeader: false,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
}

module.exports = nextConfig