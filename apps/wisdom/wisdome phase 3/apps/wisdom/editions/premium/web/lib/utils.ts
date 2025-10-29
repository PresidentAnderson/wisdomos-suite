import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color status helpers
export function getStatusColor(score: number, hasUpsets: boolean, hasBrokenCommitments: boolean): 'green' | 'yellow' | 'red' {
  if (score <= -2 || (hasBrokenCommitments && score < 0)) return 'red'
  if (hasUpsets || score <= 1) return 'yellow'
  if (score >= 2 && !hasBrokenCommitments) return 'green'
  return 'yellow'
}

export function getStatusEmoji(status: 'green' | 'yellow' | 'red'): string {
  const map = {
    green: '🟢',
    yellow: '🟡',
    red: '🔴'
  }
  return map[status]
}

export function getPhoenixStage(score: number): 'ashes' | 'fire' | 'rebirth' | 'flight' {
  if (score <= -2) return 'ashes'
  if (score <= 0) return 'fire'
  if (score <= 2) return 'rebirth'
  return 'flight'
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d)
}

// Enhanced Phoenix-specific utility functions
export const phoenixUtils = {
  // Generate Phoenix-themed gradients
  getPhoenixGradient: (intensity: 'subtle' | 'medium' | 'intense' = 'medium') => {
    const gradients = {
      subtle: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 145, 77, 0.1) 50%, rgba(230, 57, 70, 0.1) 100%)',
      medium: 'linear-gradient(135deg, #FFD700 0%, #FF914D 50%, #E63946 100%)',
      intense: 'linear-gradient(135deg, #FFD700 0%, #FF914D 25%, #E63946 50%, #DC143C 75%, #B91C1C 100%)'
    }
    return gradients[intensity]
  },

  // Generate wisdom status colors with Phoenix theme
  getWisdomColor: (score: number) => {
    if (score >= 80) return { color: '#10B981', status: 'thriving', glow: 'shadow-wisdom-green/30' }
    if (score >= 50) return { color: '#F59E0B', status: 'attention', glow: 'shadow-wisdom-yellow/30' }
    return { color: '#EF4444', status: 'breakdown', glow: 'shadow-wisdom-red/30' }
  },

  // Phoenix cycle phase detector
  getPhoenixPhase: (score: number, lastUpdate: Date) => {
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (score < 30) return { phase: 'ash', color: '#2C3E50', animation: 'animate-ash-scatter' }
    if (score < 50) return { phase: 'ember', color: '#F77F00', animation: 'animate-ember-glow' }
    if (score < 80) return { phase: 'transformation', color: '#FF914D', animation: 'animate-transformation' }
    return { phase: 'phoenix', color: '#FFD700', animation: 'animate-phoenix-rise' }
  },

  // Format Phoenix timestamps
  formatPhoenixTime: (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today - Phoenix Burns Bright'
    if (diffDays === 1) return 'Yesterday - Phoenix Remembers'
    if (diffDays < 7) return `${diffDays} days ago - Phoenix Reflection`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago - Phoenix Wisdom`
    return `${Math.floor(diffDays / 30)} months ago - Phoenix Legacy`
  },

  // Generate secure random Phoenix IDs
  generatePhoenixId: () => {
    const prefix = 'phx'
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2)
    return `${prefix}_${timestamp}_${random}`
  },

  // Phoenix theme class generator
  getPhoenixClass: (variant: 'default' | 'ash' | 'ember' | 'gold' | 'transformation', effect?: 'glow' | 'float' | 'pulse') => {
    const baseClasses = {
      default: 'bg-phoenix-gradient text-white',
      ash: 'bg-ash-gradient text-phoenix-gold',
      ember: 'bg-phoenix-ember text-white',
      gold: 'bg-phoenix-gold text-phoenix-smoke',
      transformation: 'bg-transformation-gradient text-white'
    }
    
    const effects = {
      glow: 'animate-ember-glow shadow-phoenix',
      float: 'animate-float',
      pulse: 'animate-pulse-gold'
    }
    
    return cn(baseClasses[variant], effect && effects[effect])
  }
}

// Type-safe Phoenix storage helpers
export const phoenixStorage = {
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(`phoenix_${key}`, JSON.stringify(value))
    } catch (error) {
      console.warn('Phoenix Storage: Unable to save to localStorage', error)
    }
  },
  
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(`phoenix_${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('Phoenix Storage: Unable to read from localStorage', error)
      return defaultValue
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(`phoenix_${key}`)
    } catch (error) {
      console.warn('Phoenix Storage: Unable to remove from localStorage', error)
    }
  }
}