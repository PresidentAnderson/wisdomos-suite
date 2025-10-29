/**
 * Fulfillment Display v5 — API Usage Examples
 *
 * Complete examples for interacting with the Fulfillment Backend
 * using Supabase client
 *
 * @version 5.0
 * @date 2025-10-29
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  FDArea,
  FDEntry,
  FDScoreRaw,
  FDReviewMonth,
  Goal,
  Ritual,
  RitualSession,
  Relationship,
  RelationshipEvent,
} from '../packages/types/fulfillment-display'

// =====================================================
// SETUP
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

// =====================================================
// EXAMPLE 1: Fetch All Areas
// =====================================================

async function fetchAllAreas() {
  const { data: areas, error } = await supabase
    .from('fd_area')
    .select('*')
    .eq('is_active', true)
    .order('code', { ascending: true })

  if (error) {
    console.error('Error fetching areas:', error)
    return []
  }

  console.log(`✅ Fetched ${areas.length} areas`)
  return areas as FDArea[]
}

// =====================================================
// EXAMPLE 2: Create Journal Entry
// =====================================================

async function createJournalEntry(userId: string, tenantId: string, content: string) {
  const { data: entry, error } = await supabase
    .from('fd_entry')
    .insert({
      user_id: userId,
      tenant_id: tenantId,
      date: new Date().toISOString().split('T')[0],
      content_md: content,
      lang: 'en',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating entry:', error)
    return null
  }

  console.log(`✅ Created journal entry: ${entry.id}`)
  return entry as FDEntry
}

// =====================================================
// EXAMPLE 3: Link Entry to Area/Dimension
// =====================================================

async function linkEntryToArea(
  entryId: string,
  areaId: string,
  dimensionId?: string,
  strength: number = 1.0
) {
  const { data: link, error } = await supabase
    .from('fd_entry_link')
    .insert({
      entry_id: entryId,
      area_id: areaId,
      dimension_id: dimensionId,
      strength,
    })
    .select()
    .single()

  if (error) {
    console.error('Error linking entry:', error)
    return null
  }

  console.log(`✅ Linked entry to area`)
  return link
}

// =====================================================
// EXAMPLE 4: Submit Manual Score
// =====================================================

async function submitManualScore(
  userId: string,
  tenantId: string,
  areaId: string,
  score: number,
  period: string = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
) {
  const { data: scoreData, error } = await supabase
    .from('fd_score_raw')
    .insert({
      user_id: userId,
      tenant_id: tenantId,
      area_id: areaId,
      period,
      score,
      source: 'manual',
      provenance: 'user-submitted',
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting score:', error)
    return null
  }

  console.log(`✅ Submitted score: ${score} for area ${areaId}`)
  return scoreData as FDScoreRaw
}

// =====================================================
// EXAMPLE 5: Get Monthly Review
// =====================================================

async function getMonthlyReview(userId: string, month: string) {
  const { data: review, error } = await supabase
    .from('fd_review_month')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  if (error) {
    console.error('Error fetching review:', error)
    return null
  }

  console.log(`✅ Fetched monthly review: GFS = ${review.gfs}`)
  return review as FDReviewMonth
}

// =====================================================
// EXAMPLE 6: Calculate GFS Using RPC
// =====================================================

async function calculateGFS(profileId: string, period: string) {
  const { data: gfs, error } = await supabase.rpc('fn_calculate_gfs', {
    p_profile_id: profileId,
    p_period: period,
  })

  if (error) {
    console.error('Error calculating GFS:', error)
    return 0
  }

  console.log(`✅ GFS for ${period}: ${gfs}`)
  return gfs as number
}

// =====================================================
// EXAMPLE 7: Generate Monthly Rollup
// =====================================================

async function generateMonthlyRollup(userId: string, month: string) {
  const { data: rollup, error } = await supabase.rpc('fn_fd_rollup_month', {
    p_user_id: userId,
    p_month: month,
  })

  if (error) {
    console.error('Error generating rollup:', error)
    return null
  }

  console.log(`✅ Generated rollup for ${month}:`, rollup)
  return rollup
}

// =====================================================
// EXAMPLE 8: Create Goal
// =====================================================

async function createGoal(
  profileId: string,
  title: string,
  areaId?: string,
  targetDate?: string
) {
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      profile_id: profileId,
      title,
      area_id: areaId,
      target_date: targetDate,
      status: 'planned',
      priority: 'medium',
      progress: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating goal:', error)
    return null
  }

  console.log(`✅ Created goal: ${goal.title}`)
  return goal as Goal
}

// =====================================================
// EXAMPLE 9: Update Goal Progress
// =====================================================

async function updateGoalProgress(goalId: string, progress: number, summary: string) {
  // First, update the goal
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .update({ progress })
    .eq('id', goalId)
    .select()
    .single()

  if (goalError) {
    console.error('Error updating goal:', goalError)
    return null
  }

  // Then, log the update
  const { data: update, error: updateError } = await supabase
    .from('goal_updates')
    .insert({
      goal_id: goalId,
      summary,
      progress,
    })
    .select()
    .single()

  if (updateError) {
    console.error('Error logging update:', updateError)
  }

  console.log(`✅ Updated goal progress: ${progress}%`)
  return goal
}

// =====================================================
// EXAMPLE 10: Create Ritual
// =====================================================

async function createRitual(
  profileId: string,
  title: string,
  cadence: 'daily' | 'weekly' | 'monthly' = 'daily',
  areaId?: string
) {
  const { data: ritual, error } = await supabase
    .from('rituals')
    .insert({
      profile_id: profileId,
      title,
      cadence,
      area_id: areaId,
      reminder_enabled: true,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating ritual:', error)
    return null
  }

  console.log(`✅ Created ritual: ${ritual.title}`)
  return ritual as Ritual
}

// =====================================================
// EXAMPLE 11: Record Ritual Session
// =====================================================

async function recordRitualSession(
  ritualId: string,
  didHappen: boolean,
  notes?: string,
  mood?: number
) {
  const { data: session, error } = await supabase
    .from('ritual_sessions')
    .insert({
      ritual_id: ritualId,
      did_happen: didHappen,
      notes,
      mood,
      occurred_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording session:', error)
    return null
  }

  console.log(`✅ Recorded ritual session`)
  return session as RitualSession
}

// =====================================================
// EXAMPLE 12: Create Relationship
// =====================================================

async function createRelationship(
  profileId: string,
  personName: string,
  kind: string,
  areaId?: string
) {
  const { data: relationship, error } = await supabase
    .from('relationships')
    .insert({
      profile_id: profileId,
      person_name: personName,
      kind,
      status: 'active',
      area_id: areaId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating relationship:', error)
    return null
  }

  console.log(`✅ Created relationship: ${relationship.person_name}`)
  return relationship as Relationship
}

// =====================================================
// EXAMPLE 13: Log Relationship Event
// =====================================================

async function logRelationshipEvent(
  relationshipId: string,
  title: string,
  detail?: string,
  mood?: number
) {
  const { data: event, error } = await supabase
    .from('relationship_events')
    .insert({
      relationship_id: relationshipId,
      title,
      detail,
      mood,
      occurred_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error logging event:', error)
    return null
  }

  console.log(`✅ Logged relationship event: ${event.title}`)
  return event as RelationshipEvent
}

// =====================================================
// EXAMPLE 14: Get Overdue Goals (Using View)
// =====================================================

async function getOverdueGoals(profileId: string) {
  const { data: goals, error } = await supabase
    .from('v_goals_overdue')
    .select('*')
    .eq('profile_id', profileId)

  if (error) {
    console.error('Error fetching overdue goals:', error)
    return []
  }

  console.log(`✅ Found ${goals.length} overdue goals`)
  return goals
}

// =====================================================
// EXAMPLE 15: Get Active Rituals (Using View)
// =====================================================

async function getActiveRituals(profileId: string) {
  const { data: rituals, error } = await supabase
    .from('v_rituals_active')
    .select('*')
    .eq('profile_id', profileId)

  if (error) {
    console.error('Error fetching rituals:', error)
    return []
  }

  console.log(`✅ Found ${rituals.length} active rituals`)
  return rituals
}

// =====================================================
// EXAMPLE 16: Upload Attachment
// =====================================================

async function uploadAttachment(
  profileId: string,
  file: File,
  resourceType: string,
  resourceId: string
) {
  // Upload to storage
  const filePath = `${profileId}/${resourceType}/${resourceId}/${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return null
  }

  // Create attachment record
  const { data: attachment, error: attachmentError } = await supabase
    .from('attachments')
    .insert({
      profile_id: profileId,
      resource_type: resourceType,
      resource_id: resourceId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
    })
    .select()
    .single()

  if (attachmentError) {
    console.error('Error creating attachment:', attachmentError)
    return null
  }

  console.log(`✅ Uploaded attachment: ${file.name}`)
  return attachment
}

// =====================================================
// EXAMPLE 17: Get Signed URL for Attachment
// =====================================================

async function getAttachmentUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(storagePath, 3600) // 1 hour

  if (error) {
    console.error('Error getting signed URL:', error)
    return null
  }

  console.log(`✅ Generated signed URL`)
  return data.signedUrl
}

// =====================================================
// EXAMPLE 18: Subscribe to Real-time Changes
// =====================================================

function subscribeToJournalEntries(userId: string, callback: (entry: FDEntry) => void) {
  const channel = supabase
    .channel('journal-entries')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'fd_entry',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('📨 New journal entry:', payload.new)
        callback(payload.new as FDEntry)
      }
    )
    .subscribe()

  console.log('✅ Subscribed to journal entries')

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
    console.log('❌ Unsubscribed from journal entries')
  }
}

// =====================================================
// EXAMPLE 19: Call Edge Function
// =====================================================

async function analyzeJournalEntry(entryId: string) {
  const { data, error } = await supabase.functions.invoke('journal-ai-analysis', {
    body: { entry_id: entryId },
  })

  if (error) {
    console.error('Error analyzing entry:', error)
    return null
  }

  console.log('✅ AI analysis complete:', data)
  return data
}

// =====================================================
// EXAMPLE 20: Full Workflow — Complete Fulfillment Entry
// =====================================================

async function completeFullfillmentWorkflow() {
  const userId = 'user-uuid-here'
  const tenantId = 'tenant-uuid-here'
  const profileId = 'profile-uuid-here'

  // 1. Fetch areas
  const areas = await fetchAllAreas()
  const workArea = areas.find((a) => a.code === 'WRK')!

  // 2. Create journal entry
  const entry = await createJournalEntry(
    userId,
    tenantId,
    'Today I completed 3 major tasks and made good progress on my project.'
  )

  if (!entry) return

  // 3. Link entry to area
  await linkEntryToArea(entry.id, workArea.id)

  // 4. Submit manual score
  await submitManualScore(userId, tenantId, workArea.id, 4.5)

  // 5. Create a goal
  const goal = await createGoal(profileId, 'Complete project by end of month', workArea.id)

  if (goal) {
    // 6. Update goal progress
    await updateGoalProgress(goal.id, 50, 'Halfway there! Made significant progress.')
  }

  // 7. Calculate GFS
  const gfs = await calculateGFS(profileId, new Date().toISOString().slice(0, 7))

  console.log('🎉 Workflow complete! GFS:', gfs)
}

// =====================================================
// EXPORTS
// =====================================================

export {
  fetchAllAreas,
  createJournalEntry,
  linkEntryToArea,
  submitManualScore,
  getMonthlyReview,
  calculateGFS,
  generateMonthlyRollup,
  createGoal,
  updateGoalProgress,
  createRitual,
  recordRitualSession,
  createRelationship,
  logRelationshipEvent,
  getOverdueGoals,
  getActiveRituals,
  uploadAttachment,
  getAttachmentUrl,
  subscribeToJournalEntries,
  analyzeJournalEntry,
  completeFullfillmentWorkflow,
}

// =====================================================
// USAGE EXAMPLE
// =====================================================

/*
import { completeFullfillmentWorkflow } from './examples/fulfillment-api-usage'

// Run the complete workflow
completeFullfillmentWorkflow()
  .then(() => console.log('✅ All examples complete'))
  .catch((error) => console.error('❌ Error:', error))
*/
