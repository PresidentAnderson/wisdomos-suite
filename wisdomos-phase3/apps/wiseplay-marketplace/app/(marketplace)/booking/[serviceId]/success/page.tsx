'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Calendar, Mail, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Booking {
  id: string
  scheduledAt: string
  duration: number
  timezone: string
  totalPrice: number
  service: {
    id: string
    title: string
    images: string[]
  }
  provider: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export default function BookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bookingId = searchParams?.get('bookingId')
    if (!bookingId) {
      router.push('/marketplace')
      return
    }

    // Fetch booking details
    fetch(`/api/marketplace/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch booking')
        return res.json()
      })
      .then((data) => {
        setBooking(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load booking:', err)
        router.push('/marketplace')
      })
  }, [searchParams, router])

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  const scheduledDate = new Date(booking.scheduledAt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your booking request has been sent to the provider
          </p>

          {/* Booking ID */}
          <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 mb-8">
            <p className="text-sm text-gray-600">Booking ID</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {booking.id}
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

            {/* Service Info */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b">
              {booking.service.images && booking.service.images.length > 0 && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={booking.service.images[0]}
                    alt={booking.service.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-semibold text-lg">{booking.service.title}</p>
              </div>
            </div>

            {/* Provider Info */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b">
              {booking.provider.image ? (
                <Image
                  src={booking.provider.image}
                  alt={booking.provider.name || 'Provider'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-lg">
                    {booking.provider.name?.charAt(0) || 'P'}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-semibold">{booking.provider.name}</p>
                <p className="text-sm text-gray-500">{booking.provider.email}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3 pb-4 mb-4 border-b">
              <Calendar className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Scheduled For</p>
                <p className="font-semibold">
                  {scheduledDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="font-semibold">
                  {scheduledDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">{booking.timezone}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Paid</span>
              <span className="text-2xl font-bold text-green-600">
                ${booking.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">What Happens Next?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✓ Confirmation email sent to your inbox</li>
                  <li>✓ Provider has been notified of your booking</li>
                  <li>✓ Provider will accept or decline within 24 hours</li>
                  <li>✓ You'll receive email notification of their response</li>
                  <li>✓ If accepted, you'll receive meeting details</li>
                  <li>✓ If declined, you'll get a full refund automatically</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/buyer/bookings')}
              className="flex items-center gap-2"
            >
              View My Bookings
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Link href="/marketplace">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Marketplace
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              Questions about your booking?{' '}
              <Link href="/support" className="text-orange-600 hover:text-orange-700 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
