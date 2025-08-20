import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { 
  getCurrentUser as localGetCurrentUser, 
  signOut as localSignOut,
  signInWithGoogle as localSignInWithGoogle,
  signInWithGithub as localSignInWithGithub,
  signInWithEmail as localSignInWithEmail,
  signUpWithEmail as localSignUpWithEmail
} from './auth-local'

// Only initialize during runtime, not build time
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Return a mock client during SSR/build
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        upsert: () => ({ data: null, error: null }),
      }),
      channel: () => ({
        subscribe: () => ({}),
        unsubscribe: () => Promise.resolve(),
      }),
    } as any
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholderproject.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5OTg4OTM4MTZ9.rLZz5IH-Q-sKnKS9iuJ7w-Mm2FBdN1HhFe8Q0RZwNUs'
    
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }

  return supabaseInstance
}

export const supabase = getSupabaseClient()

// For server-side operations with elevated privileges - only on server
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on server side')
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholderproject.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  
  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Auth helper functions - now delegating to local auth

export const getCurrentUser = async () => {
  const { data: user, error } = await localGetCurrentUser()
  return { user, error }
}

export const signOut = async () => {
  const { error } = await localSignOut()
  return { error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await localSignInWithGoogle()
  return { data, error }
}

export const signInWithGithub = async () => {
  const { data, error } = await localSignInWithGithub()
  return { data, error }
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await localSignInWithEmail(email, password)
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, metadata: any = {}) => {
  const { data, error } = await localSignUpWithEmail(email, password, metadata)
  return { data, error }
}

export const resetPassword = async (email: string) => {
  return {
    data: null,
    error: new Error('Password reset not available in local mode')
  }
}

export const updatePassword = async (password: string) => {
  return {
    data: null,
    error: new Error('Password update not available in local mode')
  }
}