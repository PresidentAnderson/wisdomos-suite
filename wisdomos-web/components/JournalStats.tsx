'use client'

import { useState, useEffect } from 'react'

interface JournalStats {
  totalEntries: number
  currentStreak: number
  longestStreak: number
  totalWords: number
  averageWords: number
  favoriteTime: string
  moodDistribution: { mood: string; count: number; emoji: string }[]
  topTags: { tag: string; count: number }[]
  entriesByMonth: { month: string; count: number }[]
  writingGoal: number
  goalProgress: number
}

interface JournalStatsProps {
  userId?: string
}

export default function JournalStats({ userId }: JournalStatsProps) {
  const [stats, setStats] = useState<JournalStats>({
    totalEntries: 47,
    currentStreak: 5,
    longestStreak: 12,
    totalWords: 15234,
    averageWords: 324,
    favoriteTime: 'Morning (8-10 AM)',
    moodDistribution: [
      { mood: 'happy', count: 15, emoji: '😊' },
      { mood: 'grateful', count: 12, emoji: '🙏' },
      { mood: 'thoughtful', count: 10, emoji: '🤔' },
      { mood: 'calm', count: 8, emoji: '😌' },
      { mood: 'motivated', count: 2, emoji: '💪' }
    ],
    topTags: [
      { tag: 'personal-growth', count: 23 },
      { tag: 'reflection', count: 18 },
      { tag: 'gratitude', count: 15 },
      { tag: 'goals', count: 12 },
      { tag: 'relationships', count: 9 }
    ],
    entriesByMonth: [
      { month: 'Jan', count: 8 },
      { month: 'Feb', count: 12 },
      { month: 'Mar', count: 10 },
      { month: 'Apr', count: 7 },
      { month: 'May', count: 10 }
    ],
    writingGoal: 30,
    goalProgress: 17
  })
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')
  
  useEffect(() => {
    // Fetch real stats from API
    fetchStats()
  }, [selectedPeriod])
  
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/journal/stats?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update with real data when available
      }
    } catch (error) {
      console.error('Failed to fetch journal stats:', error)
    }
  }
  
  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '❄️'
    if (streak < 3) return '🔥'
    if (streak < 7) return '🔥🔥'
    if (streak < 30) return '🔥🔥🔥'
    return '🏆'
  }
  
  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Journal Statistics</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors
                ${selectedPeriod === period 
                  ? 'bg-cyan-500 text-black' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              {period === 'all' ? 'All Time' : period}
            </button>
          ))}
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-black">{stats.totalEntries}</div>
          <div className="text-gray-600 text-sm">Total Entries</div>
        </div>
        
        <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
          <div className="text-3xl mb-2">{getStreakEmoji(stats.currentStreak)}</div>
          <div className="text-2xl font-bold text-black">{stats.currentStreak} days</div>
          <div className="text-gray-600 text-sm">Current Streak</div>
        </div>
        
        <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-black">{stats.averageWords}</div>
          <div className="text-gray-600 text-sm">Avg Words/Entry</div>
        </div>
        
        <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
          <div className="text-3xl mb-2">⏰</div>
          <div className="text-lg font-bold text-black">{stats.favoriteTime}</div>
          <div className="text-gray-600 text-sm">Favorite Time</div>
        </div>
      </div>
      
      {/* Writing Goal Progress */}
      <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-black font-semibold">Monthly Writing Goal</h3>
          <span className="text-cyan-400">{stats.goalProgress}/{stats.writingGoal} entries</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(100, (stats.goalProgress / stats.writingGoal) * 100)}%` }}
          />
        </div>
        <p className="text-gray-600 text-sm mt-2">
          {stats.writingGoal - stats.goalProgress > 0 
            ? `${stats.writingGoal - stats.goalProgress} entries to reach your goal!`
            : '🎉 Goal achieved!'}
        </p>
      </div>
      
      {/* Mood Distribution */}
      <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
        <h3 className="text-black font-semibold mb-4">Mood Patterns</h3>
        <div className="space-y-2">
          {stats.moodDistribution.map(mood => (
            <div key={mood.mood} className="flex items-center gap-3">
              <span className="text-2xl">{mood.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700 capitalize">{mood.mood}</span>
                  <span className="text-gray-600 text-sm">{mood.count} entries</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${(mood.count / stats.totalEntries) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Tags */}
      <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
        <h3 className="text-black font-semibold mb-4">Top Topics</h3>
        <div className="flex flex-wrap gap-2">
          {stats.topTags.map(tag => (
            <span 
              key={tag.tag}
              className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1"
            >
              #{tag.tag}
              <span className="text-xs text-gray-700">({tag.count})</span>
            </span>
          ))}
        </div>
      </div>
      
      {/* Writing Activity Chart */}
      <div className="bg-white backdrop-blur-lg rounded-xl p-4 border border-gray-200">
        <h3 className="text-black font-semibold mb-4">Writing Activity</h3>
        <div className="flex items-end gap-2 h-32">
          {stats.entriesByMonth.map(month => (
            <div key={month.month} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                style={{ height: `${(month.count / Math.max(...stats.entriesByMonth.map(m => m.count))) * 100}%` }}
              />
              <span className="text-xs text-gray-600 mt-1">{month.month}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Achievements */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30">
        <h3 className="text-black font-semibold mb-4">Recent Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-3xl mb-1">🌟</div>
            <p className="text-xs text-gray-700">First Entry</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🔥</div>
            <p className="text-xs text-gray-700">7-Day Streak</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">📚</div>
            <p className="text-xs text-gray-700">25 Entries</p>
          </div>
          <div className="text-center opacity-50">
            <div className="text-3xl mb-1">🏆</div>
            <p className="text-xs text-gray-600">30-Day Streak</p>
          </div>
        </div>
      </div>
    </div>
  )
}