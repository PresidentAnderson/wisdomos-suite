// Life Area Mapping Rules
// Centralized mapping for tags/moods to Life Areas

import { NEGATIVE_MOODS } from '@/types/journal'

export interface LifeAreaMapping {
  id: string
  name: string
  keywords: string[]
  moods: string[]
  tags: string[]
  patterns: RegExp[]
}

export const LIFE_AREA_MAPPINGS: LifeAreaMapping[] = [
  {
    id: 'work-purpose',
    name: 'Work & Purpose',
    keywords: ['work', 'job', 'career', 'purpose', 'mission', 'calling', 'business', 'project', 'client', 'meeting', 'deadline'],
    moods: ['energized', 'frustrated', 'overwhelmed'],
    tags: ['#work', '#career', '#goals', '#productivity', '#achievement'],
    patterns: [/\bwork\b/i, /\bjob\b/i, /\bcareer\b/i, /\bbusiness\b/i]
  },
  {
    id: 'health-recovery',
    name: 'Health & Recovery',
    keywords: ['health', 'fitness', 'exercise', 'workout', 'sleep', 'energy', 'tired', 'sick', 'doctor', 'meditation', 'yoga'],
    moods: ['tired', 'energized', 'peaceful'],
    tags: ['#health', '#fitness', '#wellness', '#selfcare', '#meditation'],
    patterns: [/\bhealth\b/i, /\bfitness\b/i, /\bexercise\b/i, /\bsleep\b/i]
  },
  {
    id: 'finance',
    name: 'Finance',
    keywords: ['money', 'budget', 'savings', 'investment', 'debt', 'income', 'expense', 'financial', 'payment', 'bill'],
    moods: ['anxious', 'content', 'overwhelmed'],
    tags: ['#finance', '#money', '#budget', '#investing', '#savings'],
    patterns: [/\bmoney\b/i, /\bfinance\b/i, /\bbudget\b/i, /\binvest/i]
  },
  {
    id: 'intimacy-love',
    name: 'Intimacy & Love',
    keywords: ['love', 'partner', 'relationship', 'intimacy', 'romance', 'dating', 'marriage', 'spouse', 'sex', 'connection'],
    moods: ['happy', 'sad', 'grateful', 'anxious'],
    tags: ['#love', '#relationship', '#intimacy', '#romance', '#partnership'],
    patterns: [/\blove\b/i, /\bpartner\b/i, /\brelationship\b/i, /\bintimacy\b/i]
  },
  {
    id: 'family',
    name: 'Family',
    keywords: ['family', 'parents', 'mother', 'father', 'siblings', 'children', 'kids', 'parenting', 'relatives'],
    moods: ['grateful', 'frustrated', 'happy'],
    tags: ['#family', '#parenting', '#children', '#parents'],
    patterns: [/\bfamily\b/i, /\bparent/i, /\bmother\b/i, /\bfather\b/i, /\bchild/i]
  },
  {
    id: 'friendship-community',
    name: 'Friendship & Community',
    keywords: ['friends', 'friendship', 'community', 'social', 'gathering', 'party', 'hangout', 'connection', 'support'],
    moods: ['happy', 'grateful', 'content'],
    tags: ['#friends', '#community', '#social', '#connection', '#gratitude'],
    patterns: [/\bfriend/i, /\bcommunity\b/i, /\bsocial\b/i]
  },
  {
    id: 'creativity-expression',
    name: 'Creativity & Expression',
    keywords: ['creative', 'art', 'writing', 'music', 'design', 'expression', 'imagination', 'project', 'craft', 'painting'],
    moods: ['creative', 'excited', 'content'],
    tags: ['#creativity', '#art', '#writing', '#music', '#expression'],
    patterns: [/\bcreativ/i, /\bart\b/i, /\bwriting\b/i, /\bmusic\b/i]
  },
  {
    id: 'emotional-regulation',
    name: 'Emotional Regulation',
    keywords: ['emotions', 'feelings', 'anxiety', 'stress', 'calm', 'peace', 'anger', 'sadness', 'therapy', 'healing'],
    moods: ['anxious', 'sad', 'angry', 'peaceful', 'overwhelmed'],
    tags: ['#emotions', '#mentalhealth', '#therapy', '#healing', '#mindfulness'],
    patterns: [/\bemotion/i, /\bfeeling/i, /\banxiety\b/i, /\bstress\b/i]
  },
  {
    id: 'spirituality-practice',
    name: 'Spirituality & Practice',
    keywords: ['spiritual', 'god', 'universe', 'prayer', 'meditation', 'faith', 'belief', 'soul', 'divine', 'sacred'],
    moods: ['peaceful', 'grateful', 'content'],
    tags: ['#spirituality', '#meditation', '#prayer', '#faith', '#mindfulness'],
    patterns: [/\bspiritual/i, /\bgod\b/i, /\bprayer\b/i, /\bfaith\b/i]
  },
  {
    id: 'learning-growth',
    name: 'Learning & Growth',
    keywords: ['learn', 'study', 'education', 'growth', 'development', 'skill', 'knowledge', 'course', 'book', 'reading'],
    moods: ['excited', 'curious', 'overwhelmed'],
    tags: ['#learning', '#growth', '#education', '#development', '#reading'],
    patterns: [/\blearn/i, /\bstudy\b/i, /\bgrowth\b/i, /\beducation\b/i]
  },
  {
    id: 'home-environment',
    name: 'Home & Environment',
    keywords: ['home', 'house', 'apartment', 'room', 'space', 'clean', 'organize', 'decor', 'environment', 'living'],
    moods: ['content', 'peaceful', 'frustrated'],
    tags: ['#home', '#space', '#environment', '#organization'],
    patterns: [/\bhome\b/i, /\bhouse\b/i, /\bapartment\b/i, /\bspace\b/i]
  },
  {
    id: 'adventure-travel',
    name: 'Adventure & Travel',
    keywords: ['travel', 'adventure', 'trip', 'vacation', 'explore', 'journey', 'destination', 'flight', 'hotel'],
    moods: ['excited', 'happy', 'energized'],
    tags: ['#travel', '#adventure', '#exploration', '#vacation'],
    patterns: [/\btravel/i, /\badventure\b/i, /\btrip\b/i, /\bvacation\b/i]
  },
  {
    id: 'time-energy',
    name: 'Time & Energy',
    keywords: ['time', 'energy', 'schedule', 'busy', 'productivity', 'focus', 'distraction', 'procrastination', 'efficiency'],
    moods: ['overwhelmed', 'tired', 'energized'],
    tags: ['#time', '#energy', '#productivity', '#focus'],
    patterns: [/\btime\b/i, /\benergy\b/i, /\bproductiv/i, /\bfocus\b/i]
  }
]

