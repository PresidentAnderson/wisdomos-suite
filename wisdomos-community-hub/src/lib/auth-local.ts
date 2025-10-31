'use client'

import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/types/database.types'

// Types for our local authentication system
export interface LocalUser {
  id: string
  email: string
  password_hash: string
  user_metadata: {
    full_name?: string
    name?: string
    avatar_url?: string
    preferred_username?: string
  }
  app_metadata: {
    provider?: string
  }
  created_at: string
  updated_at: string
  email_confirmed_at: string
}

export interface LocalSession {
  user: LocalUser
  access_token: string
  expires_at: number
}

export interface AuthResponse<T = any> {
  data: T | null
  error: Error | null
}

type Profile = Database['public']['Tables']['profiles']['Row']

// Simple hash function (not secure for production, but good for demo)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

// Local storage keys
const USERS_KEY = 'wisdomos_users'
const SESSION_KEY = 'wisdomos_session'
const PROFILES_KEY = 'wisdomos_profiles'

// Session management
let currentSession: LocalSession | null = null
let authStateChangeCallbacks: Array<(event: string, session: LocalSession | null) => void> = []

// Get stored users from localStorage
function getStoredUsers(): LocalUser[] {
  if (typeof window === 'undefined') return []
  try {
    const users = localStorage.getItem(USERS_KEY)
    return users ? JSON.parse(users) : []
  } catch {
    return []
  }
}

// Store users to localStorage
function storeUsers(users: LocalUser[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Failed to store users:', error)
  }
}

// Get stored profiles from localStorage
function getStoredProfiles(): Profile[] {
  if (typeof window === 'undefined') return []
  try {
    const profiles = localStorage.getItem(PROFILES_KEY)
    return profiles ? JSON.parse(profiles) : []
  } catch {
    return []
  }
}

// Store profiles to localStorage
function storeProfiles(profiles: Profile[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  } catch (error) {
    console.error('Failed to store profiles:', error)
  }
}

// Get stored session from localStorage
function getStoredSession(): LocalSession | null {
  if (typeof window === 'undefined') return null
  try {
    const session = localStorage.getItem(SESSION_KEY)
    if (!session) return null
    
    const parsedSession = JSON.parse(session)
    // Check if session is expired
    if (parsedSession.expires_at < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    
    return parsedSession
  } catch {
    return null
  }
}

// Store session to localStorage
function storeSession(session: LocalSession | null): void {
  if (typeof window === 'undefined') return
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  } catch (error) {
    console.error('Failed to store session:', error)
  }
}

