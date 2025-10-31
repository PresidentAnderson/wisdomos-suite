'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle,
  Search,
  TrendingUp,
  ChevronLeft,
  Plus,
  Calendar,
  Target,
  Brain,
  Shield,
  Repeat,
  CheckCircle,
  X,
  Edit,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { getFeedbackLoop, useFeedbackLoop } from '@/lib/feedback-loop'

interface Upset {
  id: string
  date: string
  lifeArea: string
  trigger: string
  emotionalResponse: string
  physicalSensation: string
  pattern: string
  frequency: 'first' | 'occasional' | 'recurring' | 'chronic'
  intensity: 1 | 2 | 3 | 4 | 5
  resolved: boolean
  resolution?: string
  commitment?: string
  relatedUpsets: string[]
}

interface Pattern {
  name: string
  count: number
  upsetIds: string[]
  firstOccurrence: string
  lastOccurrence: string
  averageIntensity: number
}

const sampleUpsets: Upset[] = [
  {
    id: '1',
    date: '2025-07-10',
    lifeArea: 'Work & Purpose',
    trigger: 'Michael didn\'t follow through on commitment',
    emotionalResponse: 'Frustration, disappointment, anger',
    physicalSensation: 'Chest tightness, jaw clenching',
    pattern: 'Others not keeping commitments',
    frequency: 'recurring',
    intensity: 4,
    resolved: false,
    relatedUpsets: ['2', '3']
  },
  {
    id: '2',
    date: '2025-07-08',
    lifeArea: 'Finance',
    trigger: 'Unexpected charge from CIBC',
    emotionalResponse: 'Rage, helplessness, violation',
    physicalSensation: 'Heat in face, stomach drop',
    pattern: 'Financial predation',
    frequency: 'chronic',
    intensity: 5,
    resolved: false,
    relatedUpsets: ['1']
  },
  {
    id: '3',
    date: '2025-07-05',
    lifeArea: 'Intimacy & Love',
    trigger: 'Djamel withdrawn during conversation',
    emotionalResponse: 'Loneliness, rejection, sadness',
    physicalSensation: 'Heart heaviness, throat constriction',
    pattern: 'Feeling unseen/unheard',
    frequency: 'recurring',
    intensity: 3,
    resolved: true,
    resolution: 'Had clarifying conversation',
    commitment: 'I commit to expressing needs directly',
    relatedUpsets: ['1']
  }
]

