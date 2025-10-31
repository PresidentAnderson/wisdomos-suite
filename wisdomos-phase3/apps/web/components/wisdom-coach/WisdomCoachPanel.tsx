'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain,
  Sparkles,
  MessageCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Heart,
  Target,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { 
  CoachingSession, 
  CoachingInsight, 
  CoachingRecommendation, 
  ActionStep,
  VoiceNote 
} from '@/types/wisdom-coach'
import { WisdomCoachService } from '@/lib/wisdom-coach-service'
import { FulfillmentIntegrationService } from '@/lib/fulfillment-integration'

interface WisdomCoachPanelProps {
  userId: string
  onSessionComplete?: (session: CoachingSession) => void
  onRecommendationAccept?: (recommendation: CoachingRecommendation) => void
}

export function WisdomCoachPanel({ 
  userId, 
  onSessionComplete, 
  onRecommendationAccept 
}: WisdomCoachPanelProps) {
  const [coachService] = useState(() => new WisdomCoachService(userId))
  const [activeSession, setActiveSession] = useState<CoachingSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [showInsights, setShowInsights] = useState(true)
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null)

  useEffect(() => {
    loadActiveSession()
    checkForTriggers()
  }, [])

  const loadActiveSession = async () => {
    const stored = localStorage.getItem('wisdomos_coaching_sessions')
    if (stored) {
      const sessions: CoachingSession[] = JSON.parse(stored)
      const active = sessions.find(s => s.status === 'active')
      if (active) {
        setActiveSession(active)
      }
    }
  }

  const checkForTriggers = async () => {
    setIsLoading(true)
    try {
      const triggeredSession = await coachService.checkTriggers()
      if (triggeredSession) {
        setActiveSession(triggeredSession)
      }
    } catch (error) {
      console.error('Error checking triggers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startManualSession = async () => {
    setIsLoading(true)
    try {
      const context = await coachService.buildCoachingContext()
      // Create manual session (simplified)
      const session: CoachingSession = {
        id: 'manual_' + Date.now(),
        userId,
        triggeredBy: 'manual',
        triggerData: { context: 'User initiated coaching session' },
        status: 'active',
        createdAt: new Date().toISOString(),
        insights: [],
        recommendations: []
      }
      setActiveSession(session)
    } catch (error) {
      console.error('Error starting manual session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeSession = async () => {
    if (!activeSession) return
    
    const updatedSession = {
      ...activeSession,
      status: 'completed' as const,
      completedAt: new Date().toISOString()
    }
    
    try {
      // Integrate with fulfillment display
      const artifacts = await FulfillmentIntegrationService.integrateCoachingSession(updatedSession)
      
      // Show success message about created items
      if (artifacts.tasks.length > 0 || artifacts.completions.length > 0 || artifacts.practices.length > 0) {
        console.log('Created fulfillment artifacts:', {
          tasks: artifacts.tasks.length,
          completions: artifacts.completions.length,
          practices: artifacts.practices.length,
          newCommitments: artifacts.newCommitments.length
        })
        // Could show toast notification here
      }
    } catch (error) {
      console.error('Error integrating with fulfillment display:', error)
    }
    
    // Save to localStorage
    const stored = localStorage.getItem('wisdomos_coaching_sessions')
    const sessions: CoachingSession[] = stored ? JSON.parse(stored) : []
    const index = sessions.findIndex(s => s.id === activeSession.id)
    if (index >= 0) {
      sessions[index] = updatedSession
    } else {
      sessions.push(updatedSession)
    }
    localStorage.setItem('wisdomos_coaching_sessions', JSON.stringify(sessions))
    
    setActiveSession(null)
    onSessionComplete?.(updatedSession)
  }

  const acceptRecommendation = (recommendation: CoachingRecommendation) => {
    if (!activeSession) return
    
    const updatedRecommendation = {
      ...recommendation,
      status: 'accepted' as const,
      acceptedAt: new Date().toISOString()
    }
    
    const updatedSession = {
      ...activeSession,
      recommendations: activeSession.recommendations.map(r => 
        r.id === recommendation.id ? updatedRecommendation : r
      )
    }
    
    setActiveSession(updatedSession)
    onRecommendationAccept?.(updatedRecommendation)
  }

  const completeActionStep = (recommendationId: string, stepId: string) => {
    if (!activeSession) return
    
    const updatedSession = {
      ...activeSession,
      recommendations: activeSession.recommendations.map(r => 
        r.id === recommendationId 
          ? {
              ...r,
              actionSteps: r.actionSteps.map(step => 
                step.id === stepId 
                  ? { ...step, completed: true, completedAt: new Date().toISOString() }
                  : step
              )
            }
          : r
      )
    }
    
    setActiveSession(updatedSession)
  }

  const startVoiceNote = async () => {
    if (!activeSession) return
    
    try {
      // TODO: Implement actual voice recording
      setIsRecording(true)
      // Mock voice recording for now
      setTimeout(() => {
        setIsRecording(false)
        const mockVoiceNote: VoiceNote = {
          id: 'voice_' + Date.now(),
          sessionId: activeSession.id,
          audioUrl: '',
          transcription: 'This would contain the voice transcription...',
          duration: 45,
          mood_detected: 'thoughtful',
          key_themes: ['reflection', 'growth'],
          createdAt: new Date().toISOString()
        }
        setVoiceNotes(prev => [...prev, mockVoiceNote])
      }, 3000)
    } catch (error) {
      console.error('Error starting voice note:', error)
      setIsRecording(false)
    }
  }

  const stopVoiceNote = () => {
    setIsRecording(false)
  }

  const getInsightIcon = (type: CoachingInsight['type']) => {
    switch (type) {
      case 'pattern': return TrendingUp
      case 'trigger': return AlertCircle
      case 'strength': return Heart
      case 'opportunity': return Target
      case 'boundary': return RotateCcw
      default: return Lightbulb
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRecommendationIcon = (type: CoachingRecommendation['type']) => {
    switch (type) {
      case 'boundary_reset': return RotateCcw
      case 'life_area_focus': return Target
      case 'relationship_repair': return Heart
      case 'habit_change': return CheckCircle
      case 'mindset_shift': return Brain
      default: return Lightbulb
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Brain className="w-8 h-8 text-phoenix-orange" />
          </motion.div>
          <p className="mt-4 text-gray-500">Phoenix is analyzing your patterns...</p>
        </CardContent>
      </Card>
    )
  }

  if (!activeSession) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-phoenix-orange to-phoenix-gold flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Phoenix Wisdom Coach</h2>
              <p className="text-sm text-gray-500 font-normal">
                Your AI companion for growth and insight
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">
              No active coaching session. Phoenix monitors your journal for patterns and 
              triggers to offer timely guidance.
            </p>
            <PhoenixButton onClick={startManualSession} size="lg" data-cy="start-manual-session">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Coaching Session
            </PhoenixButton>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" data-cy="wisdom-coach-panel">
      {/* Active Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-phoenix-orange to-phoenix-gold flex items-center justify-center">
                <Brain className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Active Coaching Session</h2>
                <p className="text-sm text-gray-500">
                  Triggered by: {activeSession.triggerData.context}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice Note Button */}
              <PhoenixButton
                variant="secondary"
                size="sm"
                onClick={isRecording ? stopVoiceNote : startVoiceNote}
                className={isRecording ? 'bg-red-50 border-red-200' : ''}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-1" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1" />
                    Voice Note
                  </>
                )}
              </PhoenixButton>
              
              {/* Complete Session */}
              <PhoenixButton variant="secondary" size="sm" onClick={completeSession} data-cy="complete-session">
                Complete Session
              </PhoenixButton>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Voice Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Mic className="w-5 h-5 text-red-600" />
                  </motion.div>
                  <span className="text-red-700 font-medium">Recording voice note...</span>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="flex gap-1"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Notes */}
      {voiceNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Voice Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {voiceNotes.map((note) => (
                <div key={note.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Play className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Voice Note ({note.duration}s)</p>
                    <p className="text-xs text-gray-500">{note.transcription}</p>
                    <div className="flex gap-2 mt-1">
                      {note.key_themes.map((theme) => (
                        <Badge key={theme} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {note.mood_detected && (
                    <Badge variant="outline" className="text-xs">
                      {note.mood_detected}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {activeSession.insights.length > 0 && (
        <Card data-cy="coaching-insights">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Insights ({activeSession.insights.length})
              </CardTitle>
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {showInsights ? 'Hide' : 'Show'}
              </button>
            </div>
          </CardHeader>
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CardContent>
                  <div className="space-y-4">
                    {activeSession.insights.map((insight) => {
                      const IconComponent = getInsightIcon(insight.type)
                      return (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border rounded-lg p-4 bg-gradient-to-r from-white to-gray-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                              <IconComponent className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                <Badge className={getPriorityColor(insight.priority)}>
                                  {insight.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {insight.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                              {insight.lifeAreasAffected.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {insight.lifeAreasAffected.map((areaId) => (
                                    <Badge key={areaId} variant="secondary" className="text-xs">
                                      {areaId.replace('-', ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Recommendations */}
      {activeSession.recommendations.length > 0 && (
        <Card data-cy="coaching-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommendations ({activeSession.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSession.recommendations.map((recommendation) => {
                const IconComponent = getRecommendationIcon(recommendation.type)
                const isExpanded = expandedRecommendation === recommendation.id
                const completedSteps = recommendation.actionSteps.filter(s => s.completed).length
                const totalSteps = recommendation.actionSteps.length
                
                return (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
                          <IconComponent className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{recommendation.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {recommendation.timeframe.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.expectedImpact} impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {recommendation.status === 'suggested' && (
                          <PhoenixButton
                            size="sm"
                            onClick={() => acceptRecommendation(recommendation)}
                            data-cy="accept-recommendation"
                          >
                            Accept
                          </PhoenixButton>
                        )}
                        <button
                          onClick={() => setExpandedRecommendation(
                            isExpanded ? null : recommendation.id
                          )}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronRight 
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`} 
                          />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {recommendation.status === 'accepted' && totalSteps > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{completedSteps}/{totalSteps} steps</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Steps */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t pt-3 mt-3"
                        >
                          <h5 className="font-medium text-gray-900 mb-3">Action Steps</h5>
                          <div className="space-y-3">
                            {recommendation.actionSteps.map((step) => (
                              <div key={step.id} className="flex items-start gap-3">
                                <button
                                  onClick={() => completeActionStep(recommendation.id, step.id)}
                                  className="mt-1"
                                >
                                  {step.completed ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-400" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className={`font-medium ${
                                    step.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                  }`}>
                                    {step.title}
                                  </p>
                                  <p className="text-sm text-gray-600">{step.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {step.estimated_time}
                                    </Badge>
                                    {step.required && (
                                      <Badge variant="outline" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}