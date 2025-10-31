'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Mood {
  emoji: string
  label: string
  value: string
}

const moods: Mood[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😡', label: 'Angry', value: 'angry' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🤗', label: 'Grateful', value: 'grateful' },
  { emoji: '😎', label: 'Confident', value: 'confident' },
  { emoji: '🤔', label: 'Thoughtful', value: 'thoughtful' },
  { emoji: '😅', label: 'Stressed', value: 'stressed' },
  { emoji: '🥰', label: 'Loved', value: 'loved' },
  { emoji: '💪', label: 'Motivated', value: 'motivated' }
]

interface QuickMoodTrackerProps {
  onMoodSaved?: (mood: string) => void
  showLabel?: boolean
  autoSave?: boolean
}

export default function QuickMoodTracker({ 
  onMoodSaved, 
  showLabel = true,
  autoSave = true 
}: QuickMoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const saveMoodEntry = async (mood: string) => {
    setSaving(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const moodData = moods.find(m => m.value === mood)
      const currentTime = new Date()
      const timeString = currentTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Mood Check-in: ${moodData?.label} ${moodData?.emoji}`,
          body: `I'm feeling ${moodData?.label.toLowerCase()} at ${timeString}`,
          type: 'reflection',
          mood: mood,
          tags: ['mood-tracking', 'quick-entry', mood],
          isQuickMood: true
        })
      })

      if (response.ok) {
        setSelectedMood(mood)
        setMessage(`Mood saved! ${moodData?.emoji}`)
        
        // Show success animation
        setTimeout(() => {
          setMessage('')
          if (onMoodSaved) {
            onMoodSaved(mood)
          }
        }, 2000)
      } else {
        setMessage('Failed to save mood')
      }
    } catch (error) {
      console.error('Error saving mood:', error)
      setMessage('Error saving mood')
    } finally {
      setSaving(false)
    }
  }

  const handleMoodClick = async (mood: string) => {
    if (autoSave && !saving) {
      await saveMoodEntry(mood)
    } else {
      setSelectedMood(mood)
      if (!autoSave && onMoodSaved) {
        onMoodSaved(mood)
      }
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-xl p-4 border border-gray-200">
      {showLabel && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-black">Quick Mood Check-in</h3>
          {message && (
            <span className="text-sm text-green-600 animate-pulse">
              {message}
            </span>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodClick(mood.value)}
            disabled={saving}
            className={`
              relative p-3 rounded-lg transition-all transform hover:scale-110
              ${selectedMood === mood.value 
                ? 'bg-white/30 ring-2 ring-cyan-400 scale-110' 
                : 'bg-white/10 hover:bg-white/20'}
              ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              flex flex-col items-center gap-1
            `}
            title={`I'm feeling ${mood.label.toLowerCase()}`}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs text-gray-700 hidden sm:block">
              {mood.label}
            </span>
            {selectedMood === mood.value && !saving && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            )}
          </button>
        ))}
      </div>
      
      {saving && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-black">Saving mood...</span>
          </div>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-600 text-center">
        Click any mood to instantly save it to your journal
      </div>
    </div>
  )
}