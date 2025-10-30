'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, DollarSign, User, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface BookingData {
  serviceId: string
  buyerId: string
  providerId: string
  scheduledAt: string
  duration: number
  timezone: string
  basePrice: number
  platformFee: number
  totalPrice: number
  notes?: string
}

export default function ConfirmBookingPage() {
  const router = useRouter()
  const params = useParams()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const storedData = sessionStorage.getItem('pendingBooking')
    if (!storedData) {
      router.push(`/booking/${params.serviceId}`)
      return
    }

    try {
      const data = JSON.parse(storedData)
      setBookingData(data)
    } catch (err) {
      console.error('Failed to parse booking data:', err)
      router.push(`/booking/${params.serviceId}`)
    }
  }, [params.serviceId, router])

  const handleConfirmBooking = async () => {
    if (!bookingData || !acceptedTerms) return

    setIsLoading(true)
    setError(null)

    try {
      // Create booking in database
      const response = await fetch('/api/marketplace/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const booking = await response.json()

      // Clear sessionStorage
      sessionStorage.removeItem('pendingBooking')

      // Navigate to payment page
      router.push(`/booking/${params.serviceId}/payment?bookingId=${booking.id}`)
    } catch (err: any) {
      console.error('Booking creation failed:', err)
      setError(err.message || 'Failed to create booking. Please try again.')
      setIsLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  const scheduledDate = new Date(bookingData.scheduledAt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <Link
          href={`/booking/${params.serviceId}`}
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Booking Form
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Confirm Your Booking</h1>
          <p className="text-gray-600 mb-8">
            Review your booking details before proceeding to payment
          </p>

          {/* Booking Details */}
          <div className="space-y-6 mb-8">
            {/* Date & Time */}
            <div className="flex items-start gap-4 pb-6 border-b">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Date & Time</h3>
                <p className="text-gray-700">
                  {scheduledDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-700">
                  {scheduledDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">{bookingData.timezone}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-4 pb-6 border-b">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Duration</h3>
                <p className="text-gray-700">
                  {bookingData.duration < 60
                    ? `${bookingData.duration} minutes`
                    : `${Math.floor(bookingData.duration / 60)} hour${Math.floor(bookingData.duration / 60) > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-start gap-4 pb-6 border-b">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-3">Pricing Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Base Price</span>
                    <span>${bookingData.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Platform Fee (6%)</span>
                    <span>${bookingData.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-semibold text-orange-600 pt-2 border-t">
                    <span>Total</span>
                    <span>${bookingData.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {bookingData.notes && (
              <div className="flex items-start gap-4 pb-6 border-b">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Your Message</h3>
                  <p className="text-gray-700 whitespace-pre-line">{bookingData.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Terms & Conditions</h3>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <p>• Your booking request will be sent to the provider for approval</p>
              <p>• Payment will be processed only after provider approval</p>
              <p>• Free cancellation up to 24 hours before scheduled time</p>
              <p>• Cancellations within 24 hours are subject to a 50% fee</p>
              <p>• Provider has 24 hours to accept or decline your request</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                I have read and agree to the Terms & Conditions and Cancellation Policy
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={isLoading}
            >
              Go Back
            </Button>
            <Button
              type="button"
              onClick={handleConfirmBooking}
              disabled={!acceptedTerms || isLoading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Booking...' : 'Confirm & Pay'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
