import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

type CreateGuestPayload = {
  full_name: string
  email?: string | null
  phone?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const g = body?.guest as CreateGuestPayload | undefined
    
    if (!g || !g.full_name) {
      return NextResponse.json(
        { error: 'Invalid payload: guest.full_name is required' },
        { status: 400 }
      )
    }

    // Choix de contrainte d'unicité logique
    const uniqueKey = g.email?.trim() || g.phone?.trim()
    if (!uniqueKey) {
      return NextResponse.json(
        { error: 'Provide at least guest.email or guest.phone' },
        { status: 400 }
      )
    }

    // Tente de trouver un invité existant
    const { data: existing, error: selErr } = await supabaseServer
      .from('guests')
      .select('id')
      .or(`email.eq.${g.email || ''},phone.eq.${g.phone || ''}`)
      .maybeSingle()

    if (selErr) {
      console.error('Guest lookup error:', selErr)
      return NextResponse.json(
        { error: `Database error: ${selErr.message}` },
        { status: 500 }
      )
    }

    if (existing?.id) {
      return NextResponse.json({ 
        id: existing.id, 
        created: false 
      })
    }

    // Sinon on crée
    const { data, error } = await supabaseServer
      .from('guests')
      .insert([{ 
        full_name: g.full_name, 
        email: g.email ?? null, 
        phone: g.phone ?? null 
      }])
      .select('id')
      .single()

    if (error) {
      console.error('Guest creation error:', error)
      return NextResponse.json(
        { error: `Failed to create guest: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      id: data.id, 
      created: true 
    })
    
  } catch (err: any) {
    console.error('Unexpected error in /api/guests:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    
    let query = supabaseServer.from('guests').select('*')
    
    if (email) {
      query = query.eq('email', email)
    } else if (phone) {
      query = query.eq('phone', phone)
    } else {
      query = query.limit(100).order('created_at', { ascending: false })
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ guests: data })
    
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}