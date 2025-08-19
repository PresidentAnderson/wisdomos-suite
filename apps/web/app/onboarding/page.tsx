'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import PhoenixLogo from '@/components/PhoenixLogo'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { lifeAreas } from '@/lib/phoenix-theme'
import { Check, ChevronRight, Sparkles } from 'lucide-react'

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [userName, setUserName] = useState('')
  const [showFlameAnimation, setShowFlameAnimation] = useState(true)

  useEffect(() => {
    // Show flame animation for 3 seconds
    const timer = setTimeout(() => setShowFlameAnimation(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const handleComplete = () => {
    // Save onboarding data and redirect to dashboard
    localStorage.setItem('wisdomos_user', JSON.stringify({
      name: userName,
      selectedAreas,
      onboardingComplete: true
    }))
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-phoenix-smoke flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Initial Flame Animation */}
        {showFlameAnimation && (
          <motion.div
            key="flame"
            className="fixed inset-0 flex items-center justify-center bg-phoenix-smoke z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.5, 1, 1.2, 1],
                rotate: [0, 180, 360, 540, 720]
              }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            >
              <PhoenixLogo size="xl" animated />
            </motion.div>
            
            {/* Radial burst effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-radial-gradient from-phoenix-orange/20 via-transparent to-transparent" />
            </motion.div>

            {/* Floating embers */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-phoenix-ember rounded-full"
                initial={{ 
                  x: 0, 
                  y: 0,
                  scale: 0
                }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: 0.5 + i * 0.05,
                  ease: "easeOut"
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  filter: 'blur(1px)'
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Step 0: Welcome */}
        {!showFlameAnimation && step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full"
          >
            <div className="text-center mb-8">
              <PhoenixLogo size="lg" animated className="mx-auto mb-6" />
              <motion.h1
                className="text-4xl font-bold flame-text mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome to WisdomOS
              </motion.h1>
              <motion.p
                className="text-lg text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Where every ending is a beginning
              </motion.p>
            </div>

            <motion.div
              className="glass-card p-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-gray-300 mb-6 text-center">
                Transform your life through the Phoenix Cycle. Journal your journey, 
                track your transformation, and rise into fulfillment.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="What should we call you?"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-phoenix-ash/30 border border-phoenix-gold/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-phoenix-gold/60 transition-colors"
                />
                
                <PhoenixButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => userName && setStep(1)}
                  disabled={!userName}
                >
                  Begin Your Journey
                  <ChevronRight className="w-5 h-5 ml-2" />
                </PhoenixButton>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 1: Life Areas Selection */}
        {step === 1 && (
          <motion.div
            key="areas"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-4xl w-full"
          >
            <div className="text-center mb-8">
              <motion.h2
                className="text-3xl font-bold text-phoenix-gold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Welcome, {userName}!
              </motion.h2>
              <motion.p
                className="text-lg text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Select the life areas you want to track and transform
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {lifeAreas.map((area, index) => (
                <motion.button
                  key={area.id}
                  className={`glass-card p-4 text-left transition-all ${
                    selectedAreas.includes(area.id)
                      ? 'border-2 border-phoenix-gold bg-phoenix-gold/10'
                      : 'border-2 border-transparent hover:border-phoenix-gold/30'
                  }`}
                  onClick={() => toggleArea(area.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{area.name}</h3>
                      <p className="text-xs text-phoenix-gold/60 italic">{area.phoenix}</p>
                    </div>
                    {selectedAreas.includes(area.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-phoenix-gold"
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>

            <div className="flex justify-between items-center">
              <PhoenixButton
                variant="ghost"
                onClick={() => setStep(0)}
              >
                Back
              </PhoenixButton>
              
              <div className="text-sm text-gray-400">
                {selectedAreas.length} areas selected
              </div>
              
              <PhoenixButton
                variant="primary"
                onClick={() => setStep(2)}
                disabled={selectedAreas.length === 0}
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </PhoenixButton>
            </div>
          </motion.div>
        )}

        {/* Step 2: Ready to Rise */}
        {step === 2 && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="max-w-md w-full text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <PhoenixLogo size="lg" animated className="mx-auto mb-6" />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold flame-text mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              You're Ready to Rise!
            </motion.h2>

            <motion.div
              className="glass-card p-8 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-phoenix-gold" />
                  <span className="text-gray-300">Track {selectedAreas.length} life areas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-phoenix-gold" />
                  <span className="text-gray-300">Journal your transformation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-phoenix-gold" />
                  <span className="text-gray-300">Rise through the Phoenix Cycle</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-phoenix-gold" />
                  <span className="text-gray-300">Unlock achievements & badges</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <PhoenixButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleComplete}
              >
                Enter WisdomOS
                <ChevronRight className="w-5 h-5 ml-2" />
              </PhoenixButton>
              
              <PhoenixButton
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Adjust Life Areas
              </PhoenixButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Phoenix Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-phoenix-ember rounded-full opacity-50"
            animate={{
              y: [-100, -1180],
              x: [0, (Math.random() - 0.5) * 200],
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: 0,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
    </div>
  )
}