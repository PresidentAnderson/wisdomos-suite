'use client'

import { useState } from 'react'

interface Mood {
  emoji: string
  label: string
  color: string
  value: string
}

const moods: Mood[] = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-500', value: 'happy' },
  { emoji: '😔', label: 'Sad', color: 'bg-blue-500', value: 'sad' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-500', value: 'angry' },
  { emoji: '😰', label: 'Anxious', color: 'bg-purple-500', value: 'anxious' },
  { emoji: '😌', label: 'Calm', color: 'bg-green-500', value: 'calm' },
  { emoji: '😴', label: 'Tired', color: 'bg-gray-500', value: 'tired' },
  { emoji: '🤗', label: 'Grateful', color: 'bg-pink-500', value: 'grateful' },
  { emoji: '😎', label: 'Confident', color: 'bg-indigo-500', value: 'confident' },
  { emoji: '🤔', label: 'Thoughtful', color: 'bg-cyan-500', value: 'thoughtful' },
  { emoji: '😅', label: 'Stressed', color: 'bg-orange-500', value: 'stressed' },
  { emoji: '🥰', label: 'Loved', color: 'bg-rose-500', value: 'loved' },
  { emoji: '💪', label: 'Motivated', color: 'bg-emerald-500', value: 'motivated' }
]

interface MoodSelectorProps {
  selectedMood: string
  onMoodSelect: (mood: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function MoodSelector({ selectedMood, onMoodSelect, size = 'md' }: MoodSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const sizeClasses = {
    sm: 'text-2xl p-2',
    md: 'text-3xl p-3',
    lg: 'text-4xl p-4'
  }
  
  const selectedMoodData = moods.find(m => m.value === selectedMood)
  
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-black">How are you feeling?</span>
        {selectedMoodData && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <span className="text-2xl">{selectedMoodData.emoji}</span>
            <span className="text-black">{selectedMoodData.label}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isExpanded ? (
          moods.map(mood => (
            <button
              key={mood.value}
              onClick={() => {
                onMoodSelect(mood.value)
                setIsExpanded(false)
              }}
              className={`
                ${sizeClasses[size]}
                ${selectedMood === mood.value ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'}
                rounded-lg transition-all transform hover:scale-110
                flex flex-col items-center gap-1
              `}
              title={mood.label}
            >
              <span>{mood.emoji}</span>
              <span className="text-xs text-black">{mood.label}</span>
            </button>
          ))
        ) : (
          <>
            {moods.slice(0, 6).map(mood => (
              <button
                key={mood.value}
                onClick={() => onMoodSelect(mood.value)}
                className={`
                  ${sizeClasses[size]}
                  ${selectedMood === mood.value ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'}
                  rounded-lg transition-all transform hover:scale-110
                `}
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
            <button
              onClick={() => setIsExpanded(true)}
              className={`
                ${sizeClasses[size]}
                bg-white/10 hover:bg-white/20
                rounded-lg transition-all
                text-white font-bold
              `}
            >
              +
            </button>
          </>
        )}
      </div>
    </div>
  )
}