import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import BookingForm from '@/components/booking/BookingForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface BookingPageProps {
  params: {
    serviceId: string
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const session = await getServerSession(authOptions)

  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/api/auth/signin?callbackUrl=/booking/${params.serviceId}`)
  }

  // Fetch service details
  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
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
      categories: true,
    },
  })

  if (!service) {
    notFound()
  }

  // Calculate platform fee (6%)
  const platformFee = Number(service.basePrice) * 0.06
  const totalPrice = Number(service.basePrice) + platformFee

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <Link
          href={`/marketplace/services/${service.id}`}
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Service
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold mb-2">Book {service.title}</h1>
              <p className="text-gray-600 mb-6">
                Complete the form below to request this booking
              </p>

              <BookingForm
                service={service}
                userId={session.user.id}
                platformFee={platformFee}
                totalPrice={totalPrice}
              />
            </div>
          </div>

          {/* Right Column - Service Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

              {/* Service Image */}
              {service.images && service.images.length > 0 && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={service.images[0]}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Service Title */}
              <h3 className="font-semibold text-lg mb-2">{service.title}</h3>

              {/* Provider Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                {service.provider.user.image ? (
                  <Image
                    src={service.provider.user.image}
                    alt={service.provider.user.name || 'Provider'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {service.provider.user.name?.charAt(0) || 'P'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{service.provider.user.name}</p>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">
                    ${Number(service.basePrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (6%)</span>
                  <span className="font-medium">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Duration */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">
                  {service.duration < 60
                    ? `${service.duration} minutes`
                    : `${Math.floor(service.duration / 60)} hour${Math.floor(service.duration / 60) > 1 ? 's' : ''}`}
                </span>
              </div>

              {/* What's Included */}
              {service.deliverables && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">What's Included</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {service.deliverables}
                  </p>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-sm mb-2">
                  Cancellation Policy
                </h4>
                <p className="text-xs text-gray-500">
                  Free cancellation up to 24 hours before the scheduled time.
                  Cancellations within 24 hours are subject to a 50% fee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
