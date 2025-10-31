/**
 * Coach Factory API Endpoint
 *
 * Routes voice coaching sessions to area-specific coaches based on:
 * - Life area classification (30 areas)
 * - Current fulfillment score
 * - Restoration mode (< 30) vs Play mode (≥ 40)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCoachFactory, type RoutingResult } from '@/lib/coach-factory'

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
    const { sessionId, transcript, tags, themes, sentiment } = body

    // Validate required fields
    if (!sessionId || !transcript || !tags || !themes || !sentiment) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, transcript, tags, themes, sentiment' },
        { status: 400 }
      )
    }

    // Create Coach Factory instance
    const coachFactory = createCoachFactory(supabase)

    // Route the session to appropriate coach
    const routingResult: RoutingResult = await coachFactory.routeSession({
      transcript,
      tags,
      themes,
      sentiment,
      userId: user.id,
    })

    // Save extended session data
    const { error: extendedSessionError } = await supabase
      .from('coach_sessions_extended')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        life_area_id: routingResult.lifeArea,
        area_score: routingResult.areaScore,
        coach_mode: routingResult.coachMode,
        relationship_id: routingResult.relationshipContext?.relationshipName
          ? null // We don't have the ID yet, would need to look it up
          : null,
        relationship_name: routingResult.relationshipContext?.relationshipName,
        we_score: routingResult.relationshipContext?.weScore,
      })

    if (extendedSessionError) {
      console.error('[Coach Factory API] Error saving extended session:', extendedSessionError)
      // Don't fail the request, just log the error
    }

    // Update main session with routing data
    const { error: updateSessionError } = await supabase
      .from('wisdom_coach_sessions')
      .update({
        life_area_id: routingResult.lifeArea,
        area_score: routingResult.areaScore,
        coach_mode: routingResult.coachMode,
        relationship_context: routingResult.relationshipContext
          ? {
              relationshipName: routingResult.relationshipContext.relationshipName,
              weScore: routingResult.relationshipContext.weScore,
              shouldTriggerAssessment:
                routingResult.relationshipContext.shouldTriggerAssessment,
            }
          : null,
      })
      .eq('id', sessionId)

    if (updateSessionError) {
      console.error('[Coach Factory API] Error updating session:', updateSessionError)
    }

    // If relationship assessment should be triggered, create trigger record
    if (
      routingResult.relationshipContext?.shouldTriggerAssessment &&
      routingResult.relationshipContext.relationshipName
    ) {
      const { error: triggerError } = await supabase.from('we_assessment_triggers').insert({
        session_id: sessionId,
        user_id: user.id,
        relationship_name: routingResult.relationshipContext.relationshipName,
        trigger_reason:
          routingResult.relationshipContext.triggerReason || 'Relationship mentioned in session',
        completed: false,
      })

      if (triggerError) {
        console.error('[Coach Factory API] Error creating assessment trigger:', triggerError)
      }
    }

    // If fulfillment signal detected, create signal record
    if (routingResult.fulfillmentSignal) {
      const { error: signalError } = await supabase.from('fulfillment_signals').insert({
        user_id: user.id,
        session_id: sessionId,
        life_area_id: routingResult.lifeArea,
        signal_type: routingResult.fulfillmentSignal.signalType,
        emotional_charge: routingResult.fulfillmentSignal.emotionalCharge,
        area_score_before: routingResult.areaScore, // Current score
        area_score_after: null, // Will be updated if score changes
        description: routingResult.fulfillmentSignal.description,
        occurred_at: new Date().toISOString(),
      })

      if (signalError) {
        console.error('[Coach Factory API] Error creating fulfillment signal:', signalError)
      }
    }

    // Return routing result
    return NextResponse.json({
      success: true,
      routing: {
        lifeArea: routingResult.lifeArea,
        areaScore: routingResult.areaScore,
        coachMode: routingResult.coachMode,
        coachName: routingResult.coachName,
        contextualResponse: routingResult.contextualResponse,
        relationshipContext: routingResult.relationshipContext,
        fulfillmentSignal: routingResult.fulfillmentSignal,
      },
    })
  } catch (error) {
    console.error('[Coach Factory API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
