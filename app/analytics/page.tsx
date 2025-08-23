'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns'

interface AnalyticsData {
  journalStats: {
    totalEntries: number
    last7Days: number
    last30Days: number
    avgLength: number
    moodDistribution: { mood: string; count: number }[]
    entriesByDay: { date: string; count: number }[]
  }
  goalStats: {
    total: number
    completed: number
    inProgress: number
    sprint: number
    completionRate: number
    goalsByMonth: { month: string; created: number; completed: number }[]
  }
  habitStats: {
    active: number
    totalCompletions: number
    avgStreak: number
    topHabits: { name: string; streak: number; completions: number }[]
    completionsByDay: { date: string; count: number }[]
  }
  contributionStats: {
    total: number
    byType: { type: string; count: number }[]
  }
  contactStats: {
    total: number
    withEmail: number
    withPhone: number
    recentInteractions: number
  }
}

const MOOD_COLORS = {
  happy: '#10b981',
  neutral: '#6b7280',
  sad: '#3b82f6',
  excited: '#f59e0b',
  anxious: '#ef4444',
  grateful: '#8b5cf6',
  motivated: '#ec4899'
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/analytics?days=${timeRange}`, {
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">No data available</div>
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
              <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-300">Track your personal growth journey with data insights</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('7')}
                className={`px-4 py-2 rounded-lg ${timeRange === '7' ? 'bg-cyan-500 text-white' : 'bg-white/20 text-white'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30')}
                className={`px-4 py-2 rounded-lg ${timeRange === '30' ? 'bg-cyan-500 text-white' : 'bg-white/20 text-white'}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90')}
                className={`px-4 py-2 rounded-lg ${timeRange === '90' ? 'bg-cyan-500 text-white' : 'bg-white/20 text-white'}`}
              >
                90 Days
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-white">{analytics.journalStats.totalEntries}</div>
            <div className="text-gray-300">Journal Entries</div>
            <div className="text-sm text-cyan-400 mt-2">
              +{analytics.journalStats.last7Days} this week
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-white">
              {Math.round(analytics.goalStats.completionRate)}%
            </div>
            <div className="text-gray-300">Goal Completion</div>
            <div className="text-sm text-green-400 mt-2">
              {analytics.goalStats.completed}/{analytics.goalStats.total} completed
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">💪</div>
            <div className="text-2xl font-bold text-white">{analytics.habitStats.active}</div>
            <div className="text-gray-300">Active Habits</div>
            <div className="text-sm text-purple-400 mt-2">
              ~{Math.round(analytics.habitStats.avgStreak)} day avg streak
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">{analytics.contactStats.total}</div>
            <div className="text-gray-300">Contacts</div>
            <div className="text-sm text-blue-400 mt-2">
              {analytics.contactStats.recentInteractions} recent interactions
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Journal Entries Over Time */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Journal Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.journalStats.entriesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mood Distribution */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Mood Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.journalStats.moodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ mood, percent }) => `${mood} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.journalStats.moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Goals Progress */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Goals Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.goalStats.goalsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend />
                <Bar dataKey="created" fill="#3b82f6" name="Created" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Habit Completions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Habit Tracking</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.habitStats.completionsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Habits */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Top Performing Habits</h2>
          <div className="space-y-3">
            {analytics.habitStats.topHabits.map((habit, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                  </div>
                  <div>
                    <div className="text-white font-medium">{habit.name}</div>
                    <div className="text-gray-400 text-sm">
                      {habit.completions} completions
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{habit.streak}</div>
                  <div className="text-gray-400 text-sm">day streak</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution Types */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Contribution Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.contributionStats.byType.map((contrib) => (
              <div key={contrib.type} className="text-center">
                <div className="text-3xl font-bold text-white">{contrib.count}</div>
                <div className="text-gray-300 capitalize">{contrib.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}