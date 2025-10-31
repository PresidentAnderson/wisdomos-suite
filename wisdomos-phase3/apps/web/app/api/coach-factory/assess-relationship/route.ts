/**
 * Assess Relationship API Endpoint
 *
 * Triggers or completes a WE2/WE3 relationship assessment
 * Based on coach session mentions of relationships
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { triggerId, weScore, notes } = body as {
      triggerId: string
      weScore?: number // 2, 3, 4, or 5
      notes?: string
    }

    // Validate required fields
    if (!triggerId) {
      return NextResponse.json({ error: 'Missing required field: triggerId' }, { status: 400 })
    }

    // Fetch the trigger
    const { data: trigger, error: fetchError } = await supabase
      .from('we_assessment_triggers')
      .select('*')
      .eq('id', triggerId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !trigger) {
      return NextResponse.json({ error: 'Assessment trigger not found' }, { status: 404 })
    }

    // If weScore provided, mark assessment as completed
    if (weScore !== undefined) {
      // Validate weScore
      if (![2, 3, 4, 5].includes(weScore)) {
        return NextResponse.json(
          { error: 'WE score must be 2, 3, 4, or 5' },
          { status: 400 }
        )
      }

      // Update trigger as completed
      const { error: updateError } = await supabase
        .from('we_assessment_triggers')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', triggerId)

      if (updateError) {
        console.error('[Assess Relationship] Error updating trigger:', updateError)
        return NextResponse.json(
          { error: 'Failed to update trigger', details: updateError.message },
          { status: 500 }
        )
      }

      // Update the session with the WE score
      const { error: sessionUpdateError } = await supabase
        .from('coach_sessions_extended')
        .update({
          we_score: weScore,
        })
        .eq('session_id', trigger.session_id)

      if (sessionUpdateError) {
        console.error('[Assess Relationship] Error updating session:', sessionUpdateError)
        // Don't fail the request
      }

      // Optionally create or update a contact record with the WE score
      // (This would integrate with your contacts/relationships system)

      return NextResponse.json({
        success: true,
        message: 'Assessment completed successfully',
        data: {
          triggerId,
          relationshipName: trigger.relationship_name,
          weScore,
          notes,
        },
      })
    }

    // If no weScore provided, just return the trigger info
    return NextResponse.json({
      success: true,
      trigger: {
        id: trigger.id,
        relationshipName: trigger.relationship_name,
        triggerReason: trigger.trigger_reason,
        completed: trigger.completed,
        createdAt: trigger.created_at,
      },
    })
  } catch (error) {
    console.error('[Assess Relationship API] Error:', error)
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
 * GET endpoint to fetch pending assessment triggers
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

    // Fetch pending triggers
    const { data: triggers, error: fetchError } = await supabase
      .from('we_assessment_triggers')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('[Assess Relationship GET] Error fetching triggers:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch triggers', details: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      triggers: triggers || [],
      count: triggers?.length || 0,
    })
  } catch (error) {
    console.error('[Assess Relationship GET API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
