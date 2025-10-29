import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LocalUser } from '@/lib/auth-local'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: LocalUser | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: LocalUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => 
        set({ 
          user: null, 
          profile: null, 
          isAuthenticated: false,
          isLoading: false 
        })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)