import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  Heart,
  ArrowRight,
  CheckCircle,
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function CreatorsPage() {
  const session = await getServerSession(authOptions)

  let provider = null
  if (session?.user?.id) {
    provider = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    })
  }

  // If already a provider, redirect to provider dashboard
  if (provider && session) {
    redirect('/dashboard/provider')
  }

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
              {session ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/api/auth/signin?callbackUrl=/creators">
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 bg-orange-100 rounded-full mb-6">
            <Sparkles className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-sm font-semibold text-orange-700 px-3">
              For Community Leaders & Coaches
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Share Your Gifts
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600">
              With the Community
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed">
            Whether you're a breakthrough coach, accountability partner, course leader, or
            transformational facilitator — create your offering and connect with those who
            are ready for their next level of transformation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/dashboard/settings/provider">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-10 py-6 text-lg"
                >
                  Create Your Provider Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/api/auth/signin?callbackUrl=/creators">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-10 py-6 text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-orange-600 text-orange-700 px-10 py-6 text-lg"
              >
                Browse Offerings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Share Your Gifts on WisePlay?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Built by Landmark community members, for the community. Create authentic impact while
            building your practice.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-orange-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Trusted Community
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Connect with fellow Landmark graduates and leaders who understand the power of
                transformation and authentic contribution.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Simple Booking System
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Manage your availability, accept bookings, and schedule sessions seamlessly.
                Focus on your contribution, not admin work.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <DollarSign className="h-7 w-7 text-yellow-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Fair & Transparent
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Just 6% platform fee. You set your rates, and earnings are transferred directly
                to your bank account via Stripe Connect.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <Star className="h-7 w-7 text-orange-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Build Your Reputation
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Receive reviews and testimonials from clients. Build credibility and showcase
                the impact of your work.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Grow Your Practice
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Access analytics and insights to understand your impact. See booking trends,
                client feedback, and earnings growth.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-amber-100">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7 text-yellow-700" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Make Real Impact
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Support breakthrough conversations and transformational partnerships that create
                ripples throughout the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            From profile to first booking in minutes
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Create Your Profile
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Sign in and set up your provider profile. Share your background, expertise,
                and what makes your offering unique.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <div className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                List Your Services
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Create offerings — coaching sessions, accountability partnerships, workshops,
                or any transformational service you provide.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 shadow-md text-center">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Accept Bookings
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Receive booking requests, manage your calendar, and start creating breakthrough
                conversations with community members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
          Creators Making a Difference
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Real stories from providers in our community
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-md border border-amber-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl">
                JM
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Jennifer M.</h4>
                <p className="text-sm text-gray-600">Breakthrough Coach</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm text-gray-600 ml-1">(47 sessions)</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              "WisePlay gave me the platform to turn my passion for coaching into a thriving
              practice. I've worked with 30+ community members on breakthrough conversations,
              and the impact has been profound for everyone involved."
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. session: $85</span>
              <span className="text-green-600 font-semibold">$4,000+ earned</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md border border-amber-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold text-xl">
                DK
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">David K.</h4>
                <p className="text-sm text-gray-600">Leadership Mentor</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm text-gray-600 ml-1">(62 sessions)</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              "As a course leader, I wanted to offer 1-on-1 mentorship to participants. WisePlay
              made it easy to manage bookings and payments. The community trust factor is huge —
              people book because they know we share the same transformation."
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. session: $120</span>
              <span className="text-green-600 font-semibold">$7,400+ earned</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <CheckCircle className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Your Contribution?
            </h2>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Join hundreds of coaches, mentors, and leaders who are making real impact in the
              Landmark community. Start sharing your gifts today.
            </p>
            {session ? (
              <Link href="/dashboard/settings/provider">
                <Button
                  size="lg"
                  className="bg-white text-orange-700 hover:bg-gray-50 px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl"
                >
                  Create Your Provider Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/api/auth/signin?callbackUrl=/creators">
                <Button
                  size="lg"
                  className="bg-white text-orange-700 hover:bg-gray-50 px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
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
