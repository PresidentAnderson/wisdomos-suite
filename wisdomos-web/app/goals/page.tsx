'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Goal {
  id: string
  title: string
  description?: string
  importance?: string
  isSprint: boolean
  isCompleted: boolean
  dueDate?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAdding, setIsAdding] = useState(false)
  // const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sprint' | 'active' | 'completed'>('all')
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    importance: '',
    isSprint: false,
    dueDate: '',
    tags: ''
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchGoals()
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
    }
  }

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token')
      let url = '/api/goals'
      
      if (filter === 'sprint') {
        url += '?sprint=true'
      } else if (filter === 'active') {
        url += '?completed=false'
      } else if (filter === 'completed') {
        url += '?completed=true'
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const tagsArray = newGoal.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      const goalData = {
        ...newGoal,
        tags: tagsArray,
        dueDate: newGoal.dueDate || undefined
      }
      
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalData)
      })
      
      if (response.ok) {
        setNewGoal({
          title: '',
          description: '',
          importance: '',
          isSprint: false,
          dueDate: '',
          tags: ''
        })
        setIsAdding(false)
        fetchGoals()
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleUpdate = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        fetchGoals()
        // setEditingGoal(null)
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const toggleComplete = (goalId: string, currentStatus: boolean) => {
    handleUpdate(goalId, { isCompleted: !currentStatus })
  }

  const filteredGoals = goals.filter(goal => {
    switch (filter) {
      case 'sprint':
        return goal.isSprint
      case 'active':
        return !goal.isCompleted
      case 'completed':
        return goal.isCompleted
      default:
        return true
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link>
              <Link href="/goals" className="text-cyan-400">Goals</Link>
              <Link href="/contributions" className="text-white/70 hover:text-white">Contributions</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/assessments" className="text-white/70 hover:text-white">Assessments</Link>
              <Link href="/settings" className="text-white/70 hover:text-white">Settings</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Goals</h1>
            <p className="text-gray-300">Organize your aspirations and track your progress</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            Add Goal
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'all', label: 'All Goals', count: goals.length },
            { key: 'sprint', label: 'Sprint Goals', count: goals.filter(g => g.isSprint).length },
            { key: 'active', label: 'Active', count: goals.filter(g => !g.isCompleted).length },
            { key: 'completed', label: 'Completed', count: goals.filter(g => g.isCompleted).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'sprint' | 'active' | 'completed')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === tab.key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Add Goal Form */}
        {isAdding && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Add New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                    placeholder="Enter goal title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                    className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white h-24"
                  placeholder="Describe your goal"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Why is this important to you?</label>
                <textarea
                  value={newGoal.importance}
                  onChange={(e) => setNewGoal({ ...newGoal, importance: e.target.value })}
                  className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white h-24"
                  placeholder="Explain the significance and meaning behind this goal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newGoal.tags}
                    onChange={(e) => setNewGoal({ ...newGoal, tags: e.target.value })}
                    className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                    placeholder="health, career, personal"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center text-gray-300">
                    <input
                      type="checkbox"
                      checked={newGoal.isSprint}
                      onChange={(e) => setNewGoal({ ...newGoal, isSprint: e.target.checked })}
                      className="mr-2 rounded"
                    />
                    Priority Sprint Goal
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="text-white text-center py-8">Loading goals...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all hover:bg-white/15 ${
                  goal.isCompleted ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleComplete(goal.id, goal.isCompleted)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        goal.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-white/40 hover:border-white/70'
                      }`}
                    >
                      {goal.isCompleted && '✓'}
                    </button>
                    {goal.isSprint && (
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                        SPRINT
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <h3 className={`text-xl font-semibold mb-3 ${goal.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-gray-300 mb-3 text-sm">{goal.description}</p>
                )}

                {goal.importance && (
                  <div className="mb-3">
                    <p className="text-cyan-400 text-xs font-semibold mb-1">Why it matters:</p>
                    <p className="text-gray-300 text-sm italic">{goal.importance}</p>
                  </div>
                )}

                {goal.dueDate && (
                  <p className="text-yellow-400 text-sm mb-3">
                    Due: {new Date(goal.dueDate).toLocaleDateString()}
                  </p>
                )}

                {goal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {goal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-500/30 text-purple-200 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredGoals.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No goals yet</h2>
            <p className="text-gray-300 mb-6">
              {filter === 'all' 
                ? 'Start by creating your first goal to track your aspirations and progress.'
                : `No ${filter} goals found. Try changing your filter or add some goals.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setIsAdding(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Create Your First Goal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}