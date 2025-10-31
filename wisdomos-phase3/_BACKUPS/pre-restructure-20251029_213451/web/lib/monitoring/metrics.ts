/**
 * Alternative Metrics System for WisdomOS
 * Works without external dependencies - stores locally and in Vercel KV if available
 */

// Make @vercel/analytics optional
let vercelTrack: any = null
try {
  const analytics = require('@vercel/analytics')
  vercelTrack = analytics.track
} catch {
  // @vercel/analytics not installed, will use local metrics only
}

interface Metric {
  name: string
  value: number
  tags: Record<string, string>
  timestamp: number
}

interface MetricAggregate {
  name: string
  count: number
  sum: number
  avg: number
  min: number
  max: number
  tags: Record<string, string>
  lastUpdated: number
}

class LocalMetricsStore {
  private metrics: Map<string, MetricAggregate> = new Map()
  private events: Array<{ timestamp: number; event: any }> = []
  private maxEvents = 1000

  record(metric: Metric): void {
    const key = this.getKey(metric.name, metric.tags)
    const existing = this.metrics.get(key)

    if (existing) {
      existing.count++
      existing.sum += metric.value
      existing.avg = existing.sum / existing.count
      existing.min = Math.min(existing.min, metric.value)
      existing.max = Math.max(existing.max, metric.value)
      existing.lastUpdated = metric.timestamp
    } else {
      this.metrics.set(key, {
        name: metric.name,
        count: 1,
        sum: metric.value,
        avg: metric.value,
        min: metric.value,
        max: metric.value,
        tags: metric.tags,
        lastUpdated: metric.timestamp
      })
    }

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('wisdomos_metrics') || '[]')
        stored.push(metric)
        // Keep only last 24 hours of metrics
        const cutoff = Date.now() - 24 * 60 * 60 * 1000
        const filtered = stored.filter((m: Metric) => m.timestamp > cutoff)
        localStorage.setItem('wisdomos_metrics', JSON.stringify(filtered))
      } catch (e) {
        console.warn('Failed to persist metrics:', e)
      }
    }
  }

  recordEvent(event: any): void {
    this.events.push({ timestamp: Date.now(), event })
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }

  private getKey(name: string, tags: Record<string, string>): string {
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
    return `${name}|${tagStr}`
  }

  getMetrics(): MetricAggregate[] {
    return Array.from(this.metrics.values())
  }

  getEvents(since?: number): any[] {
    if (since) {
      return this.events.filter(e => e.timestamp > since).map(e => e.event)
    }
    return this.events.map(e => e.event)
  }

  getDashboardData() {
    const now = Date.now()
    const hour = 60 * 60 * 1000
    const day = 24 * hour

    return {
      current: {
        contributions: this.getMetricValue('wisdomos.contribution.created', {}, now - hour),
        journalEntries: this.getMetricValue('wisdomos.journal.entry', {}, now - hour),
        fulfillmentAvg: this.getMetricAvg('wisdomos.fulfillment.score', {}, now - day),
        hubspotSyncs: this.getMetricValue('wisdomos.hubspot.sync', {}, now - hour),
        errors: this.getMetricValue('wisdomos.error.count', {}, now - hour)
      },
      trends: {
        contributionsByType: this.getMetricsByTag('wisdomos.contribution.created', 'type', now - day),
        journalsByMood: this.getMetricsByTag('wisdomos.journal.entry', 'mood', now - day),
        fulfillmentByArea: this.getMetricsByTag('wisdomos.fulfillment.score', 'area', now - day),
        apiLatency: this.getMetricsByTag('wisdomos.api.latency', 'endpoint', now - hour)
      },
      events: this.getEvents(now - hour)
    }
  }

  private getMetricValue(name: string, tags: Record<string, string>, since: number): number {
    const key = this.getKey(name, tags)
    const metric = this.metrics.get(key)
    if (metric && metric.lastUpdated > since) {
      return metric.count
    }
    return 0
  }

  private getMetricAvg(name: string, tags: Record<string, string>, since: number): number {
    const key = this.getKey(name, tags)
    const metric = this.metrics.get(key)
    if (metric && metric.lastUpdated > since) {
      return metric.avg
    }
    return 0
  }

  private getMetricsByTag(namePrefix: string, tagName: string, since: number): Record<string, number> {
    const result: Record<string, number> = {}
    
    this.metrics.forEach((metric, key) => {
      if (metric.name.startsWith(namePrefix) && metric.lastUpdated > since) {
        const tagValue = metric.tags[tagName] || 'unknown'
        result[tagValue] = (result[tagValue] || 0) + metric.count
      }
    })
    
    return result
  }

  clear(): void {
    this.metrics.clear()
    this.events = []
  }
}

