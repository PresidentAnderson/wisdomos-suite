'use client'

/**
 * Dynamic Login Providers Component
 * Displays enabled auth providers based on admin configuration
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  Shield,
  Wallet,
  Apple,
  Cloud,
  GitBranch,
  MessageSquare,
  Facebook as FacebookIcon,
  Figma,
  Github,
  Gitlab,
  Key,
  Linkedin,
  File,
  Twitch,
  Twitter,
  Slack,
  Music,
  Briefcase,
  Video,
  Loader2
} from 'lucide-react'
import { PhoenixButton } from '@/components/ui/phoenix-button'

// Provider icons mapping
const PROVIDER_ICONS: Record<string, any> = {
  email: Mail,
  phone: Phone,
  saml: Shield,
  web3: Wallet,
  apple: Apple,
  azure: Cloud,
  bitbucket: GitBranch,
  discord: MessageSquare,
  facebook: FacebookIcon,
  figma: Figma,
  github: Github,
  gitlab: Gitlab,
  google: Mail,
  kakao: MessageSquare,
  keycloak: Key,
  linkedin_oidc: Linkedin,
  notion: File,
  twitch: Twitch,
  twitter: Twitter,
  slack_oidc: Slack,
  slack: Slack,
  spotify: Music,
  workos: Briefcase,
  zoom: Video
}

// Provider brand colors
const PROVIDER_COLORS: Record<string, string> = {
  google: 'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50',
  github: 'bg-gray-900 text-white hover:bg-gray-800',
  facebook: 'bg-blue-600 text-white hover:bg-blue-700',
  twitter: 'bg-sky-500 text-white hover:bg-sky-600',
  discord: 'bg-indigo-600 text-white hover:bg-indigo-700',
  apple: 'bg-black text-white hover:bg-gray-900',
  microsoft: 'bg-blue-600 text-white hover:bg-blue-700',
  linkedin_oidc: 'bg-blue-700 text-white hover:bg-blue-800',
  slack_oidc: 'bg-purple-600 text-white hover:bg-purple-700',
  spotify: 'bg-green-500 text-white hover:bg-green-600',
  twitch: 'bg-purple-500 text-white hover:bg-purple-600',
  gitlab: 'bg-orange-600 text-white hover:bg-orange-700',
  bitbucket: 'bg-blue-600 text-white hover:bg-blue-700',
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
}

interface AuthProvider {
  id: string
  providerKey: string
  providerName: string
  providerType: string
  enabled: boolean
  redirectUri?: string
  authorizationUrl?: string
  clientId?: string
  scopes?: string[]
}

interface DynamicLoginProvidersProps {
  onProviderClick?: (provider: AuthProvider) => void
  excludeEmail?: boolean
}

export default function DynamicLoginProviders({
  onProviderClick,
  excludeEmail = false
}: DynamicLoginProvidersProps) {
  const [providers, setProviders] = useState<AuthProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  useEffect(() => {
    loadEnabledProviders()
  }, [])

  const loadEnabledProviders = async () => {
    try {
      const response = await fetch('/api/admin/auth-providers')
      if (response.ok) {
        const data = await response.json()
        const enabledProviders = (data.providers || [])
          .filter((p: AuthProvider) => p.enabled)
          .filter((p: AuthProvider) => excludeEmail ? p.providerKey !== 'email' : true)
        setProviders(enabledProviders)
      }
    } catch (error) {
      console.error('Failed to load auth providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderClick = async (provider: AuthProvider) => {
    setLoadingProvider(provider.id)

    // Call parent callback if provided
    if (onProviderClick) {
      onProviderClick(provider)
      return
    }

    // Default OAuth flow
    if (provider.providerType === 'oauth' && provider.authorizationUrl) {
      const params = new URLSearchParams({
        client_id: provider.clientId || '',
        redirect_uri: provider.redirectUri || `${window.location.origin}/auth/callback`,
        response_type: 'code',
        scope: (provider.scopes || []).join(' '),
        state: generateRandomState()
      })

      window.location.href = `${provider.authorizationUrl}?${params.toString()}`
    }

    // Other provider types would be handled here
    // (SAML redirect, Web3 wallet connection, etc.)
  }

  const generateRandomState = () => {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15)
  }

  const getProviderColor = (providerKey: string) => {
    return PROVIDER_COLORS[providerKey] || PROVIDER_COLORS.default
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-phoenix-orange" />
      </div>
    )
  }

  if (providers.length === 0) {
    return null
  }

  // Separate email/phone from social providers
  const emailPhoneProviders = providers.filter(p =>
    ['email', 'phone'].includes(p.providerKey)
  )
  const socialProviders = providers.filter(p =>
    !['email', 'phone'].includes(p.providerKey)
  )

  return (
    <div className="space-y-4">
      {/* Social/OAuth Providers */}
      {socialProviders.length > 0 && (
        <div className="space-y-3">
          {excludeEmail && socialProviders.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {socialProviders.map((provider, index) => {
              const IconComponent = PROVIDER_ICONS[provider.providerKey] || Shield
              const colorClass = getProviderColor(provider.providerKey)
              const isLoading = loadingProvider === provider.id

              return (
                <motion.button
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleProviderClick(provider)}
                  disabled={isLoading}
                  className={`
                    w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg
                    font-medium transition-all shadow-sm
                    ${colorClass}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                  `}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                  <span>Continue with {provider.providerName}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Email/Phone Divider */}
      {emailPhoneProviders.length > 0 && socialProviders.length > 0 && !excludeEmail && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or use</span>
          </div>
        </div>
      )}
    </div>
  )
}
