import { getFeaturedServices, getCategories } from '@/lib/marketplace/search';
import ServiceCard from '@/components/marketplace/ServiceCard';
import Link from 'next/link';
import { Heart, Users, Sparkles, MessageCircle, Target, Handshake } from 'lucide-react';

// Force dynamic rendering - don't pre-render this page
export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
  const [featuredServices, allCategories] = await Promise.all([
    getFeaturedServices(6),
    getCategories(),
  ]);

  // Take first 8 categories
  const categories = allCategories.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 mr-3" />
              <h1 className="text-5xl font-bold">
                WisePlay Community
              </h1>
            </div>
            <p className="text-xl mb-8 text-white/95 leading-relaxed">
              Connect with fellow Landmark community members for breakthrough conversations,
              transformational coaching, and authentic partnerships
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/marketplace/services"
                className="px-8 py-3 bg-white text-orange-700 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
              >
                Explore Offerings
              </Link>
              <Link
                href="/marketplace/providers"
                className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400 transition-all border-2 border-white/20"
              >
                Meet Contributors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Contribute */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Ways to Contribute & Partner
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Whether you're seeking support for your breakthrough or offering your unique gifts,
              you'll find authentic partnerships here.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/marketplace/services?categoryId=${category.id}`}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-amber-100 hover:border-amber-300 group"
              >
                <div className="text-center">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon || '🤝'}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600">
                    {(category as any)._count.services} {(category as any)._count.services === 1 ? 'offering' : 'offerings'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community Values */}
      <section className="py-16 bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Discover</h3>
              <p className="text-gray-700 leading-relaxed">
                Browse offerings from fellow community members - from coaching sessions to
                accountability partnerships to collaborative projects.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Connect</h3>
              <p className="text-gray-700 leading-relaxed">
                Reach out directly to create partnerships. Every connection is an opportunity
                for breakthrough and transformation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Transform</h3>
              <p className="text-gray-700 leading-relaxed">
                Engage in authentic work together. Create breakthroughs that ripple through
                your life and our entire community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Offerings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Featured Opportunities
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Community members creating possibility and making their contribution
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          {featuredServices.length === 0 && (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">
                Be the first to create an offering for the community
              </p>
              <Link
                href="/marketplace/services/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all"
              >
                Share Your Contribution
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-16 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Handshake className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Building Community, Creating Breakthroughs
            </h2>
            <p className="text-xl mb-8 text-white/95 leading-relaxed max-w-3xl mx-auto">
              Every partnership formed here strengthens our entire community. When you engage authentically,
              you're not just supporting your own transformation - you're contributing to a culture of
              possibility, integrity, and breakthrough.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 inline-block">
              <p className="text-lg mb-2">
                <span className="font-bold text-2xl">6% Community Sustainability Contribution</span>
              </p>
              <p className="text-white/90">
                Supports platform development and community resources
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Ready to Create Your Contribution?
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Whether you're a course leader, introduction leader, coach, or simply someone
              committed to transformation - your unique gifts matter to this community.
            </p>
            <Link
              href="/marketplace/services/create"
              className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Share Your Offering
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
