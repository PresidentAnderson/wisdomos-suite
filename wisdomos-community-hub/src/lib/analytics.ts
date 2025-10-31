import { supabase } from './supabase'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    fbq: (...args: unknown[]) => void
    clarity: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

class Analytics {
  private isInitialized = false
  private sessionId = this.generateSessionId()

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`
  }

  // Initialize all analytics services
  async initialize() {
    if (this.isInitialized) return

    try {
      // Initialize Google Analytics 4
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
        this.initializeGA4()
      }

      // Initialize Facebook Pixel
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
        this.initializeFacebookPixel()
      }

      // Initialize Microsoft Clarity
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
        this.initializeClarity()
      }

      this.isInitialized = true
      
      // Track initialization
      this.track('analytics_initialized', {
        timestamp: new Date().toISOString(),
        session_id: this.sessionId
      })
    } catch (error) {
      console.error('Analytics initialization error:', error)
    }
  }

  private initializeGA4() {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID!
    
    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args)
    }

    window.gtag('js', new Date())
    window.gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true
    })
  }

  private initializeFacebookPixel() {
    const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID!
    
    // Load Facebook Pixel
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)

    type FBQ = ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void
      q?: unknown[]
      loaded?: boolean
      version?: string
    }

    const fbq: FBQ = function (...args: unknown[]) {
      fbq.callMethod ? fbq.callMethod(...args) : (fbq.q = fbq.q || []).push(args)
    }

    fbq.loaded = true
    fbq.version = '2.0'
    fbq.q = []

    window.fbq = fbq
    window.fbq('init', FB_PIXEL_ID)
    window.fbq('track', 'PageView')
  }

  private initializeClarity() {
    const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID!
    
    // Load Microsoft Clarity
    type Clarity = ((...args: unknown[]) => void) & { q?: unknown[] }
    const clarity: Clarity = function (...args: unknown[]) {
      (clarity.q = clarity.q || []).push(args)
    }
    window.clarity = clarity

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.clarity.ms/tag/' + CLARITY_ID
    document.head.appendChild(script)
  }

  // Track events across all platforms
  async track(eventName: string, parameters: Record<string, unknown> = {}, userId?: string) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const eventData = {
      ...parameters,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : ''
    }

    try {
      // Track in Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, {
          ...eventData,
          user_id: userId
        })
      }

      // Track in Facebook Pixel
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', eventName, eventData)
      }

      // Track in Microsoft Clarity
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('set', eventName, JSON.stringify(eventData))
      }

      // Store in Supabase for internal analytics
      await this.storeEvent({
        user_id: userId || null,
        event_name: eventName,
        event_data: eventData,
        page_url: eventData.page_url,
        user_agent: eventData.user_agent,
        session_id: this.sessionId
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  private async storeEvent(event: {
    user_id: string | null
    event_name: string
    event_data: Record<string, unknown>
    page_url: string
    user_agent: string
    session_id: string
  }) {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert([event])

      if (error) {
        console.error('Supabase analytics error:', error)
      }
    } catch (error) {
      console.error('Analytics storage error:', error)
    }
  }

  // Page view tracking
  pageView(url?: string, title?: string) {
    const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const pageTitle = title || (typeof document !== 'undefined' ? document.title : '')

    this.track('page_view', {
      page_url: pageUrl,
      page_title: pageTitle
    })
  }

  // User identification
  identify(userId: string, properties: Record<string, unknown> = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        user_id: userId,
        custom_map: properties
      })
    }

    this.track('user_identified', {
      user_id: userId,
      properties
    }, userId)
  }

  // E-commerce tracking
  purchase(transactionId: string, value: number, currency: string, items: Record<string, unknown>[] = []) {
    const eventData = {
      transaction_id: transactionId,
      value,
      currency,
      items
    }

    this.track('purchase', eventData)

    // Facebook Pixel purchase event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value,
        currency
      })
    }
  }

  // Lead generation
  generateLead(value?: number, currency?: string) {
    const eventData = {
      value: value || 0,
      currency: currency || 'USD'
    }

    this.track('generate_lead', eventData)

    // Facebook Pixel lead event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', eventData)
    }
  }

  // User engagement
  engagement(eventName: string, details: Record<string, unknown> = {}) {
    this.track(`engagement_${eventName}`, details)
  }

  // Error tracking
  error(error: Error, context: Record<string, unknown> = {}) {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      context
    })
  }

  // Performance tracking
  performance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance_metric', {
      metric,
      value,
      unit
    })
  }
}

// Create singleton instance
export const analytics = new Analytics()

// Convenience functions
export const trackEvent = (name: string, parameters?: Record<string, unknown>, userId?: string) =>
  analytics.track(name, parameters, userId)

export const trackPageView = (url?: string, title?: string) => 
  analytics.pageView(url, title)

export const identifyUser = (userId: string, properties?: Record<string, unknown>) =>
  analytics.identify(userId, properties)

export const trackPurchase = (transactionId: string, value: number, currency: string, items?: Record<string, unknown>[]) =>
  analytics.purchase(transactionId, value, currency, items)

export const trackLead = (value?: number, currency?: string) => 
  analytics.generateLead(value, currency)

export const trackEngagement = (eventName: string, details?: Record<string, unknown>) =>
  analytics.engagement(eventName, details)

export const trackError = (error: Error, context?: Record<string, unknown>) =>
  analytics.error(error, context)

export const trackPerformance = (metric: string, value: number, unit?: string) => 
  analytics.performance(metric, value, unit)

// Initialize analytics on import
if (typeof window !== 'undefined') {
  analytics.initialize()
}