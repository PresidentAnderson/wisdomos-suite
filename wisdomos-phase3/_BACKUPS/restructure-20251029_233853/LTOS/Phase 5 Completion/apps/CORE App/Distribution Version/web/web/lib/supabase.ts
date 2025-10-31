import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only throw error in browser/runtime, not during build
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Missing Supabase environment variables - using placeholder values')
}

// Client for browser usage (with RLS enabled)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
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

// Real-time subscription helper
export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: any) => void,
  filter?: string
) {
  const subscription = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: table as string,
        filter: filter
      }, 
      callback
    )
    .subscribe()

  return subscription
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