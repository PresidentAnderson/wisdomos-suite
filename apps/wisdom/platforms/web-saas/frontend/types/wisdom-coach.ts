// Wisdom Coach System Types
// AI-powered coaching that transforms journal entries into actionable insights

export interface CoachingSession {
  id: string
  userId: string
  triggeredBy: 'journal' | 'upset' | 'mood_trend' | 'life_area_collapse' | 'manual'
  triggerData: {
    entryId?: string
    lifeAreaId?: string
    moodTrend?: string
    context?: string
  }
  status: 'active' | 'completed' | 'paused'
  createdAt: string
  completedAt?: string
  insights: CoachingInsight[]
  recommendations: CoachingRecommendation[]
  followUpScheduled?: string
}

export interface CoachingInsight {
  id: string
  type: 'pattern' | 'trigger' | 'strength' | 'opportunity' | 'boundary'
  title: string
  description: string
  confidence: number // 0-100
  evidence: string[] // References to journal entries or data points
  lifeAreasAffected: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
}

export interface CoachingRecommendation {
  id: string
  sessionId: string
  type: 'boundary_reset' | 'life_area_focus' | 'relationship_repair' | 'habit_change' | 'mindset_shift'
  title: string
  description: string
  actionSteps: ActionStep[]
  timeframe: '1_day' | '1_week' | '1_month' | '3_months'
  difficulty: 'easy' | 'moderate' | 'challenging' | 'intensive'
  expectedImpact: 'low' | 'medium' | 'high' | 'transformative'
  status: 'suggested' | 'accepted' | 'in_progress' | 'completed' | 'declined'
  progressTracking?: ProgressTracker
  createdAt: string
  acceptedAt?: string
  completedAt?: string
}

export interface ActionStep {
  id: string
  title: string
  description: string
  order: number
  estimated_time: string // "5 minutes", "1 hour", etc.
  required: boolean
  completed: boolean
  completedAt?: string
  notes?: string
}

export interface ProgressTracker {
  type: 'boolean' | 'scale' | 'frequency' | 'milestone'
  currentValue?: number
  targetValue?: number
  unit?: string
  checkIns: ProgressCheckIn[]
}

export interface ProgressCheckIn {
  date: string
  value: number
  notes?: string
  mood?: string
  confidence: number
}

export interface CoachingTrigger {
  type: 'negative_mood_pattern' | 'life_area_decline' | 'relationship_stress' | 'boundary_violation' | 'goal_stagnation'
  threshold: {
    timeframe: number // days
    occurrences: number
    severity?: number
  }
  description: string
  enabled: boolean
}

export interface WisdomCoachConfig {
  userId: string
  triggers: CoachingTrigger[]
  preferences: {
    coaching_style: 'supportive' | 'direct' | 'exploratory' | 'solution_focused'
    session_frequency: 'as_needed' | 'daily' | 'weekly' | 'monthly'
    voice_notes_enabled: boolean
    auto_scheduling: boolean
    privacy_mode: boolean
  }
  ai_personality: {
    tone: 'warm' | 'professional' | 'casual' | 'spiritual'
    approach: 'socratic' | 'directive' | 'reflective' | 'action_oriented'
    depth: 'surface' | 'moderate' | 'deep' | 'transformational'
  }
}

export interface VoiceNote {
  id: string
  sessionId: string
  audioUrl: string
  transcription: string
  duration: number // seconds
  mood_detected?: string
  key_themes: string[]
  createdAt: string
}

export interface CoachingContext {
  recent_entries: Array<{
    id: string
    title: string
    mood: string
    lifeAreas: string[]
    sentiment: number
    date: string
  }>
  life_area_trends: Array<{
    areaId: string
    trend: 'improving' | 'stable' | 'declining'
    recent_moods: string[]
    days_since_ritual: number
  }>
  relationship_dynamics: Array<{
    person: string
    mention_frequency: number
    sentiment_trend: 'positive' | 'neutral' | 'negative' | 'mixed'
    last_mentioned: string
  }>
  behavioral_patterns: Array<{
    pattern: string
    frequency: number
    triggers: string[]
    outcomes: string[]
  }>
  goal_progress: Array<{
    areaId: string
    commitment: string
    progress_score: number
    blockers: string[]
  }>
}

export interface AIPromptTemplate {
  id: string
  name: string
  trigger_type: string
  system_prompt: string
  user_prompt_template: string
  expected_output: 'insights' | 'recommendations' | 'questions' | 'reflection'
  variables: string[] // Variables to inject into template
}

// Default coaching triggers
export const DEFAULT_COACHING_TRIGGERS: CoachingTrigger[] = [
  {
    type: 'negative_mood_pattern',
    threshold: { timeframe: 7, occurrences: 3 },
    description: 'Three or more negative moods in a week',
    enabled: true
  },
  {
    type: 'life_area_decline',
    threshold: { timeframe: 14, occurrences: 2, severity: 4 },
    description: 'Life area showing declining scores',
    enabled: true
  },
  {
    type: 'relationship_stress',
    threshold: { timeframe: 7, occurrences: 2 },
    description: 'Multiple negative mentions of same person',
    enabled: true
  },
  {
    type: 'boundary_violation',
    threshold: { timeframe: 3, occurrences: 1 },
    description: 'Clear boundary violation detected',
    enabled: true
  }
]

// AI Coaching Prompts
export const COACHING_PROMPTS = {
  PATTERN_ANALYSIS: `You are Phoenix, a wise AI coach. Analyze the user's recent journal entries and identify behavioral patterns, emotional triggers, and growth opportunities. Be compassionate but direct. Focus on actionable insights.

Context: {context}
Recent entries: {entries}

Provide 2-3 key insights with specific evidence and recommendations.`,

  UPSET_PROCESSING: `You are Phoenix, helping someone process an upset or difficult emotion. Your role is to guide them through understanding what happened, what it reveals about their boundaries or values, and how to move forward constructively.

Current situation: {situation}
User's emotional state: {mood}
Context: {context}

Guide them through: 1) Acknowledgment, 2) Understanding, 3) Learning, 4) Action`,

  GOAL_COACHING: `You are Phoenix, focusing on helping the user achieve their life area commitments. Review their progress and provide specific, actionable guidance.

Life area: {lifeArea}
Current commitment: {commitment}
Recent progress: {progress}
Blockers identified: {blockers}

Provide specific next steps and address blockers.`,

  RELATIONSHIP_DYNAMICS: `You are Phoenix, helping the user understand and improve their relationship dynamics based on their journal patterns.

Relationship context: {relationships}
Recent mentions: {mentions}
Patterns observed: {patterns}

Provide insights on relationship health and specific improvement suggestions.`
}

export interface CoachingMetrics {
  total_sessions: number
  insights_generated: number
  recommendations_accepted: number
  recommendations_completed: number
  user_satisfaction_avg: number
  most_helpful_insight_types: string[]
  trigger_effectiveness: Record<string, number>
  session_completion_rate: number
  follow_up_adherence_rate: number
}