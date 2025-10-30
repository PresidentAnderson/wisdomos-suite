import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Calendar, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/db';
import ServiceCard from '@/components/marketplace/ServiceCard';
import ReviewCard from '@/components/marketplace/ReviewCard';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    providerId: string;
  };
}

async function getProvider(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
      services: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          category: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          averageRating: 'desc',
        },
      },
      _count: {
        select: {
          services: true,
          bookings: true,
        },
      },
    },
  });

  if (!provider) return null;

  // Get all reviews for this provider's services
  const allReviews = await prisma.review.findMany({
    where: {
      service: {
        providerId: providerId,
      },
    },
    include: {
      buyer: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      service: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  return { ...provider, allReviews };
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const provider = await getProvider(params.providerId);

  if (!provider) {
    notFound();
  }

  const memberSince = new Date(provider.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate average rating across all services
  const avgRating = provider.services.length > 0
    ? provider.services.reduce((acc, s) => acc + Number(s.averageRating), 0) / provider.services.length
    : 0;

  const totalReviews = provider.allReviews.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Provider Avatar */}
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-white/20 border-4 border-white shadow-xl flex-shrink-0">
              {provider.user.image ? (
                <Image
                  src={provider.user.image}
                  alt={provider.displayName || 'Provider'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-5xl">
                  {(provider.displayName || 'P')[0].toUpperCase()}
                </div>
              )}
              {provider.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 border-4 border-white">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {provider.displayName || provider.user.name}
                  </h1>
                  {provider.tagline && (
                    <p className="text-xl text-white/90 mb-3">{provider.tagline}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white text-white" />
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-white/90">
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>{provider._count.bookings} {provider._count.bookings === 1 ? 'booking' : 'bookings'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>{provider.services.length} {provider.services.length === 1 ? 'offering' : 'offerings'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Member since {memberSince}</span>
                </div>
                {provider.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{provider.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {provider.bio && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {provider.bio}
                </div>
              </section>
            )}

            {/* Services/Offerings */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Offerings ({provider.services.length})
              </h2>

              {provider.services.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No active offerings yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {provider.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            {provider.allReviews.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Reviews ({totalReviews})
                </h2>

                <div className="space-y-6">
                  {provider.allReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="mb-2">
                        <Link
                          href={`/marketplace/services/${review.serviceId}`}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          {review.service.title}
                        </Link>
                      </div>
                      <ReviewCard review={review} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Get in Touch</h3>

              <div className="space-y-3 mb-6">
                {provider.website && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Website</p>
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 text-sm break-all"
                    >
                      {provider.website}
                    </a>
                  </div>
                )}

                {provider.location && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-sm text-gray-900">{provider.location}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Response Time</p>
                  <p className="text-sm text-gray-900">Usually within 24 hours</p>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                asChild
              >
                <Link href="#offerings">
                  View Offerings
                </Link>
              </Button>
            </div>

            {/* Verification Badge */}
            {provider.isVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Verified Provider
                    </h4>
                    <p className="text-sm text-blue-700">
                      This provider has been verified by our community team and has
                      completed identity verification.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Summary */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Provider Stats</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold text-gray-900">
                    {provider._count.bookings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Offerings</span>
                  <span className="font-semibold text-gray-900">
                    {provider.services.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold text-gray-900">
                    {avgRating.toFixed(1)} ⭐
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(provider.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
