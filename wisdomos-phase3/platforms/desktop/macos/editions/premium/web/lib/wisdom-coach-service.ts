// Wisdom Coach Service
// Core AI coaching logic and session management

import { 
  CoachingSession, 
  CoachingInsight, 
  CoachingRecommendation, 
  CoachingContext,
  CoachingTrigger,
  WisdomCoachConfig,
  VoiceNote,
  ActionStep,
  COACHING_PROMPTS,
  DEFAULT_COACHING_TRIGGERS,
  AIPromptTemplate
} from '@/types/wisdom-coach'
import { JournalEntry } from '@/types/journal'
import { suggestLifeAreas, extractPeopleMentions, shouldSuggestRitual } from '@/lib/mappings'

export class WisdomCoachService {
  private config: WisdomCoachConfig
  private userId: string

  constructor(userId: string, config?: Partial<WisdomCoachConfig>) {
    this.userId = userId
    this.config = {
      userId,
      triggers: DEFAULT_COACHING_TRIGGERS,
      preferences: {
        coaching_style: 'supportive',
        session_frequency: 'as_needed',
        voice_notes_enabled: true,
        auto_scheduling: false,
        privacy_mode: false
      },
      ai_personality: {
        tone: 'warm',
        approach: 'reflective',
        depth: 'moderate'
      },
      ...config
    }
  }

  // Main AI Integration - Replace with actual AI service
  private async callAI(prompt: string, context: any): Promise<string> {
    // TODO: Replace with actual AI integration (OpenAI, Claude, etc.)
    // For now, return structured mock responses
    
    if (prompt.includes('PATTERN_ANALYSIS')) {
      return this.generatePatternAnalysis(context)
    } else if (prompt.includes('UPSET_PROCESSING')) {
      return this.generateUpsetProcessing(context)
    } else if (prompt.includes('GOAL_COACHING')) {
      return this.generateGoalCoaching(context)
    } else if (prompt.includes('RELATIONSHIP_DYNAMICS')) {
      return this.generateRelationshipAnalysis(context)
    }
    
    return "I'm here to help you reflect on your experiences and find ways to grow. Let's explore what's happening in your life."
  }

  // Context Building
  async buildCoachingContext(lookbackDays: number = 14): Promise<CoachingContext> {
    const entries = this.getRecentJournalEntries(lookbackDays)
    const lifeAreas = this.getLifeAreaData()
    
    return {
      recent_entries: entries.map(e => ({
        id: e.id,
        title: e.title,
        mood: e.mood || 'neutral',
        lifeAreas: e.linkedLifeAreas || [],
        sentiment: this.calculateSentiment(e.body),
        date: e.createdAt
      })),
      life_area_trends: this.analyzeLifeAreaTrends(entries),
      relationship_dynamics: this.analyzeRelationshipDynamics(entries),
      behavioral_patterns: this.identifyBehavioralPatterns(entries),
      goal_progress: this.assessGoalProgress(lifeAreas, entries)
    }
  }

  // Trigger Detection
  async checkTriggers(): Promise<CoachingSession | null> {
    const context = await this.buildCoachingContext()
    
    for (const trigger of this.config.triggers.filter(t => t.enabled)) {
      if (await this.evaluateTrigger(trigger, context)) {
        return await this.createCoachingSession(trigger, context)
      }
    }
    
    return null
  }

  private async evaluateTrigger(trigger: CoachingTrigger, context: CoachingContext): Promise<boolean> {
    switch (trigger.type) {
      case 'negative_mood_pattern':
        return this.checkNegativeMoodPattern(trigger, context)
      case 'life_area_decline':
        return this.checkLifeAreaDecline(trigger, context)
      case 'relationship_stress':
        return this.checkRelationshipStress(trigger, context)
      case 'boundary_violation':
        return this.checkBoundaryViolation(trigger, context)
      default:
        return false
    }
  }

  private checkNegativeMoodPattern(trigger: CoachingTrigger, context: CoachingContext): boolean {
    const negativeMoods = ['sad', 'angry', 'anxious', 'frustrated', 'overwhelmed', 'hopeless']
    const negativeEntries = context.recent_entries.filter(e => 
      negativeMoods.includes(e.mood) && 
      this.isWithinTimeframe(e.date, trigger.threshold.timeframe)
    )
    
    return negativeEntries.length >= trigger.threshold.occurrences
  }

