'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Wind, Eye, Heart, Compass, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

const resetSteps = [
  {
    id: 'pause',
    title: 'Pause',
    icon: Wind,
    instruction: 'Take a moment to pause and breathe deeply',
    prompt: 'Close your eyes. Take 3 deep breaths. Feel your body settling.',
    duration: 30,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'scan',
    title: 'Scan',
    icon: Eye,
    instruction: 'Scan your body and emotions. What do you notice?',
    prompt: 'What sensations are present? What emotions are arising?',
    duration: 60,
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'acknowledge',
    title: 'Acknowledge',
    icon: Heart,
    instruction: 'Acknowledge what happened without judgment',
    prompt: 'I acknowledge that...',
    duration: 45,
    color: 'from-pink-400 to-pink-600',
  },
  {
    id: 'recommit',
    title: 'Recommit',
    icon: Compass,
    instruction: 'Recommit to your boundaries and values',
    prompt: 'I recommit to...',
    duration: 45,
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'recalibrate',
    title: 'Recalibrate',
    icon: Target,
    instruction: 'Adjust your approach moving forward',
    prompt: 'Moving forward, I will...',
    duration: 30,
    color: 'from-green-400 to-green-600',
  },
]

export default function ResetRitualPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [currentResponse, setCurrentResponse] = useState('')
  const [breathCount, setBreathCount] = useState(0)
  const [selectedLifeArea, setSelectedLifeArea] = useState('')

  const lifeAreas = [
    'Work & Purpose',
    'Health & Recovery',
    'Finance',
    'Intimacy & Love',
    'Time & Energy',
    'Spiritual Alignment',
    'Creativity & Expression',
    'Friendship & Community',
    'Learning & Growth',
    'Home & Environment',
    'Sexuality',
    'Emotional Regulation',
    'Legacy & Archives',
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isActive) {
      setIsActive(false)
    }

    return () => clearInterval(interval)
  }, [isActive, timeRemaining])

  useEffect(() => {
    if (currentStep === 0 && isActive) {
      // Breath counter for pause step
      const breathInterval = setInterval(() => {
        setBreathCount((count) => (count + 1) % 6)
      }, 3000)
      return () => clearInterval(breathInterval)
    }
  }, [currentStep, isActive])

  const startStep = () => {
    setIsActive(true)
    setTimeRemaining(resetSteps[currentStep].duration)
  }

  const saveResponse = () => {
    setResponses({
      ...responses,
      [resetSteps[currentStep].id]: currentResponse,
    })
    setCurrentResponse('')
  }

  const nextStep = () => {
    saveResponse()
    if (currentStep < resetSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsActive(false)
      setTimeRemaining(0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setIsActive(false)
      setTimeRemaining(0)
    }
  }

  const completeRitual = () => {
    saveResponse()
    // Here you would save the completed ritual
    console.log('Ritual completed:', {
      lifeArea: selectedLifeArea,
      responses,
      completedAt: new Date(),
    })
    // Reset state
    setCurrentStep(0)
    setResponses({})
    setCurrentResponse('')
    setSelectedLifeArea('')
  }

  const step = resetSteps[currentStep]
  const Icon = step.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Boundary Reset Ritual
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-black" />
              <span className="text-sm text-black">5-Step Phoenix Rising</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Life Area Selection */}
        {!selectedLifeArea ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-phoenix-gold/20"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              Which area needs a reset?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lifeAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedLifeArea(area)}
                  className="p-4 text-center rounded-lg border-2 border-gray-200 hover:border-phoenix-orange hover:bg-phoenix-gold/10 transition-all"
                >
                  <span className="text-sm font-medium">{area}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-black">
                  Step {currentStep + 1} of {resetSteps.length}
                </span>
                <span className="text-sm font-medium text-black">
                  {selectedLifeArea}
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute h-full bg-gradient-to-r from-phoenix-red to-phoenix-orange"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / resetSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-phoenix-gold/20"
              >
                {/* Step Header */}
                <div className="text-center mb-8">
                  <motion.div
                    className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="w-12 h-12 text-black" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">{step.title}</h2>
                  <p className="text-black">{step.instruction}</p>
                </div>

                {/* Timer or Breath Counter */}
                {isActive && (
                  <div className="text-center mb-6">
                    {currentStep === 0 ? (
                      <motion.div
                        animate={{ scale: breathCount % 2 === 0 ? 1.2 : 1 }}
                        transition={{ duration: 3 }}
                        className="text-4xl font-light text-black"
                      >
                        {breathCount % 2 === 0 ? 'Breathe In' : 'Breathe Out'}
                      </motion.div>
                    ) : (
                      <div className="text-4xl font-light text-black">
                        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                )}

                {/* Response Area */}
                {currentStep > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-black mb-2">
                      {step.prompt}
                    </label>
                    <textarea
                      value={currentResponse}
                      onChange={(e) => setCurrentResponse(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent resize-none"
                      rows={4}
                      placeholder="Write your response here..."
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {currentStep > 0 && (
                    <PhoenixButton
                      onClick={prevStep}
                      variant="ghost"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </PhoenixButton>
                  )}
                  
                  {!isActive && (
                    <PhoenixButton
                      onClick={startStep}
                      className="flex-1"
                    >
                      {currentStep === 0 ? 'Start Breathing' : 'Begin Step'}
                    </PhoenixButton>
                  )}

                  {isActive && timeRemaining === 0 && (
                    <>
                      {currentStep < resetSteps.length - 1 ? (
                        <PhoenixButton
                          onClick={nextStep}
                          className="flex-1"
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </PhoenixButton>
                      ) : (
                        <PhoenixButton
                          onClick={completeRitual}
                          variant="reset"
                          className="flex-1"
                        >
                          Complete Ritual
                        </PhoenixButton>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Step Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {resetSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-phoenix-orange w-8'
                      : index < currentStep
                      ? 'bg-phoenix-gold'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}