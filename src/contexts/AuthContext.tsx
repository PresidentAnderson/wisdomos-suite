'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Database } from '@/types/database.types'
import { trackEvent, identifyUser } from '@/lib/analytics'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, setUser, setProfile, setLoading, signOut: storeSignOut } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  }

  // Create profile for new users
  const createProfile = async (user: User): Promise<Profile | null> => {
    try {
      const newProfile: Database['public']['Tables']['profiles']['Insert'] = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        username: user.user_metadata?.preferred_username || user.user_metadata?.user_name || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_admin: false,
        is_active: true,
        stats: {
          tools_used: 0,
          documents_created: 0,
          sessions_completed: 0,
          last_active: new Date().toISOString()
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      // Track user registration
      trackEvent('user_registered', {
        user_id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider
      }, user.id)

      return data
    } catch (error) {
      console.error('Profile creation error:', error)
      return null
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      let userProfile = await fetchProfile(user.id)
      
      // Create profile if it doesn't exist
      if (!userProfile) {
        userProfile = await createProfile(user)
      }

      if (userProfile) {
        setProfile(userProfile)
        
        // Update last active timestamp
        await supabase
          .from('profiles')
          .update({ 
            stats: {
              ...userProfile.stats,
              last_active: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const handleSignOut = async () => {
    try {
      setLoading(true)
      
      // Track sign out
      if (user) {
        trackEvent('user_signed_out', { user_id: user.id }, user.id)
      }

      await supabase.auth.signOut()
      storeSignOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const { user: currentUser } = await getCurrentUser()
        
        if (mounted) {
          setUser(currentUser)
          
          if (currentUser) {
            // Fetch/create profile
            let userProfile = await fetchProfile(currentUser.id)
            
            if (!userProfile) {
              userProfile = await createProfile(currentUser)
            }

            if (userProfile && mounted) {
              setProfile(userProfile)
              
              // Identify user for analytics
              identifyUser(currentUser.id, {
                email: userProfile.email,
                name: userProfile.full_name,
                username: userProfile.username
              })

              // Track login
              trackEvent('user_signed_in', {
                user_id: currentUser.id,
                email: currentUser.email
              }, currentUser.id)
            }
          }
          
          setInitialized(true)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setInitialized(true)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setLoading(true)
        
        if (session?.user) {
          setUser(session.user)
          
          // Fetch/create profile for authenticated user
          let userProfile = await fetchProfile(session.user.id)
          
          if (!userProfile) {
            userProfile = await createProfile(session.user)
          }

          if (userProfile) {
            setProfile(userProfile)
            
            // Identify user for analytics
            identifyUser(session.user.id, {
              email: userProfile.email,
              name: userProfile.full_name,
              username: userProfile.username
            })
          }

          // Track auth events
          if (event === 'SIGNED_IN') {
            trackEvent('user_signed_in', {
              user_id: session.user.id,
              email: session.user.email
            }, session.user.id)
          }
        } else {
          setUser(null)
          setProfile(null)
          
          if (event === 'SIGNED_OUT') {
            trackEvent('user_signed_out')
          }
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Don't render children until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const value = {
    user,
    profile,
    isLoading,
    signOut: handleSignOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}