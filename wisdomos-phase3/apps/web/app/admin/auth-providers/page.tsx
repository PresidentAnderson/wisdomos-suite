'use client'

/**
 * Auth Providers Admin Panel
 * Allows admin to enable/disable and configure authentication providers
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ToggleLeft,
  ToggleRight,
  Settings,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Search
} from 'lucide-react'
import { PhoenixInput } from '@/components/ui/phoenix-input'
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

interface AuthProvider {
  id: string
  tenantId: string
  providerKey: string
  providerName: string
  providerType: 'oauth' | 'saml' | 'email' | 'phone' | 'web3'
  enabled: boolean
  displayOrder: number

  // OAuth/OIDC
  clientId?: string
  clientSecret?: string
  authorizationUrl?: string
  tokenUrl?: string
  userInfoUrl?: string
  redirectUri?: string
  scopes?: string[]

  // SAML
  samlEntityId?: string
  samlSsoUrl?: string
  samlCertificate?: string
  samlIssuer?: string

  // Web3
  web3ChainId?: number
  web3ContractAddress?: string

  // Email/Phone
  emailTemplates?: any
  phoneProvider?: string

  metadata?: any
  createdAt?: Date
  updatedAt?: Date
}

export default function AuthProvidersAdmin() {
  const [providers, setProviders] = useState<AuthProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const [editingProvider, setEditingProvider] = useState<AuthProvider | null>(null)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/auth-providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      }
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProvider = async (provider: AuthProvider) => {
    try {
      const response = await fetch(`/api/admin/auth-providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !provider.enabled })
      })

      if (response.ok) {
        setProviders(prev =>
          prev.map(p => p.id === provider.id ? { ...p, enabled: !p.enabled } : p)
        )
        showMessage('success', `${provider.providerName} ${!provider.enabled ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      showMessage('error', 'Failed to update provider')
    }
  }

  const saveProviderConfig = async () => {
    if (!editingProvider) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/auth-providers/${editingProvider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProvider)
      })

      if (response.ok) {
        const updated = await response.json()
        setProviders(prev =>
          prev.map(p => p.id === updated.provider.id ? updated.provider : p)
        )
        setExpandedProvider(null)
        setEditingProvider(null)
        showMessage('success', 'Configuration saved successfully')
      }
    } catch (error) {
      showMessage('error', 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const filteredProviders = providers.filter(p =>
    p.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.providerKey.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enabledCount = providers.filter(p => p.enabled).length

  const renderConfigForm = (provider: AuthProvider) => {
    if (!editingProvider || editingProvider.id !== provider.id) return null

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200"
      >
        <h4 className="text-lg font-semibold text-black mb-4">
          Configure {provider.providerName}
        </h4>

        {/* OAuth/OIDC Configuration */}
        {provider.providerType === 'oauth' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhoenixInput
                label="Client ID"
                value={editingProvider.clientId || ''}
                onChange={(e) => setEditingProvider({ ...editingProvider, clientId: e.target.value })}
                placeholder="Enter OAuth client ID"
              />
              <PhoenixInput
                label="Client Secret"
                type="password"
                value={editingProvider.clientSecret || ''}
                onChange={(e) => setEditingProvider({ ...editingProvider, clientSecret: e.target.value })}
                placeholder="Enter OAuth client secret"
              />
            </div>

            <PhoenixInput
              label="Authorization URL"
              value={editingProvider.authorizationUrl || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, authorizationUrl: e.target.value })}
              placeholder="https://provider.com/oauth/authorize"
            />

            <PhoenixInput
              label="Token URL"
              value={editingProvider.tokenUrl || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, tokenUrl: e.target.value })}
              placeholder="https://provider.com/oauth/token"
            />

            <PhoenixInput
              label="User Info URL"
              value={editingProvider.userInfoUrl || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, userInfoUrl: e.target.value })}
              placeholder="https://provider.com/oauth/userinfo"
            />

            <PhoenixInput
              label="Redirect URI"
              value={editingProvider.redirectUri || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, redirectUri: e.target.value })}
              placeholder="https://yourdomain.com/auth/callback"
            />

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Scopes (comma-separated)
              </label>
              <PhoenixInput
                value={(editingProvider.scopes || []).join(', ')}
                onChange={(e) => setEditingProvider({
                  ...editingProvider,
                  scopes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="email, profile, openid"
              />
            </div>
          </div>
        )}

        {/* SAML Configuration */}
        {provider.providerType === 'saml' && (
          <div className="space-y-4">
            <PhoenixInput
              label="Entity ID"
              value={editingProvider.samlEntityId || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, samlEntityId: e.target.value })}
              placeholder="https://yourdomain.com/saml/metadata"
            />

            <PhoenixInput
              label="SSO URL"
              value={editingProvider.samlSsoUrl || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, samlSsoUrl: e.target.value })}
              placeholder="https://idp.com/sso/saml"
            />

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                X.509 Certificate
              </label>
              <textarea
                value={editingProvider.samlCertificate || ''}
                onChange={(e) => setEditingProvider({ ...editingProvider, samlCertificate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                rows={6}
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              />
            </div>

            <PhoenixInput
              label="Issuer"
              value={editingProvider.samlIssuer || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, samlIssuer: e.target.value })}
              placeholder="https://idp.com/saml/issuer"
            />
          </div>
        )}

        {/* Web3 Configuration */}
        {provider.providerType === 'web3' && (
          <div className="space-y-4">
            <PhoenixInput
              label="Chain ID"
              type="number"
              value={editingProvider.web3ChainId || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, web3ChainId: parseInt(e.target.value) })}
              placeholder="1 (Mainnet), 137 (Polygon), etc."
            />

            <PhoenixInput
              label="Contract Address (Optional)"
              value={editingProvider.web3ContractAddress || ''}
              onChange={(e) => setEditingProvider({ ...editingProvider, web3ContractAddress: e.target.value })}
              placeholder="0x..."
            />
          </div>
        )}

        {/* Phone Configuration */}
        {provider.providerType === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                SMS Provider
              </label>
              <select
                value={editingProvider.phoneProvider || 'twilio'}
                onChange={(e) => setEditingProvider({ ...editingProvider, phoneProvider: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="twilio">Twilio</option>
                <option value="vonage">Vonage</option>
                <option value="messagebird">MessageBird</option>
              </select>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <PhoenixButton
            onClick={saveProviderConfig}
            disabled={saving}
            variant="default"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </PhoenixButton>
          <PhoenixButton
            onClick={() => {
              setEditingProvider(null)
              setExpandedProvider(null)
            }}
            variant="secondary"
          >
            Cancel
          </PhoenixButton>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phoenix-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication providers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Authentication Providers</h1>
              <p className="text-gray-600">
                Configure and manage login methods for your workspace
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-phoenix-orange">{enabledCount}</div>
              <div className="text-sm text-gray-600">Enabled</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* Save Message */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{saveMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => {
            const IconComponent = PROVIDER_ICONS[provider.providerKey] || Shield
            const isExpanded = expandedProvider === provider.id

            return (
              <motion.div
                key={provider.id}
                layout
                className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                  provider.enabled
                    ? 'border-green-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isExpanded ? 'col-span-full' : ''}`}
              >
                {/* Provider Card */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        provider.enabled ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-6 h-6 ${
                          provider.enabled ? 'text-green-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">{provider.providerName}</h3>
                        <p className="text-xs text-gray-500 capitalize">{provider.providerType}</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleProvider(provider)}
                      className="transition-transform hover:scale-110"
                    >
                      {provider.enabled ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      provider.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {provider.enabled ? 'Enabled' : 'Disabled'}
                    </span>

                    {/* Configure Button */}
                    {provider.providerType !== 'email' && (
                      <button
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedProvider(null)
                            setEditingProvider(null)
                          } else {
                            setExpandedProvider(provider.id)
                            setEditingProvider(provider)
                          }
                        }}
                        className="flex items-center gap-1 text-sm text-phoenix-orange hover:text-phoenix-red transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {isExpanded ? 'Close' : 'Configure'}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuration Form */}
                <AnimatePresence>
                  {isExpanded && renderConfigForm(provider)}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No providers found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
