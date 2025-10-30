/**
 * Area Sessions Widget
 *
 * Displays recent coach sessions for a specific life area
 * Shows mode, score, and date for quick insights
 */

'use client'

import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import { PhoenixCard, PhoenixCardHeader, PhoenixCardTitle, PhoenixCardContent } from '@/components/ui/phoenix-card'
import { PhoenixBadge } from '@/components/ui/phoenix-badge'
import { createClient } from '@/lib/supabase/client'

interface AreaSession {
  id: string
  created_at: string
  life_area_id: string
  area_score: number
  coach_mode: 'restoration' | 'play' | 'unknown'
  transcript: string
}

interface AreaSessionsWidgetProps {
  lifeAreaId: string
  areaName: string
  userId: string
  limit?: number
}

export function AreaSessionsWidget({
  lifeAreaId,
  areaName,
  userId,
  limit = 3,
}: AreaSessionsWidgetProps) {
  const [sessions, setSessions] = useState<AreaSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [lifeAreaId, userId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('wisdom_coach_sessions')
        .select('id, created_at, life_area_id, area_score, coach_mode, transcript')
        .eq('user_id', userId)
        .eq('life_area_id', lifeAreaId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      setSessions(data || [])
    } catch (err) {
      console.error('Error fetching area sessions:', err)
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PhoenixCard variant="default" className="animate-pulse">
        <PhoenixCardHeader>
          <PhoenixCardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Recent Sessions
          </PhoenixCardTitle>
        </PhoenixCardHeader>
        <PhoenixCardContent>
          <div className="space-y-2">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </PhoenixCardContent>
      </PhoenixCard>
    )
  }

  if (error) {
    return (
      <PhoenixCard variant="ash">
        <PhoenixCardContent className="p-4">
          <p className="text-sm text-gray-600">{error}</p>
        </PhoenixCardContent>
      </PhoenixCard>
    )
  }

  if (sessions.length === 0) {
    return (
      <PhoenixCard variant="default">
        <PhoenixCardHeader>
          <PhoenixCardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-phoenix-orange" />
            Recent Sessions - {areaName}
          </PhoenixCardTitle>
        </PhoenixCardHeader>
        <PhoenixCardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No coach sessions yet for this area.
          </p>
        </PhoenixCardContent>
      </PhoenixCard>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'restoration':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'play':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-red-600'
    if (score < 40) return 'text-yellow-600'
    if (score < 70) return 'text-blue-600'
    return 'text-green-600'
  }

  return (
    <PhoenixCard variant="default">
      <PhoenixCardHeader>
        <PhoenixCardTitle className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-phoenix-orange" />
          Recent Sessions - {areaName}
        </PhoenixCardTitle>
      </PhoenixCardHeader>
      <PhoenixCardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200 hover:border-phoenix-orange/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Transcript preview */}
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {session.transcript || 'No transcript available'}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Mode badge */}
                    <span
                      className={`px-2 py-1 rounded-full font-medium border ${getModeColor(
                        session.coach_mode
                      )}`}
                    >
                      {session.coach_mode}
                    </span>

                    {/* Score */}
                    <span className={`font-mono font-semibold ${getScoreColor(session.area_score)}`}>
                      {session.area_score}/100
                    </span>

                    {/* Date */}
                    <span className="text-gray-500">{formatDate(session.created_at)}</span>
                  </div>
                </div>

                {/* Score indicator icon */}
                <div className="flex-shrink-0">
                  {session.area_score >= 70 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : session.area_score < 40 ? (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PhoenixCardContent>
    </PhoenixCard>
  )
}
