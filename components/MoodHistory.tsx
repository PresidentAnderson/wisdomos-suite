'use client'

import { useState, useEffect } from 'react'

interface MoodEntry {
  id: string
  mood: string
  createdAt: string
}

const moodEmojis: { [key: string]: string } = {
  happy: '😊',
  sad: '😔',
  angry: '😡',
  anxious: '😰',
  calm: '😌',
  tired: '😴',
  grateful: '🤗',
  confident: '😎',
  thoughtful: '🤔',
  stressed: '😅',
  loved: '🥰',
  motivated: '💪'
}

const moodColors: { [key: string]: string } = {
  happy: 'bg-yellow-500',
  sad: 'bg-blue-500',
  angry: 'bg-red-500',
  anxious: 'bg-purple-500',
  calm: 'bg-green-500',
  tired: 'bg-gray-500',
  grateful: 'bg-pink-500',
  confident: 'bg-indigo-500',
  thoughtful: 'bg-cyan-500',
  stressed: 'bg-orange-500',
  loved: 'bg-rose-500',
  motivated: 'bg-emerald-500'
}

export default function MoodHistory() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    fetchMoodHistory()
  }, [timeRange])

  const fetchMoodHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/journal?type=reflection&mood=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Filter entries with mood and sort by date
        const moodData = data
          .filter((entry: any) => entry.mood)
          .slice(0, 30) // Last 30 mood entries
          .map((entry: any) => ({
            id: entry.id,
            mood: entry.mood,
            createdAt: entry.createdAt
          }))
        
        setMoodEntries(moodData)
      }
    } catch (error) {
      console.error('Error fetching mood history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return 'neutral'
    
    const positiveMoods = ['happy', 'calm', 'grateful', 'confident', 'loved', 'motivated']
    const recentMoods = moodEntries.slice(0, 5)
    const positiveCount = recentMoods.filter(e => positiveMoods.includes(e.mood)).length
    
    if (positiveCount >= 4) return 'improving'
    if (positiveCount <= 1) return 'declining'
    return 'stable'
  }

  const getMoodFrequency = () => {
    const frequency: { [key: string]: number } = {}
    moodEntries.forEach(entry => {
      frequency[entry.mood] = (frequency[entry.mood] || 0) + 1
    })
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }

  const trend = getMoodTrend()
  const topMoods = getMoodFrequency()

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-white/20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Mood History</h3>
        <div className="flex gap-1">
          {['day', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range as 'day' | 'week' | 'month')}
              className={`px-2 py-1 text-xs rounded capitalize ${
                timeRange === range 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Timeline */}
      <div className="mb-4">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {moodEntries.slice(0, 14).map((entry, index) => {
            const date = new Date(entry.createdAt)
            const isToday = new Date().toDateString() === date.toDateString()
            
            return (
              <div
                key={entry.id}
                className="flex flex-col items-center min-w-[40px]"
                title={`${moodEmojis[entry.mood]} on ${date.toLocaleDateString()}`}
              >
                <div className={`text-xl mb-1 ${isToday ? 'ring-2 ring-cyan-400 rounded-full' : ''}`}>
                  {moodEmojis[entry.mood] || '😐'}
                </div>
                <div className="text-xs text-gray-400">
                  {date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                </div>
                <div className={`w-full h-1 rounded-full mt-1 ${moodColors[entry.mood] || 'bg-gray-500'} opacity-50`} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Mood Trend Indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-300">Trend</span>
        <div className="flex items-center gap-2">
          {trend === 'improving' && (
            <>
              <span className="text-green-400">↗️ Improving</span>
              <span className="text-xs text-gray-400">Keep it up!</span>
            </>
          )}
          {trend === 'declining' && (
            <>
              <span className="text-orange-400">↘️ Declining</span>
              <span className="text-xs text-gray-400">Take care</span>
            </>
          )}
          {trend === 'stable' && (
            <>
              <span className="text-cyan-400">→ Stable</span>
              <span className="text-xs text-gray-400">Consistent</span>
            </>
          )}
        </div>
      </div>

      {/* Top Moods */}
      {topMoods.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Most frequent moods</p>
          <div className="flex flex-wrap gap-2">
            {topMoods.map(([mood, count]) => (
              <div
                key={mood}
                className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full"
              >
                <span>{moodEmojis[mood]}</span>
                <span className="text-xs text-gray-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {moodEntries.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">No mood data yet</p>
          <p className="text-gray-500 text-xs mt-1">Start tracking your moods above!</p>
        </div>
      )}
    </div>
  )
}