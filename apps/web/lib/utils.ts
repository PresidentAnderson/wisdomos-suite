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