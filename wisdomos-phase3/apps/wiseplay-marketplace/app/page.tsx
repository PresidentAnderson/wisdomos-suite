import Link from "next/link"
import { ArrowRight, Heart, Users, Sparkles, CircleDot, Lightbulb, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-amber-200/50 bg-white/70 backdrop-blur-sm dark:bg-gray-900/70">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                WisePlay
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/marketplace" className="text-gray-700 hover:text-orange-700 dark:text-gray-300 dark:hover:text-orange-400 transition-colors">
                Explore
              </Link>
              <Link href="/creators" className="text-gray-700 hover:text-orange-700 dark:text-gray-300 dark:hover:text-orange-400 transition-colors">
                Share Your Gifts
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-700 dark:text-gray-300 dark:hover:text-orange-400 transition-colors">
                Our Story
              </Link>
              <Link href="/auth/signin" className="text-orange-700 hover:text-orange-800 font-medium">
                Join Us
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Where Landmark Community Members
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600">
              Create Possibility Together
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
            A space for authentic contribution, transformational partnerships, and
            breakthrough conversations that make a difference
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
            >
              Explore Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/creators"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-700 rounded-lg font-semibold border-2 border-orange-600 hover:bg-orange-50 transition-colors dark:bg-gray-800 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-gray-700"
            >
              Create Your Contribution
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Built on Transformation
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            This isn't about transactions. It's about people coming together to support each other's
            breakthroughs, leadership, and contribution.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-orange-700 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Create Possibility
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Share your unique gifts and offerings with fellow community members.
                Whether it's coaching, mentorship, or collaborative projects - your contribution matters.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <CircleDot className="h-7 w-7 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Find Support
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Connect with accountability partners, breakthrough coaches, and fellow leaders.
                Get the support you need for your next level of transformation.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-yellow-700 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Build Community
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Engage in authentic partnerships that expand what's possible.
                Together we create breakthroughs that ripple through our entire community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Community in Action
          </h2>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Real stories of breakthrough, contribution, and transformation
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                  SL
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Sarah L.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Course Leader</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                "Finding my accountability partner here transformed my leadership. We meet weekly,
                and the breakthroughs we create together have impacted hundreds of participants in my courses."
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Marcus R.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Introduction Leader</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                "I started offering breakthrough coaching sessions and it's become my greatest contribution.
                The community partnerships I've formed here are authentic, powerful, and life-changing."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">1,200+</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Community Members</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Creating possibility together</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">3,500+</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Partnerships Formed</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Breakthrough conversations & collaborations</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">850+</div>
              <div className="text-gray-700 dark:text-gray-300 font-medium">Leaders Contributing</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Coaches, mentors, and facilitators</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Lightbulb className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create New Possibilities?
            </h2>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Join our community of leaders, coaches, and change-makers who are committed to
              transformation, authentic contribution, and making a real difference.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-orange-700 rounded-lg font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl text-lg"
            >
              Explore WisePlay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-orange-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                WisePlay
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-orange-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-orange-700 transition-colors">Community Guidelines</Link>
              <Link href="/contact" className="hover:text-orange-700 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            © 2024 WisePlay. Where Landmark Community Creates Possibility.
          </div>
        </div>
      </footer>
    </div>
  )
}
