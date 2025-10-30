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
  MapPin
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Type Selection */}
              <div className="flex gap-2">
                {(['journal', 'voice', 'reflection'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={type === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setType(t)}
                  >
                    {t === 'journal' && <BookOpen className="w-4 h-4 mr-1" />}
                    {t === 'voice' && <Mic className="w-4 h-4 mr-1" />}
                    {t === 'reflection' && <Sparkles className="w-4 h-4 mr-1" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                />
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MOOD_EMOJIS).map(([moodKey, emoji]) => (
                    <button
                      key={moodKey}
                      onClick={() => setMood(mood === moodKey ? '' : moodKey)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        mood === moodKey
                          ? 'border-phoenix-orange bg-phoenix-orange/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl mr-1">{emoji}</span>
                      <span className="text-sm">{moodKey}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ritual Banner */}
              {shouldShowRitualBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Consider a Boundary Reset Ritual
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        You've been experiencing challenging emotions in this area. 
                        A reset ritual can help restore balance.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setShowRitualWizard(true)}
                      >
                        Start Ritual
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What's on your mind?
                </label>
                <div className="relative">
                  <textarea
                    ref={bodyRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                    placeholder="Write your thoughts... Use @name to mention people and #tag for topics"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent resize-none"
                    rows={8}
                  />
                  
                  {/* Voice Recording Button */}
                  {type === 'voice' && (
                    <button
                      onClick={handleVoiceToggle}
                      className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                
                {/* Quick Insert Buttons */}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertAtCursor('@')}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Mention
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => insertAtCursor('#')}
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    Tag
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const time = new Date().toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })
                      insertAtCursor(`[${time}] `)
                    }}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Time
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 text-xs hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Linked Life Areas
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLifeAreaPanel(!showLifeAreaPanel)}
                  >
                    {showLifeAreaPanel ? 'Hide' : 'Show'} Suggestions
                  </Button>
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
                        <Badge key={areaId} variant="outline">
                          {area.icon} {area.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              {/* Linked People */}
              {linkedPeople.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    People Mentioned
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {linkedPeople.map((person) => (
                      <Badge key={person} variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Where are you?"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Energy Level
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energy}
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{energy}</span>
                  </div>
                </div>
              </div>

              {/* Autobiography Year */}
              {showAutobiographyYear && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year for Autobiography
                  </label>
                  <input
                    type="number"
                    value={autobiographyYear || ''}
                    onChange={(e) => setAutobiographyYear(parseInt(e.target.value))}
                    placeholder="Enter year or leave blank to auto-detect"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {autobiographyYear && (
                    <p className="text-xs text-gray-500 mt-1">
                      This entry will be added to your {autobiographyYear} autobiography
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="flex gap-2">
                {NEGATIVE_MOODS.includes(mood) && (
                  <PhoenixButton
                    variant="secondary"
                    onClick={() => handleSave('ritual')}
                    disabled={isSaving || !body}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Apply Reset Ritual
                  </PhoenixButton>
                )}
                
                <PhoenixButton
                  variant="secondary"
                  onClick={() => {
                    setShowAutobiographyYear(true)
                    handleSave('autobiography')
                  }}
                  disabled={isSaving || !body}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Save & Add to Autobiography
                </PhoenixButton>
                
                <PhoenixButton
                  onClick={() => handleSave('save')}
                  disabled={isSaving || !body}
                  className="bg-gradient-to-r from-phoenix-gold to-phoenix-orange"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </PhoenixButton>
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