import { getFeaturedServices, getPopularCategories } from '@/lib/marketplace/search';
import ServiceCard from '@/components/marketplace/ServiceCard';
import Link from 'next/link';

export default async function MarketplacePage() {
  const [featuredServices, categories] = await Promise.all([
    getFeaturedServices(6),
    getPopularCategories(8),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              WisePlay Marketplace
            </h1>
            <p className="text-xl mb-8">
              Discover and book wisdom services from expert providers worldwide
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/marketplace/services"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                Browse Services
              </Link>
              <Link
                href="/marketplace/providers"
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400"
              >
                Find Providers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/marketplace/services?categoryId=${category.id}`}
                className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{category.icon || '📦'}</div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {(category as any)._count.services} services
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
