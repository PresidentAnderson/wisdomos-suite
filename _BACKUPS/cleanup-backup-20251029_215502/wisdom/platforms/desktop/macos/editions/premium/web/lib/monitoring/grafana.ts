/**
 * Grafana Monitoring Integration for WisdomOS
 * Tracks application metrics, user engagement, and system health
 */

interface GrafanaConfig {
  serviceAccountId: string
  serviceAccountToken: string
  instanceUrl: string
  orgId: string
}

interface MetricPayload {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: number
}

interface EventPayload {
  title: string
  text: string
  tags?: string[]
  level?: 'info' | 'warning' | 'error' | 'critical'
}

class GrafanaMonitor {
  private config: GrafanaConfig
  private metricsBuffer: MetricPayload[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<GrafanaConfig> = {}) {
    this.config = {
      serviceAccountId: config.serviceAccountId || process.env.GRAFANA_SERVICE_ACCOUNT_ID || '',
      serviceAccountToken: config.serviceAccountToken || process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN || '',
      instanceUrl: config.instanceUrl || process.env.GRAFANA_INSTANCE_URL || '',
      orgId: config.orgId || process.env.GRAFANA_ORG_ID || '1'
    }

    // Start metrics flush interval (every 10 seconds)
    if (this.isConfigured()) {
      this.flushInterval = setInterval(() => this.flushMetrics(), 10000)
    }
  }

  private isConfigured(): boolean {
    return !!(
      this.config.serviceAccountToken && 
      this.config.instanceUrl
    )
  }

  /**
   * Track a metric value
   */
  async metric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    if (!this.isConfigured()) return

    const metric: MetricPayload = {
      name: `wisdomos.${name}`,
      value,
      tags: {
        ...tags,
        service: 'wisdomos',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      },
      timestamp: Date.now()
    }

    this.metricsBuffer.push(metric)

    // Auto-flush if buffer is large
    if (this.metricsBuffer.length >= 100) {
      await this.flushMetrics()
    }
  }

  /**
   * Track an event/annotation
   */
  async event(title: string, text: string, level: EventPayload['level'] = 'info'): Promise<void> {
    if (!this.isConfigured()) return

    try {
      const response = await fetch(`${this.config.instanceUrl}/api/annotations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.serviceAccountToken}`,
          'Content-Type': 'application/json',
          'X-Grafana-Org-Id': this.config.orgId
        },
        body: JSON.stringify({
          dashboardUID: 'wisdomos-main',
          panelId: 1,
          time: Date.now(),
          timeEnd: Date.now(),
          tags: ['wisdomos', level],
          text: `${title}\n\n${text}`
        })
      })

      if (!response.ok) {
        console.error('[Grafana] Failed to send event:', response.statusText)
      }
    } catch (error) {
      console.error('[Grafana] Error sending event:', error)
    }
  }

  /**
   * Flush buffered metrics to Grafana
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return

    const metrics = [...this.metricsBuffer]
    this.metricsBuffer = []

    try {
      // Convert to Prometheus format
      const lines = metrics.map(m => {
        const tags = Object.entries(m.tags || {})
          .map(([k, v]) => `${k}="${v}"`)
          .join(',')
        return `${m.name}{${tags}} ${m.value} ${m.timestamp}`
      })

      const response = await fetch(`${this.config.instanceUrl}/api/v1/push`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.serviceAccountToken}`,
          'Content-Type': 'text/plain',
          'X-Grafana-Org-Id': this.config.orgId
        },
        body: lines.join('\n')
      })

      if (!response.ok) {
        console.error('[Grafana] Failed to push metrics:', response.statusText)
      }
    } catch (error) {
      console.error('[Grafana] Error pushing metrics:', error)
    }
  }

  /**
   * Track WisdomOS-specific metrics
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
      `${error.message}\n\nStack: ${error.stack}\n\nContext: ${JSON.stringify(context)}`,
      'error'
    )
    await this.metric('error.count', 1, { 
      error: error.name,
      message: error.message.substring(0, 50)
    })
  }

  /**
   * Create dashboard configuration
   */
  getDashboardConfig(): object {
    return {
      uid: 'wisdomos-main',
      title: 'WisdomOS Monitoring',
      tags: ['wisdomos', 'anthropic'],
      timezone: 'browser',
      panels: [
        {
          title: 'Contributions by Type',
          type: 'graph',
          targets: [
            { expr: 'sum by (type) (rate(wisdomos_contribution_created[5m]))' }
          ]
        },
        {
          title: 'Fulfillment Scores',
          type: 'heatmap',
          targets: [
            { expr: 'wisdomos_fulfillment_score' }
          ]
        },
        {
          title: 'Journal Entries by Mood',
          type: 'piechart',
          targets: [
            { expr: 'sum by (mood) (wisdomos_journal_entry)' }
          ]
        },
        {
          title: 'HubSpot Sync Activity',
          type: 'stat',
          targets: [
            { expr: 'sum(rate(wisdomos_hubspot_sync[1h]))' }
          ]
        },
        {
          title: 'API Latency',
          type: 'graph',
          targets: [
            { expr: 'histogram_quantile(0.95, wisdomos_api_latency)' }
          ]
        },
        {
          title: 'Error Rate',
          type: 'alertlist',
          targets: [
            { expr: 'sum(rate(wisdomos_error_count[5m])) > 0' }
          ]
        }
      ]
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flushMetrics()
  }
}

// Singleton instance
let monitor: GrafanaMonitor | null = null

export function getGrafanaMonitor(): GrafanaMonitor {
  if (!monitor) {
    monitor = new GrafanaMonitor()
  }
  return monitor
}

// Convenience exports
export const grafana = getGrafanaMonitor()

export async function trackMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
  return grafana.metric(name, value, tags)
}

export async function trackEvent(title: string, text: string, level?: EventPayload['level']): Promise<void> {
  return grafana.event(title, text, level)
}

// React hook for component tracking
export function useGrafanaTracking(componentName: string) {
  const track = (action: string, data?: any) => {
    grafana.trackUserAction(`${componentName}.${action}`, componentName)
    if (data) {
      console.log(`[Grafana] ${componentName}.${action}:`, data)
    }
  }

  return { track }
}