// Singleton store
const store = new LocalMetricsStore()

/**
 * Main metrics interface that works with multiple backends
 */
export class WisdomMetrics {
  private useVercel: boolean
  private useLocal: boolean

  constructor() {
    this.useVercel = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID !== undefined
    this.useLocal = true // Always use local store
  }

  /**
   * Track a metric
   */
  async metric(name: string, value: number = 1, tags?: Record<string, string>): Promise<void> {
    const metric: Metric = {
      name: `wisdomos.${name}`,
      value,
      tags: tags || {},
      timestamp: Date.now()
    }

    // Store locally
    if (this.useLocal) {
      store.record(metric)
    }

    // Send to Vercel Analytics if available
    if (this.useVercel && typeof window !== 'undefined' && vercelTrack) {
      vercelTrack(name, {
        value: value.toString(),
        ...tags
      } as any)
    }

    // Try to send to Grafana if configured (won't fail if not)
    if (process.env.NEXT_PUBLIC_GRAFANA_WRITE_URL) {
      this.sendToGrafana(metric).catch(() => {
        // Silently fail if Grafana is not available
      })
    }
  }

  /**
   * Track an event
   */
  async event(title: string, description: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    const event = {
      title,
      description,
      level,
      timestamp: Date.now()
    }

    // Store locally
    store.recordEvent(event)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = level === 'error' ? '🔴' : level === 'warning' ? '🟡' : '🟢'
      console.log(`${color} [${title}] ${description}`)
    }
  }

  /**
   * WisdomOS-specific tracking methods
   */
  async trackContribution(type: 'being' | 'doing' | 'having', action: 'created' | 'updated' | 'deleted'): Promise<void> {
    await this.metric(`contribution.${action}`, 1, { type })
  }

  async trackJournalEntry(mood?: string): Promise<void> {
    await this.metric('journal.entry', 1, { mood: mood || 'neutral' })
  }

  async trackFulfillmentScore(area: string, score: number): Promise<void> {
    await this.metric('fulfillment.score', score, { area })
  }

  async trackHubSpotSync(entity: string, count: number): Promise<void> {
    await this.metric('hubspot.sync', count, { entity })
  }

  async trackUserAction(action: string, category?: string): Promise<void> {
    await this.metric('user.action', 1, { action, category: category || 'general' })
  }

  async trackApiLatency(endpoint: string, duration: number): Promise<void> {
    await this.metric('api.latency', duration, { endpoint })
  }

  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.event(
      `Error: ${error.name}`,
      `${error.message}\n\nContext: ${JSON.stringify(context)}`,
      'error'
    )
    await this.metric('error.count', 1, { 
      error: error.name,
      message: error.message.substring(0, 50)
    })
  }

  /**
   * Get dashboard data
   */
  getDashboard() {
    return store.getDashboardData()
  }

  /**
   * Get raw metrics
   */
  getMetrics() {
    return store.getMetrics()
  }

  /**
   * Try to send to Grafana (best effort)
   */
  private async sendToGrafana(metric: Metric): Promise<void> {
    const url = process.env.NEXT_PUBLIC_GRAFANA_WRITE_URL
    const username = process.env.NEXT_PUBLIC_GRAFANA_USERNAME || ''
    const token = process.env.NEXT_PUBLIC_GRAFANA_TOKEN || ''

    if (!url) return

    const labels = Object.entries(metric.tags)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    
    const line = `${metric.name}{${labels}} ${metric.value} ${metric.timestamp}`

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${username}:${token}`
        },
        body: line
      })
    } catch {
      // Silently fail
    }
  }
}

// Export singleton instance
export const metrics = new WisdomMetrics()

// Convenience exports
export const trackMetric = (name: string, value?: number, tags?: Record<string, string>) => 
  metrics.metric(name, value, tags)

export const trackEvent = (title: string, description: string, level?: 'info' | 'warning' | 'error') =>
  metrics.event(title, description, level)

// React hook for component tracking
export function useMetrics(componentName: string) {
  const track = (action: string, data?: any) => {
    metrics.trackUserAction(`${componentName}.${action}`, componentName)
    if (data && process.env.NODE_ENV === 'development') {
      console.log(`[Metrics] ${componentName}.${action}:`, data)
    }
  }

  return { track, metrics }
}