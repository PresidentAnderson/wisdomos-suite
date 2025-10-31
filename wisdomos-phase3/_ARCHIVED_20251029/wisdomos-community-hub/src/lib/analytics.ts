import { supabase } from './supabase'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
    clarity: (...args: any[]) => void
    dataLayer: any[]
  }
}

interface AnalyticsEvent {
  name: string
  parameters?: Record<string, any>
  user_id?: string
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
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
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
    !(function (f: any, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

    window.fbq('init', FB_PIXEL_ID)
    window.fbq('track', 'PageView')
  }

  private initializeClarity() {
    const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID!
    
    // Load Microsoft Clarity
    !(function (c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
      c[a] = c[a] || function () {
        (c[a].q = c[a].q || []).push(arguments)
      }
      t = l.createElement(r)
      t.async = 1
      t.src = 'https://www.clarity.ms/tag/' + i
      y = l.getElementsByTagName(r)[0]
      y.parentNode.insertBefore(t, y)
    })(window, document, 'clarity', 'script', CLARITY_ID)
  }

  // Track events across all platforms
  async track(eventName: string, parameters: Record<string, any> = {}, userId?: string) {
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
    event_data: Record<string, any>
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
  identify(userId: string, properties: Record<string, any> = {}) {
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
  purchase(transactionId: string, value: number, currency: string, items: any[] = []) {
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
  engagement(eventName: string, details: Record<string, any> = {}) {
    this.track(`engagement_${eventName}`, details)
  }

  // Error tracking
  error(error: Error, context: Record<string, any> = {}) {
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
export const trackEvent = (name: string, parameters?: Record<string, any>, userId?: string) => 
  analytics.track(name, parameters, userId)

export const trackPageView = (url?: string, title?: string) => 
  analytics.pageView(url, title)

export const identifyUser = (userId: string, properties?: Record<string, any>) => 
  analytics.identify(userId, properties)

export const trackPurchase = (transactionId: string, value: number, currency: string, items?: any[]) => 
  analytics.purchase(transactionId, value, currency, items)

export const trackLead = (value?: number, currency?: string) => 
  analytics.generateLead(value, currency)

export const trackEngagement = (eventName: string, details?: Record<string, any>) => 
  analytics.engagement(eventName, details)

export const trackError = (error: Error, context?: Record<string, any>) => 
  analytics.error(error, context)

export const trackPerformance = (metric: string, value: number, unit?: string) => 
  analytics.performance(metric, value, unit)

// Initialize analytics on import
if (typeof window !== 'undefined') {
  analytics.initialize()
}