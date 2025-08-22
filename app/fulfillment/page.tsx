'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LifeArea {
  id: number
  name: string
  icon: string
  status: 'thriving' | 'attention' | 'collapse'
  attention?: number
  notes?: string
}

const lifeAreas: LifeArea[] = [
  { id: 1, name: 'Work & Career', icon: '💼', status: 'thriving' },
  { id: 2, name: 'Money & Finance', icon: '💰', status: 'attention' },
  { id: 3, name: 'Health & Fitness', icon: '💪', status: 'thriving' },
  { id: 4, name: 'Intimacy & Love', icon: '❤️', status: 'thriving' },
  { id: 5, name: 'Family & Friends', icon: '👨‍👩‍👧‍👦', status: 'attention' },
  { id: 6, name: 'Personal Growth', icon: '🌱', status: 'thriving' },
  { id: 7, name: 'Fun & Recreation', icon: '🎮', status: 'attention' },
  { id: 8, name: 'Physical Environment', icon: '🏡', status: 'thriving' },
  { id: 9, name: 'Creativity', icon: '🎨', status: 'thriving' },
  { id: 10, name: 'Community & Service', icon: '🤝', status: 'attention' },
  { id: 11, name: 'Learning & Education', icon: '📚', status: 'thriving' },
  { id: 12, name: 'Spirituality', icon: '🙏', status: 'collapse' }
]

export default function FulfillmentPage() {
  const router = useRouter()
  const [areas, setAreas] = useState<LifeArea[]>(lifeAreas)
  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        console.log('Not authenticated')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'thriving':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'collapse':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'thriving':
        return '✨'
      case 'attention':
        return '⚠️'
      case 'collapse':
        return '🆘'
      default:
        return '❓'
    }
  }

  const updateAreaStatus = (areaId: number, newStatus: 'thriving' | 'attention' | 'collapse') => {
    setAreas(areas.map(area => 
      area.id === areaId ? { ...area, status: newStatus } : area
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Life Fulfillment Areas</h1>
          <p className="text-gray-600">Track and balance all areas of your life</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {areas.filter(a => a.status === 'thriving').length}
            </div>
            <div className="text-green-600">Thriving Areas</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {areas.filter(a => a.status === 'attention').length}
            </div>
            <div className="text-yellow-600">Need Attention</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {areas.filter(a => a.status === 'collapse').length}
            </div>
            <div className="text-red-600">Critical Areas</div>
          </div>
        </div>

        {/* Life Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedArea(area)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{area.icon}</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(area.status)}`}>
                  {getStatusEmoji(area.status)} {area.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{area.name}</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateAreaStatus(area.id, 'thriving')
                    }}
                    className={`flex-1 py-1 px-2 rounded text-xs ${
                      area.status === 'thriving' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                    }`}
                  >
                    Thriving
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateAreaStatus(area.id, 'attention')
                    }}
                    className={`flex-1 py-1 px-2 rounded text-xs ${
                      area.status === 'attention' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
                    }`}
                  >
                    Attention
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateAreaStatus(area.id, 'collapse')
                    }}
                    className={`flex-1 py-1 px-2 rounded text-xs ${
                      area.status === 'collapse' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                    }`}
                  >
                    Collapse
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Area Modal */}
        {selectedArea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedArea.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedArea.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      updateAreaStatus(selectedArea.id, 'thriving')
                      setSelectedArea({ ...selectedArea, status: 'thriving' })
                    }}
                    className={`flex-1 py-2 px-3 rounded ${
                      selectedArea.status === 'thriving' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                    }`}
                  >
                    ✨ Thriving
                  </button>
                  <button
                    onClick={() => {
                      updateAreaStatus(selectedArea.id, 'attention')
                      setSelectedArea({ ...selectedArea, status: 'attention' })
                    }}
                    className={`flex-1 py-2 px-3 rounded ${
                      selectedArea.status === 'attention' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'
                    }`}
                  >
                    ⚠️ Attention
                  </button>
                  <button
                    onClick={() => {
                      updateAreaStatus(selectedArea.id, 'collapse')
                      setSelectedArea({ ...selectedArea, status: 'collapse' })
                    }}
                    className={`flex-1 py-2 px-3 rounded ${
                      selectedArea.status === 'collapse' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                    }`}
                  >
                    🆘 Collapse
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Add notes about this life area..."
                  defaultValue={selectedArea.notes}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Attention Level</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  defaultValue={selectedArea.attention || 5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedArea(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Save changes
                    setSelectedArea(null)
                  }}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fulfillment Wheel Preview */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Life Balance Wheel</h2>
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                <circle cx="100" cy="100" r="30" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                {areas.map((area, index) => {
                  const angle = (index * 30) - 90
                  const radian = (angle * Math.PI) / 180
                  const radius = area.status === 'thriving' ? 80 : area.status === 'attention' ? 50 : 20
                  const x = 100 + radius * Math.cos(radian)
                  const y = 100 + radius * Math.sin(radian)
                  return (
                    <circle
                      key={area.id}
                      cx={x}
                      cy={y}
                      r="8"
                      fill={area.status === 'thriving' ? '#10b981' : area.status === 'attention' ? '#f59e0b' : '#ef4444'}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedArea(area)}
                    />
                  )
                })}
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Thriving</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Needs Attention</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}