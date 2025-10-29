'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Animation temporarily disabled for build
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  HeartIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@/components/icons/placeholder'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user && !isLoading) {
      router.push('/dashboard')
    }
    
    // Track landing page view
    if (!isLoading) {
      trackEvent('landing_page_viewed')
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render landing page if user is authenticated
  if (user) {
    return null
  }

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Upset Documentation',
      description: 'Process and document emotional upsets for personal growth and understanding.'
    },
    {
      icon: ChartBarIcon,
      title: 'Boundary Audit',
      description: 'Assess and strengthen your personal boundaries through structured evaluation.'
    },
    {
      icon: HeartIcon,
      title: 'Fulfillment Display',
      description: 'Visualize and celebrate your achievements and fulfilling experiences.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Learning',
      description: 'Connect with others on similar journeys of personal development and wisdom.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            {/* Navigation */}
            <header className="relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
                  <div className="flex justify-start lg:w-0 lg:flex-1">
                    <span className="text-2xl font-bold text-blue-600">
                      WisdomOS
                    </span>
                  </div>
                  <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
                    <Link
                      href="/auth/login"
                      className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                    >
                      Sign in
                    </Link>
                    <Link href="/auth/register">
                      <Button>Get Started</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            {/* Hero Content */}
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div>
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Transform Your</span>{' '}
                    <span className="block text-blue-600 xl:inline">Inner Wisdom</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    A comprehensive platform for personal growth, emotional processing, and community learning. 
                    Document your journey, audit your boundaries, and celebrate your fulfillment.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/auth/register">
                        <Button 
                          size="lg" 
                          className="w-full"
                          rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                        >
                          Start Your Journey
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/auth/login">
                        <Button variant="outline" size="lg" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <div
            >
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Tools for Personal Growth
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Comprehensive tools designed to support your journey of self-discovery and personal development.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="relative"
                >
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.title}
                  </p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <div
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to begin?</span>
              <span className="block">Start your wisdom journey today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Join thousands of others who are transforming their lives through structured personal growth.
            </p>
            <Link href="/auth/register">
              <Button 
                variant="secondary" 
                size="lg"
                className="mt-8"
                leftIcon={<SparklesIcon className="h-5 w-5" />}
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-gray-400 text-sm">
              Built with wisdom and care
            </span>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 WisdomOS Community Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
