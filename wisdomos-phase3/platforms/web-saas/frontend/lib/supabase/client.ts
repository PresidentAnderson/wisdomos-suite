import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application': 'wisdomos'
      }
    }
  }
)

// Helper functions for common operations
export const supabaseAdmin = {
  // Users
  async createUser(email: string, name?: string) {
    const { data, error } = await supabase
      .from('users')
      .insert({ email, name })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, life_areas(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Journal Entries
  async createJournalEntry(entry: {
    user_id: string
    title: string
    body?: string
    mood?: string
    tags?: string[]
    linked_life_areas?: string[]
  }) {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getJournalEntries(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Contributions
  async upsertContribution(contribution: {
    user_id: string
    external_id: string
    type: 'being' | 'doing' | 'having'
    title: string
    description?: string
    entity?: string
    entity_id?: string
    source?: string
    properties?: any
    associations?: any
  }) {
    const { data, error } = await supabase
      .from('contributions')
      .upsert(contribution, { 
        onConflict: 'external_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getContributions(userId: string, type?: string) {
    let query = supabase
      .from('contributions')
      .select('*')
      .eq('user_id', userId)
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Life Areas
  async updateLifeArea(id: string, updates: {
    score?: number
    status?: string
  }) {
    const { data, error } = await supabase
      .from('life_areas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Fulfillment Scores
  async recordFulfillmentScore(score: {
    user_id: string
    life_area_id: string
    score: number
    contributions?: string[]
  }) {
    const { data, error } = await supabase
      .from('fulfillment_scores')
      .insert(score)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getFulfillmentHistory(userId: string, lifeAreaId?: string) {
    let query = supabase
      .from('fulfillment_scores')
      .select('*, life_areas(*)')
      .eq('user_id', userId)
    
    if (lifeAreaId) {
      query = query.eq('life_area_id', lifeAreaId)
    }
    
    const { data, error } = await query
      .order('measured_at', { ascending: false })
      .limit(100)
    
    if (error) throw error
    return data
  },

  // HubSpot Sync
  async updateSyncStatus(
    userId: string,
    entityType: string,
    entityId: string,
    status: 'success' | 'error',
    errorMessage?: string
  ) {
    const { data, error } = await supabase
      .from('hubspot_sync')
      .upsert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        sync_status: status,
        error_message: errorMessage,
        last_synced_at: new Date().toISOString()
      }, {
        onConflict: 'entity_type,entity_id'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Monthly Audits
  async createMonthlyAudit(audit: {
    user_id: string
    month: number
    year: number
    life_area_scores: Record<string, number>
    total_score: number
    insights?: string
    boundaries_set?: string[]
    celebrations?: string[]
  }) {
    const { data, error } = await supabase
      .from('monthly_audits')
      .upsert(audit, {
        onConflict: 'user_id,month,year'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getMonthlyAudits(userId: string, year?: number) {
    let query = supabase
      .from('monthly_audits')
      .select('*')
      .eq('user_id', userId)
    
    if (year) {
      query = query.eq('year', year)
    }
    
    const { data, error } = await query
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    
    if (error) throw error
    return data
  }
}