'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Habit {
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  targetCount: number
  currentStreak: number
  bestStreak: number
  completedDates: string[]
  color: string
  icon: string
  createdAt: string
}

export default function HabitsPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [targetCount, setTargetCount] = useState(1)
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('blue')

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/habits', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveHabit = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          frequency,
          targetCount,
          icon,
          color
        })
      })
      
      if (response.ok) {
        const newHabit = await response.json()
        setHabits([...habits, newHabit])
        setShowAddHabit(false)
        // Reset form
        setName('')
        setDescription('')
        setFrequency('daily')
        setTargetCount(1)
        setIcon('🎯')
        setColor('blue')
      }
    } catch (error) {
      console.error('Error saving habit:', error)
    }
  }

  const toggleHabitCompletion = async (habitId: string) => {
    try {
      const token = localStorage.getItem('token')
      const today = new Date().toISOString().split('T')[0]
      
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: today })
      })
      
      if (response.ok) {
        const updatedHabit = await response.json()
        setHabits(habits.map(h => h.id === habitId ? updatedHabit : h))
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0]
    return habit.completedDates?.includes(today)
  }

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return ''
    if (streak < 7) return '🔥'
    if (streak < 30) return '🔥🔥'
    if (streak < 100) return '🔥🔥🔥'
    return '🏆'
  }

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'from-blue-500 to-indigo-600',
      green: 'from-green-500 to-emerald-600',
      purple: 'from-purple-500 to-pink-600',
      yellow: 'from-yellow-500 to-orange-600',
      red: 'from-red-500 to-pink-600',
      cyan: 'from-cyan-500 to-teal-600'
    }
    return colors[color] || colors.blue
  }

  // Mock data for demonstration
  const mockHabits: Habit[] = habits.length === 0 && !loading ? [
    {
      id: '1',
      name: 'Morning Meditation',
      description: '10 minutes of mindfulness',
      frequency: 'daily',
      targetCount: 1,
      currentStreak: 12,
      bestStreak: 45,
      completedDates: [new Date().toISOString().split('T')[0]],
      color: 'purple',
      icon: '🧘',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Exercise',
      description: '30 minutes workout',
      frequency: 'daily',
      targetCount: 1,
      currentStreak: 5,
      bestStreak: 30,
      completedDates: [],
      color: 'green',
      icon: '💪',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Read',
      description: 'Read for 20 minutes',
      frequency: 'daily',
      targetCount: 1,
      currentStreak: 8,
      bestStreak: 60,
      completedDates: [new Date().toISOString().split('T')[0]],
      color: 'blue',
      icon: '📚',
      createdAt: new Date().toISOString()
    }
  ] : habits

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading habits...</div>
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
              <h1 className="text-4xl font-bold text-white mb-2">Habit Tracker</h1>
              <p className="text-gray-300">Build consistency, track progress</p>
            </div>
            <button
              onClick={() => setShowAddHabit(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              ➕ New Habit
            </button>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Today's Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {mockHabits.filter(h => isCompletedToday(h)).length}/{mockHabits.length}
              </div>
              <div className="text-sm text-gray-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {Math.max(...mockHabits.map(h => h.currentStreak), 0)}
              </div>
              <div className="text-sm text-gray-300">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {mockHabits.filter(h => h.currentStreak > 0).length}
              </div>
              <div className="text-sm text-gray-300">Active Streaks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {mockHabits.reduce((sum, h) => sum + (isCompletedToday(h) ? 1 : 0), 0) * 10}
              </div>
              <div className="text-sm text-gray-300">Points Today</div>
            </div>
          </div>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockHabits.map((habit) => {
            const completed = isCompletedToday(habit)
            return (
              <div
                key={habit.id}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border transition-all ${
                  completed ? 'border-green-500/50 bg-green-500/10' : 'border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{habit.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-gray-300">{habit.description}</p>
                      )}
                    </div>
                  </div>
                  {habit.currentStreak > 0 && (
                    <div className="text-right">
                      <div className="text-2xl">{getStreakEmoji(habit.currentStreak)}</div>
                      <div className="text-sm text-gray-300">{habit.currentStreak} days</div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getColorClasses(habit.color)} h-2 rounded-full transition-all`}
                      style={{ width: `${(habit.currentStreak / habit.bestStreak) * 100}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Best: {habit.bestStreak} days</span>
                    <span className="text-gray-400 capitalize">{habit.frequency}</span>
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={`w-full py-3 rounded-lg transition-all font-semibold ${
                      completed
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {completed ? '✓ Completed Today' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Habit Modal */}
        {showAddHabit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Create New Habit</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Morning Meditation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="10 minutes of mindfulness"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="🎯">🎯 Target</option>
                      <option value="💪">💪 Exercise</option>
                      <option value="🧘">🧘 Meditation</option>
                      <option value="📚">📚 Reading</option>
                      <option value="✍️">✍️ Writing</option>
                      <option value="🎨">🎨 Creative</option>
                      <option value="💧">💧 Water</option>
                      <option value="🥗">🥗 Healthy Eating</option>
                      <option value="😴">😴 Sleep</option>
                      <option value="🚶">🚶 Walking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                  <div className="flex gap-2">
                    {['blue', 'green', 'purple', 'yellow', 'red', 'cyan'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getColorClasses(c)} ${
                          color === c ? 'ring-2 ring-white' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddHabit(false)}
                  className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveHabit}
                  disabled={!name}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                >
                  Create Habit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}