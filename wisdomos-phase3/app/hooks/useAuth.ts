/**
 * useAuth Hook
 *
 * Authentication state management for WisdomOS
 */

'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface Tenant {
  id: string
  name: string
  schemaName: string
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  workspaceName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('wisdomos_token')
    const storedUser = localStorage.getItem('wisdomos_user')
    const storedTenant = localStorage.getItem('wisdomos_tenant')

    if (storedToken && storedUser && storedTenant) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setTenant(JSON.parse(storedTenant))
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()

      // Store auth data
      localStorage.setItem('wisdomos_token', data.token)
      localStorage.setItem('wisdomos_user', JSON.stringify(data.user))
      localStorage.setItem('wisdomos_tenant', JSON.stringify(data.tenants[0].tenant))

      setToken(data.token)
      setUser(data.user)
      setTenant(data.tenants[0].tenant)

      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      const result = await response.json()

      // Store auth data
      localStorage.setItem('wisdomos_token', result.token)
      localStorage.setItem('wisdomos_user', JSON.stringify(result.user))
      localStorage.setItem('wisdomos_tenant', JSON.stringify(result.tenant))

      setToken(result.token)
      setUser(result.user)
      setTenant(result.tenant)

      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('wisdomos_token')
    localStorage.removeItem('wisdomos_user')
    localStorage.removeItem('wisdomos_tenant')

    setToken(null)
    setUser(null)
    setTenant(null)

    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user
      }}
    >
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
