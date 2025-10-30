'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash or search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        
        // Check for error parameters
        const error = hashParams.get('error') || searchParams.get('error')
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description')
        
        if (error) {
          console.error('Auth callback error:', error, errorDescription)
          trackEvent('auth_callback_error', { error, error_description: errorDescription })
          router.push('/auth/login?error=' + encodeURIComponent(errorDescription || error))
          return
        }

        // Handle the auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          trackEvent('auth_callback_session_error', { error: sessionError.message })
          router.push('/auth/login?error=' + encodeURIComponent('Authentication failed'))
          return
        }

        if (session) {
          trackEvent('auth_callback_success', { 
            provider: session.user.app_metadata?.provider,
            user_id: session.user.id 
          })
          router.push('/dashboard')
        } else {
          router.push('/auth/login')
        }
      } catch (error: unknown) {
        console.error('Auth callback handling error:', error)
        trackEvent('auth_callback_error', { error: error instanceof Error ? error.message : 'Unknown error' })
        router.push('/auth/login?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  )
}