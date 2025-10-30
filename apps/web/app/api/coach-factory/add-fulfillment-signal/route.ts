/**
 * Add Fulfillment Signal API Endpoint
 *
 * Manually adds a fulfillment signal to the autobiography timeline
 * Can be called from journal entries, manual reflections, or other sources
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LifeAreaId } from '@/lib/coach-factory'

type SignalType = 'breakthrough' | 'setback' | 'progress' | 'milestone'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const {
      lifeAreaId,
      signalType,
      emotionalCharge,
      description,
      areaScoreBefore,
      areaScoreAfter,
      sessionId,
      occurredAt,
    } = body as {
      lifeAreaId: LifeAreaId
      signalType: SignalType
      emotionalCharge: number // -5 to +5
      description: string
      areaScoreBefore?: number
      areaScoreAfter?: number
      sessionId?: string
      occurredAt?: string // ISO date string
    }

    // Validate required fields
    if (!lifeAreaId || !signalType || emotionalCharge === undefined || !description) {
      return NextResponse.json(
        {
          error: 'Missing required fields: lifeAreaId, signalType, emotionalCharge, description',
        },
        { status: 400 }
      )
    }

    // Validate signal type
    if (!['breakthrough', 'setback', 'progress', 'milestone'].includes(signalType)) {
      return NextResponse.json(
        { error: 'signalType must be one of: breakthrough, setback, progress, milestone' },
        { status: 400 }
      )
    }

    // Validate emotional charge range
    if (emotionalCharge < -5 || emotionalCharge > 5) {
      return NextResponse.json(
        { error: 'emotionalCharge must be between -5 and +5' },
        { status: 400 }
      )
    }

    // If scores not provided, fetch current score
    let scoreBefore = areaScoreBefore
    let scoreAfter = areaScoreAfter

    if (scoreBefore === undefined) {
      const { data: currentData, error: fetchError } = await supabase
        .from('fulfillment_display_items')
        .select('current_score')
        .eq('user_id', user.id)
        .eq('area_slug', lifeAreaId)
        .single()

      if (!fetchError && currentData) {
        scoreBefore = currentData.current_score
        scoreAfter = scoreAfter !== undefined ? scoreAfter : currentData.current_score
      }
    }

    // Create the fulfillment signal
    const { data: signal, error: insertError } = await supabase
      .from('fulfillment_signals')
      .insert({
        user_id: user.id,
        session_id: sessionId || null,
        life_area_id: lifeAreaId,
        signal_type: signalType,
        emotional_charge: emotionalCharge,
        area_score_before: scoreBefore,
        area_score_after: scoreAfter,
        description,
        occurred_at: occurredAt || new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Add Fulfillment Signal] Error inserting signal:', insertError)
      return NextResponse.json(
        { error: 'Failed to create signal', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      signal: {
        id: signal.id,
        lifeAreaId: signal.life_area_id,
        signalType: signal.signal_type,
        emotionalCharge: signal.emotional_charge,
        description: signal.description,
        areaScoreBefore: signal.area_score_before,
        areaScoreAfter: signal.area_score_after,
        occurredAt: signal.occurred_at,
      },
    })
  } catch (error) {
    console.error('[Add Fulfillment Signal API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to fetch fulfillment signals
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const lifeAreaId = searchParams.get('lifeAreaId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const signalType = searchParams.get('signalType')

    // Build query
    let query = supabase
      .from('fulfillment_signals')
      .select('*')
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (lifeAreaId) {
      query = query.eq('life_area_id', lifeAreaId)
    }
    if (signalType) {
      query = query.eq('signal_type', signalType)
    }

    const { data: signals, error: fetchError } = await query

    if (fetchError) {
      console.error('[Add Fulfillment Signal GET] Error fetching signals:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch signals', details: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      signals: signals || [],
      count: signals?.length || 0,
    })
  } catch (error) {
    console.error('[Add Fulfillment Signal GET API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
