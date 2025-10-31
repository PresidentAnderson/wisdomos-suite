import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

type CreateBookingPayload = {
  guest_id: string
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const booking = body?.booking as CreateBookingPayload | undefined
    
    if (!booking || !booking.guest_id || !booking.room_type || booking.total_price === undefined) {
      return NextResponse.json(
        { error: 'Invalid payload: guest_id, room_type, and total_price are required' },
        { status: 400 }
      )
    }

    // Créer la réservation
    const { data, error } = await supabaseServer
      .from('bookings')
      .insert([{
        guest_id: booking.guest_id,
        room_type: booking.room_type,
        bed_label: booking.bed_label ?? null,
        source: booking.source ?? 'DIRECT',
        total_price: booking.total_price,
        paid_amount: booking.paid_amount ?? 0,
        payment_method: booking.payment_method ?? null,
        payment_status: booking.payment_status ?? 'PENDING',
        checkin_date: booking.checkin_date ?? null,
        checkout_date: booking.checkout_date ?? null,
        special_requests: booking.special_requests ?? null,
        internal_notes: booking.internal_notes ?? null,
        status: 'CONFIRMED'
      }])
      .select('id, guest_id, room_type, total_price, status')
      .single()

    if (error) {
      console.error('Booking creation error:', error)
      return NextResponse.json(
        { error: `Failed to create booking: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      id: data.id,
      booking: data,
      success: true 
    })
    
  } catch (err: any) {
    console.error('Unexpected error in /api/bookings:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since') // YYYY-MM-DD
    const guestId = searchParams.get('guest_id')
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    
    let query = supabaseServer
      .from('bookings')
      .select(`
        *,
        guests (
          id,
          full_name,
          email,
          phone
        )
      `)
    
    if (since) {
      query = query.gte('created_at', `${since}T00:00:00`)
    }
    
    if (guestId) {
      query = query.eq('guest_id', guestId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (source) {
      query = query.eq('source', source)
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Bookings fetch error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      bookings: data,
      count: data?.length ?? 0
    })
    
  } catch (err: any) {
    console.error('Unexpected error in /api/bookings GET:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}