// Create a new session
function createSession(user: LocalUser): LocalSession {
  const session: LocalSession = {
    user,
    access_token: uuidv4(),
    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
  storeSession(session)
  currentSession = session
  
  // Notify listeners
  authStateChangeCallbacks.forEach(callback => {
    try {
      callback('SIGNED_IN', session)
    } catch (error) {
      console.error('Auth state change callback error:', error)
    }
  })
  
  return session
}

// Initialize session on load
export function initializeAuth(): void {
  if (typeof window === 'undefined') return
  
  const session = getStoredSession()
  if (session) {
    currentSession = session
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string, 
  password: string, 
  metadata: any = {}
): Promise<AuthResponse<{ user: LocalUser; session: LocalSession }>> {
  try {
    const users = getStoredUsers()
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return {
        data: null,
        error: new Error('User already exists')
      }
    }
    
    // Create new user
    const newUser: LocalUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password_hash: simpleHash(password),
      user_metadata: {
        full_name: metadata.full_name || '',
        name: metadata.full_name || '',
        ...metadata
      },
      app_metadata: {
        provider: 'email'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString() // Auto-confirm for demo
    }
    
    // Store user
    users.push(newUser)
    storeUsers(users)
    
    // Create session
    const session = createSession(newUser)
    
    return {
      data: { user: newUser, session },
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Sign up failed')
    }
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string, 
  password: string
): Promise<AuthResponse<{ user: LocalUser; session: LocalSession }>> {
  try {
    const users = getStoredUsers()
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password_hash === simpleHash(password)
    )
    
    if (!user) {
      return {
        data: null,
        error: new Error('Invalid login credentials')
      }
    }
    
    // Create session
    const session = createSession(user)
    
    return {
      data: { user, session },
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Sign in failed')
    }
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthResponse<LocalUser>> {
  try {
    const session = getStoredSession()
    if (!session) {
      return {
        data: null,
        error: null
      }
    }
    
    currentSession = session
    return {
      data: session.user,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get current user')
    }
  }
}

// Sign out
export async function signOut(): Promise<AuthResponse<void>> {
  try {
    storeSession(null)
    currentSession = null
    
    // Notify listeners
    authStateChangeCallbacks.forEach(callback => {
      try {
        callback('SIGNED_OUT', null)
      } catch (error) {
        console.error('Auth state change callback error:', error)
      }
    })
    
    return {
      data: null,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Sign out failed')
    }
  }
}

// OAuth providers (mock implementation for demo)
export async function signInWithGoogle(): Promise<AuthResponse<{ user: LocalUser; session: LocalSession }>> {
  // Show a more user-friendly message and create demo account
  const shouldCreateDemo = window.confirm(
    'OAuth providers are not available in demo mode. Would you like to create a demo Google account instead?'
  )
  
  if (shouldCreateDemo) {
    // Create a demo Google user
    const demoEmail = 'demo.google@wisdomos.com'
    const users = getStoredUsers()
    
    // Check if demo user already exists
    let existingUser = users.find(u => u.email === demoEmail)
    
    if (!existingUser) {
      // Create new demo user
      const newUser: LocalUser = {
        id: uuidv4(),
        email: demoEmail,
        password_hash: simpleHash('demo123'),
        user_metadata: {
          full_name: 'Demo Google User',
          name: 'Demo Google User',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
          preferred_username: 'demo_google'
        },
        app_metadata: {
          provider: 'google'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString()
      }
      
      users.push(newUser)
      storeUsers(users)
      existingUser = newUser
    }
    
    // Create session for demo user
    const session = createSession(existingUser)
    
    return {
      data: { user: existingUser, session },
      error: null
    }
  }
  
  return {
    data: null,
    error: new Error('Google Sign-In cancelled. Please use email/password registration or try the demo account.')
  }
}

export async function signInWithGithub(): Promise<AuthResponse<{ user: LocalUser; session: LocalSession }>> {
  // Show a more user-friendly message and create demo account
  const shouldCreateDemo = window.confirm(
    'OAuth providers are not available in demo mode. Would you like to create a demo GitHub account instead?'
  )
  
  if (shouldCreateDemo) {
    // Create a demo GitHub user
    const demoEmail = 'demo.github@wisdomos.com'
    const users = getStoredUsers()
    
    // Check if demo user already exists
    let existingUser = users.find(u => u.email === demoEmail)
    
    if (!existingUser) {
      // Create new demo user
      const newUser: LocalUser = {
        id: uuidv4(),
        email: demoEmail,
        password_hash: simpleHash('demo123'),
        user_metadata: {
          full_name: 'Demo GitHub User',
          name: 'Demo GitHub User',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=github',
          preferred_username: 'demo_github'
        },
        app_metadata: {
          provider: 'github'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString()
      }
      
      users.push(newUser)
      storeUsers(users)
      existingUser = newUser
    }
    
    // Create session for demo user
    const session = createSession(existingUser)
    
    return {
      data: { user: existingUser, session },
      error: null
    }
  }
  
  return {
    data: null,
    error: new Error('GitHub Sign-In cancelled. Please use email/password registration or try the demo account.')
  }
}

// Auth state change listener
export function onAuthStateChange(
  callback: (event: string, session: LocalSession | null) => void
): { data: { subscription: { unsubscribe: () => void } }; error: null } {
  authStateChangeCallbacks.push(callback)
  
  // Call immediately with current state
  setTimeout(() => {
    const session = getStoredSession()
    if (session) {
      currentSession = session
      callback('SIGNED_IN', session)
    } else {
      callback('SIGNED_OUT', null)
    }
  }, 0)
  
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          const index = authStateChangeCallbacks.indexOf(callback)
          if (index > -1) {
            authStateChangeCallbacks.splice(index, 1)
          }
        }
      }
    },
    error: null
  }
}

// Profile management functions
export async function getProfile(userId: string): Promise<AuthResponse<Profile>> {
  try {
    const profiles = getStoredProfiles()
    const profile = profiles.find(p => p.id === userId)
    
    return {
      data: profile || null,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to get profile')
    }
  }
}

export async function createProfile(user: LocalUser): Promise<AuthResponse<Profile>> {
  try {
    const profiles = getStoredProfiles()
    
    const newProfile: Profile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || null,
      username: user.user_metadata?.preferred_username || null,
      bio: null,
      website: null,
      location: null,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_admin: false,
      is_active: true,
      stats: {
        tools_used: 0,
        documents_created: 0,
        sessions_completed: 0,
        last_active: new Date().toISOString()
      }
    }
    
    profiles.push(newProfile)
    storeProfiles(profiles)
    
    return {
      data: newProfile,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to create profile')
    }
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<AuthResponse<Profile>> {
  try {
    const profiles = getStoredProfiles()
    const profileIndex = profiles.findIndex(p => p.id === userId)
    
    if (profileIndex === -1) {
      return {
        data: null,
        error: new Error('Profile not found')
      }
    }
    
    profiles[profileIndex] = {
      ...profiles[profileIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    storeProfiles(profiles)
    
    return {
      data: profiles[profileIndex],
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update profile')
    }
  }
}

// Mock database functions for documents and activities (for dashboard)
export const localDB = {
  documents: {
    select: () => ({
      eq: (field: string, value: string) => ({
        order: (field: string, options?: any) => Promise.resolve({
          data: [],
          error: null
        })
      })
    })
  },
  activities: {
    select: () => ({
      eq: (field: string, value: string) => ({
        order: (field: string, options?: any) => ({
          limit: (count: number) => Promise.resolve({
            data: [],
            error: null
          })
        })
      })
    })
  },
  profiles: {
    select: () => ({
      eq: (field: string, value: string) => ({
        single: () => getProfile(value)
      })
    }),
    insert: (data: any[]) => ({
      select: () => ({
        single: () => createProfile(data[0])
      })
    }),
    update: (data: Partial<Profile>) => ({
      eq: (field: string, value: string) => updateProfile(value, data)
    })
  }
}

// Initialize auth when this module loads
if (typeof window !== 'undefined') {
  initializeAuth()
}