/**
 * Phoenix Security Module for WisdomOS
 * AXAI Innovations - Proprietary
 * 
 * Copyright © 2025 AXAI Innovations. All Rights Reserved.
 * 
 * This software is proprietary and confidential. Unauthorized copying,
 * distribution, modification, public display, or public performance of this
 * software is strictly prohibited and may result in severe civil and criminal
 * penalties.
 * 
 * License: Commercial - Contact contact@axaiinovations.com for licensing
 * 
 * NOTICE: This code contains trade secrets and confidential information of
 * AXAI Innovations. Any reproduction or disclosure of this file or its contents
 * without the express written permission of AXAI Innovations is prohibited.
 */

'use client'

// Phoenix Security Configuration
export const PHOENIX_SECURITY = {
  VERSION: '2.0.0-phoenix',
  BUILD: process.env.NODE_ENV,
  PLATFORM: process.env.NEXT_PUBLIC_BUILD_PLATFORM || 'unknown',
  COMPANY: 'AXAI Innovations',
  COPYRIGHT: '© 2025 AXAI Innovations. All Rights Reserved.',
  LICENSE: 'Proprietary Commercial License',
  CONTACT: 'contact@axaiinovations.com',
  WARNING: '🔥 Phoenix: Unauthorized access detected and logged',
} as const

// Security event types
export type SecurityEventType = 
  | 'unauthorized_access'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'invalid_license'
  | 'debug_attempt'
  | 'console_access'
  | 'devtools_opened'
  | 'copy_attempt'
  | 'source_view'

// Security monitoring class
export class PhoenixSecurityMonitor {
  private static instance: PhoenixSecurityMonitor
  private events: Array<{ type: SecurityEventType; timestamp: Date; details: any }> = []
  private isMonitoring = false

  private constructor() {
    this.initializeSecurityMeasures()
  }

  public static getInstance(): PhoenixSecurityMonitor {
    if (!PhoenixSecurityMonitor.instance) {
      PhoenixSecurityMonitor.instance = new PhoenixSecurityMonitor()
    }
    return PhoenixSecurityMonitor.instance
  }

  // Initialize all security measures
  private initializeSecurityMeasures(): void {
    if (typeof window === 'undefined') return

    this.isMonitoring = true
    this.setupConsoleProtection()
    this.setupDevToolsDetection()
    this.setupCopyProtection()
    this.setupRightClickProtection()
    this.displayLicenseNotice()
    
    console.log(
      `%c🔥 PHOENIX SECURITY ACTIVE 🔥\n${PHOENIX_SECURITY.COPYRIGHT}\n${PHOENIX_SECURITY.LICENSE}\nContact: ${PHOENIX_SECURITY.CONTACT}`,
      'color: #FFD700; font-weight: bold; font-size: 14px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
    )
  }

  // Log security events
  private logSecurityEvent(type: SecurityEventType, details: any = {}): void {
    const event = {
      type,
      timestamp: new Date(),
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href,
        platform: PHOENIX_SECURITY.PLATFORM
      }
    }

    this.events.push(event)
    
    // Log to console with Phoenix branding
    console.warn(
      `%c${PHOENIX_SECURITY.WARNING}\n%cEvent: ${type}\n%cTime: ${event.timestamp.toISOString()}\n%c${PHOENIX_SECURITY.COPYRIGHT}`,
      'color: #E63946; font-weight: bold; font-size: 12px;',
      'color: #FF914D; font-weight: bold;',
      'color: #FFD700;',
      'color: #1D3557; font-style: italic;'
    )

