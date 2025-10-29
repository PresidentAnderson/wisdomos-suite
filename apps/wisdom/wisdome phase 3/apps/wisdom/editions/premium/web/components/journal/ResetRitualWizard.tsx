'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Heart,
  Shield,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Brain,
  Target,
  Sparkles
} from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { Button } from '@/components/ui/button'
import { ResetRitual, CreateResetRitualRequest } from '@/types/journal'

interface ResetRitualWizardProps {
  isOpen: boolean
  onClose: () => void
  journalEntryId: string
  lifeAreas: any[]
  suggestedAreaId?: string
  onComplete?: (ritual: ResetRitual) => void
}

const RITUAL_STEPS = [
  {
    id: 'pause',
    title: 'Pause & Pattern Interrupt',
    icon: <Heart className="w-6 h-6" />,
    description: 'Stop and breathe. Notice what\'s happening right now.',
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'scan',
    title: 'Scan & Acknowledge',
    icon: <Brain className="w-6 h-6" />,
    description: 'Identify which boundary was crossed and by whom.',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'forgive',
    title: 'Acknowledge & Forgive',
    icon: <Shield className="w-6 h-6" />,
    description: 'Release the energy with compassion for yourself and others.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'recommit',
    title: 'Recommit to Boundaries',
    icon: <Target className="w-6 h-6" />,
    description: 'Reaffirm your boundaries and values.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'recalibrate',
    title: 'Recalibrate & Restore',
    icon: <RefreshCw className="w-6 h-6" />,
    description: 'Take action to restore your energy and balance.',
    color: 'from-yellow-500 to-orange-500'
  }
]