  private checkLifeAreaDecline(trigger: CoachingTrigger, context: CoachingContext): boolean {
    const decliningAreas = context.life_area_trends.filter(t => t.trend === 'declining')
    return decliningAreas.length >= trigger.threshold.occurrences
  }

  private checkRelationshipStress(trigger: CoachingTrigger, context: CoachingContext): boolean {
    const stressedRelationships = context.relationship_dynamics.filter(r => 
      r.sentiment_trend === 'negative' && r.mention_frequency >= trigger.threshold.occurrences
    )
    return stressedRelationships.length > 0
  }

  private checkBoundaryViolation(trigger: CoachingTrigger, context: CoachingContext): boolean {
    // Look for boundary-related keywords in recent entries
    const boundaryKeywords = ['boundary', 'violated', 'overwhelmed', 'used', 'taken advantage', 'disrespected']
    const recentEntries = this.getRecentJournalEntries(trigger.threshold.timeframe)
    
    return recentEntries.some(entry => 
      boundaryKeywords.some(keyword => 
        entry.body.toLowerCase().includes(keyword)
      )
    )
  }

  // Session Management
  private async createCoachingSession(trigger: CoachingTrigger, context: CoachingContext): Promise<CoachingSession> {
    const sessionId = this.generateId()
    
    const session: CoachingSession = {
      id: sessionId,
      userId: this.userId,
      triggeredBy: this.mapTriggerToSource(trigger.type),
      triggerData: {
        context: trigger.description
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      insights: [],
      recommendations: []
    }

    // Generate initial insights
    session.insights = await this.generateInsights(session, context)
    session.recommendations = await this.generateRecommendations(session, context)

    // Save session
    this.saveCoachingSession(session)
    
    return session
  }

  async processJournalEntry(entry: JournalEntry): Promise<CoachingSession | null> {
    // Quick analysis for immediate coaching opportunities
    const urgentKeywords = ['crisis', 'breakdown', 'can\'t handle', 'giving up', 'hopeless']
    const isUrgent = urgentKeywords.some(keyword => 
      entry.body.toLowerCase().includes(keyword)
    )

    if (isUrgent || this.shouldTriggerImmediate(entry)) {
      const context = await this.buildCoachingContext(7) // Shorter lookback for immediate
      return await this.createImmediateSession(entry, context)
    }

    return null
  }

  private shouldTriggerImmediate(entry: JournalEntry): boolean {
    const negativeMoods = ['hopeless', 'angry', 'overwhelmed', 'anxious']
    return negativeMoods.includes(entry.mood || '') && (entry.moodScore || 0) <= 3
  }

  private async createImmediateSession(entry: JournalEntry, context: CoachingContext): Promise<CoachingSession> {
    const sessionId = this.generateId()
    
    const session: CoachingSession = {
      id: sessionId,
      userId: this.userId,
      triggeredBy: 'journal',
      triggerData: {
        entryId: entry.id,
        context: 'Immediate support needed based on journal entry'
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      insights: [],
      recommendations: []
    }

    // Focus on immediate support
    const prompt = COACHING_PROMPTS.UPSET_PROCESSING
      .replace('{situation}', entry.body)
      .replace('{mood}', entry.mood || 'distressed')
      .replace('{context}', JSON.stringify(context))

    const aiResponse = await this.callAI(prompt, { entry, context })
    session.insights = this.parseInsightsFromAI(aiResponse, entry)
    session.recommendations = this.parseRecommendationsFromAI(aiResponse, session.id)

    this.saveCoachingSession(session)
    return session
  }

  // Insight Generation
  private async generateInsights(session: CoachingSession, context: CoachingContext): Promise<CoachingInsight[]> {
    const insights: CoachingInsight[] = []

    // Pattern analysis
    const patternPrompt = COACHING_PROMPTS.PATTERN_ANALYSIS
      .replace('{context}', JSON.stringify(context))
      .replace('{entries}', JSON.stringify(context.recent_entries))

    const patternResponse = await this.callAI(patternPrompt, context)
    insights.push(...this.parseInsightsFromAI(patternResponse))

    // Relationship analysis if relevant
    if (context.relationship_dynamics.some(r => r.sentiment_trend === 'negative')) {
      const relationshipPrompt = COACHING_PROMPTS.RELATIONSHIP_DYNAMICS
        .replace('{relationships}', JSON.stringify(context.relationship_dynamics))
        .replace('{mentions}', JSON.stringify(context.recent_entries.filter(e => e.lifeAreas.includes('family') || e.lifeAreas.includes('intimacy-love'))))
        .replace('{patterns}', JSON.stringify(context.behavioral_patterns))

      const relationshipResponse = await this.callAI(relationshipPrompt, context)
      insights.push(...this.parseInsightsFromAI(relationshipResponse))
    }

    return insights
  }

  private async generateRecommendations(session: CoachingSession, context: CoachingContext): Promise<CoachingRecommendation[]> {
    const recommendations: CoachingRecommendation[] = []

    // Generate recommendations based on insights
    for (const insight of session.insights) {
      if (insight.priority === 'high' || insight.priority === 'urgent') {
        const recommendation = await this.createRecommendationFromInsight(insight, session.id)
        if (recommendation) {
          recommendations.push(recommendation)
        }
      }
    }

    // Add boundary reset if needed
    const needsRitual = context.life_area_trends.some(t => 
      t.trend === 'declining' && t.days_since_ritual > 14
    )
    
    if (needsRitual) {
      recommendations.push(this.createBoundaryResetRecommendation(session.id))
    }

    return recommendations
  }

  // AI Response Parsing (Mock implementations - replace with actual AI parsing)
  private parseInsightsFromAI(aiResponse: string, entry?: JournalEntry): CoachingInsight[] {
    // TODO: Implement proper AI response parsing
    // For now, return structured mock insights
    return [{
      id: this.generateId(),
      type: 'pattern',
      title: 'Emotional Processing Pattern',
      description: aiResponse.substring(0, 200) + '...',
      confidence: 85,
      evidence: entry ? [entry.id] : [],
      lifeAreasAffected: entry?.linkedLifeAreas || [],
      priority: 'medium',
      createdAt: new Date().toISOString()
    }]
  }

  private parseRecommendationsFromAI(aiResponse: string, sessionId: string): CoachingRecommendation[] {
    // TODO: Implement proper AI response parsing
    return [{
      id: this.generateId(),
      sessionId,
      type: 'mindset_shift',
      title: 'Reframe Current Challenge',
      description: 'Focus on what you can control in this situation',
      actionSteps: [
        {
          id: this.generateId(),
          title: 'List 3 things within your control',
          description: 'Write down specific actions you can take',
          order: 1,
          estimated_time: '10 minutes',
          required: true,
          completed: false
        }
      ],
      timeframe: '1_day',
      difficulty: 'easy',
      expectedImpact: 'medium',
      status: 'suggested',
      createdAt: new Date().toISOString()
    }]
  }

  private createBoundaryResetRecommendation(sessionId: string): CoachingRecommendation {
    return {
      id: this.generateId(),
      sessionId,
      type: 'boundary_reset',
      title: 'Complete Boundary Reset Ritual',
      description: 'Your recent journal patterns suggest it\'s time for a boundary reset to restore emotional balance.',
      actionSteps: [
        {
          id: this.generateId(),
          title: 'Start Reset Ritual',
          description: 'Open the journal and select the life area that needs attention',
          order: 1,
          estimated_time: '15 minutes',
          required: true,
          completed: false
        }
      ],
      timeframe: '1_day',
      difficulty: 'moderate',
      expectedImpact: 'high',
      status: 'suggested',
      createdAt: new Date().toISOString()
    }
  }

  // Mock AI Response Generators (replace with actual AI)
  private generatePatternAnalysis(context: any): string {
    return `Based on your recent journal entries, I notice a pattern of overwhelming feelings during busy work periods. Your emotional regulation appears strongest when you maintain consistent self-care routines. I recommend focusing on boundary setting in your work life and scheduling dedicated time for emotional processing.`
  }

  private generateUpsetProcessing(context: any): string {
    return `I hear that you're going through a challenging time. Let's process this together. First, acknowledge what you're feeling without judgment. What specific event or thought triggered this emotional response? Understanding the root cause will help us develop a constructive path forward.`
  }

  private generateGoalCoaching(context: any): string {
    return `Looking at your recent progress in this life area, I see both challenges and opportunities. Your commitment shows in your consistent effort, but there seem to be some recurring obstacles. Let's identify specific strategies to overcome these blocks and create momentum toward your goals.`
  }

  private generateRelationshipAnalysis(context: any): string {
    return `Your journal entries reveal some important relationship dynamics. There's a pattern of giving more than receiving in certain relationships, which may be affecting your emotional well-being. Consider setting clearer boundaries and communicating your needs more directly.`
  }

  // Helper Methods
  private getRecentJournalEntries(days: number): JournalEntry[] {
    const stored = localStorage.getItem('wisdomos_journals')
    if (!stored) return []
    
    const journals: JournalEntry[] = JSON.parse(stored)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return journals.filter(j => new Date(j.createdAt) >= cutoffDate)
  }

  private getLifeAreaData() {
    // TODO: Get from context or API
    return []
  }

  private calculateSentiment(text: string): number {
    // Simple sentiment analysis - replace with proper implementation
    const positiveWords = ['good', 'great', 'happy', 'love', 'amazing', 'wonderful', 'excited', 'grateful']
    const negativeWords = ['bad', 'terrible', 'sad', 'hate', 'awful', 'horrible', 'angry', 'frustrated']
    
    const words = text.toLowerCase().split(/\s+/)
    let score = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1
      if (negativeWords.includes(word)) score -= 1
    })
    
    return Math.max(-10, Math.min(10, score))
  }

