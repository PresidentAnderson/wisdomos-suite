'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff, Building, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PhoenixButton from '@/components/ui/PhoenixButton'
import PhoenixLogo from '@/components/PhoenixLogo'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    dateOfBirth: '',
    tenantName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Account Info, 2: Workspace Setup

  const { register } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setStep(2)
  }

  const handleStepTwo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Call the API directly since we need to pass dateOfBirth
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          tenantName: formData.tenantName || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store auth data manually since we're not using the context register function
      localStorage.setItem('wisdomos_auth_token', data.token)
      localStorage.setItem(`wisdomos_user_${data.user.id}`, JSON.stringify(data.user))
      localStorage.setItem(`wisdomos_tenant_${data.tenant.id}`, JSON.stringify(data.tenant))

      router.push('/')
    } catch (error: any) {
      setError(error.message || 'Registration failed')
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
            Join WisdomOS
          </h1>
          <p className="text-black">
            Start your journey to fulfillment
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-phoenix-orange text-black' : 'bg-gray-200 text-black'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-phoenix-orange' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-phoenix-orange text-black' : 'bg-gray-200 text-black'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between text-xs text-black mt-2">
            <span>Account</span>
            <span>Workspace</span>
          </div>
        </div>

        {/* Registration Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-phoenix-gold/20"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-black text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStepOne} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-black">Create Your Account</h2>
                <p className="text-sm text-black mt-1">Enter your personal information</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                  required
                />
                <p className="text-xs text-black mt-1">
                  Used to initialize your 120-year life calendar
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                    placeholder="Create a secure password"
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
                <p className="text-xs text-black mt-1">
                  At least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-black hover:text-black"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <PhoenixButton type="submit" className="w-full" size="lg">
                Continue to Workspace Setup
              </PhoenixButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStepTwo} className="space-y-6">
              <div className="text-center mb-6">
                <Building className="w-12 h-12 text-black mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-black">Setup Your Workspace</h2>
                <p className="text-sm text-black mt-1">Customize your WisdomOS experience</p>
              </div>

              {/* Workspace Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Workspace Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
                  placeholder={`${formData.name}'s Workspace`}
                />
                <p className="text-xs text-black mt-1">
                  Leave empty to use "{formData.name}'s Workspace"
                </p>
              </div>

              {/* Features Preview */}
              <div className="bg-gradient-to-r from-phoenix-gold/10 to-phoenix-orange/10 rounded-lg p-4 border border-phoenix-gold/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-black" />
                  <span className="font-medium text-black">Your workspace includes:</span>
                </div>
                <ul className="space-y-1 text-sm text-black">
                  <li>• Personal journal with AI reframing</li>
                  <li>• 120-year autobiography mapping</li>
                  <li>• Upset inquiry & pattern recognition</li>
                  <li>• Priority matrix & contribution tracking</li>
                  <li>• Real-time feedback loop system</li>
                  <li>• Ability to invite team members</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <PhoenixButton
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </PhoenixButton>

                <PhoenixButton
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
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
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </>
                  )}
                </PhoenixButton>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-black">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-black hover:text-black transition-colors font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}