'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Insight {
  type: string
  title: string
  description: string
  recommendation: string
}

export default function InsightsPage() {
  const router = useRouter()
  const [insights, setInsights] = useState<Insight[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      mood_pattern: '😊',
      frequency: '📊',
      themes: '🏷️',
      time_pattern: '⏰',
      goals: '🎯',
      habits: '💪',
      growth: '🌱'
    }
    return icons[type] || '💡'
  }

  const getInsightColor = (type: string) => {
    const colors: { [key: string]: string } = {
      mood_pattern: 'from-purple-500 to-pink-600',
      frequency: 'from-blue-500 to-indigo-600',
      themes: 'from-green-500 to-teal-600',
      time_pattern: 'from-yellow-500 to-orange-600',
      goals: 'from-red-500 to-pink-600',
      habits: 'from-cyan-500 to-blue-600'
    }
    return colors[type] || 'from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Analyzing your patterns...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">AI Insights</h1>
              <p className="text-gray-300">Personalized patterns and recommendations from your data</p>
            </div>
            <button
              onClick={fetchInsights}
              className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Analysis Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-cyan-400">{summary.totalEntries}</div>
                <div className="text-sm text-gray-300">Entries Analyzed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{summary.timeSpan}</div>
                <div className="text-sm text-gray-300">Time Period</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(summary.averageLength)} chars
                </div>
                <div className="text-sm text-gray-300">Avg Entry Length</div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all"
            >
              <div className={`h-2 bg-gradient-to-r ${getInsightColor(insight.type)}`} />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{insight.title}</h3>
                    <p className="text-gray-300 mb-4">{insight.description}</p>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-sm text-cyan-300">
                        💡 {insight.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {insights.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Insights Yet</h3>
            <p className="text-gray-300">Keep journaling and tracking your habits to generate insights!</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-8 border border-indigo-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Take Action</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/journal')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600"
            >
              📝 Journal Now
            </button>
            <button
              onClick={() => router.push('/goals')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600"
            >
              🎯 Review Goals
            </button>
            <button
              onClick={() => router.push('/habits')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-600"
            >
              💪 Check Habits
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}