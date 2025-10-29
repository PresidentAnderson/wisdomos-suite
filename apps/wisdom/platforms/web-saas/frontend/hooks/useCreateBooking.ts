import { useState, useCallback } from 'react'

export type GuestInput = {
  full_name: string
  email?: string
  phone?: string
}

export type BookingInput = {
  room_type: string
  bed_label?: string
  source?: string
  total_price: number
  paid_amount?: number
  payment_method?: string
  payment_status?: string
  checkin_date?: string // 'YYYY-MM-DD'
  checkout_date?: string
  special_requests?: string
  internal_notes?: string
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(
    async (guest: GuestInput, booking: BookingInput) => {
      setLoading(true)
      setError(null)
      
      try {
        // 1) upsert guest
        const gRes = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest })
        })
        
        const gJson = await gRes.json()
        
        if (!gRes.ok) {
          const errorMsg = gJson?.error || 'Failed to create/find guest'
          setError(errorMsg)
          throw new Error(errorMsg)
        }
        
        const guest_id: string = gJson.id

        // 2) create booking
        const bRes = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking: { ...booking, guest_id } })
        })
        
        const bJson = await bRes.json()
        
        if (!bRes.ok) {
          const errorMsg = bJson?.error || 'Failed to create booking'
          setError(errorMsg)
          throw new Error(errorMsg)
        }

        return { 
          booking_id: bJson.id as string,
          guest_id,
          booking: bJson.booking
        }
        
      } catch (err: any) {
        // Re-throw to allow toast handling
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return { create, loading, error, reset }
}