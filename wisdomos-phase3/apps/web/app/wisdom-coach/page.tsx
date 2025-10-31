'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain,
  ChevronLeft,
  History,
  Settings,
  TrendingUp,
  Calendar,
  Award,
  Target
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WisdomCoachPanel } from '@/components/wisdom-coach/WisdomCoachPanel'
import { CoachingSession, CoachingMetrics } from '@/types/wisdom-coach'
import { useLifeAreas } from '@/contexts/LifeAreasContext'

export default function WisdomCoachPage() {
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [metrics, setMetrics] = useState<CoachingMetrics | null>(null)
  const [activeView, setActiveView] = useState<'coach' | 'history' | 'analytics'>('coach')
  const { lifeAreas } = useLifeAreas()

  useEffect(() => {
    loadSessions()
    calculateMetrics()
  }, [])

  const loadSessions = () => {
    const stored = localStorage.getItem('wisdomos_coaching_sessions')
    if (stored) {
      const loadedSessions: CoachingSession[] = JSON.parse(stored)
      setSessions(loadedSessions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    }
  }

  const calculateMetrics = () => {
    const stored = localStorage.getItem('wisdomos_coaching_sessions')
    if (!stored) return

    const allSessions: CoachingSession[] = JSON.parse(stored)
    const completedSessions = allSessions.filter(s => s.status === 'completed')
    
    const totalInsights = allSessions.reduce((sum, s) => sum + s.insights.length, 0)
    const totalRecommendations = allSessions.reduce((sum, s) => sum + s.recommendations.length, 0)
    const acceptedRecommendations = allSessions.reduce((sum, s) => 
      sum + s.recommendations.filter(r => r.status === 'accepted' || r.status === 'in_progress' || r.status === 'completed').length, 0
    )
    const completedRecommendations = allSessions.reduce((sum, s) => 
      sum + s.recommendations.filter(r => r.status === 'completed').length, 0
    )

    const insightTypes: Record<string, number> = {}
    allSessions.forEach(s => {
      s.insights.forEach(i => {
        insightTypes[i.type] = (insightTypes[i.type] || 0) + 1
      })
    })

    const mostHelpfulTypes = Object.entries(insightTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type)

    const calculatedMetrics: CoachingMetrics = {
      total_sessions: allSessions.length,
      insights_generated: totalInsights,
      recommendations_accepted: acceptedRecommendations,
      recommendations_completed: completedRecommendations,
      user_satisfaction_avg: 8.5, // Mock - would come from user ratings
      most_helpful_insight_types: mostHelpfulTypes,
      trigger_effectiveness: {
        'negative_mood_pattern': 0.85,
        'life_area_decline': 0.72,
        'relationship_stress': 0.91,
        'boundary_violation': 0.68
      },
      session_completion_rate: completedSessions.length / allSessions.length,
      follow_up_adherence_rate: 0.73 // Mock
    }

    setMetrics(calculatedMetrics)
  }

  const handleSessionComplete = (session: CoachingSession) => {
    loadSessions()
    calculateMetrics()
  }

  const handleRecommendationAccept = () => {
    calculateMetrics()
  }

  const getSessionIcon = (triggeredBy: CoachingSession['triggeredBy']) => {
    switch (triggeredBy) {
      case 'journal': return '📝'
      case 'upset': return '😔'
      case 'mood_trend': return '📊'
      case 'life_area_collapse': return '⚠️'
      case 'manual': return '🤔'
      default: return '🔥'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return 'Less than an hour ago'
  }

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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-phoenix-orange to-phoenix-gold flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-black">Phoenix Wisdom Coach</h1>
                  <p className="text-xs text-gray-500">AI-powered growth insights</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <PhoenixButton
                variant={activeView === 'coach' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('coach')}
              >
                <Brain className="w-4 h-4 mr-1" />
                Coach
              </PhoenixButton>
              <PhoenixButton
                variant={activeView === 'history' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('history')}
              >
                <History className="w-4 h-4 mr-1" />
                History
              </PhoenixButton>
              <PhoenixButton
                variant={activeView === 'analytics' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('analytics')}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Analytics
              </PhoenixButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coach View */}
        {activeView === 'coach' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WisdomCoachPanel
              userId="current_user" // TODO: Get from auth context
              onSessionComplete={handleSessionComplete}
              onRecommendationAccept={handleRecommendationAccept}
            />
          </motion.div>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Coaching History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No coaching sessions yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Sessions will appear here as Phoenix identifies patterns and opportunities.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getSessionIcon(session.triggeredBy)}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {session.triggerData.context || 'Coaching Session'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatTimeAgo(session.createdAt)} • 
                                {session.status === 'completed' ? ' Completed' : ' Active'}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={session.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {session.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Insights</p>
                            <p className="font-medium">{session.insights.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Recommendations</p>
                            <p className="font-medium">{session.recommendations.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Accepted</p>
                            <p className="font-medium">
                              {session.recommendations.filter(r => 
                                r.status === 'accepted' || r.status === 'in_progress' || r.status === 'completed'
                              ).length}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Completed</p>
                            <p className="font-medium">
                              {session.recommendations.filter(r => r.status === 'completed').length}
                            </p>
                          </div>
                        </div>

                        {session.insights.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium text-gray-700 mb-2">Top Insights:</p>
                            <div className="flex flex-wrap gap-2">
                              {session.insights.slice(0, 3).map((insight) => (
                                <Badge key={insight.id} variant="secondary" className="text-xs">
                                  {insight.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Sessions</p>
                      <p className="text-2xl font-bold">{metrics?.total_sessions || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Insights Generated</p>
                      <p className="text-2xl font-bold">{metrics?.insights_generated || 0}</p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Recommendations</p>
                      <p className="text-2xl font-bold">{metrics?.recommendations_accepted || 0}</p>
                    </div>
                    <Target className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Completion Rate</p>
                      <p className="text-2xl font-bold">
                        {metrics ? Math.round(metrics.session_completion_rate * 100) : 0}%
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Most Helpful Insights */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Most Helpful Insight Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.most_helpful_insight_types.map((type, index) => (
                      <div key={type} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-phoenix-orange to-phoenix-gold flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium capitalize">{type.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">
                            Helped identify key patterns and growth opportunities
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trigger Effectiveness */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Trigger Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(metrics.trigger_effectiveness).map(([trigger, effectiveness]) => (
                      <div key={trigger}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {trigger.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.round(effectiveness * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-phoenix-orange to-phoenix-gold h-2 rounded-full"
                            style={{ width: `${effectiveness * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}