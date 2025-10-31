'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { PhoenixCard, PhoenixCardHeader, PhoenixCardTitle, PhoenixCardContent } from '@/components/ui/phoenix-card'
import { PhoenixBadge } from '@/components/ui/phoenix-badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, Calendar, Tag, Heart, Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PhoenixButton } from '@/components/ui/phoenix-button'

const COLORS = ['#FF6B35', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#EC4899']

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Session {
  id: string
  created_at: string
  transcript: string
  tags: string[]
  sentiment: {
    overall: string
    emotions: string[]
    intensity: number
    energy: number
  }
  themes: {
    themes: string[]
  }
  insights: string
  coach_response: string
}

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('wisdom_coach_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading sessions:', error)
      } else {
        setSessions(data || [])
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate analytics
  const tagFrequency: Record<string, number> = {}
  const emotionFrequency: Record<string, number> = {}
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 }
  const timelineData: { date: string; sessions: number; avgIntensity: number }[] = []

  sessions.forEach((session) => {
    // Tag frequency
    session.tags?.forEach((tag: string) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
    })

    // Emotion frequency
    session.sentiment?.emotions?.forEach((emotion: string) => {
      emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1
    })

    // Sentiment counts
    const overall = session.sentiment?.overall || 'neutral'
    if (overall in sentimentCounts) {
      sentimentCounts[overall as keyof typeof sentimentCounts]++
    }
  })

  // Top tags chart data
  const tagChartData = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  // Emotion chart data
  const emotionChartData = Object.entries(emotionFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }))

  // Sentiment pie chart data
  const sentimentChartData = Object.entries(sentimentCounts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  // Average intensity and energy
  const avgIntensity = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.sentiment?.intensity || 0), 0) / sessions.length
    : 0

  const avgEnergy = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.sentiment?.energy || 0), 0) / sessions.length
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-phoenix-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your journey...</p>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center space-y-6">
        <PhoenixCard variant="default">
          <PhoenixCardContent className="p-12">
            <Brain className="w-16 h-16 mx-auto text-phoenix-orange mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your Wisdom Journey
            </h2>
            <p className="text-gray-600 mb-6">
              Record your first reflection to see your personalized analytics
            </p>
            <PhoenixButton onClick={() => router.push('/coach')}>
              Record Your First Reflection
            </PhoenixButton>
          </PhoenixCardContent>
        </PhoenixCard>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-phoenix-orange to-phoenix-gold bg-clip-text text-transparent">
          Your Wisdom Journey
        </h1>
        <p className="text-gray-600">
          Insights and patterns from your coaching sessions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PhoenixCard variant="default">
          <PhoenixCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-phoenix-orange" />
            </div>
          </PhoenixCardContent>
        </PhoenixCard>

        <PhoenixCard variant="default">
          <PhoenixCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Themes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Object.keys(tagFrequency).length}
                </p>
              </div>
              <Tag className="w-10 h-10 text-amber-500" />
            </div>
          </PhoenixCardContent>
        </PhoenixCard>

        <PhoenixCard variant="default">
          <PhoenixCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Intensity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {avgIntensity.toFixed(1)}/10
                </p>
              </div>
              <Heart className="w-10 h-10 text-pink-500" />
            </div>
          </PhoenixCardContent>
        </PhoenixCard>

        <PhoenixCard variant="default">
          <PhoenixCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Energy</p>
                <p className="text-3xl font-bold text-gray-900">
                  {avgEnergy.toFixed(1)}/10
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </PhoenixCardContent>
        </PhoenixCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <PhoenixCard variant="default">
          <PhoenixCardHeader>
            <PhoenixCardTitle>Emotional Sentiment</PhoenixCardTitle>
          </PhoenixCardHeader>
          <PhoenixCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {sentimentChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </PhoenixCardContent>
        </PhoenixCard>

        {/* Top Themes */}
        <PhoenixCard variant="default">
          <PhoenixCardHeader>
            <PhoenixCardTitle>Most Common Themes</PhoenixCardTitle>
          </PhoenixCardHeader>
          <PhoenixCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagChartData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FF6B35" />
              </BarChart>
            </ResponsiveContainer>
          </PhoenixCardContent>
        </PhoenixCard>
      </div>

      {/* Emotion Frequency */}
      {emotionChartData.length > 0 && (
        <PhoenixCard variant="default">
          <PhoenixCardHeader>
            <PhoenixCardTitle>Emotion Patterns</PhoenixCardTitle>
          </PhoenixCardHeader>
          <PhoenixCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionChartData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </PhoenixCardContent>
        </PhoenixCard>
      )}

      {/* Session History */}
      <PhoenixCard variant="default">
        <PhoenixCardHeader>
          <PhoenixCardTitle>Recent Reflections</PhoenixCardTitle>
        </PhoenixCardHeader>
        <PhoenixCardContent className="space-y-4">
          {sessions.slice(0, 5).map((session) => (
            <div key={session.id} className="p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-500">
                  {new Date(session.created_at).toLocaleString()}
                </p>
                {session.sentiment?.overall && (
                  <PhoenixBadge variant="default">
                    {session.sentiment.overall}
                  </PhoenixBadge>
                )}
              </div>

              <p className="text-gray-700 line-clamp-2">{session.transcript}</p>

              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {session.tags.slice(0, 5).map((tag, index) => (
                    <PhoenixBadge key={index} variant="default" className="text-xs">
                      {tag}
                    </PhoenixBadge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </PhoenixCardContent>
      </PhoenixCard>

      {/* Back Button */}
      <div className="flex justify-center">
        <PhoenixButton onClick={() => router.push('/coach')} variant="default">
          Record Another Reflection
        </PhoenixButton>
      </div>
    </div>
  )
}
