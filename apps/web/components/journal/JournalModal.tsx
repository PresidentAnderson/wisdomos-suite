'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Save,
  Calendar,
  Tag,
  Users,
  Heart,
  Mic,
  MicOff,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Clock,
  MapPin,
  Zap,
  Target
} from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LifeAreaLinkPanel } from './LifeAreaLinkPanel'
import { ResetRitualWizard } from './ResetRitualWizard'
import { 
  JournalEntry,
  CreateJournalRequest,
  MOOD_EMOJIS,
  MOOD_SCORES,
  NEGATIVE_MOODS
} from '@/types/journal'
import { 
  suggestLifeAreas, 
  extractPeopleMentions, 
  extractHashtags,
  inferYearFromText,
  generateAutobiographySnippet,
  shouldSuggestRitual
} from '@/lib/mappings'
import { WisdomCoachService } from '@/lib/wisdom-coach-service'

interface JournalModalProps {
  isOpen: boolean
  onClose: () => void
  entry?: JournalEntry
  lifeAreas: any[]
  onSave?: (entry: JournalEntry) => void
}

export function JournalModal({ 
  isOpen, 
  onClose, 
  entry, 
  lifeAreas,
  onSave 
}: JournalModalProps) {
  // Form state
  const [title, setTitle] = useState(entry?.title || '')
  const [body, setBody] = useState(entry?.body || '')
  const [type, setType] = useState<'journal' | 'voice' | 'reflection'>(entry?.type || 'journal')
  const [mood, setMood] = useState(entry?.mood || '')
  const [tags, setTags] = useState<string[]>(entry?.tags || [])
  const [linkedLifeAreas, setLinkedLifeAreas] = useState<string[]>(entry?.linkedLifeAreas || [])
  const [linkedPeople, setLinkedPeople] = useState<string[]>(entry?.linkedPeople || [])
  const [location, setLocation] = useState('')
  const [energy, setEnergy] = useState(5)
  
  // UI state
  const [isRecording, setIsRecording] = useState(false)
  const [showLifeAreaPanel, setShowLifeAreaPanel] = useState(false)
  const [showRitualWizard, setShowRitualWizard] = useState(false)
  const [showAutobiographyYear, setShowAutobiographyYear] = useState(false)
  const [autobiographyYear, setAutobiographyYear] = useState<number | null>(null)
  const [suggestedLifeAreas, setSuggestedLifeAreas] = useState<string[]>([])
  const [shouldShowRitualBanner, setShouldShowRitualBanner] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)

  // Load existing people for @mentions
  const [existingPeople, setExistingPeople] = useState<any[]>([])
  
  useEffect(() => {
    if (isOpen) {
      // Reset form if no entry
      if (!entry) {
        setTitle('')
        setBody('')
        setType('journal')
        setMood('')
        setTags([])
        setLinkedLifeAreas([])
        setLinkedPeople([])
        setLocation('')
        setEnergy(5)
      }
      
      // Load existing people
      loadPeople()
      
      // Check if should show ritual banner
      checkRitualSuggestion()
    }
  }, [isOpen, entry])

  // Auto-suggest life areas based on content
  useEffect(() => {
    if (body || tags.length > 0 || mood) {
      const suggestions = suggestLifeAreas(body, tags, mood)
      setSuggestedLifeAreas(suggestions)
    }
  }, [body, tags, mood])

  // Extract mentions and hashtags from body
  useEffect(() => {
    const mentions = extractPeopleMentions(body)
    const hashtags = extractHashtags(body)
    
    // Update tags with new hashtags
    const newTags = hashtags.filter(h => !tags.includes(h))
    if (newTags.length > 0) {
      setTags([...tags, ...newTags])
    }
    
    // Update linked people with mentions
    setLinkedPeople(mentions)
  }, [body])

  // Auto-detect year for autobiography
  useEffect(() => {
    const inferredYear = inferYearFromText(body)
    if (inferredYear) {
      setAutobiographyYear(inferredYear)
    }
  }, [body])

  const loadPeople = async () => {
    try {
      const stored = localStorage.getItem('wisdomos_people')
      if (stored) {
        setExistingPeople(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading people:', error)
    }
  }

  const checkRitualSuggestion = async () => {
    // Check recent mood history
    const moodHistory = JSON.parse(localStorage.getItem('wisdomos_mood_history') || '[]')
    
    // Check if any life area needs ritual
    const needsRitual = linkedLifeAreas.some(areaId => 
      shouldSuggestRitual(moodHistory.filter((m: any) => m.lifeAreaId === areaId), areaId)
    )
    
    setShouldShowRitualBanner(needsRitual || NEGATIVE_MOODS.includes(mood))
  }

  const handleSave = async (action: 'save' | 'autobiography' | 'ritual') => {
    setIsSaving(true)
    
    try {
      // Create journal entry
      const journalData: CreateJournalRequest = {
        title: title || `Journal Entry - ${new Date().toLocaleDateString()}`,
        body,
        type,
        mood,
        moodScore: mood ? MOOD_SCORES[mood as keyof typeof MOOD_SCORES] : undefined,
        tags: tags || [],
        linkedLifeAreas,
        linkedPeople
      }
      
      // Save to localStorage (in production, use API)
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        title: journalData.title,
        body: journalData.body,
        type: journalData.type,
        mood: journalData.mood,
        moodScore: journalData.moodScore,
        tags: journalData.tags || [],
        audioUrl: journalData.audioUrl,
        linkedLifeAreas: journalData.linkedLifeAreas,
        linkedPeople: journalData.linkedPeople,
        createdAt: new Date().toISOString()
      }
      
      // Save journal
      const existingJournals = JSON.parse(localStorage.getItem('wisdomos_journals') || '[]')
      existingJournals.push(newEntry)
      localStorage.setItem('wisdomos_journals', JSON.stringify(existingJournals))
      
      // Update mood history
      if (mood) {
        const moodHistory = JSON.parse(localStorage.getItem('wisdomos_mood_history') || '[]')
        linkedLifeAreas.forEach(areaId => {
          moodHistory.push({
            mood,
            date: new Date().toISOString(),
            lifeAreaId: areaId,
            journalId: newEntry.id
          })
        })
        localStorage.setItem('wisdomos_mood_history', JSON.stringify(moodHistory))
      }
      
      // Update people mentions
      linkedPeople.forEach(personName => {
        const people = JSON.parse(localStorage.getItem('wisdomos_people') || '[]')
        let person = people.find((p: any) => p.name === personName)
        
        if (!person) {
          person = {
            id: `person-${Date.now()}`,
            name: personName,
            mentionCount: 0,
            weight: 10,
            createdAt: new Date().toISOString()
          }
          people.push(person)
        }
        
        person.mentionCount++
        person.weight = Math.min(100, person.weight + 5)
        person.lastContact = new Date().toISOString()
        
        localStorage.setItem('wisdomos_people', JSON.stringify(people))
      })
      
      // Handle specific actions
      if (action === 'autobiography' && autobiographyYear) {
        // Save to autobiography
        const autobiographies = JSON.parse(localStorage.getItem('wisdomos_autobiographies') || '{}')
        if (!autobiographies[autobiographyYear]) {
          autobiographies[autobiographyYear] = {
            year: autobiographyYear,
            entries: []
          }
        }
        
        autobiographies[autobiographyYear].entries.push({
          journalId: newEntry.id,
          snippet: generateAutobiographySnippet(body),
          date: new Date().toISOString(),
          significance: mood
        })
        
        localStorage.setItem('wisdomos_autobiographies', JSON.stringify(autobiographies))
        newEntry.autobiographyYear = autobiographyYear
      }
      
      if (action === 'ritual') {
        // Open ritual wizard
        setShowRitualWizard(true)
        return // Don't close modal yet
      }
      
      // Check for coaching triggers
      try {
        const coachService = new WisdomCoachService('current_user') // TODO: Get from auth context
        const coachingSession = await coachService.processJournalEntry(newEntry)
        if (coachingSession) {
          // Notify user of coaching session (optional)
          console.log('Coaching session triggered:', coachingSession.id)
          // Could show toast notification or redirect to coach page
        }
      } catch (error) {
        console.error('Error checking coaching triggers:', error)
        // Don't prevent journal save on coaching error
      }
      
      // Callback
      if (onSave) {
        onSave(newEntry)
      }
      
      // Close modal
      onClose()
    } catch (error) {
      console.error('Error saving journal:', error)
      alert('Failed to save journal entry')
    } finally {
      setIsSaving(false)
    }
  }

  const handleVoiceToggle = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true)
      setType('voice')
      // In production, implement actual voice recording
      console.log('Starting voice recording...')
    } else {
      // Stop recording
      setIsRecording(false)
      console.log('Stopping voice recording...')
    }
  }

  const handleTagAdd = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const insertAtCursor = (text: string) => {
    if (bodyRef.current) {
      const start = bodyRef.current.selectionStart
      const end = bodyRef.current.selectionEnd
      const newBody = body.substring(0, start) + text + body.substring(end)
      setBody(newBody)
      
      // Set cursor position after inserted text
      setTimeout(() => {
        if (bodyRef.current) {
          bodyRef.current.selectionStart = start + text.length
          bodyRef.current.selectionEnd = start + text.length
          bodyRef.current.focus()
        }
      }, 0)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
            <div className="space-y-6">
              {/* Type Selection */}
              <div className="flex gap-3">
                {(['journal', 'voice', 'reflection'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      type === t
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    {t === 'journal' && <BookOpen className="w-5 h-5" />}
                    {t === 'voice' && <Mic className="w-5 h-5" />}
                    {t === 'reflection' && <Sparkles className="w-5 h-5" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your entry a meaningful title..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  How are you feeling?
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Object.entries(MOOD_EMOJIS).map(([moodKey, emoji]) => (
                    <button
                      key={moodKey}
                      onClick={() => setMood(mood === moodKey ? '' : moodKey)}
                      className={`px-3 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 hover:scale-105 ${
                        mood === moodKey
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 shadow-lg'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{moodKey}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ritual Banner */}
              {shouldShowRitualBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Consider a Boundary Reset Ritual
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        You've been experiencing challenging emotions in this area.
                        A reset ritual can help restore balance and clarity.
                      </p>
                      <button
                        onClick={() => setShowRitualWizard(true)}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        Start Ritual
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  What's on your mind?
                </label>
                <div className="relative">
                  <textarea
                    ref={bodyRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                    placeholder="Write your thoughts freely... Use @name to mention people and #tag for topics"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    rows={10}
                  />

                  {/* Voice Recording Button */}
                  {type === 'voice' && (
                    <button
                      onClick={handleVoiceToggle}
                      className={`absolute bottom-4 right-4 p-3 rounded-full transition-all shadow-lg ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse scale-110'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-110'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                </div>

                {/* Quick Insert Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => insertAtCursor('@')}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-amber-300 dark:hover:border-amber-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Mention
                  </button>
                  <button
                    onClick={() => insertAtCursor('#')}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-amber-300 dark:hover:border-amber-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Tag className="w-4 h-4" />
                    Tag
                  </button>
                  <button
                    onClick={() => {
                      const time = new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })
                      insertAtCursor(`[${time}] `)
                    }}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-amber-300 dark:hover:border-amber-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Time
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium flex items-center gap-2">
                      #{tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleTagAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>

              {/* Life Areas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Linked Life Areas
                  </label>
                  <button
                    onClick={() => setShowLifeAreaPanel(!showLifeAreaPanel)}
                    className="px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    {showLifeAreaPanel ? 'Hide' : 'Show'} Suggestions
                  </button>
                </div>

                {showLifeAreaPanel && (
                  <LifeAreaLinkPanel
                    lifeAreas={lifeAreas}
                    selectedAreas={linkedLifeAreas}
                    suggestedAreas={suggestedLifeAreas}
                    onToggle={(areaId) => {
                      if (linkedLifeAreas.includes(areaId)) {
                        setLinkedLifeAreas(linkedLifeAreas.filter(id => id !== areaId))
                      } else {
                        setLinkedLifeAreas([...linkedLifeAreas, areaId])
                      }
                    }}
                  />
                )}

                {!showLifeAreaPanel && linkedLifeAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {linkedLifeAreas.map(areaId => {
                      const area = lifeAreas.find(a => a.id === areaId)
                      return area ? (
                        <span key={areaId} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium flex items-center gap-1 hover:scale-105 transition-transform">
                          {area.icon} {area.name}
                        </span>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              {/* Linked People */}
              {linkedPeople.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    People Mentioned
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {linkedPeople.map((person) => (
                      <span key={person} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform">
                        <Users className="w-3 h-3" />
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Location (optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Where are you?"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Energy Level
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energy}
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-yellow-500 [&::-webkit-slider-thumb]:to-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg text-white font-bold text-sm shadow-lg">
                      {energy}
                    </div>
                  </div>
                </div>
              </div>

              {/* Autobiography Year */}
              {showAutobiographyYear && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Year for Autobiography
                  </label>
                  <input
                    type="number"
                    value={autobiographyYear || ''}
                    onChange={(e) => setAutobiographyYear(parseInt(e.target.value))}
                    placeholder="Enter year or leave blank to auto-detect"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                  />
                  {autobiographyYear && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg"
                    >
                      <Sparkles className="w-3 h-3" />
                      This entry will be added to your {autobiographyYear} autobiography
                    </motion.p>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-600"
              >
                Cancel
              </button>

              <div className="flex gap-3 flex-wrap">
                {NEGATIVE_MOODS.includes(mood) && (
                  <button
                    onClick={() => handleSave('ritual')}
                    disabled={isSaving || !body}
                    className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Apply Reset Ritual
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowAutobiographyYear(true)
                    handleSave('autobiography')
                  }}
                  disabled={isSaving || !body}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Save & Add to Autobiography
                </button>

                <button
                  onClick={() => handleSave('save')}
                  disabled={isSaving || !body}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 scale-105"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reset Ritual Wizard */}
        {showRitualWizard && (
          <ResetRitualWizard
            isOpen={showRitualWizard}
            onClose={() => setShowRitualWizard(false)}
            journalEntryId={`journal-${Date.now()}`}
            lifeAreas={lifeAreas}
            suggestedAreaId={linkedLifeAreas[0]}
            onComplete={() => {
              setShowRitualWizard(false)
              onClose()
            }}
          />
        )}
      </div>
    </AnimatePresence>
  )
}