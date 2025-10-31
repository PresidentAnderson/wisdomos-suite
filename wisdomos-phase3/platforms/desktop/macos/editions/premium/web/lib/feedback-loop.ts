/**
 * Dynamic Feedback Loop System
 * Automatically processes events and updates dashboard in real-time
 */

import { EventEmitter } from 'events'
import { useState, useEffect } from 'react'

// Event Types that trigger dashboard updates
export type EventType = 
  | 'journal_entry'
  | 'upset_logged'
  | 'boundary_reset'
  | 'commitment_made'
  | 'commitment_kept'
  | 'commitment_broken'
  | 'pattern_detected'
  | 'relationship_added'
  | 'task_completed'
  | 'milestone_reached'

export interface SystemEvent {
  id: string
  type: EventType
  timestamp: Date
  lifeAreaId: string
  lifeAreaName: string
  impact: -2 | -1 | 0 | 1 | 2  // Negative to positive impact
  data: any
  tags?: string[]
  relatedEvents?: string[]
}

export interface LifeAreaStatus {
  id: string
  name: string
  color: 'green' | 'yellow' | 'red'
  score: number
  recentEvents: SystemEvent[]
  patterns: Pattern[]
  lastUpdated: Date
  trend: 'improving' | 'stable' | 'declining'
}

export interface Pattern {
  id: string
  name: string
  type: 'positive' | 'negative' | 'neutral'
  frequency: number
  lastOccurrence: Date
  lifeAreas: string[]
  triggerEvents: string[]
  suggestedAction?: string
}

export interface DashboardState {
  lifeAreas: LifeAreaStatus[]
  overallHealth: number
  activePatterns: Pattern[]
  notifications: Notification[]
  lastSync: Date
}

export interface Notification {
  id: string
  type: 'alert' | 'success' | 'warning' | 'info'
  title: string
  message: string
  lifeAreaId?: string
  actionRequired: boolean
  timestamp: Date
  read: boolean
}

class FeedbackLoopSystem extends EventEmitter {
  private events: SystemEvent[] = []
  private patterns: Pattern[] = []
  private dashboardState: DashboardState
  private processingQueue: SystemEvent[] = []
  private isProcessing = false

  constructor() {
    super()
    this.dashboardState = this.loadState()
    this.startProcessingLoop()
  }

  // Load state from localStorage
  private loadState(): DashboardState {
    if (typeof window === 'undefined') {
      // Return default state during SSR
      return {
        lifeAreas: this.initializeLifeAreas(),
        overallHealth: 70,
        activePatterns: [],
        notifications: [],
        lastSync: new Date()
      }
    }
    
    try {
      const stored = localStorage.getItem('wisdomos_dashboard_state')
      if (stored) {
        const parsedState = JSON.parse(stored)
        // Ensure all required properties exist
        return {
          lifeAreas: parsedState.lifeAreas || this.initializeLifeAreas(),
          overallHealth: typeof parsedState.overallHealth === 'number' ? parsedState.overallHealth : 70,
          activePatterns: Array.isArray(parsedState.activePatterns) ? parsedState.activePatterns : [],
          notifications: Array.isArray(parsedState.notifications) ? parsedState.notifications : [],
          lastSync: parsedState.lastSync ? new Date(parsedState.lastSync) : new Date()
        }
      }
    } catch (error) {
      console.error('Error loading dashboard state:', error)
    }

    // Initialize with default state
    return {
      lifeAreas: this.initializeLifeAreas(),
      overallHealth: 70,
      activePatterns: [],
      notifications: [],
      lastSync: new Date()
    }
  }

