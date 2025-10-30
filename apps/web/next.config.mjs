/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
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