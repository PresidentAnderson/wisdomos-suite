'use client'

/**
 * Enterprise Onboarding Wizard
 * Phoenix Rising WisdomOS
 *
 * Multi-step onboarding flow for enterprise customers
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  Shield,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Mail,
  Upload,
  Settings,
  Zap,
  ArrowRight
} from 'lucide-react'
import { PhoenixInput } from '@/components/ui/phoenix-input'
import { PhoenixButton } from '@/components/ui/phoenix-button'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Phoenix Rising',
    description: "Let's set up your enterprise workspace",
    icon: Sparkles
  },
  {
    id: 'organization',
    title: 'Organization Details',
    description: 'Tell us about your company',
    icon: Building2
  },
  {
    id: 'team',
    title: 'Invite Your Team',
    description: 'Add members to your workspace',
    icon: Users
  },
  {
    id: 'sso',
    title: 'Single Sign-On',
    description: 'Configure enterprise authentication',
    icon: Shield
  },
  {
    id: 'customize',
    title: 'Customize Your Workspace',
    description: 'Make it yours',
    icon: Settings
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description: 'Welcome to the Phoenix Rising journey',
    icon: Zap
  }
]

export default function EnterpriseOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Organization
    organizationName: '',
    domain: '',
    industry: '',
    size: '',

    // Team
    teamMembers: [''],

    // SSO
    ssoEnabled: false,
    ssoProvider: '',

    // Customization
    primaryColor: '#FF6B35',
    logoUrl: ''
  })

  const currentStepData = STEPS[currentStep]
  const IconComponent = currentStepData.icon

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, '']
    })
  }

  const updateTeamMember = (index: number, value: string) => {
    const newMembers = [...formData.teamMembers]
    newMembers[index] = value
    setFormData({ ...formData, teamMembers: newMembers })
  }

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter((_, i) => i !== index)
    })
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Save organization data
      const response = await fetch('/api/onboarding/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-phoenix-orange to-phoenix-red rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black">
              Welcome to Phoenix Rising WisdomOS
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're excited to have you here. This quick setup will help you configure your enterprise workspace and get your team started on their wisdom journey.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <Building2 className="w-8 h-8 text-phoenix-orange mx-auto mb-2" />
                <p className="text-sm font-medium text-black">Enterprise Security</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <Users className="w-8 h-8 text-phoenix-orange mx-auto mb-2" />
                <p className="text-sm font-medium text-black">Team Collaboration</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <Shield className="w-8 h-8 text-phoenix-orange mx-auto mb-2" />
                <p className="text-sm font-medium text-black">SSO Integration</p>
              </div>
            </div>
          </div>
        )

      case 'organization':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-black">Organization Details</h2>
            <div className="space-y-4">
              <PhoenixInput
                label="Organization Name"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                placeholder="Landmark Worldwide"
                required
              />

              <PhoenixInput
                label="Email Domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="landmark.com"
                required
              />

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                >
                  <option value="">Select industry</option>
                  <option value="education">Education & Training</option>
                  <option value="consulting">Consulting</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Company Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'team':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-black">Invite Your Team</h2>
            <p className="text-gray-600">
              Add team members by email. They'll receive an invitation to join your workspace.
            </p>

            <div className="space-y-3">
              {formData.teamMembers.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <PhoenixInput
                    type="email"
                    value={email}
                    onChange={(e) => updateTeamMember(index, e.target.value)}
                    placeholder={`team.member${index + 1}@${formData.domain || 'company.com'}`}
                    className="flex-1"
                  />
                  {formData.teamMembers.length > 1 && (
                    <button
                      onClick={() => removeTeamMember(index)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addTeamMember}
              className="flex items-center gap-2 text-phoenix-orange hover:text-phoenix-red transition-colors"
            >
              <Mail className="w-4 h-4" />
              Add another team member
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can invite more team members later from your admin dashboard.
              </p>
            </div>
          </div>
        )

      case 'sso':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-black">Single Sign-On (Optional)</h2>
            <p className="text-gray-600">
              Enable SSO for seamless enterprise authentication with your existing identity provider.
            </p>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <input
                type="checkbox"
                checked={formData.ssoEnabled}
                onChange={(e) => setFormData({ ...formData, ssoEnabled: e.target.checked })}
                className="w-5 h-5 text-phoenix-orange rounded focus:ring-phoenix-orange"
              />
              <label className="text-black font-medium">
                Enable Single Sign-On
              </label>
            </div>

            {formData.ssoEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    SSO Provider
                  </label>
                  <select
                    value={formData.ssoProvider}
                    onChange={(e) => setFormData({ ...formData, ssoProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  >
                    <option value="">Select provider</option>
                    <option value="okta">Okta</option>
                    <option value="azure">Microsoft Azure AD</option>
                    <option value="google">Google Workspace</option>
                    <option value="onelogin">OneLogin</option>
                    <option value="auth0">Auth0</option>
                    <option value="saml">Generic SAML 2.0</option>
                  </select>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> SSO configuration requires additional setup. Our team will reach out to complete the integration.
                  </p>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => nextStep()}
              className="text-phoenix-orange hover:text-phoenix-red transition-colors text-sm"
            >
              Skip for now →
            </button>
          </div>
        )

      case 'customize':
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-black">Customize Your Workspace</h2>
            <p className="text-gray-600">
              Add your brand identity to create a personalized experience.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Company Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-phoenix-orange transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Primary Brand Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-16 h-10 rounded border border-gray-300"
                  />
                  <PhoenixInput
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#FF6B35"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => nextStep()}
              className="text-phoenix-orange hover:text-phoenix-red transition-colors text-sm"
            >
              Skip customization →
            </button>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black">
              You're All Set!
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your enterprise workspace is ready. Welcome to Phoenix Rising WisdomOS — where transformation begins.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
              <div className="p-6 bg-white rounded-lg border border-gray-200 text-left">
                <h3 className="font-semibold text-black mb-2">Next Steps</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Explore your dashboard</li>
                  <li>• Set up your first journal entry</li>
                  <li>• Create your first commitment</li>
                </ul>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200 text-left">
                <h3 className="font-semibold text-black mb-2">Resources</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Video tutorials</li>
                  <li>• Documentation</li>
                  <li>• Community forums</li>
                </ul>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200 text-left">
                <h3 className="font-semibold text-black mb-2">Support</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Live chat</li>
                  <li>• Email support</li>
                  <li>• Dedicated account manager</li>
                </ul>
              </div>
            </div>

            <PhoenixButton
              onClick={handleComplete}
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Go to Dashboard'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </PhoenixButton>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-phoenix-orange to-phoenix-red"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    index <= currentStep
                      ? 'bg-phoenix-orange text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      index < currentStep ? 'bg-phoenix-orange' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex justify-between mt-8">
            <PhoenixButton
              onClick={prevStep}
              variant="secondary"
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </PhoenixButton>

            <PhoenixButton
              onClick={nextStep}
              variant="primary"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </PhoenixButton>
          </div>
        )}
      </div>
    </div>
  )
}
