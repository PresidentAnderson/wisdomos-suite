'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AutobiographyEntry {
  id: string
  year: number
  title: string
  body: string
  earliest?: string
  insight?: string
  commitment?: string
  createdAt: string
}

export default function AutobiographyPage() {
  const [entries, setEntries] = useState<AutobiographyEntry[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    year: new Date().getFullYear(),
    title: '',
    body: '',
    earliest: '',
    insight: '',
    commitment: ''
  })

  // Generate years from birth to current
  const currentYear = new Date().getFullYear()
  const birthYear = 1985 // This should come from user profile
  const years = Array.from({ length: currentYear - birthYear + 1 }, (_, i) => birthYear + i)
  
  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/autobiography', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Failed to fetch autobiography entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/autobiography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEntry)
      })
      
      if (response.ok) {
        await fetchEntries()
        setNewEntry({
          year: new Date().getFullYear(),
          title: '',
          body: '',
          earliest: '',
          insight: '',
          commitment: ''
        })
        setIsAdding(false)
      }
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/autobiography/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        await fetchEntries()
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const hasEntryForYear = (year: number) => {
    return entries.some(entry => entry.year === year)
  }

  const getEntryForYear = (year: number) => {
    return entries.find(entry => entry.year === year)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

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
              <Link href="/autobiography" className="text-cyan-400">Autobiography</Link>
              <Link href="/assessments" className="text-white/70 hover:text-white">Assessments</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Your Life Timeline</h1>
          <p className="text-gray-300 text-lg">
            Document your journey year by year. Green indicates growth - years where you've reflected and recorded your story.
          </p>
        </div>

        {/* Year Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-10 gap-2">
            {years.map(year => {
              const hasEntry = hasEntryForYear(year)
              return (
                <button
                  key={year}
                  onClick={() => {
                    if (hasEntry) {
                      setSelectedYear(year)
                    } else {
                      setNewEntry({ ...newEntry, year })
                      setIsAdding(true)
                    }
                  }}
                  className={`
                    relative p-3 rounded-lg transition-all text-sm font-medium
                    ${hasEntry 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:scale-105' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                    }
                    ${selectedYear === year ? 'ring-2 ring-cyan-400' : ''}
                  `}
                  title={hasEntry ? 'Click to view entry' : 'Click to add entry'}
                >
                  {year}
                  {hasEntry && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Growth Progress</h3>
              <p className="text-gray-300">
                You&apos;ve documented {entries.length} years of your {years.length}-year journey
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">
                {Math.round((entries.length / years.length) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Complete</div>
            </div>
          </div>
          <div className="mt-4 bg-black/30 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(entries.length / years.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Selected Year Entry */}
        {selectedYear && getEntryForYear(selectedYear) && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-white">Year {selectedYear}</h3>
              <button
                onClick={() => setSelectedYear(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            {(() => {
              const entry = getEntryForYear(selectedYear)
              return entry ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-cyan-400 mb-2">{entry.title}</h4>
                    <p className="text-gray-300">{entry.body}</p>
                  </div>
                  {entry.earliest && (
                    <div>
                      <h5 className="text-sm font-medium text-purple-400 mb-1">Earliest Similar Occurrence</h5>
                      <p className="text-gray-300">{entry.earliest}</p>
                    </div>
                  )}
                  {entry.insight && (
                    <div>
                      <h5 className="text-sm font-medium text-purple-400 mb-1">What I Made It Mean</h5>
                      <p className="text-gray-300">{entry.insight}</p>
                    </div>
                  )}
                  {entry.commitment && (
                    <div>
                      <h5 className="text-sm font-medium text-purple-400 mb-1">New Way of Being</h5>
                      <p className="text-gray-300">{entry.commitment}</p>
                    </div>
                  )}
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete Entry
                  </button>
                </div>
              ) : null
            })()}
          </div>
        )}

        {/* Add Entry Form */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Add Entry for Year {newEntry.year}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Title *</label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                    placeholder="Main theme or event of this year"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Story *</label>
                  <textarea
                    value={newEntry.body}
                    onChange={(e) => setNewEntry({ ...newEntry, body: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-32"
                    placeholder="What happened this year? What was significant?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Earliest Similar Occurrence</label>
                  <textarea
                    value={newEntry.earliest}
                    onChange={(e) => setNewEntry({ ...newEntry, earliest: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-24"
                    placeholder="When did something similar happen before?"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">What I Made It Mean</label>
                  <textarea
                    value={newEntry.insight}
                    onChange={(e) => setNewEntry({ ...newEntry, insight: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-24"
                    placeholder="What meaning did I give to this experience?"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">New Way of Being</label>
                  <textarea
                    value={newEntry.commitment}
                    onChange={(e) => setNewEntry({ ...newEntry, commitment: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-24"
                    placeholder="How will I be different moving forward?"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={addEntry}
                    disabled={!newEntry.title || !newEntry.body}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}