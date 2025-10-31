// Fulfillment Integration Service
// Connects Wisdom Coach recommendations to Fulfillment Display

import { CoachingSession, CoachingRecommendation, ActionStep } from '@/types/wisdom-coach'
import { FulfillmentDisplay, LifeArea, Commitment } from '@/types/integrated-display'

export interface CoachingTask {
  id: string
  title: string
  description: string
  areaId: string
  commitmentIds: string[]
  source: {
    type: 'coach'
    sessionId: string
    recommendationId: string
  }
  status: 'pending' | 'active' | 'completed'
  createdAt: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface CoachingCompletion {
  id: string
  title: string
  description: string
  steps: string[]
  areaId: string
  commitmentIds: string[]
  source: {
    type: 'coach'
    sessionId: string
    recommendationId: string
  }
  status: 'suggested' | 'active' | 'completed'
  createdAt: string
}

export interface CoachingPractice {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  instructions: string
  areaId: string
  source: {
    type: 'coach'
    sessionId: string
    recommendationId: string
  }
  status: 'suggested' | 'active' | 'completed'
  createdAt: string
}

export class FulfillmentIntegrationService {
  
  // Convert coaching recommendations to fulfillment artifacts
  static async integrateCoachingSession(session: CoachingSession): Promise<{
    tasks: CoachingTask[]
    completions: CoachingCompletion[]
    practices: CoachingPractice[]
    newCommitments: Commitment[]
  }> {
    const tasks: CoachingTask[] = []
    const completions: CoachingCompletion[] = []
    const practices: CoachingPractice[] = []
    const newCommitments: Commitment[] = []

    for (const recommendation of session.recommendations) {
      if (recommendation.status !== 'accepted') continue

      const artifacts = await this.convertRecommendationToArtifacts(session, recommendation)
      tasks.push(...artifacts.tasks)
      completions.push(...artifacts.completions)
      practices.push(...artifacts.practices)
      newCommitments.push(...artifacts.commitments)
    }

    // Save to localStorage (in production, save to API)
    await this.saveToFulfillmentDisplay({ tasks, completions, practices, newCommitments })

    return { tasks, completions, practices, newCommitments }
  }

  private static async convertRecommendationToArtifacts(
    session: CoachingSession,
    recommendation: CoachingRecommendation
  ): Promise<{
    tasks: CoachingTask[]
    completions: CoachingCompletion[]
    practices: CoachingPractice[]
    commitments: Commitment[]
  }> {
    const tasks: CoachingTask[] = []
    const completions: CoachingCompletion[] = []
    const practices: CoachingPractice[] = []
    const commitments: Commitment[] = []

    const sourceInfo = {
      type: 'coach' as const,
      sessionId: session.id,
      recommendationId: recommendation.id
    }

    const targetAreaId = this.inferLifeAreaFromRecommendation(recommendation, session)

    switch (recommendation.type) {
      case 'boundary_reset':
        // Create a completion for the reset ritual
        completions.push({
          id: `comp_${recommendation.id}`,
          title: recommendation.title,
          description: recommendation.description,
          steps: recommendation.actionSteps.map(step => step.title),
          areaId: targetAreaId,
          commitmentIds: [],
          source: sourceInfo,
          status: 'suggested',
          createdAt: new Date().toISOString()
        })
        break

      case 'life_area_focus':
        // Create focused tasks for the area
        tasks.push({
          id: `task_${recommendation.id}`,
          title: recommendation.title,
          description: recommendation.description,
          areaId: targetAreaId,
          commitmentIds: [],
          source: sourceInfo,
          status: 'pending',
          createdAt: new Date().toISOString(),
          priority: recommendation.expectedImpact === 'transformative' ? 'urgent' : 
                   recommendation.expectedImpact === 'high' ? 'high' : 'medium'
        })
        break

      case 'relationship_repair':
        // Create specific relationship tasks
        for (const step of recommendation.actionSteps) {
          tasks.push({
            id: `task_${step.id}`,
            title: step.title,
            description: step.description,
            areaId: this.getRelationshipAreaId(),
            commitmentIds: this.findRelatedCommitments(['communication', 'honesty', 'boundaries']),
            source: sourceInfo,
            status: 'pending',
            createdAt: new Date().toISOString(),
            dueDate: this.calculateDueDate(recommendation.timeframe).slice(0, 10),
            priority: recommendation.expectedImpact === 'transformative' ? 'urgent' : 'high'
          })
        }
        break

      case 'habit_change':
        // Create a practice/habit
        practices.push({
          id: `practice_${recommendation.id}`,
          name: recommendation.title,
          description: recommendation.description,
          frequency: this.mapTimeframeToFrequency(recommendation.timeframe),
          instructions: this.formatActionStepsAsInstructions(recommendation.actionSteps),
          areaId: targetAreaId,
          source: sourceInfo,
          status: 'suggested',
          createdAt: new Date().toISOString()
        })
        break

      case 'mindset_shift':
        // Create a new commitment or update existing one
        const commitment = this.createCommitmentFromRecommendation(recommendation, targetAreaId, sourceInfo)
        if (commitment) {
          commitments.push(commitment)
        }
        
        // Also create a completion to track the mindset work
        completions.push({
          id: `comp_${recommendation.id}`,
          title: `Mindset Work: ${recommendation.title}`,
          description: recommendation.description,
          steps: recommendation.actionSteps.map(step => step.title),
          areaId: targetAreaId,
          commitmentIds: commitment ? [commitment.id] : [],
          source: sourceInfo,
          status: 'suggested',
          createdAt: new Date().toISOString()
        })
        break
    }

    return { tasks, completions, practices, commitments }
  }

