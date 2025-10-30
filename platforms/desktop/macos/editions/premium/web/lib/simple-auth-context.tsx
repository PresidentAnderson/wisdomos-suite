'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from './api-client/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('wisdomos_token')
        const storedUser = localStorage.getItem('wisdomos_user')
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setToken(storedToken)
          apiClient.setToken(storedToken)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        localStorage.removeItem('wisdomos_token')
        localStorage.removeItem('wisdomos_user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.http.post('/api/auth/login', {
        email,
        password
      })

      const { access_token, user: userData } = response.data
      
      // Store token and user
      localStorage.setItem('wisdomos_token', access_token)
      localStorage.setItem('wisdomos_user', JSON.stringify(userData))
      
      // Set auth state
      setUser(userData)
      setToken(access_token)
      apiClient.setToken(access_token)
      
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      const response = await apiClient.http.post('/api/auth/register', {
        email,
        password,
        name
      })

      const { access_token, user: userData } = response.data
      
      // Store token and user
      localStorage.setItem('wisdomos_token', access_token)
      localStorage.setItem('wisdomos_user', JSON.stringify(userData))
      
      // Set auth state
      setUser(userData)
      setToken(access_token)
      apiClient.setToken(access_token)
      
    } catch (error: any) {
      console.error('Register error:', error)
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    apiClient.clearToken()
    localStorage.removeItem('wisdomos_token')
    localStorage.removeItem('wisdomos_user')
    router.push('/auth/login')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider