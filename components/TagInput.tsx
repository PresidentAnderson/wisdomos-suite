'use client'

import { useState, KeyboardEvent } from 'react'

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  suggestions?: string[]
  maxTags?: number
  placeholder?: string
}

export default function TagInput({ 
  tags, 
  onTagsChange, 
  suggestions = [],
  maxTags = 10,
  placeholder = 'Add tags...'
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const defaultSuggestions = [
    'personal-growth',
    'reflection', 
    'gratitude',
    'goals',
    'relationships',
    'work',
    'health',
    'creativity',
    'mindfulness',
    'achievement',
    'challenge',
    'learning',
    'family',
    'travel',
    'inspiration'
  ]
  
  const allSuggestions = [...new Set([...defaultSuggestions, ...suggestions])]
  const filteredSuggestions = allSuggestions.filter(s => 
    s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  )
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }
  
  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-')
    if (!tags.includes(normalizedTag) && tags.length < maxTags) {
      onTagsChange([...tags, normalizedTag])
      setInputValue('')
      setShowSuggestions(false)
    }
  }
  
  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-300">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm"
          >
            #{tag}
            <button
              onClick={() => removeTag(index)}
              className="hover:text-red-600 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-black placeholder-gray-400 outline-none"
          disabled={tags.length >= maxTags}
        />
      </div>
      
      {/* Tag Suggestions */}
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 p-2 max-h-40 overflow-y-auto shadow-lg">
          <p className="text-xs text-gray-600 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {filteredSuggestions.slice(0, 10).map(suggestion => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-black rounded text-sm transition-colors"
              >
                #{suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Popular Tags */}
      {!inputValue && tags.length === 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-400">Popular:</span>
          {allSuggestions.slice(0, 5).map(tag => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 rounded text-xs transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}