  private static inferLifeAreaFromRecommendation(
    recommendation: CoachingRecommendation,
    session: CoachingSession
  ): string {
    // Check if the recommendation mentions specific life areas
    const areaKeywords = {
      'relationships': ['relationship', 'partner', 'friend', 'family', 'communication'],
      'work-purpose': ['work', 'career', 'purpose', 'mission', 'project', 'goal'],
      'health-recovery': ['health', 'wellness', 'exercise', 'sleep', 'energy'],
      'finance': ['money', 'budget', 'financial', 'investment', 'income'],
      'emotional-regulation': ['emotion', 'feeling', 'anxiety', 'stress', 'calm'],
      'creativity-expression': ['creative', 'art', 'expression', 'imagination'],
      'spirituality-practice': ['spiritual', 'meditation', 'prayer', 'faith'],
      'learning-growth': ['learn', 'growth', 'development', 'skill', 'education']
    }

    const searchText = (recommendation.title + ' ' + recommendation.description).toLowerCase()
    
    for (const [areaId, keywords] of Object.entries(areaKeywords)) {
      if (keywords.some(keyword => searchText.includes(keyword))) {
        return areaId
      }
    }

    // Default to the trigger source if available
    if (session.triggerData.lifeAreaId) {
      return session.triggerData.lifeAreaId
    }

    // Default fallback
    return 'emotional-regulation'
  }

  private static getRelationshipAreaId(): string {
    return 'relationships' // or 'intimacy-love' depending on context
  }

  private static findRelatedCommitments(themes: string[]): string[] {
    // In production, this would query actual commitments from the database
    const stored = localStorage.getItem('wisdomos_commitments')
    if (!stored) return []

    const commitments = JSON.parse(stored)
    return commitments
      .filter((c: any) => 
        themes.some(theme => 
          c.name.toLowerCase().includes(theme) || 
          c.description?.toLowerCase().includes(theme)
        )
      )
      .map((c: any) => c.id)
  }

  private static calculateDueDate(timeframe: CoachingRecommendation['timeframe']): string {
    const now = new Date()
    switch (timeframe) {
      case '1_day':
        now.setDate(now.getDate() + 1)
        break
      case '1_week':
        now.setDate(now.getDate() + 7)
        break
      case '1_month':
        now.setMonth(now.getMonth() + 1)
        break
      case '3_months':
        now.setMonth(now.getMonth() + 3)
        break
    }
    return now.toISOString()
  }

  private static mapTimeframeToFrequency(timeframe: CoachingRecommendation['timeframe']): 'daily' | 'weekly' | 'monthly' {
    switch (timeframe) {
      case '1_day':
      case '1_week':
        return 'daily'
      case '1_month':
        return 'weekly'
      case '3_months':
        return 'monthly'
      default:
        return 'weekly'
    }
  }

  private static formatActionStepsAsInstructions(steps: ActionStep[]): string {
    return steps.map((step, index) => 
      `${index + 1}. ${step.title}: ${step.description}`
    ).join('\n')
  }

  private static createCommitmentFromRecommendation(
    recommendation: CoachingRecommendation,
    areaId: string,
    sourceInfo: { type: 'coach', sessionId: string, recommendationId: string }
  ): Commitment | null {
    // Only create commitments for mindset shifts and boundary work
    if (!recommendation.title.toLowerCase().includes('boundary') && 
        !recommendation.title.toLowerCase().includes('commitment') &&
        recommendation.type !== 'mindset_shift') {
      return null
    }

    return {
      id: `cmt_coach_${recommendation.id}`,
      title: this.extractCommitmentFromTitle(recommendation.title),
      description: recommendation.description,
      areaId,
      relatedPeople: [], // Could extract from recommendation context
      status: 'active',
      size: recommendation.expectedImpact === 'transformative' ? 'large' : 
            recommendation.expectedImpact === 'high' ? 'medium' : 'small',
      createdAt: new Date()
    } as Commitment
  }

  private static extractCommitmentFromTitle(title: string): string {
    // Convert recommendation titles to commitment statements
    const patterns = [
      { pattern: /reframe (.+)/i, replacement: 'I choose to see $1 differently' },
      { pattern: /practice (.+)/i, replacement: 'I commit to practicing $1' },
      { pattern: /set (.+) boundaries/i, replacement: 'I maintain $1 boundaries' },
      { pattern: /improve (.+)/i, replacement: 'I invest in improving $1' },
      { pattern: /focus on (.+)/i, replacement: 'I prioritize $1' }
    ]

    for (const { pattern, replacement } of patterns) {
      if (pattern.test(title)) {
        return title.replace(pattern, replacement)
      }
    }

    // Default: add "I commit to" prefix
    return `I commit to ${title.toLowerCase()}`
  }

