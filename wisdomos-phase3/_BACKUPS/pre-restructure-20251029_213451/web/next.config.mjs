/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  // Remove static export for proper SSR support
  // output: 'export',
  trailingSlash: true,
  images: {
    domains: ['supabase.com', 'gravatar.com', 'github.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    outputFileTracingRoot: process.cwd(),
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  typescript: {
    // Enable type checking in production
    ignoreBuildErrors: false,
  },
  eslint: {
    // Temporarily ignore ESLint during build for faster iteration
    ignoreDuringBuilds: true,
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-WisdomOS-Protection',
            value: 'Active - AXAI Innovations Proprietary',
          },
        ],
      },
    ]
  },
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ||
                          process.env.URL ||
                          process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined ||
                          'http://localhost:3011',
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ||
                          (process.env.URL ? process.env.URL + '/api' : undefined) ||
                          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : undefined) ||
                          'http://localhost:4000',
    NEXT_PUBLIC_APP_VERSION: '2.0.0-phoenix',
    NEXT_PUBLIC_COMPANY: 'AXAI Innovations',
  },
  // Optimize for serverless deployment
  outputFileTracing: true,
}

export default nextConfig