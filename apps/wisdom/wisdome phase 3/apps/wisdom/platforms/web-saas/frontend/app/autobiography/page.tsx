'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Book,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Heart,
  Briefcase,
  Globe,
  Sparkles,
  Brain,
  Eye,
  Upload,
  Plus,
  Edit,
  Save,
  X,
  Camera
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface YearData {
  year: number
  age: number
  picture?: string
  importantPeople: {
    category: 'family' | 'friends' | 'mentors' | 'partners'
    name: string
    role: string
  }[]
  lifeEvents: {
    category: 'personal' | 'relational' | 'work'
    event: string
    impact?: 'positive' | 'negative' | 'neutral'
  }[]
  worldEvents: string[]
  patterns: {
    pattern: string
    frequency: 'emerging' | 'active' | 'completing'
  }[]
  learnings: string[]
  currentPerspective: {
    completion: string
    newCommitment: string
  }
}

// Initialize with Jonathan's birth year
const BIRTH_YEAR = 1975
const CURRENT_YEAR = new Date().getFullYear()
const MAX_AGE = 120

// Sample data for demonstration
const sampleData: Partial<Record<number, YearData>> = {
  1975: {
    year: 1975,
    age: 0,
    importantPeople: [
      { category: 'family', name: 'Mother', role: 'Primary caregiver' },
      { category: 'family', name: 'Father', role: 'Provider' }
    ],
    lifeEvents: [
      { category: 'personal', event: 'Born June 8 in Montreal', impact: 'positive' }
    ],
    worldEvents: ['Vietnam War ends', 'Microsoft founded', 'Jaws released'],
    patterns: [],
    learnings: ['Entered the world ready to experience life'],
    currentPerspective: {
      completion: 'My arrival set the stage for independence',
      newCommitment: 'Honor the fighter spirit I was born with'
    }
  },
  1983: {
    year: 1983,
    age: 8,
    importantPeople: [
      { category: 'family', name: 'Parents', role: 'Conflicted caregivers' }
    ],
    lifeEvents: [
      { category: 'personal', event: 'Missed school bus - walked alone', impact: 'negative' },
      { category: 'personal', event: 'Created "Solo Hero" pattern', impact: 'negative' }
    ],
    worldEvents: ['Return of the Jedi released', 'M*A*S*H finale', 'Apple Lisa computer'],
    patterns: [
      { pattern: 'Solo Hero Complex', frequency: 'emerging' },
      { pattern: 'Self-reliance', frequency: 'emerging' }
    ],
    learnings: ['No one is coming to save you', 'I must handle everything myself'],
    currentPerspective: {
      completion: 'The Solo Hero served its purpose and can now rest',
      newCommitment: 'I architect collaborative systems'
    }
  },
  1987: {
    year: 1987,
    age: 12,
    importantPeople: [
      { category: 'family', name: 'Michel', role: 'Dangerous brother' }
    ],
    lifeEvents: [
      { category: 'relational', event: 'Betrayal by Michel - drowning attempt', impact: 'negative' },
      { category: 'personal', event: 'Developed hypervigilance', impact: 'negative' }
    ],
    worldEvents: ['Black Monday stock crash', 'The Simpsons debuts', 'DNA first used in criminal case'],
    patterns: [
      { pattern: 'Trust issues', frequency: 'emerging' },
      { pattern: 'Hypervigilance', frequency: 'active' }
    ],
    learnings: ['Family can be dangerous', 'Must always be on guard'],
    currentPerspective: {
      completion: 'Michel taught me discernment',
      newCommitment: 'I maintain boundaries with toxic people permanently'
    }
  },
  2015: {
    year: 2015,
    age: 40,
    importantPeople: [
      { category: 'mentors', name: 'Wisdom Teacher', role: 'Transformation guide' }
    ],
    lifeEvents: [
      { category: 'personal', event: 'Started Wisdom work', impact: 'positive' },
      { category: 'work', event: 'Major career pivot', impact: 'positive' }
    ],
    worldEvents: ['Paris attacks', 'Same-sex marriage legalized in US', 'Star Wars: Force Awakens'],
    patterns: [
      { pattern: 'External validation seeking', frequency: 'completing' },
      { pattern: 'Pattern awareness', frequency: 'emerging' }
    ],
    learnings: ['Patterns are changeable', 'Transformation is possible'],
    currentPerspective: {
      completion: 'The seeker found what he was looking for',
      newCommitment: 'I embody and teach transformation'
    }
  },
  2025: {
    year: 2025,
    age: 50,
    importantPeople: [
      { category: 'partners', name: 'Djamel', role: 'Life partner' },
      { category: 'friends', name: 'Michael', role: 'Operational support' },
      { category: 'mentors', name: 'AI Agents', role: 'Digital workforce' }
    ],
    lifeEvents: [
      { category: 'personal', event: 'Full system activation at 50', impact: 'positive' },
      { category: 'work', event: 'WisdomOS launch', impact: 'positive' },
      { category: 'personal', event: 'Health recovery protocol', impact: 'neutral' }
    ],
    worldEvents: ['AI transformation accelerates', 'Global consciousness shift', 'Phoenix rising'],
    patterns: [
      { pattern: 'Solo Hero Complex', frequency: 'completing' },
      { pattern: 'Collaborative architect', frequency: 'active' }
    ],
    learnings: ['All patterns visible and workable', 'Legacy is already in motion'],
    currentPerspective: {
      completion: 'The warrior becomes the wise elder',
      newCommitment: 'Build liberation systems for others'
    }
  }
}