// Function to suggest Life Areas based on journal content
export function suggestLifeAreas(
  body: string,
  tags: string[],
  mood?: string
): string[] {
  const suggestions = new Set<string>()
  const lowerBody = body.toLowerCase()
  
  LIFE_AREA_MAPPINGS.forEach(mapping => {
    // Check keywords
    const hasKeyword = mapping.keywords.some(keyword => 
      lowerBody.includes(keyword.toLowerCase())
    )
    
    // Check tags
    const hasTag = tags.some(tag => 
      mapping.tags.some(mappingTag => 
        tag.toLowerCase() === mappingTag.toLowerCase()
      )
    )
    
    // Check mood
    const hasMood = mood && mapping.moods.includes(mood)
    
    // Check patterns
    const hasPattern = mapping.patterns.some(pattern => 
      pattern.test(body)
    )
    
    // Add to suggestions if any match
    if (hasKeyword || hasTag || hasMood || hasPattern) {
      suggestions.add(mapping.id)
    }
  })
  
  return Array.from(suggestions)
}

// Function to detect people mentions (@Name)
export function extractPeopleMentions(body: string): string[] {
  const mentions = body.match(/@([A-Za-z]+(?:\s+[A-Za-z]+)?)/g) || []
  return mentions.map(m => m.substring(1).trim())
}