  private initializeLifeAreas(): LifeAreaStatus[] {
    const areas = [
      'Work & Purpose',
      'Health & Recovery',
      'Finance',
      'Intimacy & Love',
      'Time & Energy',
      'Spiritual Alignment',
      'Creativity & Expression',
      'Friendship & Community',
      'Learning & Growth',
      'Home & Environment',
      'Sexuality',
      'Emotional Regulation',
      'Legacy & Archives'
    ]

    return areas.map((name, index) => ({
      id: `area-${index + 1}`,
      name,
      color: 'yellow' as const,
      score: 0,
      recentEvents: [],
      patterns: [],
      lastUpdated: new Date(),
      trend: 'stable' as const
    }))
  }

  // Save state to localStorage
  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wisdomos_dashboard_state', JSON.stringify(this.dashboardState))
      } catch (error) {
        console.error('Error saving dashboard state:', error)
      }
    }
    this.emit('stateUpdated', this.dashboardState)
  }

  // Process events in queue
  private async startProcessingLoop() {
    setInterval(() => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        this.processNextEvent()
      }
    }, 100)
  }

  private async processNextEvent() {
    if (this.processingQueue.length === 0) return
    
    this.isProcessing = true
    const event = this.processingQueue.shift()!
    
    try {
      // Update life area based on event
      await this.updateLifeArea(event)
      
      // Check for patterns
      await this.detectPatterns(event)
      
      // Generate notifications if needed
      await this.generateNotifications(event)
      
      // Update overall health
      this.calculateOverallHealth()
      
      // Save state
      this.saveState()
      
      // Emit event for UI updates
      this.emit('eventProcessed', event)
      
    } catch (error) {
      console.error('Error processing event:', error)
    } finally {
      this.isProcessing = false
    }
  }

  private async updateLifeArea(event: SystemEvent) {
    const area = this.dashboardState.lifeAreas.find(a => a.id === event.lifeAreaId)
    if (!area) return

    // Add event to recent events (keep last 10)
    area.recentEvents = [event, ...area.recentEvents].slice(0, 10)
    
    // Update score based on impact
    area.score += event.impact
    
    // Update color based on score and recent events
    const negativeEvents = area.recentEvents.filter(e => e.impact < 0).length
    const positiveEvents = area.recentEvents.filter(e => e.impact > 0).length
    
    if (area.score <= -2 || negativeEvents >= 3) {
      area.color = 'red'
    } else if (area.score >= 2 && positiveEvents >= 3) {
      area.color = 'green'
    } else {
      area.color = 'yellow'
    }
    
    // Calculate trend
    const recentScores = area.recentEvents.map(e => e.impact)
    const avgRecent = recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    const avgPrevious = recentScores.slice(3, 6).reduce((a, b) => a + b, 0) / 3 || 0
    
    if (avgRecent > avgPrevious + 0.5) {
      area.trend = 'improving'
    } else if (avgRecent < avgPrevious - 0.5) {
      area.trend = 'declining'
    } else {
      area.trend = 'stable'
    }
    
    area.lastUpdated = new Date()
  }

  private async detectPatterns(event: SystemEvent) {
    // Check for recurring patterns
    const similarEvents = this.events.filter(e => 
      e.type === event.type && 
      e.lifeAreaId === event.lifeAreaId &&
      e.id !== event.id
    )
    
    if (similarEvents.length >= 2) {
      // Pattern detected
      const patternId = `${event.type}-${event.lifeAreaId}`
      let pattern = this.patterns.find(p => p.id === patternId)
      
      if (!pattern) {
        pattern = {
          id: patternId,
          name: `Recurring ${event.type} in ${event.lifeAreaName}`,
          type: event.impact < 0 ? 'negative' : event.impact > 0 ? 'positive' : 'neutral',
          frequency: 1,
          lastOccurrence: event.timestamp,
          lifeAreas: [event.lifeAreaId],
          triggerEvents: [event.id],
          suggestedAction: this.generateSuggestedAction(event.type, event.impact)
        }
        this.patterns.push(pattern)
        this.dashboardState.activePatterns.push(pattern)
      } else {
        pattern.frequency++
        pattern.lastOccurrence = event.timestamp
        pattern.triggerEvents.push(event.id)
      }
      
      // Emit pattern detected event
      this.emit('patternDetected', pattern)
    }
    
    // Check for cross-area patterns
    if (event.type === 'upset_logged' || event.type === 'commitment_broken') {
      const recentSimilar = this.events.filter(e => 
        (e.type === 'upset_logged' || e.type === 'commitment_broken') &&
        Math.abs(e.timestamp.getTime() - event.timestamp.getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
      )
      
      if (recentSimilar.length >= 3) {
        const notification: Notification = {
          id: `notif-${Date.now()}`,
          type: 'warning',
          title: 'Pattern Alert',
          message: 'Multiple upsets/broken commitments detected across life areas. Consider a boundary reset.',
          actionRequired: true,
          timestamp: new Date(),
          read: false
        }
        this.dashboardState.notifications.push(notification)
      }
    }
  }

  private generateSuggestedAction(eventType: EventType, impact: number): string {
    const suggestions: Record<string, string> = {
      'upset_logged': 'Review upset patterns and consider boundary reset',
      'commitment_broken': 'Revisit commitment and adjust to be more realistic',
      'pattern_detected': 'This pattern is recurring - time for deeper inquiry',
      'boundary_reset': 'Monitor if new boundaries hold over next 7 days',
      'relationship_added': 'Schedule regular check-ins with new connection',
      'task_completed': 'Celebrate the win and build on momentum'
    }
    
    return suggestions[eventType] || 'Continue monitoring this area'
  }

  private async generateNotifications(event: SystemEvent) {
    // Critical notifications for red areas
    const area = this.dashboardState.lifeAreas.find(a => a.id === event.lifeAreaId)
    if (area && area.color === 'red' && event.impact < 0) {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'alert',
        title: `Critical: ${area.name}`,
        message: `${area.name} needs immediate attention. Multiple negative events detected.`,
        lifeAreaId: area.id,
        actionRequired: true,
        timestamp: new Date(),
        read: false
      }
      this.dashboardState.notifications.push(notification)
      this.emit('notificationCreated', notification)
    }
    
    // Success notifications for improvements
    if (area && area.trend === 'improving' && event.impact > 0) {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'success',
        title: `Progress in ${area.name}`,
        message: `Great work! ${area.name} is showing improvement.`,
        lifeAreaId: area.id,
        actionRequired: false,
        timestamp: new Date(),
        read: false
      }
      this.dashboardState.notifications.push(notification)
    }
    
    // Keep only last 20 notifications
    this.dashboardState.notifications = this.dashboardState.notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20)
  }

  private calculateOverallHealth() {
    const areas = this.dashboardState.lifeAreas
    const weights = {
      green: 3,
      yellow: 1,
      red: -1
    }
    
    const totalScore = areas.reduce((sum, area) => {
      return sum + weights[area.color] + area.score
    }, 0)
    
    // Normalize to 0-100 scale
    const maxPossible = areas.length * 5 // Max score per area is 5
    const minPossible = areas.length * -5
    const normalized = ((totalScore - minPossible) / (maxPossible - minPossible)) * 100
    
    this.dashboardState.overallHealth = Math.max(0, Math.min(100, Math.round(normalized)))
  }

  // Public API
  
  public logEvent(event: Omit<SystemEvent, 'id' | 'timestamp'>): void {
    const fullEvent: SystemEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    
    this.events.push(fullEvent)
    this.processingQueue.push(fullEvent)
    
    // Store events
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wisdomos_events', JSON.stringify(this.events.slice(-100))) // Keep last 100
      } catch (error) {
        console.error('Error saving events:', error)
      }
    }
  }

  public logJournalEntry(lifeAreaName: string, content: string, mood: 'positive' | 'negative' | 'neutral') {
    const impact = mood === 'positive' ? 1 : mood === 'negative' ? -1 : 0
    const area = this.dashboardState.lifeAreas.find(a => a.name === lifeAreaName)
    
    if (area) {
      this.logEvent({
        type: 'journal_entry',
        lifeAreaId: area.id,
        lifeAreaName: area.name,
        impact,
        data: { content, mood },
        tags: this.extractTags(content)
      })
    }
  }

  public logUpset(lifeAreaName: string, trigger: string, intensity: number) {
    const area = this.dashboardState.lifeAreas.find(a => a.name === lifeAreaName)
    const impact = Math.min(-2, -Math.ceil(intensity / 3)) as -2 | -1
    
    if (area) {
      this.logEvent({
        type: 'upset_logged',
        lifeAreaId: area.id,
        lifeAreaName: area.name,
        impact,
        data: { trigger, intensity }
      })
    }
  }

  public logCommitment(lifeAreaName: string, commitment: string, kept: boolean) {
    const area = this.dashboardState.lifeAreas.find(a => a.name === lifeAreaName)
    
    if (area) {
      this.logEvent({
        type: kept ? 'commitment_kept' : 'commitment_broken',
        lifeAreaId: area.id,
        lifeAreaName: area.name,
        impact: kept ? 1 : -1,
        data: { commitment }
      })
    }
  }

  public logBoundaryReset(lifeAreaName: string, boundary: string) {
    const area = this.dashboardState.lifeAreas.find(a => a.name === lifeAreaName)
    
    if (area) {
      this.logEvent({
        type: 'boundary_reset',
        lifeAreaId: area.id,
        lifeAreaName: area.name,
        impact: 2,
        data: { boundary }
      })
    }
  }

  private extractTags(content: string): string[] {
    const tags: string[] = []
    
    // Extract hashtags
    const hashtags = content.match(/#\w+/g) || []
    tags.push(...hashtags.map(tag => tag.slice(1)))
    
    // Extract emotional keywords
    const emotions = ['happy', 'sad', 'angry', 'frustrated', 'excited', 'grateful', 'anxious']
    emotions.forEach(emotion => {
      if (content.toLowerCase().includes(emotion)) {
        tags.push(emotion)
      }
    })
    
    return tags
  }

  public getState(): DashboardState {
    return this.dashboardState
  }

  public getLifeAreaStatus(lifeAreaName: string): LifeAreaStatus | undefined {
    return this.dashboardState.lifeAreas.find(a => a.name === lifeAreaName)
  }

  public getActivePatterns(): Pattern[] {
    return this.dashboardState.activePatterns
  }

  public getNotifications(unreadOnly = false): Notification[] {
    if (unreadOnly) {
      return this.dashboardState.notifications.filter(n => !n.read)
    }
    return this.dashboardState.notifications
  }

  public markNotificationRead(notificationId: string) {
    const notification = this.dashboardState.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveState()
    }
  }

  public clearNotifications() {
    this.dashboardState.notifications = []
    this.saveState()
  }

  // Subscribe to updates
  public subscribe(event: string, callback: (...args: any[]) => void) {
    this.on(event, callback)
  }

  public unsubscribe(event: string, callback: (...args: any[]) => void) {
    this.off(event, callback)
  }
}

// Singleton instance
let instance: FeedbackLoopSystem | null = null

export function getFeedbackLoop(): FeedbackLoopSystem {
  if (!instance) {
    instance = new FeedbackLoopSystem()
  }
  return instance
}

// Helper hooks for React components
export function useFeedbackLoop() {
  const [state, setState] = useState<DashboardState | null>(null)
  
  useEffect(() => {
    const feedbackLoop = getFeedbackLoop()
    setState(feedbackLoop.getState())
    
    const handleUpdate = (newState: DashboardState) => {
      setState(newState)
    }
    
    feedbackLoop.subscribe('stateUpdated', handleUpdate)
    
    return () => {
      feedbackLoop.unsubscribe('stateUpdated', handleUpdate)
    }
  }, [])
  
  return {
    state,
    feedbackLoop: getFeedbackLoop()
  }
}

export default getFeedbackLoop