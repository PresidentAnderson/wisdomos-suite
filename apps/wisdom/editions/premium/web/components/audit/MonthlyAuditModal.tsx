'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  Target,
  Heart,
  Brain,
  Zap,
  Award
} from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { Progress } from '@/components/ui/progress'

interface LifeArea {
  id: string
  name: string
  phoenixName?: string
  icon?: string
  color?: string
}

interface AuditQuestion {
  id: string
  area: string
  question: string
  category: 'satisfaction' | 'progress' | 'challenges' | 'goals'
  type: 'rating' | 'text' | 'multiselect'
  options?: string[]
}

interface AuditResponse {
  questionId: string
  value: any
  notes?: string
}

interface LifeAreaAudit {
  areaId: string
  areaName: string
  previousScore?: number
  currentScore: number
  trend: 'up' | 'down' | 'stable'
  status: 'thriving' | 'attention' | 'collapsed'
  responses: AuditResponse[]
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
}

interface MonthlyAudit {
  id: string
  month: string
  year: number
  completedAt: string
  overallScore: number
  areaAudits: LifeAreaAudit[]
  insights: string[]
  celebrations: string[]
  focusAreas: string[]
}

interface MonthlyAuditModalProps {
  isOpen: boolean
  onClose: () => void
  lifeAreas: LifeArea[]
  onComplete?: (audit: MonthlyAudit) => void
}

const auditQuestions: AuditQuestion[] = [
  {
    id: 'q1',
    area: 'general',
    question: 'How satisfied are you with this life area this month?',
    category: 'satisfaction',
    type: 'rating'
  },
  {
    id: 'q2',
    area: 'general',
    question: 'What progress have you made in this area?',
    category: 'progress',
    type: 'text'
  },
  {
    id: 'q3',
    area: 'general',
    question: 'What challenges did you face?',
    category: 'challenges',
    type: 'text'
  },
  {
    id: 'q4',
    area: 'general',
    question: 'What are your top 3 priorities for next month?',
    category: 'goals',
    type: 'text'
  },
  {
    id: 'q5',
    area: 'general',
    question: 'How aligned do you feel with your phoenix purpose in this area?',
    category: 'satisfaction',
    type: 'rating'
  }
]

