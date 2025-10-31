'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Booking {
  id: string
  scheduledAt: string
  duration: number
  timezone: string
  basePrice: number
  platformFee: number
  totalPrice: number
  service: {
    title: string
    images: string[]
  }
  buyer: {
    name: string
    email: string
  }
}

function PaymentForm({ booking }: { booking: Booking }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch('/api/marketplace/payments/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: booking.buyer.name,
              email: booking.buyer.email,
            },
          },
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent.status === 'succeeded') {
        // Navigate to success page
        router.push(`/booking/${booking.service.id}/success?bookingId=${booking.id}`)
      }
    } catch (err: any) {
      console.error('Payment failed:', err)
      setError(err.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Secure Payment Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
        <Lock className="w-4 h-4 text-green-600" />
        <span>Secure payment powered by Stripe</span>
      </div>

      {/* Card Element */}
      <div className="border border-gray-300 rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Payment Security Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">Your payment is secure</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>PCI-DSS compliant payment processing</li>
              <li>256-bit SSL encryption</li>
              <li>Payment held until service is delivered</li>
              <li>Full refund if booking is declined</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${booking.totalPrice.toFixed(2)}`}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By confirming your payment, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}

export default function PaymentPage() {
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
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  const scheduledDate = new Date(booking.scheduledAt)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back button */}
        <Link
          href={`/booking/${booking.id}/confirm`}
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Confirmation
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Complete Payment</h1>
              <p className="text-gray-600">Secure checkout for your booking</p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4">Booking Summary</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium">{booking.service.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium">
                  {scheduledDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="font-medium">
                  {scheduledDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span>${booking.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>${booking.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-orange-600 pt-2 border-t">
                  <span>Total</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <Elements stripe={stripePromise}>
            <PaymentForm booking={booking} />
          </Elements>
        </div>
      </div>
    </div>
  )
}