  private analyzeLifeAreaTrends(entries: JournalEntry[]) {
    // TODO: Implement proper trend analysis
    return []
  }

  private analyzeRelationshipDynamics(entries: JournalEntry[]) {
    const dynamics: any[] = []
    const people: Map<string, any> = new Map()
    
    entries.forEach(entry => {
      const mentions = extractPeopleMentions(entry.body)
      const sentiment = this.calculateSentiment(entry.body)
      
      mentions.forEach(person => {
        if (!people.has(person)) {
          people.set(person, {
            person,
            mention_frequency: 0,
            sentiment_sum: 0,
            last_mentioned: entry.createdAt
          })
        }
        
        const data = people.get(person)!
        data.mention_frequency += 1
        data.sentiment_sum += sentiment
        data.last_mentioned = entry.createdAt
      })
    })
    
    people.forEach(data => {
      const avg_sentiment = data.sentiment_sum / data.mention_frequency
      dynamics.push({
        ...data,
        sentiment_trend: avg_sentiment > 1 ? 'positive' : avg_sentiment < -1 ? 'negative' : 'neutral'
      })
    })
    
    return dynamics
  }

  private identifyBehavioralPatterns(entries: JournalEntry[]) {
    // TODO: Implement pattern detection
    return []
  }

  private assessGoalProgress(lifeAreas: any[], entries: JournalEntry[]) {
    // TODO: Implement goal progress assessment
    return []
  }

  private isWithinTimeframe(dateString: string, days: number): boolean {
    const date = new Date(dateString)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return date >= cutoff
  }

  private mapTriggerToSource(triggerType: string): CoachingSession['triggeredBy'] {
    switch (triggerType) {
      case 'negative_mood_pattern': return 'mood_trend'
      case 'life_area_decline': return 'life_area_collapse'
      case 'relationship_stress': return 'upset'
      default: return 'manual'
    }
  }

  private async createRecommendationFromInsight(insight: CoachingInsight, sessionId: string): Promise<CoachingRecommendation | null> {
    // TODO: Implement insight-to-recommendation conversion
    return null
  }

  private saveCoachingSession(session: CoachingSession) {
    const key = 'wisdomos_coaching_sessions'
    const stored = localStorage.getItem(key)
    const sessions: CoachingSession[] = stored ? JSON.parse(stored) : []
    
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    if (existingIndex >= 0) {
      sessions[existingIndex] = session
    } else {
      sessions.push(session)
    }
    
    localStorage.setItem(key, JSON.stringify(sessions))
  }

  private generateId(): string {
    return 'coach_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}