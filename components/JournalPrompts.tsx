'use client'

import { useState, useEffect } from 'react'

interface Prompt {
  id: string
  text: string
  category: string
  difficulty: 'easy' | 'medium' | 'deep'
}

const prompts: Prompt[] = [
  // Easy prompts
  { id: '1', text: 'What made you smile today?', category: 'gratitude', difficulty: 'easy' },
  { id: '2', text: 'Describe your perfect day.', category: 'imagination', difficulty: 'easy' },
  { id: '3', text: 'What are three things you&apos;re grateful for?', category: 'gratitude', difficulty: 'easy' },
  { id: '4', text: 'What&apos;s your favorite memory from this week?', category: 'reflection', difficulty: 'easy' },
  { id: '5', text: 'What song best describes your mood today?', category: 'creative', difficulty: 'easy' },
  
  // Medium prompts
  { id: '6', text: 'What would you tell your younger self?', category: 'reflection', difficulty: 'medium' },
  { id: '7', text: 'How have you grown in the last year?', category: 'growth', difficulty: 'medium' },
  { id: '8', text: 'What fear would you like to overcome?', category: 'courage', difficulty: 'medium' },
  { id: '9', text: 'Describe a moment when you felt truly alive.', category: 'mindfulness', difficulty: 'medium' },
  { id: '10', text: 'What does success mean to you?', category: 'values', difficulty: 'medium' },
  
  // Deep prompts
  { id: '11', text: 'What parts of yourself are you still discovering?', category: 'self-discovery', difficulty: 'deep' },
  { id: '12', text: 'How do you want to be remembered?', category: 'legacy', difficulty: 'deep' },
  { id: '13', text: 'What truth about yourself are you avoiding?', category: 'honesty', difficulty: 'deep' },
  { id: '14', text: 'What would you do if you knew you couldn&apos;t fail?', category: 'dreams', difficulty: 'deep' },
  { id: '15', text: 'What story are you telling yourself that no longer serves you?', category: 'growth', difficulty: 'deep' }
]

interface JournalPromptsProps {
  onSelectPrompt: (prompt: string) => void
  difficulty?: 'all' | 'easy' | 'medium' | 'deep'
}

export default function JournalPrompts({ onSelectPrompt, difficulty = 'all' }: JournalPromptsProps) {
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null)
  const [usedPromptIds, setUsedPromptIds] = useState<string[]>([])
  
  const getRandomPrompt = () => {
    const availablePrompts = prompts.filter(p => {
      const difficultyMatch = difficulty === 'all' || p.difficulty === difficulty
      const notUsed = !usedPromptIds.includes(p.id)
      return difficultyMatch && notUsed
    })
    
    if (availablePrompts.length === 0) {
      // Reset if all prompts have been used
      setUsedPromptIds([])
      return prompts[Math.floor(Math.random() * prompts.length)]
    }
    
    return availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
  }
  
  const handleNewPrompt = () => {
    const prompt = getRandomPrompt()
    setCurrentPrompt(prompt)
    if (prompt) {
      setUsedPromptIds([...usedPromptIds, prompt.id])
    }
  }
  
  useEffect(() => {
    handleNewPrompt()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/20 text-green-300'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300'
      case 'deep': return 'bg-purple-500/20 text-purple-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }
  
  return (
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">💭</span>
          Daily Prompt
        </h3>
        <button
          onClick={handleNewPrompt}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
          title="Get new prompt"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>
      
      {currentPrompt && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-white text-lg leading-relaxed">
                {currentPrompt.text}
              </p>
              <div className="flex gap-2 mt-3">
                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(currentPrompt.difficulty)}`}>
                  {currentPrompt.difficulty}
                </span>
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                  {currentPrompt.category}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onSelectPrompt(currentPrompt.text)}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors"
          >
            Use This Prompt
          </button>
        </div>
      )}
      
      {/* Difficulty Selector */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm text-gray-400 mb-2">Prompt Difficulty:</p>
        <div className="flex gap-2">
          {['all', 'easy', 'medium', 'deep'].map(diff => (
            <button
              key={diff}
              className={`px-3 py-1 rounded-full text-xs capitalize transition-colors
                ${difficulty === diff 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              onClick={() => {/* Handle difficulty change */}}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}