export function MonthlyAuditModal({ isOpen, onClose, lifeAreas, onComplete }: MonthlyAuditModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, AuditResponse[]>>({})
  const [areaScores, setAreaScores] = useState<Record<string, number>>({})
  const [isReviewing, setIsReviewing] = useState(false)
  const [auditSummary, setAuditSummary] = useState<MonthlyAudit | null>(null)

  const totalSteps = lifeAreas.length + 2 // Intro + areas + summary
  const currentArea = lifeAreas[currentAreaIndex]
  const progress = ((currentStep + 1) / totalSteps) * 100

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCurrentStep(0)
      setCurrentAreaIndex(0)
      setResponses({})
      setAreaScores({})
      setIsReviewing(false)
      setAuditSummary(null)
    }
  }, [isOpen])

  const handleRatingChange = (questionId: string, value: number) => {
    const areaResponses = responses[currentArea.id] || []
    const updatedResponses = areaResponses.filter(r => r.questionId !== questionId)
    updatedResponses.push({ questionId, value })
    
    setResponses({
      ...responses,
      [currentArea.id]: updatedResponses
    })

    // Update area score based on ratings
    const ratingResponses = updatedResponses.filter(r => 
      auditQuestions.find(q => q.id === r.questionId)?.type === 'rating'
    )
    if (ratingResponses.length > 0) {
      const avgScore = ratingResponses.reduce((sum, r) => sum + r.value, 0) / ratingResponses.length
      setAreaScores({
        ...areaScores,
        [currentArea.id]: avgScore
      })
    }
  }

  const handleTextResponse = (questionId: string, value: string) => {
    const areaResponses = responses[currentArea.id] || []
    const updatedResponses = areaResponses.filter(r => r.questionId !== questionId)
    updatedResponses.push({ questionId, value })
    
    setResponses({
      ...responses,
      [currentArea.id]: updatedResponses
    })
  }

  const getAreaStatus = (score: number): 'thriving' | 'attention' | 'collapsed' => {
    if (score >= 8) return 'thriving'
    if (score >= 5) return 'attention'
    return 'collapsed'
  }

  const getAreaTrend = (currentScore: number, previousScore?: number): 'up' | 'down' | 'stable' => {
    if (!previousScore) return 'stable'
    if (currentScore > previousScore + 0.5) return 'up'
    if (currentScore < previousScore - 0.5) return 'down'
    return 'stable'
  }

  const generateAuditSummary = () => {
    const areaAudits: LifeAreaAudit[] = lifeAreas.map(area => {
      const areaResponses = responses[area.id] || []
      const score = areaScores[area.id] || 5
      
      return {
        areaId: area.id,
        areaName: area.name,
        currentScore: score,
        trend: getAreaTrend(score),
        status: getAreaStatus(score),
        responses: areaResponses,
        strengths: score >= 7 ? [`Strong performance in ${area.name}`] : [],
        improvements: score < 5 ? [`Needs attention in ${area.name}`] : [],
        nextSteps: [`Continue monitoring ${area.name}`]
      }
    })

    const overallScore = Object.values(areaScores).reduce((sum, score) => sum + score, 0) / Object.keys(areaScores).length || 5

    const summary: MonthlyAudit = {
      id: `audit-${Date.now()}`,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      completedAt: new Date().toISOString(),
      overallScore,
      areaAudits,
      insights: generateInsights(areaAudits),
      celebrations: generateCelebrations(areaAudits),
      focusAreas: generateFocusAreas(areaAudits)
    }

    setAuditSummary(summary)
    setIsReviewing(true)
  }

  const generateInsights = (audits: LifeAreaAudit[]): string[] => {
    const insights: string[] = []
    
    const thrivingAreas = audits.filter(a => a.status === 'thriving')
    const collapsedAreas = audits.filter(a => a.status === 'collapsed')
    
    if (thrivingAreas.length > 0) {
      insights.push(`You're thriving in ${thrivingAreas.length} life area${thrivingAreas.length > 1 ? 's' : ''}: ${thrivingAreas.map(a => a.areaName).join(', ')}`)
    }
    
    if (collapsedAreas.length > 0) {
      insights.push(`${collapsedAreas.length} area${collapsedAreas.length > 1 ? 's need' : ' needs'} immediate attention: ${collapsedAreas.map(a => a.areaName).join(', ')}`)
    }
    
    const upwardTrends = audits.filter(a => a.trend === 'up')
    if (upwardTrends.length > 0) {
      insights.push(`Positive momentum in: ${upwardTrends.map(a => a.areaName).join(', ')}`)
    }
    
    return insights
  }

  const generateCelebrations = (audits: LifeAreaAudit[]): string[] => {
    const celebrations: string[] = []
    
    audits.forEach(audit => {
      if (audit.currentScore >= 8) {
        celebrations.push(`Outstanding performance in ${audit.areaName}!`)
      }
      if (audit.trend === 'up') {
        celebrations.push(`Great improvement in ${audit.areaName}`)
      }
    })
    
    if (celebrations.length === 0) {
      celebrations.push('You completed your monthly audit - that\'s a win!')
    }
    
    return celebrations
  }

  const generateFocusAreas = (audits: LifeAreaAudit[]): string[] => {
    return audits
      .filter(a => a.status === 'collapsed' || a.status === 'attention')
      .sort((a, b) => a.currentScore - b.currentScore)
      .slice(0, 3)
      .map(a => a.areaName)
  }

  const handleNext = () => {
    if (currentStep === 0) {
      // Move from intro to first area
      setCurrentStep(1)
    } else if (currentStep <= lifeAreas.length) {
      // Move through areas
      if (currentAreaIndex < lifeAreas.length - 1) {
        setCurrentAreaIndex(currentAreaIndex + 1)
        setCurrentStep(currentStep + 1)
      } else {
        // Generate summary
        generateAuditSummary()
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1 && currentAreaIndex > 0) {
      setCurrentAreaIndex(currentAreaIndex - 1)
      setCurrentStep(currentStep - 1)
    } else if (currentStep === 1) {
      setCurrentStep(0)
    }
  }

  const handleComplete = () => {
    if (auditSummary) {
      // Save to localStorage
      const existingAudits = localStorage.getItem('wisdomos_audits')
      const audits = existingAudits ? JSON.parse(existingAudits) : []
      audits.push(auditSummary)
      localStorage.setItem('wisdomos_audits', JSON.stringify(audits))
      
      if (onComplete) {
        onComplete(auditSummary)
      }
      
      onClose()
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: 'thriving' | 'attention' | 'collapsed') => {
    switch (status) {
      case 'thriving': return 'text-green-600 bg-green-50 border-green-200'
      case 'attention': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'collapsed': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentStep === 0 && 'Monthly Life Audit'}
                  {currentStep > 0 && currentStep <= lifeAreas.length && `Audit: ${currentArea?.name}`}
                  {isReviewing && 'Audit Summary'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-gray-900 font-medium">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Intro Screen */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-phoenix-gold to-phoenix-orange rounded-full flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Time for Your Monthly Phoenix Rising
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Take a moment to reflect on your journey across all life areas. 
                    This audit will help you celebrate wins, identify challenges, 
                    and set clear intentions for the month ahead.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <Heart className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">Reflect</h4>
                    <p className="text-sm text-gray-600">
                      Review your progress and experiences
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <Brain className="w-8 h-8 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">Assess</h4>
                    <p className="text-sm text-gray-600">
                      Evaluate each life area honestly
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <Target className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-semibold text-gray-900">Plan</h4>
                    <p className="text-sm text-gray-600">
                      Set intentions for next month
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Time Required:</span> Approximately 15-20 minutes
                  </p>
                </div>
              </motion.div>
            )}

            {/* Area Assessment */}
            {currentStep > 0 && currentStep <= lifeAreas.length && currentArea && !isReviewing && (
              <motion.div
                key={currentArea.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                {/* Area Header */}
                <div className="text-center mb-6">
                  <div 
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
                    style={{ backgroundColor: currentArea.color || '#FFD700' }}
                  >
                    {currentArea.icon || '🔥'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{currentArea.name}</h3>
                  {currentArea.phoenixName && (
                    <p className="text-sm text-gray-500 italic">{currentArea.phoenixName}</p>
                  )}
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {auditQuestions.map((question) => (
                    <div key={question.id} className="space-y-3">
                      <label className="block text-sm font-medium text-gray-900">
                        {question.question}
                      </label>
                      
                      {question.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
                            const currentResponse = responses[currentArea.id]?.find(r => r.questionId === question.id)
                            const isSelected = currentResponse?.value === value
                            
                            return (
                              <button
                                key={value}
                                onClick={() => handleRatingChange(question.id, value)}
                                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                  isSelected
                                    ? 'bg-phoenix-orange text-white scale-110'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {value}
                              </button>
                            )
                          })}
                        </div>
                      )}
                      
                      {question.type === 'text' && (
                        <textarea
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent resize-none"
                          rows={3}
                          placeholder="Share your thoughts..."
                          value={responses[currentArea.id]?.find(r => r.questionId === question.id)?.value || ''}
                          onChange={(e) => handleTextResponse(question.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Current Score Display */}
                {areaScores[currentArea.id] && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Current Score</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {areaScores[currentArea.id].toFixed(1)}/10
                    </p>
                    <p className={`text-sm font-medium mt-1 ${
                      areaScores[currentArea.id] >= 8 ? 'text-green-600' :
                      areaScores[currentArea.id] >= 5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getAreaStatus(areaScores[currentArea.id]).toUpperCase()}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Summary Screen */}
            {isReviewing && auditSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Overall Score */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-phoenix-gold to-phoenix-orange text-white mb-4">
                    <div>
                      <p className="text-4xl font-bold">{auditSummary.overallScore.toFixed(1)}</p>
                      <p className="text-sm">Overall Score</p>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {auditSummary.month} {auditSummary.year} Audit Complete!
                  </h3>
                  
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>{auditSummary.areaAudits.filter(a => a.status === 'thriving').length} Thriving</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>{auditSummary.areaAudits.filter(a => a.status === 'attention').length} Attention</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>{auditSummary.areaAudits.filter(a => a.status === 'collapsed').length} Collapsed</span>
                    </div>
                  </div>
                </div>

                {/* Life Areas Grid */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Life Area Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auditSummary.areaAudits.map((audit) => {
                      const area = lifeAreas.find(a => a.id === audit.areaId)
                      return (
                        <div 
                          key={audit.areaId}
                          className={`rounded-lg border p-4 ${getStatusColor(audit.status)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{area?.icon || '🔥'}</span>
                              <div>
                                <p className="font-medium text-gray-900">{audit.areaName}</p>
                                <p className="text-sm">Score: {audit.currentScore.toFixed(1)}/10</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(audit.trend)}
                              <span className="text-xs font-medium uppercase">
                                {audit.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Insights */}
                {auditSummary.insights.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      Key Insights
                    </h4>
                    <ul className="space-y-1">
                      {auditSummary.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Celebrations */}
                {auditSummary.celebrations.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      Celebrations
                    </h4>
                    <ul className="space-y-1">
                      {auditSummary.celebrations.map((celebration, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">🎉</span>
                          {celebration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Focus Areas */}
                {auditSummary.focusAreas.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-600" />
                      Focus Areas for Next Month
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {auditSummary.focusAreas.map((area, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <PhoenixButton
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0 || isReviewing}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </PhoenixButton>
              
              {!isReviewing ? (
                <PhoenixButton
                  onClick={handleNext}
                  disabled={currentStep > 0 && currentStep <= lifeAreas.length && !areaScores[currentArea?.id]}
                >
                  {currentStep === 0 ? 'Start Audit' : 
                   currentStep < lifeAreas.length ? 'Next Area' :
                   'View Summary'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </PhoenixButton>
              ) : (
                <PhoenixButton
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-phoenix-gold to-phoenix-orange"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete Audit
                </PhoenixButton>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}