// Function to extract hashtags
export function extractHashtags(body: string): string[] {
  const hashtags = body.match(/#[A-Za-z0-9_]+/g) || []
  return hashtags.map(h => h.substring(1))
}

// Function to determine if Reset Ritual should be suggested
export function shouldSuggestRitual(
  moodHistory: { mood: string; date: string }[],
  lifeAreaId: string,
  daysToCheck: number = 7
): boolean {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToCheck)
  
  const recentMoods = moodHistory.filter(entry => 
    new Date(entry.date) >= cutoffDate
  )
  
  const negativeCount = recentMoods.filter(entry => 
    NEGATIVE_MOODS.includes(entry.mood)
  ).length
  
  // Suggest ritual if 3+ negative moods in the time period
  return negativeCount >= 3
}

// Function to infer year from journal text
export function inferYearFromText(body: string): number | null {
  // Look for explicit years
  const yearMatch = body.match(/\b(19\d{2}|20\d{2})\b/)
  if (yearMatch) {
    return parseInt(yearMatch[1])
  }
  
  // Look for age references
  const ageMatch = body.match(/when I was (\d+)/i)
  if (ageMatch) {
    const age = parseInt(ageMatch[1])
    const currentYear = new Date().getFullYear()
    const birthYear = currentYear - 30 // Assuming average user age
    return birthYear + age
  }
  
  // Look for relative time references
  const relativeMatches = {
    'last year': -1,
    'two years ago': -2,
    'three years ago': -3,
    'five years ago': -5,
    'ten years ago': -10,
    'in college': -10, // Rough estimate
    'in high school': -15,
    'as a child': -25,
    'as a kid': -25
  }
  
  for (const [phrase, yearsAgo] of Object.entries(relativeMatches)) {
    if (body.toLowerCase().includes(phrase)) {
      return new Date().getFullYear() + yearsAgo
    }
  }
  
  return null
}

// Function to generate snippet for autobiography
export function generateAutobiographySnippet(
  body: string,
  maxLength: number = 200
): string {
  // Remove @mentions and clean up
  let snippet = body.replace(/@[A-Za-z]+(?:\s+[A-Za-z]+)?/g, '[person]')
  
  // Find the most meaningful sentence (first or one with emotion words)
  const sentences = snippet.split(/[.!?]+/)
  const emotionWords = ['felt', 'realized', 'learned', 'discovered', 'understood', 'experienced']
  
  const meaningfulSentence = sentences.find(s => 
    emotionWords.some(word => s.toLowerCase().includes(word))
  ) || sentences[0]
  
  if (meaningfulSentence.length <= maxLength) {
    return meaningfulSentence.trim()
  }
  
  return meaningfulSentence.substring(0, maxLength - 3).trim() + '...'
}

// Function to determine Life Area health based on recent moods
export function calculateLifeAreaHealth(
  moods: { mood: string; score: number }[],
  ritualCount: number
): 'healthy' | 'attention' | 'critical' {
  if (moods.length === 0) return 'healthy'
  
  const avgScore = moods.reduce((sum, m) => sum + m.score, 0) / moods.length
  const negativeCount = moods.filter(m => NEGATIVE_MOODS.includes(m.mood)).length
  const negativeRatio = negativeCount / moods.length
  
  if (avgScore >= 7 && negativeRatio < 0.2) {
    return 'healthy'
  } else if (avgScore >= 5 || negativeRatio < 0.5) {
    return 'attention'
  } else {
    return 'critical'
  }
}

// Function to calculate relationship weight based on mentions
export function calculatePersonWeight(
  mentionCount: number,
  lastContactDays: number,
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
): number {
  let weight = mentionCount * 10
  
  // Recency bonus
  if (lastContactDays <= 7) weight += 20
  else if (lastContactDays <= 30) weight += 10
  
  // Sentiment modifier
  if (sentiment === 'positive') weight *= 1.2
  else if (sentiment === 'negative') weight *= 0.8
  
  return Math.min(100, weight) // Cap at 100
}