'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PhoenixButton from '@/components/ui/PhoenixButton'
import PhoenixLogo from '@/components/PhoenixLogo'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      router.push('/')
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Quick demo login
  const handleDemoLogin = async () => {
    setEmail('demo@wisdomos.com')
    setPassword('password123')
    setIsLoading(true)
    setError('')

    try {
      await login('demo@wisdomos.com', 'password123')
      router.push('/')
    } catch (error: any) {
      setError(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <PhoenixLogo size="lg" animated className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-black">
            Sign in to your WisdomOS account
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-phoenix-gold/20"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-black text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-black hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <PhoenixButton
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </PhoenixButton>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-black">New to WisdomOS?</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/auth/register">
                <PhoenixButton variant="ghost" className="w-full">
                  Create Your Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </PhoenixButton>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-gradient-to-r from-phoenix-gold/10 to-phoenix-orange/10 rounded-lg border border-phoenix-gold/30"
        >
          <h3 className="text-sm font-semibold text-black mb-2">Demo Account</h3>
          <p className="text-xs text-black mb-3">
            Try WisdomOS with a demo account:
          </p>
          <div className="space-y-1 text-xs mb-3">
            <div><span className="font-medium">Email:</span> demo@wisdomos.com</div>
            <div><span className="font-medium">Password:</span> password123</div>
          </div>
          <PhoenixButton 
            onClick={handleDemoLogin}
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={isLoading}
          >
            Login with Demo Account
          </PhoenixButton>
        </motion.div>
      </motion.div>
    </div>
  )
}