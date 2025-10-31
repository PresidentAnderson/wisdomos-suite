import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only warn in development/runtime, not during build
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('🔥 Phoenix Warning: Missing Supabase environment variables - using placeholder values')
}

// Phoenix-themed Supabase client configuration
const phoenixSupabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
  },
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
  global: {
    headers: {
      'X-WisdomOS-Client': 'Phoenix-Frontend',
      'X-AXAI-Innovations': 'Proprietary',
    },
  },
}

// Client for browser usage (with RLS enabled)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, phoenixSupabaseOptions)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-WisdomOS-Admin': 'Phoenix-Backend',
          'X-AXAI-Innovations': 'Proprietary',
        },
      },
    })
  : null

// Helper function to get client based on context
export function getSupabaseClient(isAdmin = false) {
  if (isAdmin && supabaseAdmin) {
    return supabaseAdmin
  }
  return supabase
}

// Types for database operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Phoenix-themed real-time subscription helpers
export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: any) => void,
  filter?: string,
  events: ('INSERT' | 'UPDATE' | 'DELETE')[] = ['INSERT', 'UPDATE', 'DELETE']
) {
  console.log(`🔥 Phoenix: Subscribing to ${table} table with events: ${events.join(', ')}`)
  
  const subscription = supabase
    .channel(`phoenix:${table}:${Date.now()}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: table as string,
        filter: filter
      }, 
      (payload) => {
        console.log(`🔥 Phoenix Real-time: ${table} ${payload.eventType}`, payload)
        callback(payload)
      }
    )
    .subscribe((status) => {
      console.log(`🔥 Phoenix Subscription Status: ${status}`)
    })

  return subscription
}

// Enhanced Phoenix collaboration subscription
export function subscribeToPhoenixCollaboration(
  organizationId: string,
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel(`phoenix:collaboration:${organizationId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'life_areas',
        filter: `organization_id=eq.${organizationId}`
      }, 
      callback
    )
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'contacts',
        filter: `organization_id=eq.${organizationId}`
      }, 
      callback
    )
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'journal_entries',
        filter: `organization_id=eq.${organizationId}`
      }, 
      callback
    )
    .subscribe()

  return subscription
}

// Phoenix authentication helpers
export async function signInWithPhoenix(email: string, password: string) {
  console.log('🔥 Phoenix: Authenticating user...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('🔥 Phoenix Auth Error:', error)
    return { data: null, error }
  }
  
  console.log('🔥 Phoenix: User authenticated successfully')
  return { data, error: null }
}

export async function signUpWithPhoenix(email: string, password: string, metadata: any = {}) {
  console.log('🔥 Phoenix: Creating new user account...')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...metadata,
        phoenix_theme: 'enabled',
        created_with: 'WisdomOS Phoenix'
      }
    }
  })
  
  if (error) {
    console.error('🔥 Phoenix Registration Error:', error)
    return { data: null, error }
  }
  
  console.log('🔥 Phoenix: User account created successfully')
  return { data, error: null }
}

export async function signOutFromPhoenix() {
  console.log('🔥 Phoenix: Signing out user...')
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('🔥 Phoenix Sign Out Error:', error)
    return { error }
  }
  
  console.log('🔥 Phoenix: User signed out successfully')
  return { error: null }
}

// Phoenix session management
export async function getPhoenixSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('🔥 Phoenix Session Error:', error)
    return { session: null, error }
  }
  
  return { session, error: null }
}

// Phoenix user profile helper
export async function getPhoenixUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('🔥 Phoenix Profile Error:', error)
    return { profile: null, error }
  }
  
  return { profile: data, error: null }
}

// Error handling helper
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error)
  
  if (error?.code === 'PGRST301') {
    return { data: null, error: 'Access denied - insufficient permissions' }
  }
  
  if (error?.code === '23505') {
    return { data: null, error: 'This item already exists' }
  }
  
  if (error?.code === '23503') {
    return { data: null, error: 'Cannot delete - item is referenced by other records' }
  }
  
  return { data: null, error: error?.message || 'An unexpected error occurred' }
}