  private static async saveToFulfillmentDisplay(artifacts: {
    tasks: CoachingTask[]
    completions: CoachingCompletion[]
    practices: CoachingPractice[]
    newCommitments: Commitment[]
  }): Promise<void> {
    // Save tasks
    const existingTasks = JSON.parse(localStorage.getItem('wisdomos_fulfillment_tasks') || '[]')
    localStorage.setItem('wisdomos_fulfillment_tasks', JSON.stringify([
      ...existingTasks,
      ...artifacts.tasks
    ]))

    // Save completions
    const existingCompletions = JSON.parse(localStorage.getItem('wisdomos_fulfillment_completions') || '[]')
    localStorage.setItem('wisdomos_fulfillment_completions', JSON.stringify([
      ...existingCompletions,
      ...artifacts.completions
    ]))

    // Save practices
    const existingPractices = JSON.parse(localStorage.getItem('wisdomos_fulfillment_practices') || '[]')
    localStorage.setItem('wisdomos_fulfillment_practices', JSON.stringify([
      ...existingPractices,
      ...artifacts.practices
    ]))

    // Save new commitments to the existing life areas
    if (artifacts.newCommitments.length > 0) {
      const existingAreas = JSON.parse(localStorage.getItem('wisdomos_life_areas') || '[]')
      const updatedAreas = existingAreas.map((area: any) => {
        const newCommitmentsForArea = artifacts.newCommitments.filter(c => c.areaId === area.id)
        if (newCommitmentsForArea.length > 0) {
          return {
            ...area,
            commitments: [...(area.commitments || []), ...newCommitmentsForArea]
          }
        }
        return area
      })
      localStorage.setItem('wisdomos_life_areas', JSON.stringify(updatedAreas))
    }
  }

  // Get coaching-related items for display
  static getCoachingItems(): {
    tasks: CoachingTask[]
    completions: CoachingCompletion[]
    practices: CoachingPractice[]
  } {
    return {
      tasks: JSON.parse(localStorage.getItem('wisdomos_fulfillment_tasks') || '[]')
        .filter((task: any) => task.source?.type === 'coach'),
      completions: JSON.parse(localStorage.getItem('wisdomos_fulfillment_completions') || '[]')
        .filter((comp: any) => comp.source?.type === 'coach'),
      practices: JSON.parse(localStorage.getItem('wisdomos_fulfillment_practices') || '[]')
        .filter((practice: any) => practice.source?.type === 'coach')
    }
  }

  // Mark coaching task as completed
  static async completeCoachingTask(taskId: string): Promise<void> {
    const tasks = JSON.parse(localStorage.getItem('wisdomos_fulfillment_tasks') || '[]')
    const updatedTasks = tasks.map((task: CoachingTask) => 
      task.id === taskId ? { ...task, status: 'completed', completedAt: new Date().toISOString() } : task
    )
    localStorage.setItem('wisdomos_fulfillment_tasks', JSON.stringify(updatedTasks))

    // Update coaching session metrics
    const task = tasks.find((t: CoachingTask) => t.id === taskId)
    if (task?.source?.sessionId) {
      await this.updateSessionMetrics(task.source.sessionId, 'task_completed')
    }
  }

  private static async updateSessionMetrics(sessionId: string, action: 'task_completed' | 'completion_finished' | 'practice_started'): Promise<void> {
    const sessions = JSON.parse(localStorage.getItem('wisdomos_coaching_sessions') || '[]')
    const updatedSessions = sessions.map((session: CoachingSession) => {
      if (session.id === sessionId) {
        return {
          ...session,
          metrics: {
            ...(session as any).metrics,
            [action]: ((session as any).metrics?.[action] || 0) + 1
          }
        }
      }
      return session
    })
    localStorage.setItem('wisdomos_coaching_sessions', JSON.stringify(updatedSessions))
  }

  // Get tasks for a specific life area
  static getTasksForLifeArea(areaId: string): CoachingTask[] {
    const tasks = JSON.parse(localStorage.getItem('wisdomos_fulfillment_tasks') || '[]')
    return tasks.filter((task: CoachingTask) => task.areaId === areaId)
  }

  // Get coaching session that created a specific task
  static getSessionForTask(taskId: string): CoachingSession | null {
    const tasks = JSON.parse(localStorage.getItem('wisdomos_fulfillment_tasks') || '[]')
    const task = tasks.find((t: CoachingTask) => t.id === taskId)
    if (!task?.source?.sessionId) return null

    const sessions = JSON.parse(localStorage.getItem('wisdomos_coaching_sessions') || '[]')
    return sessions.find((s: CoachingSession) => s.id === task.source.sessionId) || null
  }
}