export function ResetRitualWizard({
  isOpen,
  onClose,
  journalEntryId,
  lifeAreas,
  suggestedAreaId,
  onComplete
}: ResetRitualWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [ritualData, setRitualData] = useState<Partial<CreateResetRitualRequest>>({
    entryId: journalEntryId,
    boundaryArea: suggestedAreaId || ''
  })

  // Step-specific state
  const [pauseNote, setPauseNote] = useState('')
  const [actualSituation, setActualSituation] = useState('')
  const [boundaryArea, setBoundaryArea] = useState(suggestedAreaId || '')
  const [pulledEnergy, setPulledEnergy] = useState('')
  const [acknowledgment, setAcknowledgment] = useState('')
  const [forgiveness, setForgiveness] = useState('')
  const [recommitment, setRecommitment] = useState('')
  const [restoreAction, setRestoreAction] = useState('')
  const [newBoundary, setNewBoundary] = useState('')

  const handleNext = () => {
    // Save current step data
    switch (currentStep) {
      case 0: // Pause
        setRitualData({ ...ritualData, pauseNote, actualSituation })
        break
      case 1: // Scan
        setRitualData({ ...ritualData, boundaryArea, pulledEnergy })
        break
      case 2: // Forgive
        setRitualData({ ...ritualData, acknowledgment, forgiveness })
        break
      case 3: // Recommit
        setRitualData({ ...ritualData, recommitment, newBoundary })
        break
      case 4: // Recalibrate
        setRitualData({ ...ritualData, restoreAction })
        break
    }

    if (currentStep < RITUAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    const ritual: ResetRitual = {
      id: `ritual-${Date.now()}`,
      journalEntryId,
      createdAt: new Date().toISOString(),
      pauseNote,
      actualSituation,
      boundaryArea,
      pulledEnergy,
      acknowledgment,
      forgiveness,
      recommitment,
      restoreAction,
      newBoundary,
      completedAt: new Date().toISOString()
    }

    // Save ritual to localStorage (in production, use API)
    const rituals = JSON.parse(localStorage.getItem('wisdomos_rituals') || '[]')
    rituals.push(ritual)
    localStorage.setItem('wisdomos_rituals', JSON.stringify(rituals))

    // Update boundary audit for the life area
    const audits = JSON.parse(localStorage.getItem('wisdomos_boundary_audits') || '{}')
    const month = new Date().toLocaleString('default', { month: 'long' })
    const year = new Date().getFullYear()
    const auditKey = `${boundaryArea}-${month}-${year}`

    if (!audits[auditKey]) {
      audits[auditKey] = {
        lifeAreaId: boundaryArea,
        month,
        year,
        boundariesCrossed: 0,
        ritualsCompleted: 0,
        energyLeaks: [],
        status: 'healthy',
        color: 'green',
        createdAt: new Date().toISOString()
      }
    }

    audits[auditKey].boundariesCrossed++
    audits[auditKey].ritualsCompleted++
    if (pulledEnergy && !audits[auditKey].energyLeaks.includes(pulledEnergy)) {
      audits[auditKey].energyLeaks.push(pulledEnergy)
    }

    // Update status based on frequency
    if (audits[auditKey].boundariesCrossed > 5) {
      audits[auditKey].status = 'critical'
      audits[auditKey].color = 'red'
    } else if (audits[auditKey].boundariesCrossed > 2) {
      audits[auditKey].status = 'attention'
      audits[auditKey].color = 'yellow'
    }

    localStorage.setItem('wisdomos_boundary_audits', JSON.stringify(audits))

    if (onComplete) {
      onComplete(ritual)
    }

    onClose()
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return pauseNote && actualSituation
      case 1: return boundaryArea
      case 2: return acknowledgment
      case 3: return recommitment
      case 4: return restoreAction
      default: return false
    }
  }

  const getBreathingExercise = () => {
    const exercises = [
      '4-7-8 Breathing: Inhale for 4, hold for 7, exhale for 8',
      'Box Breathing: Inhale 4, hold 4, exhale 4, hold 4',
      '5-5-5 Breathing: Inhale for 5, hold for 5, exhale for 5',
      'Belly Breathing: Deep breath into your belly, slow release'
    ]
    return exercises[Math.floor(Math.random() * exercises.length)]
  }

  const getSuggestedActions = () => {
    const actions = [
      '5-minute walk in nature',
      'Listen to calming music',
      'Journal for 10 minutes',
      'Call a supportive friend',
      'Practice gratitude (list 3 things)',
      'Do gentle stretching',
      'Take a warm bath',
      'Practice meditation',
      'Create art or doodle',
      'Read something inspiring'
    ]
    return actions
  }

  if (!isOpen) return null

  const currentStepData = RITUAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / RITUAL_STEPS.length) * 100

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`p-6 bg-gradient-to-r ${currentStepData.color} text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Boundary Reset Ritual</h2>
                  <p className="text-white/80 text-sm">
                    Step {currentStep + 1} of {RITUAL_STEPS.length}: {currentStepData.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <p className="text-gray-600 text-lg">{currentStepData.description}</p>
              </div>

              {/* Step 1: Pause & Pattern Interrupt */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Breathing Exercise</p>
                        <p className="text-gray-700">{getBreathingExercise()}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Take 3-5 deep breaths before continuing
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's actually happening right now? (Just the facts)
                    </label>
                    <textarea
                      value={actualSituation}
                      onChange={(e) => setActualSituation(e.target.value)}
                      placeholder="Describe the situation without judgment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How are you feeling in this moment?
                    </label>
                    <textarea
                      value={pauseNote}
                      onChange={(e) => setPauseNote(e.target.value)}
                      placeholder="Name your emotions and physical sensations..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Scan & Acknowledge */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which life area boundary was crossed?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {lifeAreas.map((area) => (
                        <button
                          key={area.id}
                          onClick={() => setBoundaryArea(area.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            boundaryArea === area.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{area.icon || '🔥'}</span>
                            <span className="font-medium text-gray-900">{area.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who or what pulled your energy? (Optional)
                    </label>
                    <input
                      type="text"
                      value={pulledEnergy}
                      onChange={(e) => setPulledEnergy(e.target.value)}
                      placeholder="Person, situation, or pattern..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-700">
                      <strong>Remember:</strong> This isn't about blame. It's about understanding 
                      where your energy went and recognizing patterns.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Acknowledge & Forgive */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acknowledge what happened without judgment
                    </label>
                    <textarea
                      value={acknowledgment}
                      onChange={(e) => setAcknowledgment(e.target.value)}
                      placeholder="I acknowledge that..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer forgiveness (to yourself and/or others)
                    </label>
                    <textarea
                      value={forgiveness}
                      onChange={(e) => setForgiveness(e.target.value)}
                      placeholder="I forgive myself for... I forgive [person] for..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Self-Compassion Reminder</p>
                        <p className="text-sm text-gray-700">
                          You're human. It's okay to have boundaries crossed. 
                          This ritual is an act of self-love and growth.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Recommit to Boundaries */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommit to your boundary
                    </label>
                    <textarea
                      value={recommitment}
                      onChange={(e) => setRecommitment(e.target.value)}
                      placeholder="I recommit to... I will honor my boundary by..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Define a new or adjusted boundary (Optional)
                    </label>
                    <textarea
                      value={newBoundary}
                      onChange={(e) => setNewBoundary(e.target.value)}
                      placeholder="Moving forward, I will..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Your Boundaries Matter</p>
                        <p className="text-sm text-gray-700">
                          Healthy boundaries are acts of self-respect and love. 
                          They protect your energy and allow you to show up fully.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Recalibrate & Restore */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What action will you take to restore your energy?
                    </label>
                    <textarea
                      value={restoreAction}
                      onChange={(e) => setRestoreAction(e.target.value)}
                      placeholder="I will restore my energy by..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Suggested restoration activities:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {getSuggestedActions().map((action, index) => (
                        <button
                          key={index}
                          onClick={() => setRestoreAction(action)}
                          className="p-2 text-left text-sm bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-gray-700"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-200">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                      <p className="font-semibold text-gray-900 mb-2">
                        You've completed the Boundary Reset Ritual! 🎉
                      </p>
                      <p className="text-sm text-gray-700">
                        Your boundaries have been acknowledged and restored. 
                        Take your restoration action and be gentle with yourself.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                {RITUAL_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-gradient-to-r from-phoenix-gold to-phoenix-orange'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <PhoenixButton
                onClick={handleNext}
                disabled={!isStepValid()}
                className={currentStep === RITUAL_STEPS.length - 1 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : ''}
              >
                {currentStep === RITUAL_STEPS.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete Ritual
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </PhoenixButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}