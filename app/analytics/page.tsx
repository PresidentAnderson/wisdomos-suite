'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Analytics {
  journalStats: {
    total: number
    thisWeek: number
    thisMonth: number
    byMood: { mood: string; count: number }[]
    byType: { type: string; count: number }[]
  }
  goalStats: {
    total: number
    completed: number
    sprint: number
    completionRate: number
  }
  contactStats: {
    total: number
    withEmail: number
    withPhone: number
    recentlyAdded: number
  }
  activityStats: {
    streakDays: number
    totalDays: number
    mostActiveDay: string
    lastActive: string
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    )
  }

  // Mock data for visualization
  const mockAnalytics: Analytics = analytics || {
    journalStats: {
      total: 42,
      thisWeek: 7,
      thisMonth: 28,
      byMood: [
        { mood: 'grateful', count: 12 },
        { mood: 'happy', count: 8 },
        { mood: 'inspired', count: 6 },
        { mood: 'peaceful', count: 5 },
        { mood: 'thoughtful', count: 11 }
      ],
      byType: [
        { type: 'journal', count: 25 },
        { type: 'voice', count: 10 },
        { type: 'reflection', count: 7 }
      ]
    },
    goalStats: {
      total: 15,
      completed: 8,
      sprint: 3,
      completionRate: 53.3
    },
    contactStats: {
      total: 45,
      withEmail: 38,
      withPhone: 25,
      recentlyAdded: 5
    },
    activityStats: {
      streakDays: 12,
      totalDays: 45,
      mostActiveDay: 'Monday',
      lastActive: 'Today'
    }
  }

  const data = mockAnalytics

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
              <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
              <p className="text-gray-300">Track your growth and progress</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg border border-white/30"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30">
            <div className="text-4xl font-bold text-white mb-2">{data.activityStats.streakDays}</div>
            <div className="text-cyan-300 text-sm">Day Streak 🔥</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
            <div className="text-4xl font-bold text-white mb-2">{data.activityStats.totalDays}</div>
            <div className="text-green-300 text-sm">Active Days</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="text-4xl font-bold text-white mb-2">{data.journalStats.total}</div>
            <div className="text-purple-300 text-sm">Journal Entries</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
            <div className="text-4xl font-bold text-white mb-2">{data.goalStats.completionRate}%</div>
            <div className="text-yellow-300 text-sm">Goals Complete</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Journal Mood Distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Journal Mood Distribution</h2>
            <div className="space-y-3">
              {data.journalStats.byMood.map((item) => {
                const percentage = (item.count / data.journalStats.total) * 100
                return (
                  <div key={item.mood}>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="capitalize">{item.mood}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Goals Progress</h2>
            <div className="flex justify-center items-center h-48">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - data.goalStats.completionRate / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-white">{data.goalStats.completed}</div>
                  <div className="text-sm text-gray-300">of {data.goalStats.total}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{data.goalStats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{data.goalStats.completed}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{data.goalStats.sprint}</div>
                <div className="text-xs text-gray-400">Sprint</div>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {data.journalStats.byType.map((item) => (
            <div key={item.type} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white capitalize">{item.type}</h3>
                <span className="text-2xl">
                  {item.type === 'journal' ? '📝' : item.type === 'voice' ? '🎙️' : '💭'}
                </span>
              </div>
              <div className="text-3xl font-bold text-cyan-400">{item.count}</div>
              <div className="text-sm text-gray-400">entries</div>
            </div>
          ))}
        </div>

        {/* Export Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Export Your Data</h2>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/api/export?format=json'}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600"
            >
              Export as JSON
            </button>
            <button
              onClick={() => window.location.href = '/api/export?format=csv'}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600"
            >
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}