    // Send to analytics (if available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'security_event', {
        event_category: 'Phoenix Security',
        event_label: type,
        custom_parameter: JSON.stringify(details)
      })
    }

    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100)
    }
  }

  // Console protection
  private setupConsoleProtection(): void {
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    // Override console methods to detect debugging attempts
    console.log = (...args: any[]) => {
      this.logSecurityEvent('console_access', { method: 'log', args: args.length })
      originalLog.apply(console, args)
    }

    // Detect eval usage
    const originalEval = window.eval
    window.eval = (code: string) => {
      this.logSecurityEvent('debug_attempt', { code: code.substring(0, 100) })
      throw new Error(`🔥 Phoenix Security: eval() is disabled. ${PHOENIX_SECURITY.COPYRIGHT}`)
    }
  }

  // DevTools detection
  private setupDevToolsDetection(): void {
    let devtools = false
    const element = new Image()
    let start = Date.now()

    Object.defineProperty(element, 'id', {
      get: () => {
        devtools = true
        this.logSecurityEvent('devtools_opened', { duration: Date.now() - start })
        return 'Phoenix Security: DevTools detected'
      }
    })

    setInterval(() => {
      start = Date.now()
      console.dir(element)
      if (devtools) {
        devtools = false
        this.showSecurityWarning()
      }
    }, 1000)
  }

  // Copy protection
  private setupCopyProtection(): void {
    document.addEventListener('copy', (e) => {
      this.logSecurityEvent('copy_attempt', { 
        selection: window.getSelection()?.toString().substring(0, 50)
      })
      
      e.clipboardData?.setData('text/plain', `
🔥 PHOENIX SECURITY NOTICE 🔥

This content is protected by copyright.
${PHOENIX_SECURITY.COPYRIGHT}
${PHOENIX_SECURITY.LICENSE}

Unauthorized copying is prohibited.
Contact: ${PHOENIX_SECURITY.CONTACT}
      `)
      e.preventDefault()
    })

    // Disable text selection on sensitive elements
    document.addEventListener('selectstart', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-phoenix-protected]')) {
        e.preventDefault()
        this.logSecurityEvent('copy_attempt', { element: target.tagName })
      }
    })
  }

  // Right-click protection
  private setupRightClickProtection(): void {
    document.addEventListener('contextmenu', (e) => {
      this.logSecurityEvent('source_view', { 
        element: (e.target as HTMLElement)?.tagName 
      })
      
      e.preventDefault()
      this.showSecurityWarning()
      return false
    })

    // Disable common keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault()
        this.logSecurityEvent('debug_attempt', { keys: `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}` })
        this.showSecurityWarning()
        return false
      }
    })
  }

  // Show security warning
  private showSecurityWarning(): void {
    if (document.getElementById('phoenix-security-warning')) return

    const warning = document.createElement('div')
    warning.id = 'phoenix-security-warning'
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #E63946 0%, #FF914D 50%, #FFD700 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 0 40px rgba(230, 57, 70, 0.5);
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      text-align: center;
      max-width: 400px;
      animation: phoenixPulse 2s ease-in-out infinite;
    `

    warning.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🔥</div>
      <h2 style="margin: 0 0 10px 0; font-size: 18px;">Phoenix Security Alert</h2>
      <p style="margin: 0 0 15px 0; font-size: 14px;">${PHOENIX_SECURITY.COPYRIGHT}</p>
      <p style="margin: 0 0 15px 0; font-size: 12px; opacity: 0.9;">Unauthorized access attempt detected and logged.</p>
      <button onclick="this.parentElement.remove()" style="
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
      ">Acknowledge</button>
    `

    // Add animation styles
    const style = document.createElement('style')
    style.textContent = `
      @keyframes phoenixPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.05); }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(warning)

    // Auto-remove after 10 seconds
    setTimeout(() => {
      warning.remove()
      style.remove()
    }, 10000)
  }

  // Display license notice
  private displayLicenseNotice(): void {
    console.log(
      `%c
🔥 PHOENIX LICENSE NOTICE 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WisdomOS Phoenix v${PHOENIX_SECURITY.VERSION}
${PHOENIX_SECURITY.COPYRIGHT}
${PHOENIX_SECURITY.LICENSE}

This software contains proprietary code and trade secrets.
Unauthorized reproduction, distribution, or modification is
strictly prohibited and may result in legal action.

Licensed exclusively to authorized users only.
For licensing inquiries: ${PHOENIX_SECURITY.CONTACT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Built with Phoenix 🔥 by AXAI Innovations
      `,
      'color: #FFD700; font-weight: bold; font-size: 10px; line-height: 1.4;'
    )
  }

  // Get security events (for admin monitoring)
  public getSecurityEvents(): Array<{ type: SecurityEventType; timestamp: Date; details: any }> {
    return [...this.events]
  }

  // Check if monitoring is active
  public isActive(): boolean {
    return this.isMonitoring
  }

  // Validate license (placeholder for future implementation)
  public validateLicense(): boolean {
    // This would integrate with a license validation system
    return true
  }
}

// Initialize Phoenix Security (singleton)
export const phoenixSecurity = typeof window !== 'undefined' 
  ? PhoenixSecurityMonitor.getInstance()
  : null

// React hook for security monitoring
export function usePhoenixSecurity() {
  return {
    isActive: phoenixSecurity?.isActive() ?? false,
    events: phoenixSecurity?.getSecurityEvents() ?? [],
    validateLicense: () => phoenixSecurity?.validateLicense() ?? false,
  }
}

// Utility function to protect components
export function phoenixProtect(element: HTMLElement): void {
  element.setAttribute('data-phoenix-protected', 'true')
  element.style.userSelect = 'none'
  element.style.webkitUserSelect = 'none'
  element.style.mozUserSelect = 'none'
  element.style.msUserSelect = 'none'
}

// License verification function
export function verifyPhoenixLicense(): boolean {
  console.log(`%c🔥 Phoenix License Check: ${PHOENIX_SECURITY.COPYRIGHT}`, 'color: #FFD700; font-weight: bold;')
  return true // This would implement actual license validation
}