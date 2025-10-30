// Journal Entry Types
export interface JournalEntry {
  id: string
  title: string
  body: string
  type: 'journal' | 'voice' | 'reflection'
  mood?: string
  moodScore?: number // 1-10 for tracking
  tags: string[]
  createdAt: string
  updatedAt?: string
  audioUrl?: string
  
  // Relationships
  linkedLifeAreas?: string[]   // LifeArea IDs
  linkedPeople?: string[]      // Person IDs
  resetRitualApplied?: boolean
  resetRitualId?: string
  autobiographyYear?: number
  
  // Additional metadata
  location?: string
  weather?: string
  energy?: number // 1-10
  gratitudes?: string[]
}

// Reset Ritual Types
export interface ResetRitual {
  id: string
  journalEntryId: string
  createdAt: string
  
  // Step 1: Pause & Pattern Interrupt
  pauseNote: string
  actualSituation: string
  
  // Step 2: Scan & Acknowledge
  boundaryArea: string // Life Area ID
  pulledEnergy?: string // Who/what pulled energy
  acknowledgment: string
  forgiveness?: string
  
  // Step 3: Recommit & Recalibrate
  recommitment: string
  restoreAction: string
  newBoundary?: string
  
  // Outcome
  completedAt?: string
  outcome?: string
  followUpDate?: string
}

// Boundary Audit Types
export interface BoundaryAudit {
  id: string
  lifeAreaId: string
  month: string
  year: number
  
  // Tracking
  boundariesCrossed: number
  ritualsCompleted: number
  energyLeaks: string[]
  
  // Status
  status: 'healthy' | 'attention' | 'critical'
  color: 'green' | 'yellow' | 'red'
  
  // Notes
  patterns?: string[]
  improvements?: string[]
  
  createdAt: string
  updatedAt: string
}

// Person/Relationship Types
export interface Person {
  id: string
  name: string
  relationship?: string // friend, family, colleague, etc.
  frequency?: number // 1-10 contact frequency
  lastContact?: string
  notes?: string
  tags?: string[]
  
  // Metrics
  mentionCount: number
  weight: number // For visual prominence
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
  
  // Life areas they're associated with
  lifeAreas?: string[]
  
  createdAt: string
  updatedAt: string
}

// Mood Analysis Types
export interface MoodTrend {
  lifeAreaId: string
  period: '7days' | '30days' | '90days'
  averageMood: number
  moodCounts: {
    positive: number
    neutral: number
    negative: number
  }
  trend: 'improving' | 'stable' | 'declining'
  shouldTriggerRitual: boolean
  lastAnalyzed: string
}

// Autobiography Entry
export interface AutobiographyEntry {
  id: string
  year: number
  title?: string
  entries: {
    journalId: string
    snippet: string
    date: string
    significance?: string
  }[]
  themes?: string[]
  patterns?: string[]
  growth?: string
  
  createdAt: string
  updatedAt: string
}

// Life Area Extended (for journal integration)
export interface LifeAreaExtended {
  id: string
  name: string
  phoenixName?: string
  icon?: string
  color?: string
  
  // Journal integration
  recentMood?: string
  recentMoodScore?: number
  lastJournalEntry?: string
  journalCount?: number
  
  // Boundary tracking
  boundaryHealth: 'healthy' | 'attention' | 'critical'
  recentRituals?: number
  
  // Status
  status?: 'thriving' | 'attention' | 'collapsed'
  score?: number
}

// API Request/Response Types
export interface CreateJournalRequest {
  title: string
  body: string
  type: 'journal' | 'voice' | 'reflection'
  mood?: string
  moodScore?: number
  tags?: string[]
  audioUrl?: string
  linkedLifeAreas?: string[]
  linkedPeople?: string[]
}

export interface LinkLifeAreasRequest {
  entryId: string
  lifeAreaIds: string[]
}

export interface LinkPeopleRequest {
  entryId: string
  personIds: string[]
}

export interface AppendAutobiographyRequest {
  entryId: string
  year: number
  snippet?: string
  significance?: string
}

export interface CreateResetRitualRequest {
  entryId: string
  pauseNote: string
  actualSituation: string
  boundaryArea: string
  pulledEnergy?: string
  acknowledgment: string
  forgiveness?: string
  recommitment: string
  restoreAction: string
  newBoundary?: string
}

// Mood mappings
export const MOOD_EMOJIS = {
  excited: '🤩',
  happy: '😊',
  content: '😌',
  neutral: '😐',
  anxious: '😰',
  sad: '😢',
  angry: '😠',
  frustrated: '😤',
  overwhelmed: '😵',
  peaceful: '😇',
  grateful: '🙏',
  creative: '🎨',
  tired: '😴',
  energized: '⚡',
  confused: '😕'
}

export const MOOD_SCORES = {
  excited: 10,
  happy: 9,
  content: 8,
  peaceful: 8,
  grateful: 8,
  creative: 8,
  energized: 9,
  neutral: 5,
  confused: 4,
  tired: 4,
  anxious: 3,
  frustrated: 3,
  sad: 2,
  angry: 2,
  overwhelmed: 1
}

export const NEGATIVE_MOODS = ['anxious', 'sad', 'angry', 'frustrated', 'overwhelmed']
export const POSITIVE_MOODS = ['excited', 'happy', 'content', 'peaceful', 'grateful', 'creative', 'energized']
export const NEUTRAL_MOODS = ['neutral', 'confused', 'tired']