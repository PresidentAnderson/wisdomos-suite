'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BoundaryStatus {
  id: string
  lifeArea: string
  status: 'healthy' | 'warning' | 'toxic'
  lastReset: string
}

const lifeAreas = [
  { name: 'Work & Purpose', icon: '💼', healthy: 'Clear deliverables, integrity', toxic: 'Emotional labor for unreliable people' },
  { name: 'Health', icon: '❤️', healthy: 'Mutual accountability, recovery', toxic: 'Ignoring body signals' },
  { name: 'Finance', icon: '💰', healthy: 'Transparent records, aligned earnings', toxic: 'Disorganized accounts, passive leaks' },
  { name: 'Intimacy & Love', icon: '💕', healthy: 'Presence, honesty, freedom', toxic: 'Guilt manipulation, passive-aggression' },
  { name: 'Time & Energy', icon: '⏰', healthy: 'Protected focus blocks', toxic: 'Double-booking, chronic interruption' },
  { name: 'Spiritual Alignment', icon: '✨', healthy: 'Sacred silence, inner guidance', toxic: 'Forcing clarity, dismissing intuition' },
  { name: 'Creativity', icon: '🎨', healthy: 'Expression without pressure', toxic: 'Creation only on demand' },
  { name: 'Community', icon: '👥', healthy: 'Non-transactional love', toxic: 'One-sided venting, exploitation' },
  { name: 'Learning', icon: '📚', healthy: 'Staying teachable, curious', toxic: 'Rigidity, shutting down inquiry' },
  { name: 'Home', icon: '🏡', healthy: 'Organized, inspiring space', toxic: 'Chaos, energy-draining mess' },
  { name: 'Sexuality', icon: '🔥', healthy: 'Honoring erotic self', toxic: 'Shame, avoidance, manipulation' },
  { name: 'Emotional', icon: '🧘', healthy: 'Validation, reparenting', toxic: 'Collapse, self-abandonment' },
  { name: 'Legacy', icon: '📜', healthy: 'Organized systems', toxic: 'Secrecy, accidental erasure' }
]

