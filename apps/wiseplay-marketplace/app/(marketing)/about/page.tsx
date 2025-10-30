import Link from 'next/link'
import { Heart, Users, Sparkles, Target, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* Header */}
      <header className="border-b border-amber-200/50 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">WisePlay</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                href="/marketplace"
                className="text-gray-700 hover:text-orange-700 transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/creators"
                className="text-gray-700 hover:text-orange-700 transition-colors"
              >
                Share Your Gifts
              </Link>
              <Link href="/api/auth/signin">
                <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                  Join Us
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Our Story
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600">
              Building Community Together
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed">
            WisePlay was born from a simple insight: when Landmark community members support each
            other's breakthroughs, everyone wins.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-amber-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">How It Started</h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              <p>
                In late 2024, a group of Landmark graduates noticed something powerful: our
                community was full of talented coaches, mentors, and facilitators — but finding
                and working with each other felt scattered and disconnected.
              </p>
              <p>
                Course leaders were offering breakthrough coaching on the side. Introduction
                leaders were creating accountability partnerships. Self-Expression and Leadership
                Project leaders were launching transformational services.
              </p>
              <p>
                But there was no central place where the community could discover these offerings,
                book sessions easily, or support each other's contribution in a structured way.
              </p>
              <p className="font-semibold text-orange-700">
                We asked ourselves: What if there was a trusted platform designed specifically for
                our community — where transformation meets contribution, and everyone has a chance
                to create new possibilities?
              </p>
              <p>That question became WisePlay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              What We Stand For
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Value 1 */}
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-orange-700" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Community First</h3>
                <p className="text-gray-700 leading-relaxed">
                  Built by Landmark grads, for Landmark grads. We prioritize authentic connection,
                  shared values, and mutual transformation over everything else.
                </p>
              </div>

              {/* Value 2 */}
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-amber-700" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Authentic Contribution
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  This isn't about transactions — it's about breakthroughs. We believe in the
                  power of people creating real impact in each other's lives.
                </p>
              </div>

              {/* Value 3 */}
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                  <Target className="h-7 w-7 text-yellow-700" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Radical Simplicity</h3>
                <p className="text-gray-700 leading-relaxed">
                  We keep things simple so providers can focus on their contribution and clients
                  can focus on their transformation — not on complicated systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Philosophy */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900">
            Why We Built This Way
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Every design decision came from listening to what the community actually needed
          </p>

          <div className="space-y-8">
            {/* Design Decision 1 */}
            <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-orange-500">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                🤝 Community Trust Built In
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We require Landmark affiliation because the shared context creates immediate trust.
                You don't need to explain what a "breakthrough" means or why accountability
                partnerships matter — everyone already gets it.
              </p>
            </div>

            {/* Design Decision 2 */}
            <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-amber-500">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                💰 Fair Pricing for Everyone
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We charge just 6% platform fee (most competitors take 15-30%). Providers deserve
                to keep the value they create, and we're committed to sustainability without
                exploitation.
              </p>
            </div>

            {/* Design Decision 3 */}
            <div className="bg-white rounded-xl p-8 shadow-md border-l-4 border-yellow-500">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                🚀 Easy Start, Powerful Growth
              </h3>
              <p className="text-gray-700 leading-relaxed">
                You can launch your first offering in under 10 minutes, but we also provide
                analytics, reviews, and tools to build a serious practice over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gradient-to-b from-white to-orange-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Built By Community Members
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              WisePlay is maintained by a small team of Landmark graduates who are passionate about
              creating tools that empower transformation. We're not a big corporation — we're
              community members building for community members.
            </p>
            <p className="text-gray-600 italic">
              "We use WisePlay ourselves. We book sessions, we provide services, and we're
              constantly listening to feedback to make it better for everyone."
            </p>
          </div>
        </div>
      </section>

      {/* Vision for the Future */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-12 text-white shadow-xl">
            <Globe className="h-12 w-12 mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Where We're Going</h2>
            <div className="space-y-4 text-lg text-white/90 leading-relaxed">
              <p>
                Our vision is to become the go-to platform for transformation-focused services
                across the entire Landmark global community.
              </p>
              <p>
                Imagine thousands of graduates worldwide offering breakthrough coaching,
                accountability partnerships, workshops, courses, and transformational experiences
                — all accessible in one trusted place.
              </p>
              <p className="font-semibold text-white">
                We're just getting started. And we're building this together — one conversation, one
                booking, one breakthrough at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Be Part of the Story
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Whether you're looking for breakthrough support or ready to share your gifts with the
              community, WisePlay is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-10 py-6 text-lg"
                >
                  Explore Offerings
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/creators">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-600 text-orange-700 px-10 py-6 text-lg"
                >
                  Share Your Gifts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-orange-600" />
              <span className="text-xl font-bold text-gray-900">WisePlay</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-orange-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-orange-700 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-orange-700 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500">
            © 2024 WisePlay. Where Landmark Community Creates Possibility.
          </div>
        </div>
      </footer>
    </div>
  )
}