export default function AutobiographyPage() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [yearData, setYearData] = useState<Record<number, YearData>>({})
  const [editMode, setEditMode] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [tempData, setTempData] = useState<YearData | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wisdomos_autobiography')
    if (stored) {
      setYearData(JSON.parse(stored))
    } else {
      // Initialize with sample data
      setYearData(sampleData as Record<number, YearData>)
    }
  }, [])

  // Save data to localStorage
  const saveData = (data: Record<number, YearData>) => {
    setYearData(data)
    localStorage.setItem('wisdomos_autobiography', JSON.stringify(data))
  }

  const currentAge = selectedYear - BIRTH_YEAR
  const currentData = yearData[selectedYear] || {
    year: selectedYear,
    age: currentAge,
    importantPeople: [],
    lifeEvents: [],
    worldEvents: [],
    patterns: [],
    learnings: [],
    currentPerspective: { completion: '', newCommitment: '' }
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' 
      ? Math.max(BIRTH_YEAR, selectedYear - 1)
      : Math.min(BIRTH_YEAR + MAX_AGE - 1, selectedYear + 1)
    setSelectedYear(newYear)
    setEditMode(false)
    setEditingSection(null)
  }

  const startEdit = (section: string) => {
    setEditingSection(section)
    setTempData({ ...currentData })
  }

  const saveSection = () => {
    if (tempData) {
      const newData = { ...yearData, [selectedYear]: tempData }
      saveData(newData)
    }
    setEditingSection(null)
    setTempData(null)
  }

  const cancelEdit = () => {
    setEditingSection(null)
    setTempData(null)
  }

  const getLifePhase = (age: number) => {
    if (age < 0) return { phase: 'Pre-birth', color: 'text-black' }
    if (age <= 12) return { phase: 'Childhood', color: 'text-black' }
    if (age <= 19) return { phase: 'Adolescence', color: 'text-black' }
    if (age <= 29) return { phase: 'Young Adult', color: 'text-black' }
    if (age <= 39) return { phase: 'Building Years', color: 'text-black' }
    if (age <= 49) return { phase: 'Integration', color: 'text-black' }
    if (age <= 59) return { phase: 'Wisdom Years', color: 'text-black' }
    if (age <= 69) return { phase: 'Elder', color: 'text-black' }
    if (age <= 79) return { phase: 'Sage', color: 'text-black' }
    return { phase: 'Legacy', color: 'text-black' }
  }

  const lifePhase = getLifePhase(currentAge)

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
                Autobiography
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-black" />
              <span className="text-sm text-black">120 Years of Life</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Year Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-phoenix-gold/20">
          <div className="flex items-center justify-between">
            <PhoenixButton
              onClick={() => navigateYear('prev')}
              variant="ghost"
              size="sm"
              disabled={selectedYear === BIRTH_YEAR}
            >
              <ChevronLeft className="w-4 h-4" />
            </PhoenixButton>

            <div className="flex items-center gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
              >
                {Array.from({ length: MAX_AGE }, (_, i) => BIRTH_YEAR + i).map(year => (
                  <option key={year} value={year}>
                    {year} (Age {year - BIRTH_YEAR})
                  </option>
                ))}
              </select>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{selectedYear}</div>
                <div className={`text-sm font-medium ${lifePhase.color}`}>
                  {lifePhase.phase} • Age {currentAge}
                </div>
              </div>
            </div>

            <PhoenixButton
              onClick={() => navigateYear('next')}
              variant="ghost"
              size="sm"
              disabled={selectedYear === BIRTH_YEAR + MAX_AGE - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </PhoenixButton>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Picture/Memory Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Camera className="w-5 h-5 text-black" />
                Picture / Memory
              </h3>
              {!editingSection && (
                <PhoenixButton
                  onClick={() => startEdit('picture')}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PhoenixButton>
              )}
            </div>

            {editingSection === 'picture' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-black mx-auto mb-2" />
                  <p className="text-sm text-black">Upload an image or describe a memory</p>
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  rows={3}
                  placeholder="Describe a key memory from this year..."
                  value={tempData?.picture || ''}
                  onChange={(e) => setTempData(prev => prev ? {...prev, picture: e.target.value} : null)}
                />
                <div className="flex gap-2">
                  <PhoenixButton onClick={saveSection} size="sm">Save</PhoenixButton>
                  <PhoenixButton onClick={cancelEdit} variant="ghost" size="sm">Cancel</PhoenixButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.picture ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-black">{currentData.picture}</p>
                  </div>
                ) : (
                  <div className="text-black italic">No memory recorded for this year</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Important People Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Users className="w-5 h-5 text-black" />
                Important People
              </h3>
              {!editingSection && (
                <PhoenixButton
                  onClick={() => startEdit('people')}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PhoenixButton>
              )}
            </div>

            {editingSection === 'people' ? (
              <div className="space-y-4">
                {tempData?.importantPeople.map((person, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      className="px-2 py-1 border border-gray-300 rounded text-black text-sm"
                      value={person.category}
                      onChange={(e) => {
                        const newPeople = [...(tempData?.importantPeople || [])]
                        newPeople[idx].category = e.target.value as any
                        setTempData(prev => prev ? {...prev, importantPeople: newPeople} : null)
                      }}
                    >
                      <option value="family">Family</option>
                      <option value="friends">Friends</option>
                      <option value="mentors">Mentors</option>
                      <option value="partners">Partners</option>
                    </select>
                    <input
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                      placeholder="Name"
                      value={person.name}
                      onChange={(e) => {
                        const newPeople = [...(tempData?.importantPeople || [])]
                        newPeople[idx].name = e.target.value
                        setTempData(prev => prev ? {...prev, importantPeople: newPeople} : null)
                      }}
                    />
                    <input
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                      placeholder="Role"
                      value={person.role}
                      onChange={(e) => {
                        const newPeople = [...(tempData?.importantPeople || [])]
                        newPeople[idx].role = e.target.value
                        setTempData(prev => prev ? {...prev, importantPeople: newPeople} : null)
                      }}
                    />
                  </div>
                ))}
                <PhoenixButton
                  onClick={() => {
                    const newPeople = [...(tempData?.importantPeople || []), 
                      { category: 'family' as const, name: '', role: '' }]
                    setTempData(prev => prev ? {...prev, importantPeople: newPeople} : null)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Person
                </PhoenixButton>
                <div className="flex gap-2">
                  <PhoenixButton onClick={saveSection} size="sm">Save</PhoenixButton>
                  <PhoenixButton onClick={cancelEdit} variant="ghost" size="sm">Cancel</PhoenixButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {currentData.importantPeople.length > 0 ? (
                  currentData.importantPeople.map((person, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        person.category === 'family' ? 'bg-blue-100 text-black' :
                        person.category === 'friends' ? 'bg-green-100 text-black' :
                        person.category === 'mentors' ? 'bg-purple-100 text-black' :
                        'bg-pink-100 text-black'
                      }`}>
                        {person.category}
                      </span>
                      <span className="font-medium text-black">{person.name}</span>
                      <span className="text-black">• {person.role}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-black italic">No people recorded</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Life Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Calendar className="w-5 h-5 text-black" />
                Life Events
              </h3>
              {!editingSection && (
                <PhoenixButton
                  onClick={() => startEdit('events')}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PhoenixButton>
              )}
            </div>

            {editingSection === 'events' ? (
              <div className="space-y-4">
                {tempData?.lifeEvents.map((event, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-black text-sm"
                        value={event.category}
                        onChange={(e) => {
                          const newEvents = [...(tempData?.lifeEvents || [])]
                          newEvents[idx].category = e.target.value as any
                          setTempData(prev => prev ? {...prev, lifeEvents: newEvents} : null)
                        }}
                      >
                        <option value="personal">Personal</option>
                        <option value="relational">Relational</option>
                        <option value="work">Work</option>
                      </select>
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-black text-sm"
                        value={event.impact || 'neutral'}
                        onChange={(e) => {
                          const newEvents = [...(tempData?.lifeEvents || [])]
                          newEvents[idx].impact = e.target.value as any
                          setTempData(prev => prev ? {...prev, lifeEvents: newEvents} : null)
                        }}
                      >
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    </div>
                    <input
                      className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                      placeholder="Describe the event..."
                      value={event.event}
                      onChange={(e) => {
                        const newEvents = [...(tempData?.lifeEvents || [])]
                        newEvents[idx].event = e.target.value
                        setTempData(prev => prev ? {...prev, lifeEvents: newEvents} : null)
                      }}
                    />
                  </div>
                ))}
                <PhoenixButton
                  onClick={() => {
                    const newEvents = [...(tempData?.lifeEvents || []), 
                      { category: 'personal' as const, event: '', impact: 'neutral' as const }]
                    setTempData(prev => prev ? {...prev, lifeEvents: newEvents} : null)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Event
                </PhoenixButton>
                <div className="flex gap-2">
                  <PhoenixButton onClick={saveSection} size="sm">Save</PhoenixButton>
                  <PhoenixButton onClick={cancelEdit} variant="ghost" size="sm">Cancel</PhoenixButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {currentData.lifeEvents.length > 0 ? (
                  currentData.lifeEvents.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.category === 'personal' ? 'bg-blue-100 text-black' :
                        event.category === 'relational' ? 'bg-purple-100 text-black' :
                        'bg-orange-100 text-black'
                      }`}>
                        {event.category}
                      </span>
                      <span className={`text-lg ${
                        event.impact === 'positive' ? 'text-black' :
                        event.impact === 'negative' ? 'text-black' :
                        'text-black'
                      }`}>
                        {event.impact === 'positive' ? '↑' :
                         event.impact === 'negative' ? '↓' : '→'}
                      </span>
                      <span className="text-black flex-1">{event.event}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-black italic">No events recorded</div>
                )}
              </div>
            )}
          </motion.div>

          {/* World Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Globe className="w-5 h-5 text-black" />
                World Events / Pop Culture
              </h3>
              {!editingSection && (
                <PhoenixButton
                  onClick={() => startEdit('world')}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PhoenixButton>
              )}
            </div>

            {editingSection === 'world' ? (
              <div className="space-y-4">
                {tempData?.worldEvents.map((event, idx) => (
                  <input
                    key={idx}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                    value={event}
                    onChange={(e) => {
                      const newEvents = [...(tempData?.worldEvents || [])]
                      newEvents[idx] = e.target.value
                      setTempData(prev => prev ? {...prev, worldEvents: newEvents} : null)
                    }}
                  />
                ))}
                <PhoenixButton
                  onClick={() => {
                    const newEvents = [...(tempData?.worldEvents || []), '']
                    setTempData(prev => prev ? {...prev, worldEvents: newEvents} : null)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Event
                </PhoenixButton>
                <div className="flex gap-2">
                  <PhoenixButton onClick={saveSection} size="sm">Save</PhoenixButton>
                  <PhoenixButton onClick={cancelEdit} variant="ghost" size="sm">Cancel</PhoenixButton>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {currentData.worldEvents.length > 0 ? (
                  currentData.worldEvents.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span className="text-black">{event}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-black italic">No world events recorded</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Patterns Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                Recurring Patterns
              </h3>
              {!editingSection && (
                <PhoenixButton
                  onClick={() => startEdit('patterns')}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PhoenixButton>
              )}
            </div>

            {editingSection === 'patterns' ? (
              <div className="space-y-4">
                {tempData?.patterns.map((pattern, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
                      placeholder="Pattern description"
                      value={pattern.pattern}
                      onChange={(e) => {
                        const newPatterns = [...(tempData?.patterns || [])]
                        newPatterns[idx].pattern = e.target.value
                        setTempData(prev => prev ? {...prev, patterns: newPatterns} : null)
                      }}
                    />
                    <select
                      className="px-2 py-1 border border-gray-300 rounded text-black text-sm"
                      value={pattern.frequency}
                      onChange={(e) => {
                        const newPatterns = [...(tempData?.patterns || [])]
                        newPatterns[idx].frequency = e.target.value as any
                        setTempData(prev => prev ? {...prev, patterns: newPatterns} : null)
                      }}
                    >
                      <option value="emerging">Emerging</option>
                      <option value="active">Active</option>
                      <option value="completing">Completing</option>
                    </select>
                  </div>
                ))}
                <PhoenixButton
                  onClick={() => {
                    const newPatterns = [...(tempData?.patterns || []), 
                      { pattern: '', frequency: 'emerging' as const }]
                    setTempData(prev => prev ? {...prev, patterns: newPatterns} : null)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Pattern
                </PhoenixButton>
                <div className="flex gap-2">
                  <PhoenixButton onClick={saveSection} size="sm">Save</PhoenixButton>
                  <PhoenixButton onClick={cancelEdit} variant="ghost" size="sm">Cancel</PhoenixButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {currentData.patterns.length > 0 ? (
                  currentData.patterns.map((pattern, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        pattern.frequency === 'emerging' ? 'bg-green-100 text-black' :
                        pattern.frequency === 'active' ? 'bg-yellow-100 text-black' :
                        'bg-red-100 text-black'
                      }`}>
                        {pattern.frequency}
                      </span>
                      <span className="text-black">{pattern.pattern}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-black italic">No patterns recorded</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Learnings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Brain className="w-5 h-5 text-black" />
                What I Learned
              </h3>
              {!editingSection && (
                <PhoenixButton
                  onClick={() => startEdit('learnings')}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PhoenixButton>
              )}
            </div>

            {editingSection === 'learnings' ? (
              <div className="space-y-4">
                {tempData?.learnings.map((learning, idx) => (
                  <textarea
                    key={idx}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                    rows={2}
                    value={learning}
                    onChange={(e) => {
                      const newLearnings = [...(tempData?.learnings || [])]
                      newLearnings[idx] = e.target.value
                      setTempData(prev => prev ? {...prev, learnings: newLearnings} : null)
                    }}
                  />
                ))}
                <PhoenixButton
                  onClick={() => {
                    const newLearnings = [...(tempData?.learnings || []), '']
                    setTempData(prev => prev ? {...prev, learnings: newLearnings} : null)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Learning
                </PhoenixButton>
                <div className="flex gap-2">
                  <PhoenixButton onClick={saveSection} size="sm">Save</PhoenixButton>
                  <PhoenixButton onClick={cancelEdit} variant="ghost" size="sm">Cancel</PhoenixButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {currentData.learnings.length > 0 ? (
                  currentData.learnings.map((learning, idx) => (
                    <div key={idx} className="bg-phoenix-gold/10 rounded-lg p-3">
                      <p className="text-black">{learning}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-black italic">No learnings recorded</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Current Perspective Section - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Eye className="w-5 h-5 text-black" />
                How I See It Now
              </h3>
              {!editingSection && (
                <PhoenixButton
                  onClick={() => startEdit('perspective')}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </PhoenixButton>
              )}
            </div>

            {editingSection === 'perspective' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Completion (What I can release)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    rows={3}
                    value={tempData?.currentPerspective.completion || ''}
                    onChange={(e) => setTempData(prev => prev ? {
                      ...prev, 
                      currentPerspective: {...prev.currentPerspective, completion: e.target.value}
                    } : null)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    New Commitment (What I embrace now)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    rows={3}
                    value={tempData?.currentPerspective.newCommitment || ''}
                    onChange={(e) => setTempData(prev => prev ? {
                      ...prev, 
                      currentPerspective: {...prev.currentPerspective, newCommitment: e.target.value}
                    } : null)}
                  />
                </div>
                <div className="flex gap-2">
                  <PhoenixButton onClick={saveSection} size="sm">Save</PhoenixButton>
                  <PhoenixButton onClick={cancelEdit} variant="ghost" size="sm">Cancel</PhoenixButton>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-black mb-2">Completion</h4>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-black">
                      {currentData.currentPerspective.completion || 
                        <span className="italic text-black">No completion recorded</span>}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-black mb-2">New Commitment</h4>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-black">
                      {currentData.currentPerspective.newCommitment || 
                        <span className="italic text-black">No commitment recorded</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
          <h3 className="text-lg font-semibold text-black mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.keys(yearData).map(year => (
              <PhoenixButton
                key={year}
                onClick={() => setSelectedYear(Number(year))}
                variant={Number(year) === selectedYear ? 'primary' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                {year}
              </PhoenixButton>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}