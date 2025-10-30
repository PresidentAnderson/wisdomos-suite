/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
    // Skip static generation for pages that use React Query
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
  },
  typescript: {
    // Skip type checking during build to speed up deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build
    ignoreDuringBuilds: true,
  },
  // Skip static optimization for client-only pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

export default nextConfig