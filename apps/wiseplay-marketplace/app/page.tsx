import Link from "next/link"
import { ArrowRight, GamepadIcon, BookOpen, Users, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GamepadIcon className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                WisePlay
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Marketplace
              </Link>
              <Link href="/creators" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                For Creators
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                About
              </Link>
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Learn Through
            <span className="text-blue-600"> Play</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10">
            Discover engaging educational games and experiences that make learning fun for everyone
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Marketplace
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/creators"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <GamepadIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Engaging Games
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Curated collection of educational games designed to make learning interactive and fun
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="bg-green-100 dark:bg-green-900 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Educational Content
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Content aligned with learning objectives and curriculum standards
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Creator Community
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Join a vibrant community of educators and game creators
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-blue-100">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Educational Games</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Creator Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GamepadIcon className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                WisePlay
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            © 2024 WisePlay Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
