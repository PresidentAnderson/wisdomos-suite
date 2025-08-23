'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface GoalRecommendation {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeframe: string
  benefits: string[]
  relatedTo: string[]
  icon: string
}

interface Analysis {
  completionRate: number
  dominantMoods: string[]
  topTags: string[]
  focusAreas: string[]
  strengths: string[]
  challenges: string[]
  habitConsistency: number
}

export default function GoalRecommendations() {
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGoal, setSelectedGoal] = useState<GoalRecommendation | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const adoptGoal = async (recommendation: GoalRecommendation) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: recommendation.title,
          description: recommendation.description,
          importance: `AI Recommended: ${recommendation.benefits.join(', ')}`,
          tags: [recommendation.category, ...recommendation.relatedTo],
          isSprint: recommendation.difficulty === 'easy'
        })
      })
      
      if (response.ok) {
        router.push('/goals')
      }
    } catch (error) {
      console.error('Failed to adopt goal:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      wellness: 'from-purple-500 to-pink-600',
      productivity: 'from-blue-500 to-indigo-600',
      learning: 'from-green-500 to-teal-600',
      relationships: 'from-yellow-500 to-orange-600',
      fitness: 'from-red-500 to-pink-600'
    }
    return colors[category] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Analyzing your data and generating recommendations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Insights */}
      {analysis && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Your Profile Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400">Goal Completion</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">
                  {Math.round(analysis.completionRate)}%
                </div>
                <div className="flex-1 bg-black/20 rounded-full h-2">
                  <div 
                    className="bg-cyan-400 h-2 rounded-full"
                    style={{ width: `${analysis.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Habit Consistency</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">
                  {Math.round(analysis.habitConsistency)}%
                </div>
                <div className="flex-1 bg-black/20 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full"
                    style={{ width: `${analysis.habitConsistency}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Dominant Moods</div>
              <div className="flex gap-2 mt-1">
                {analysis.dominantMoods.map(mood => (
                  <span key={mood} className="px-2 py-1 bg-white/20 rounded text-xs text-white">
                    {mood}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">Your Strengths</div>
              <div className="flex flex-wrap gap-2">
                {analysis.strengths.length > 0 ? (
                  analysis.strengths.map(strength => (
                    <span key={strength} className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-sm text-green-300">
                      ✨ {strength}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">Keep journaling to identify strengths</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Areas for Growth</div>
              <div className="flex flex-wrap gap-2">
                {analysis.challenges.map(challenge => (
                  <span key={challenge} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-sm text-yellow-300">
                    🎯 {challenge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Goal Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map(recommendation => (
            <div
              key={recommendation.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all cursor-pointer"
              onClick={() => setSelectedGoal(recommendation)}
            >
              <div className={`h-2 bg-gradient-to-r ${getCategoryColor(recommendation.category)}`} />
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{recommendation.icon}</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 ${getDifficultyColor(recommendation.difficulty)} rounded text-xs text-white`}>
                      {recommendation.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-white/20 rounded text-xs text-white">
                      {recommendation.timeframe}
                    </span>
                  </div>
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2">{recommendation.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{recommendation.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {recommendation.benefits.slice(0, 2).map(benefit => (
                    <span key={benefit} className="px-2 py-1 bg-white/10 rounded text-xs text-cyan-300">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{selectedGoal.icon}</div>
              <button
                onClick={() => setSelectedGoal(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">{selectedGoal.title}</h3>
            <p className="text-gray-300 mb-4">{selectedGoal.description}</p>
            
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Benefits</div>
                <div className="flex flex-wrap gap-2">
                  {selectedGoal.benefits.map(benefit => (
                    <span key={benefit} className="px-2 py-1 bg-green-500/20 rounded text-sm text-green-300">
                      ✓ {benefit}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Related to Your Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  {selectedGoal.relatedTo.map(area => (
                    <span key={area} className="px-2 py-1 bg-purple-500/20 rounded text-sm text-purple-300">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-gray-400">Difficulty</div>
                  <div className="text-white capitalize">{selectedGoal.difficulty}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Timeframe</div>
                  <div className="text-white">{selectedGoal.timeframe}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Category</div>
                  <div className="text-white capitalize">{selectedGoal.category}</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => adoptGoal(selectedGoal)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Adopt This Goal
              </button>
              <button
                onClick={() => setSelectedGoal(null)}
                className="flex-1 bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}