export default function AssessmentsPage() {
  const [boundaries, setBoundaries] = useState<BoundaryStatus[]>([])
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize boundaries from localStorage or API
    const stored = localStorage.getItem('boundaries')
    if (stored) {
      setBoundaries(JSON.parse(stored))
    } else {
      // Initialize with default values
      const initial = lifeAreas.map(area => ({
        id: area.name.toLowerCase().replace(/\s+/g, '-'),
        lifeArea: area.name,
        status: 'healthy' as const,
        lastReset: new Date().toISOString()
      }))
      setBoundaries(initial)
      localStorage.setItem('boundaries', JSON.stringify(initial))
    }
    setLoading(false)
  }, [])

  const updateBoundaryStatus = (areaName: string, status: 'healthy' | 'warning' | 'toxic') => {
    const updated = boundaries.map(b => 
      b.lifeArea === areaName ? { ...b, status } : b
    )
    setBoundaries(updated)
    localStorage.setItem('boundaries', JSON.stringify(updated))
  }

  const resetAllBoundaries = () => {
    const reset = boundaries.map(b => ({
      ...b,
      status: 'healthy' as const,
      lastReset: new Date().toISOString()
    }))
    setBoundaries(reset)
    localStorage.setItem('boundaries', JSON.stringify(reset))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'from-green-500 to-emerald-500'
      case 'warning': return 'from-yellow-500 to-orange-500'
      case 'toxic': return 'from-red-500 to-rose-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getRadarData = () => {
    const centerX = 200
    const centerY = 200
    const radius = 150
    const angleStep = (2 * Math.PI) / lifeAreas.length

    return lifeAreas.map((area, index) => {
      const boundary = boundaries.find(b => b.lifeArea === area.name)
      const value = boundary?.status === 'healthy' ? 100 : 
                   boundary?.status === 'warning' ? 50 : 20
      
      const angle = index * angleStep - Math.PI / 2
      const x = centerX + (radius * value / 100) * Math.cos(angle)
      const y = centerY + (radius * value / 100) * Math.sin(angle)
      const labelX = centerX + (radius + 30) * Math.cos(angle)
      const labelY = centerY + (radius + 30) * Math.sin(angle)

      return { area, x, y, labelX, labelY, value, angle }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const radarPoints = getRadarData()
  const pathData = radarPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link>
              <Link href="/contributions" className="text-white/70 hover:text-white">Contributions</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/assessments" className="text-cyan-400">Assessments</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">⚠️ Toxicity Chart</h1>
          <p className="text-gray-300 text-lg">
            Track what corrodes energy, clarity, or fulfillment. Green = healthy boundaries, Yellow = drifting, Red = toxic patterns.
          </p>
        </div>

        {/* Boundary Reset Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={resetAllBoundaries}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            🔄 Reset All Boundaries to Healthy
          </button>
        </div>

        {/* Radar Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Toxicity Radar</h2>
          <div className="flex justify-center">
            <svg width="400" height="400" className="overflow-visible">
              {/* Grid circles */}
              {[25, 50, 75, 100].map(r => (
                <circle
                  key={r}
                  cx="200"
                  cy="200"
                  r={150 * r / 100}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Axis lines */}
              {radarPoints.map((point, i) => (
                <line
                  key={i}
                  x1="200"
                  y1="200"
                  x2={point.labelX}
                  y2={point.labelY}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Data polygon */}
              <path
                d={pathData}
                fill="rgba(16, 185, 129, 0.3)"
                stroke="rgb(16, 185, 129)"
                strokeWidth="2"
              />
              
              {/* Data points */}
              {radarPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="rgb(16, 185, 129)"
                  className="cursor-pointer hover:r-6"
                  onClick={() => setSelectedArea(point.area.name)}
                />
              ))}
              
              {/* Labels */}
              {radarPoints.map((point, i) => (
                <text
                  key={i}
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-xs"
                >
                  {point.area.icon}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Selected Area Details */}
        {selectedArea && (
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Selected: {selectedArea}</h3>
              <button
                onClick={() => setSelectedArea(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-300">
              Click on the life area cards below to update their status.
            </p>
          </div>
        )}

        {/* Life Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lifeAreas.map(area => {
            const boundary = boundaries.find(b => b.lifeArea === area.name)
            return (
              <div
                key={area.name}
                className={`bg-gradient-to-br ${getStatusColor(boundary?.status || 'healthy')} bg-opacity-20 backdrop-blur-lg rounded-xl p-4 border border-white/20 cursor-pointer hover:scale-105 transition-all`}
                onClick={() => updateBoundaryStatus(
                  area.name,
                  boundary?.status === 'healthy' ? 'warning' :
                  boundary?.status === 'warning' ? 'toxic' : 'healthy'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{area.icon}</span>
                    <h3 className="text-white font-semibold">{area.name}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    boundary?.status === 'healthy' ? 'bg-green-500/30 text-green-300' :
                    boundary?.status === 'warning' ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-red-500/30 text-red-300'
                  }`}>
                    {boundary?.status || 'healthy'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-green-300 mb-1">✓ Healthy</div>
                    <div className="text-xs text-gray-300">{area.healthy}</div>
                  </div>
                  <div>
                    <div className="text-xs text-red-300 mb-1">✗ Toxic</div>
                    <div className="text-xs text-gray-300">{area.toxic}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">📌 How to Use</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Click on any life area card to cycle through status (Healthy → Warning → Toxic)</li>
            <li>• Use the radar chart to see patterns across all areas at once</li>
            <li>• Click &quot;Reset All Boundaries&quot; to mark all areas as healthy after a reset ritual</li>
            <li>• Pair with your Monthly Boundary Audit Log</li>
            <li>• When you see toxic patterns: pause, acknowledge, forgive, recommit</li>
          </ul>
        </div>
      </div>
    </div>
  )
}