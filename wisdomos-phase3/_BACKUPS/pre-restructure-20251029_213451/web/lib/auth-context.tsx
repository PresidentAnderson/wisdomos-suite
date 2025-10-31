'use client'

/**
 * Multi-Tenant Authentication Context for WisdomOS
 * Provides authentication state and tenant management across the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { hashPassword, verifyPassword, verifyLegacyPassword } from './password-utils'
import { 
  User, 
  Tenant, 
  JWTPayload,
  generateToken,
  verifyToken,
  generateId,
  generateSlug,
  getDefaultPreferences,
  getAllPermissions,
  getDefaultTenantSettings,
  storeUserInLocalStorage,
  storeTenantInLocalStorage,
  getUserByEmailFromLocalStorage,
  getTenantBySlugFromLocalStorage,
  getAllUsersFromLocalStorage,
  getAllTenantsFromLocalStorage
} from './auth'

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  token: string | null
  isLoading: boolean
  
  // Auth methods
  login: (email: string, password: string, tenantSlug?: string) => Promise<void>
  register: (email: string, password: string, name: string, tenantName?: string) => Promise<void>
  logout: () => void
  
  // Tenant methods
  switchTenant: (tenantId: string) => Promise<void>
  createTenant: (name: string, slug?: string) => Promise<Tenant>
  inviteUser: (email: string, role: 'admin' | 'member' | 'viewer') => Promise<string>
  acceptInvite: (inviteId: string, userData?: { name: string; password: string }) => Promise<void>
  
  // Data sharing
  shareData: (dataType: 'journal' | 'autobiography' | 'upset_inquiry', targetTenantId: string) => Promise<string>
  
  // Utility
  hasPermission: (resource: string, action: string) => boolean
  getCurrentMembership: () => any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // During build time or server-side rendering, return default values
    if (typeof window === 'undefined') {
      return {
        user: null,
        tenant: null,
        token: null,
        isLoading: false,
        login: async () => {},
        register: async () => {},
        logout: () => {},
        switchTenant: async () => {},
        createTenant: async () => ({ id: '', name: '', slug: '', ownerId: '', plan: 'free', settings: {}, createdAt: new Date(), updatedAt: new Date(), members: [] }),
        inviteUser: async () => '',
        acceptInvite: async () => {},
        shareData: async () => '',
        hasPermission: () => false,
        getCurrentMembership: () => null
      }
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('wisdomos_auth_token')
        if (storedToken) {
          const payload = verifyToken(storedToken)
          if (payload) {
            const storedUser = localStorage.getItem(`wisdomos_user_${payload.userId}`)
            const storedTenant = localStorage.getItem(`wisdomos_tenant_${payload.tenantId}`)
            
            if (storedUser && storedTenant) {
              setUser(JSON.parse(storedUser))
              setTenant(JSON.parse(storedTenant))
              setToken(storedToken)
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        localStorage.removeItem('wisdomos_auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string, tenantSlug?: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantSlug })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store auth data
      setUser(data.user)
      setTenant(data.tenant)
      setToken(data.token)
      localStorage.setItem('wisdomos_auth_token', data.token)
      localStorage.setItem(`wisdomos_user_${data.user.id}`, JSON.stringify(data.user))
      localStorage.setItem(`wisdomos_tenant_${data.tenant.id}`, JSON.stringify(data.tenant))

    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string, tenantName?: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, tenantName })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store auth data
      setUser(data.user)
      setTenant(data.tenant)
      setToken(data.token)
      localStorage.setItem('wisdomos_auth_token', data.token)
      localStorage.setItem(`wisdomos_user_${data.user.id}`, JSON.stringify(data.user))
      localStorage.setItem(`wisdomos_tenant_${data.tenant.id}`, JSON.stringify(data.tenant))

    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setTenant(null)
    setToken(null)
    localStorage.removeItem('wisdomos_auth_token')
  }

  const switchTenant = async (tenantId: string): Promise<void> => {
    if (!user) throw new Error('No user logged in')

    const targetTenant = localStorage.getItem(`wisdomos_tenant_${tenantId}`)
      ? JSON.parse(localStorage.getItem(`wisdomos_tenant_${tenantId}`)!)
      : null

    if (!targetTenant) {
      throw new Error('Tenant not found')
    }

    // Check if user is member of this tenant
    const membership = targetTenant.members.find((m: any) => m.userId === user.id)
    if (!membership) {
      throw new Error('Access denied to this workspace')
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      tenantId: targetTenant.id,
      role: membership.role
    }

    const newToken = generateToken(payload)
    
    setTenant(targetTenant)
    setToken(newToken)
    localStorage.setItem('wisdomos_auth_token', newToken)
  }

  const createTenant = async (name: string, slug?: string): Promise<Tenant> => {
    if (!user) throw new Error('No user logged in')

    const tenantSlug = slug || generateSlug(name)
    
    // Check if slug is available
    const existingTenant = getTenantBySlugFromLocalStorage(tenantSlug)
    if (existingTenant) {
      throw new Error('Tenant slug already exists')
    }

    const newTenant: Tenant = {
      id: generateId(),
      name,
      slug: tenantSlug,
      ownerId: user.id,
      plan: 'free',
      settings: getDefaultTenantSettings(name),
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [{
        userId: user.id,
        tenantId: '', // Will be set after tenant ID is generated
        role: 'owner',
        permissions: getAllPermissions(),
        invitedAt: new Date(),
        joinedAt: new Date(),
        invitedBy: user.id
      }]
    }

    // Set the tenant ID in the member record
    newTenant.members[0].tenantId = newTenant.id

    storeTenantInLocalStorage(newTenant)
    
    return newTenant
  }

  const inviteUser = async (email: string, role: 'admin' | 'member' | 'viewer'): Promise<string> => {
    if (!user || !tenant) throw new Error('No user or tenant context')

    // Check if user has permission to invite
    const userMembership = tenant.members.find(m => m.userId === user.id)
    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      throw new Error('Insufficient permissions to invite users')
    }

    // Check if user is already a member
    const existingUser = getUserByEmailFromLocalStorage(email)
    if (existingUser) {
      const existingMembership = tenant.members.find(m => m.userId === existingUser.id)
      if (existingMembership) {
        throw new Error('User is already a member of this workspace')
      }
    }

    // Create invite
    const inviteId = generateId()
    const invite = {
      id: inviteId,
      email,
      tenantId: tenant.id,
      role,
      permissions: role === 'admin' ? getAllPermissions() : [],
      invitedBy: user.id,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }

    localStorage.setItem(`wisdomos_invite_${inviteId}`, JSON.stringify(invite))
    
    return `${window.location.origin}/invite/${inviteId}`
  }

  const acceptInvite = async (inviteId: string, userData?: { name: string; password: string }): Promise<void> => {
    const inviteData = localStorage.getItem(`wisdomos_invite_${inviteId}`)
    if (!inviteData) {
      throw new Error('Invalid or expired invite')
    }

    const invite = JSON.parse(inviteData)
    if (new Date() > new Date(invite.expiresAt)) {
      throw new Error('Invite has expired')
    }

    const targetTenant = localStorage.getItem(`wisdomos_tenant_${invite.tenantId}`)
      ? JSON.parse(localStorage.getItem(`wisdomos_tenant_${invite.tenantId}`)!)
      : null

    if (!targetTenant) {
      throw new Error('Tenant not found')
    }

    let targetUser = getUserByEmailFromLocalStorage(invite.email)
    
    if (!targetUser && userData) {
      // Create new user
      const hashedPassword = await hashPassword(userData.password)
      targetUser = {
        id: generateId(),
        email: invite.email,
        name: userData.name,
        tenantId: invite.tenantId,
        role: invite.role,
        createdAt: new Date(),
        preferences: getDefaultPreferences()
      }
      
      storeUserInLocalStorage(targetUser)
      localStorage.setItem(`wisdomos_password_${targetUser.id}`, hashedPassword)
    } else if (!targetUser) {
      throw new Error('User registration required')
    }

    // Add user to tenant
    targetTenant.members.push({
      userId: targetUser.id,
      tenantId: invite.tenantId,
      role: invite.role,
      permissions: invite.permissions,
      invitedAt: new Date(invite.invitedAt),
      joinedAt: new Date(),
      invitedBy: invite.invitedBy
    })

    storeTenantInLocalStorage(targetTenant)
    localStorage.removeItem(`wisdomos_invite_${inviteId}`)

    // Auto-login the user
    const payload: JWTPayload = {
      userId: targetUser.id,
      email: targetUser.email,
      tenantId: targetTenant.id,
      role: invite.role
    }

    const newToken = generateToken(payload)
    
    setUser(targetUser)
    setTenant(targetTenant)
    setToken(newToken)
    localStorage.setItem('wisdomos_auth_token', newToken)
  }

  const shareData = async (
    dataType: 'journal' | 'autobiography' | 'upset_inquiry', 
    targetTenantId: string
  ): Promise<string> => {
    if (!user || !tenant) throw new Error('No user or tenant context')

    const targetTenant = localStorage.getItem(`wisdomos_tenant_${targetTenantId}`)
      ? JSON.parse(localStorage.getItem(`wisdomos_tenant_${targetTenantId}`)!)
      : null

    if (!targetTenant) {
      throw new Error('Target tenant not found')
    }

    // Check permissions
    const membership = tenant.members.find(m => m.userId === user.id)
    if (!membership) {
      throw new Error('User not a member of source tenant')
    }

    const hasPermission = membership.role === 'owner' || 
      membership.permissions.some((p: any) => 
        p.resource === dataType && p.actions.includes('share')
      )

    if (!hasPermission) {
      throw new Error('Insufficient permissions to share data')
    }

    const shareId = generateId()
    const share = {
      id: shareId,
      userId: user.id,
      sourceTenantId: tenant.id,
      targetTenantId,
      dataType,
      permissions: ['read'],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }

    localStorage.setItem(`wisdomos_share_${shareId}`, JSON.stringify(share))
    
    return shareId
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !tenant) return false

    const membership = tenant.members.find(m => m.userId === user.id)
    if (!membership) return false

    if (membership.role === 'owner') return true

    return membership.permissions.some((p: any) => 
      p.resource === resource && p.actions.includes(action)
    )
  }

  const getCurrentMembership = () => {
    if (!user || !tenant) return null
    return tenant.members.find(m => m.userId === user.id)
  }

  const value: AuthContextType = {
    user,
    tenant,
    token,
    isLoading,
    login,
    register,
    logout,
    switchTenant,
    createTenant,
    inviteUser,
    acceptInvite,
    shareData,
    hasPermission,
    getCurrentMembership
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider