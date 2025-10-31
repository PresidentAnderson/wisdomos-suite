import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, Shield, Heart, Share2, Flag, CheckCircle } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import ReviewCard from '@/components/marketplace/ReviewCard';
import ServiceCard from '@/components/marketplace/ServiceCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    serviceId: string;
  };
}

async function getService(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      category: true,
      media: {
        orderBy: { order: 'asc' },
      },
      reviews: {
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
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          bookings: true,
          reviews: true,
        },
      },
    },
  });

  return service;
}

async function getRelatedServices(categoryId: string, excludeId: string) {
  const related = await prisma.service.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
      status: 'ACTIVE',
    },
    include: {
      category: true,
      provider: true,
    },
    take: 3,
    orderBy: {
      averageRating: 'desc',
    },
  });

  return related;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const service = await getService(params.serviceId);

  if (!service) {
    notFound();
  }

  const relatedServices = service.categoryId
    ? await getRelatedServices(service.categoryId, service.id)
    : [];

  const rating = typeof service.averageRating === 'number'
    ? service.averageRating
    : Number(service.averageRating);

  const price = typeof service.price === 'number'
    ? service.price
    : Number(service.price);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={service.imageUrl || '/placeholder-service.jpg'}
                  alt={service.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Thumbnail Gallery */}
              {service.media.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {service.media.slice(0, 4).map((media) => (
                    <div
                      key={media.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity"
                    >
                      <Image
                        src={media.url}
                        alt={media.caption || service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div>
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-600 mb-4">
                <Link href="/marketplace" className="hover:text-orange-600">
                  Marketplace
                </Link>
                <span className="mx-2">/</span>
                <Link href="/marketplace/services" className="hover:text-orange-600">
                  Services
                </Link>
                {service.category && (
                  <>
                    <span className="mx-2">/</span>
                    <Link
                      href={`/marketplace/services?categoryId=${service.categoryId}`}
                      className="hover:text-orange-600"
                    >
                      {service.category.name}
                    </Link>
                  </>
                )}
              </nav>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {service.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-gray-600">
                    ({service._count.reviews} {service._count.reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {service._count.bookings} {service._count.bookings === 1 ? 'booking' : 'bookings'}
                </span>
              </div>

              {/* Provider Info */}
              <Link
                href={`/marketplace/providers/${service.providerId}`}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg hover:shadow-md transition-all mb-6 border border-orange-100"
              >
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  {service.provider.user.image ? (
                    <Image
                      src={service.provider.user.image}
                      alt={service.provider.displayName || 'Provider'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-lg">
                      {(service.provider.displayName || 'P')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {service.provider.displayName || service.provider.user.name}
                    </p>
                    {service.provider.isVerified && (
                      <CheckCircle className="h-5 w-5 text-blue-500" title="Verified Provider" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {service.provider.bio?.slice(0, 60) || 'Community Member'}
                  </p>
                </div>
              </Link>

              {/* Price & Booking */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 sticky top-4">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">
                      ${price.toFixed(2)}
                    </span>
                    {service.priceType === 'PER_HOUR' && (
                      <span className="text-gray-600 ml-2">/hour</span>
                    )}
                    {service.priceType === 'PER_SESSION' && (
                      <span className="text-gray-600 ml-2">/session</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Save to favorites"
                    >
                      <Heart className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Share"
                    >
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  {service.deliveryTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Delivery: {service.deliveryTime}</span>
                    </div>
                  )}
                  {service.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>6% platform contribution</span>
                  </div>
                </div>

                {/* Book Now Button */}
                <Link href={`/booking/${service.id}`}>
                  <Button className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                    Book Now
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center mt-3">
                  You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Description */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About This Offering */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Offering
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                {service.description}
              </div>
            </section>

            {/* What's Included */}
            {service.whatIsIncluded && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  What's Included
                </h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {service.whatIsIncluded}
                </div>
              </section>
            )}

            {/* Requirements */}
            {service.requirements && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Requirements
                </h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {service.requirements}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Reviews ({service._count.reviews})
              </h2>

              {service.reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No reviews yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Be the first to book and leave a review!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {service.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">About the Provider</h3>
              <Link
                href={`/marketplace/providers/${service.providerId}`}
                className="block hover:opacity-75 transition-opacity"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                    {service.provider.user.image ? (
                      <Image
                        src={service.provider.user.image}
                        alt={service.provider.displayName || 'Provider'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-xl">
                        {(service.provider.displayName || 'P')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{service.provider.displayName}</p>
                      {service.provider.isVerified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Member since {new Date(service.provider.createdAt).getFullYear()}</p>
                  </div>
                </div>
              </Link>

              {service.provider.bio && (
                <p className="text-sm text-gray-700 mb-4">
                  {service.provider.bio.slice(0, 150)}
                  {service.provider.bio.length > 150 && '...'}
                </p>
              )}

              <Link href={`/marketplace/providers/${service.providerId}`}>
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>
            </div>

            {/* Report */}
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mx-auto">
              <Flag className="h-4 w-4" />
              Report this offering
            </button>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Similar Offerings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((relatedService) => (
                <ServiceCard key={relatedService.id} service={relatedService} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