export default function UpsetInquiryPage() {
  const [upsets, setUpsets] = useState<Upset[]>(sampleUpsets)
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [showAddUpset, setShowAddUpset] = useState(false)
  const [editingUpset, setEditingUpset] = useState<Upset | null>(null)
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'patterns' | 'resolution'>('timeline')
  const [showResolved, setShowResolved] = useState(true)
  
  const { state, feedbackLoop } = useFeedbackLoop()

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('wisdomos_upsets')
    if (stored) {
      setUpsets(JSON.parse(stored))
    }
  }, [])

  // Calculate patterns
  useEffect(() => {
    const patternMap = new Map<string, Pattern>()
    
    upsets.forEach(upset => {
      if (!patternMap.has(upset.pattern)) {
        patternMap.set(upset.pattern, {
          name: upset.pattern,
          count: 0,
          upsetIds: [],
          firstOccurrence: upset.date,
          lastOccurrence: upset.date,
          averageIntensity: 0
        })
      }
      
      const pattern = patternMap.get(upset.pattern)!
      pattern.count++
      pattern.upsetIds.push(upset.id)
      pattern.averageIntensity = 
        (pattern.averageIntensity * (pattern.count - 1) + upset.intensity) / pattern.count
      
      if (new Date(upset.date) < new Date(pattern.firstOccurrence)) {
        pattern.firstOccurrence = upset.date
      }
      if (new Date(upset.date) > new Date(pattern.lastOccurrence)) {
        pattern.lastOccurrence = upset.date
      }
    })
    
    setPatterns(Array.from(patternMap.values()).sort((a, b) => b.count - a.count))
  }, [upsets])

  // Save to localStorage
  const saveUpsets = (newUpsets: Upset[]) => {
    setUpsets(newUpsets)
    localStorage.setItem('wisdomos_upsets', JSON.stringify(newUpsets))
  }

  const addUpset = (upset: Omit<Upset, 'id'>) => {
    const newUpset = { ...upset, id: Date.now().toString() }
    saveUpsets([...upsets, newUpset])
    setShowAddUpset(false)
    
    // Log to feedback loop
    feedbackLoop.logUpset(upset.lifeArea, upset.trigger, upset.intensity)
  }

  const updateUpset = (updated: Upset) => {
    saveUpsets(upsets.map(u => u.id === updated.id ? updated : u))
    setEditingUpset(null)
  }

  const deleteUpset = (id: string) => {
    saveUpsets(upsets.filter(u => u.id !== id))
  }

  const resolveUpset = (id: string, resolution: string, commitment: string) => {
    const upset = upsets.find(u => u.id === id)
    saveUpsets(upsets.map(u => 
      u.id === id 
        ? { ...u, resolved: true, resolution, commitment }
        : u
    ))
    
    // Log resolution to feedback loop
    if (upset) {
      feedbackLoop.logEvent({
        type: 'pattern_detected',
        lifeAreaId: state?.lifeAreas.find(a => a.name === upset.lifeArea)?.id || '1',
        lifeAreaName: upset.lifeArea,
        impact: 1, // Positive impact for resolution
        data: { resolution, commitment, originalUpset: upset.trigger }
      })
    }
  }

  const frequencyColors = {
    first: 'bg-green-100 text-black',
    occasional: 'bg-yellow-100 text-black',
    recurring: 'bg-orange-100 text-black',
    chronic: 'bg-red-100 text-black'
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return 'text-black'
    if (intensity <= 3) return 'text-black'
    if (intensity <= 4) return 'text-black'
    return 'text-black'
  }

  const filteredUpsets = showResolved 
    ? upsets 
    : upsets.filter(u => !u.resolved)

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Upset Inquiry
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Health Indicator */}
              {state && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    state.overallHealth >= 70 ? 'bg-green-500' :
                    state.overallHealth >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-black">Health: {state.overallHealth}%</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-black" />
                <span className="text-sm text-black">Pattern Recognition System</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Total Upsets</span>
              <AlertTriangle className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">{upsets.length}</div>
            <div className="text-xs text-black mt-1">
              {upsets.filter(u => !u.resolved).length} unresolved
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Patterns</span>
              <Repeat className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">{patterns.length}</div>
            <div className="text-xs text-black mt-1">
              {patterns.filter(p => p.count >= 3).length} chronic
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Avg Intensity</span>
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {upsets.length > 0 
                ? (upsets.reduce((sum, u) => sum + u.intensity, 0) / upsets.length).toFixed(1)
                : '0'}
            </div>
            <div className="text-xs text-black mt-1">out of 5</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Resolution Rate</span>
              <CheckCircle className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {upsets.length > 0 
                ? Math.round((upsets.filter(u => u.resolved).length / upsets.length) * 100)
                : 0}%
            </div>
            <div className="text-xs text-black mt-1">
              {upsets.filter(u => u.resolved).length} resolved
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-phoenix-gold/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {['timeline', 'patterns', 'resolution'].map(mode => (
                <PhoenixButton
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  variant={viewMode === mode ? 'primary' : 'ghost'}
                  size="sm"
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </PhoenixButton>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="rounded text-black focus:ring-phoenix-orange"
                />
                <span className="text-sm text-black">Show Resolved</span>
              </label>

              <PhoenixButton
                onClick={() => setShowAddUpset(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Log Upset
              </PhoenixButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {filteredUpsets
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((upset, index) => (
                <motion.div
                  key={upset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl shadow-xl border-2 p-6 ${
                    upset.resolved ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-black">
                          {new Date(upset.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-black">
                          {upset.lifeArea}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          frequencyColors[upset.frequency]
                        }`}>
                          {upset.frequency}
                        </span>
                        {upset.resolved && (
                          <CheckCircle className="w-4 h-4 text-black" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-1">
                        {upset.trigger}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getIntensityColor(upset.intensity)}`}>
                          {upset.intensity}/5
                        </div>
                        <div className="text-xs text-black">Intensity</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingUpset(upset)}
                          className="text-black hover:text-black"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUpset(upset.id)}
                          className="text-black hover:text-black"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-black mb-1">Emotional Response:</p>
                      <p className="text-sm text-black">{upset.emotionalResponse}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black mb-1">Physical Sensation:</p>
                      <p className="text-sm text-black">{upset.physicalSensation}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-black mb-1">Pattern:</p>
                    <p className="text-sm text-black font-medium">{upset.pattern}</p>
                  </div>

                  {upset.resolved ? (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-black mb-1">Resolution:</p>
                          <p className="text-sm text-black">{upset.resolution}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black mb-1">Commitment:</p>
                          <p className="text-sm text-black italic">"{upset.commitment}"</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <PhoenixButton
                        onClick={() => {
                          const resolution = prompt('How was this resolved?')
                          const commitment = prompt('What is your commitment moving forward?')
                          if (resolution && commitment) {
                            resolveUpset(upset.id, resolution, commitment)
                          }
                        }}
                        variant="success"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Resolved
                      </PhoenixButton>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        )}

        {viewMode === 'patterns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-xl border-2 p-6 cursor-pointer hover:shadow-2xl transition-shadow"
                style={{ 
                  borderColor: pattern.count >= 5 ? '#EF4444' : 
                               pattern.count >= 3 ? '#F59E0B' : 
                               '#10B981' + '40'
                }}
                onClick={() => setSelectedPattern(pattern.name)}
              >
                <div className="flex items-center justify-between mb-3">
                  <Repeat className={`w-5 h-5 ${
                    pattern.count >= 5 ? 'text-black' :
                    pattern.count >= 3 ? 'text-black' :
                    'text-black'
                  }`} />
                  <span className="text-2xl font-bold text-black">{pattern.count}x</span>
                </div>
                
                <h3 className="text-lg font-semibold text-black mb-2">{pattern.name}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black">First:</span>
                    <span className="text-black">
                      {new Date(pattern.firstOccurrence).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Last:</span>
                    <span className="text-black">
                      {new Date(pattern.lastOccurrence).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Avg Intensity:</span>
                    <span className={`font-bold ${getIntensityColor(pattern.averageIntensity)}`}>
                      {pattern.averageIntensity.toFixed(1)}
                    </span>
                  </div>
                </div>

                {pattern.count >= 3 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-black font-medium">
                      ⚠️ Chronic pattern requiring attention
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {viewMode === 'resolution' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <h3 className="text-lg font-semibold text-black mb-4">Resolution Strategies</h3>
              
              <div className="space-y-4">
                {patterns.filter(p => p.count >= 2).map(pattern => {
                  const resolvedCount = upsets
                    .filter(u => u.pattern === pattern.name && u.resolved).length
                  const resolutionRate = pattern.count > 0 
                    ? Math.round((resolvedCount / pattern.count) * 100)
                    : 0
                    
                  return (
                    <div key={pattern.name} className="border-l-4 border-phoenix-orange pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-black">{pattern.name}</h4>
                        <span className={`text-sm font-medium ${
                          resolutionRate >= 75 ? 'text-black' :
                          resolutionRate >= 50 ? 'text-black' :
                          'text-black'
                        }`}>
                          {resolutionRate}% resolved
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {upsets
                          .filter(u => u.pattern === pattern.name && u.resolved)
                          .slice(0, 2)
                          .map(upset => (
                            <div key={upset.id} className="bg-green-50 rounded-lg p-3">
                              <p className="text-sm text-black mb-1">
                                <span className="font-medium">Resolution:</span> {upset.resolution}
                              </p>
                              <p className="text-sm text-black italic">
                                <span className="font-medium">Commitment:</span> "{upset.commitment}"
                              </p>
                            </div>
                          ))}
                      </div>
                      
                      {resolutionRate < 50 && (
                        <div className="mt-2 bg-red-50 rounded-lg p-3">
                          <p className="text-sm text-black">
                            ⚠️ This pattern needs a new approach - current strategies aren't working
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <h3 className="text-lg font-semibold text-black mb-4">Pattern Insights</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-black mt-0.5" />
                  <div>
                    <p className="font-medium text-black">Most Common Trigger</p>
                    <p className="text-sm text-black">
                      {patterns[0]?.name || 'No patterns yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-black mt-0.5" />
                  <div>
                    <p className="font-medium text-black">Most Affected Life Area</p>
                    <p className="text-sm text-black">
                      {(() => {
                        const counts = upsets.reduce((acc, u) => {
                          acc[u.lifeArea] = (acc[u.lifeArea] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-black mt-0.5" />
                  <div>
                    <p className="font-medium text-black">Recommended Focus</p>
                    <p className="text-sm text-black">
                      {patterns.find(p => p.count >= 3)?.name || 'Continue tracking patterns'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddUpset || editingUpset) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4 text-black">
                {editingUpset ? 'Edit Upset' : 'Log Upset'}
              </h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  
                  const upset = {
                    date: formData.get('date') as string,
                    lifeArea: formData.get('lifeArea') as string,
                    trigger: formData.get('trigger') as string,
                    emotionalResponse: formData.get('emotionalResponse') as string,
                    physicalSensation: formData.get('physicalSensation') as string,
                    pattern: formData.get('pattern') as string,
                    frequency: formData.get('frequency') as any,
                    intensity: Number(formData.get('intensity')) as any,
                    resolved: editingUpset?.resolved || false,
                    resolution: editingUpset?.resolution,
                    commitment: editingUpset?.commitment,
                    relatedUpsets: []
                  }
                  
                  if (editingUpset) {
                    updateUpset({ ...upset, id: editingUpset.id })
                  } else {
                    addUpset(upset)
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Date</label>
                    <input
                      name="date"
                      type="date"
                      defaultValue={editingUpset?.date || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Life Area</label>
                    <input
                      name="lifeArea"
                      type="text"
                      defaultValue={editingUpset?.lifeArea}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Work & Purpose"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Trigger Event</label>
                  <input
                    name="trigger"
                    type="text"
                    defaultValue={editingUpset?.trigger}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="What happened?"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Emotional Response</label>
                    <textarea
                      name="emotionalResponse"
                      rows={2}
                      defaultValue={editingUpset?.emotionalResponse}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="What did you feel?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Physical Sensation</label>
                    <textarea
                      name="physicalSensation"
                      rows={2}
                      defaultValue={editingUpset?.physicalSensation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="What did you feel in your body?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Pattern</label>
                  <input
                    name="pattern"
                    type="text"
                    defaultValue={editingUpset?.pattern}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="What pattern does this represent?"
                    list="patterns"
                    required
                  />
                  <datalist id="patterns">
                    {patterns.map(p => (
                      <option key={p.name} value={p.name} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Frequency</label>
                    <select
                      name="frequency"
                      defaultValue={editingUpset?.frequency || 'first'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="first">First Time</option>
                      <option value="occasional">Occasional</option>
                      <option value="recurring">Recurring</option>
                      <option value="chronic">Chronic</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Intensity (1-5)
                    </label>
                    <input
                      name="intensity"
                      type="range"
                      min="1"
                      max="5"
                      defaultValue={editingUpset?.intensity || 3}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-black">
                      <span>Mild</span>
                      <span>Extreme</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <PhoenixButton type="submit">
                    {editingUpset ? 'Update' : 'Log'} Upset
                  </PhoenixButton>
                  <PhoenixButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingUpset(null)
                      setShowAddUpset(false)
                    }}
                  >
                    Cancel
                  </PhoenixButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}