/**
 * Update Area Score API Endpoint
 *
 * Updates the fulfillment score for a specific life area
 * and logs the change as a fulfillment signal if significant
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LifeAreaId } from '@/lib/coach-factory'

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
    const { lifeAreaId, newScore, reason } = body as {
      lifeAreaId: LifeAreaId
      newScore: number
      reason?: string
    }

    // Validate required fields
    if (!lifeAreaId || newScore === undefined || newScore === null) {
      return NextResponse.json(
        { error: 'Missing required fields: lifeAreaId, newScore' },
        { status: 400 }
      )
    }

    // Validate score range
    if (newScore < 0 || newScore > 100) {
      return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 400 })
    }

    // Fetch current score from fulfillment display
    const { data: currentData, error: fetchError } = await supabase
      .from('fulfillment_display_items')
      .select('current_score, id')
      .eq('user_id', user.id)
      .eq('area_slug', lifeAreaId)
      .single()

    if (fetchError) {
      console.error('[Update Area Score] Error fetching current score:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch current score', details: fetchError.message },
        { status: 500 }
      )
    }

    const oldScore = currentData?.current_score || 0
    const scoreDelta = newScore - oldScore

    // Update the score in fulfillment_display_items
    const { error: updateError } = await supabase
      .from('fulfillment_display_items')
      .update({
        current_score: newScore,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('area_slug', lifeAreaId)

    if (updateError) {
      console.error('[Update Area Score] Error updating score:', updateError)
      return NextResponse.json(
        { error: 'Failed to update score', details: updateError.message },
        { status: 500 }
      )
    }

    // If score change is significant (>= 10 points), create a fulfillment signal
    if (Math.abs(scoreDelta) >= 10) {
      const signalType =
        scoreDelta >= 20
          ? 'breakthrough'
          : scoreDelta >= 10
          ? 'progress'
          : scoreDelta <= -20
          ? 'setback'
          : 'progress'

      const emotionalCharge = Math.min(5, Math.max(-5, scoreDelta / 10))

      const { error: signalError } = await supabase.from('fulfillment_signals').insert({
        user_id: user.id,
        session_id: null, // Not tied to a specific session
        life_area_id: lifeAreaId,
        signal_type: signalType,
        emotional_charge: emotionalCharge,
        area_score_before: oldScore,
        area_score_after: newScore,
        description:
          reason ||
          `Score ${scoreDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(scoreDelta)} points`,
        occurred_at: new Date().toISOString(),
      })

      if (signalError) {
        console.error('[Update Area Score] Error creating fulfillment signal:', signalError)
        // Don't fail the request
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        lifeAreaId,
        oldScore,
        newScore,
        scoreDelta,
        signalCreated: Math.abs(scoreDelta) >= 10,
      },
    })
  } catch (error) {
    console.error('[Update Area Score API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
