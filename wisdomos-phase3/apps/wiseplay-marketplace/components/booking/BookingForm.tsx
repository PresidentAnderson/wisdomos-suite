'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingFormProps {
  service: {
    id: string
    title: string
    basePrice: any
    duration: number
    provider: {
      id: string
      user: {
        id: string
        name: string | null
      }
    }
  }
  userId: string
  platformFee: number
  totalPrice: number
}

export default function BookingForm({
  service,
  userId,
  platformFee,
  totalPrice,
}: BookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.time) newErrors.time = 'Time is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const scheduledAt = new Date(`${formData.date}T${formData.time}`)

      // Create booking data
      const bookingData = {
        serviceId: service.id,
        buyerId: userId,
        providerId: service.provider.user.id,
        scheduledAt: scheduledAt.toISOString(),
        duration: service.duration,
        timezone: formData.timezone,
        basePrice: Number(service.basePrice),
        platformFee: platformFee,
        totalPrice: totalPrice,
        notes: formData.message,
      }

      // Store booking data in sessionStorage for confirmation page
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))

      // Navigate to confirmation page
      router.push(`/booking/${service.id}/confirm`)
    } catch (error) {
      console.error('Error preparing booking:', error)
      setErrors({ submit: 'Failed to process booking. Please try again.' })
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get maximum date (90 days from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 90)
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Selection */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-2" />
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          min={getMinDate()}
          max={getMaxDate()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date}</p>
        )}
      </div>

      {/* Time Selection */}
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="inline w-4 h-4 mr-2" />
          Select Time
        </label>
        <input
          type="time"
          id="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {errors.time && (
          <p className="text-red-500 text-sm mt-1">{errors.time}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Timezone: {formData.timezone}
        </p>
      </div>

      {/* Message to Provider */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="inline w-4 h-4 mr-2" />
          Message to Provider (Optional)
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Let the provider know any specific requirements or questions..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          This message will be sent to {service.provider.user.name}
        </p>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 text-sm mb-2">
          Before you continue:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Your booking is subject to provider approval</li>
          <li>You will not be charged until the provider accepts</li>
          <li>You'll receive email confirmation once accepted</li>
          <li>Free cancellation up to 24 hours before scheduled time</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Confirmation'}
        </Button>
      </div>
    </form>
  )
}
