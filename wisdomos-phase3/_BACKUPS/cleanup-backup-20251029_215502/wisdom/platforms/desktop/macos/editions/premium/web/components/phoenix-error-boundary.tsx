/**
 * Phoenix Error Boundary Component for WisdomOS
 * AXAI Innovations - Proprietary
 * 
 * Copyright © 2025 AXAI Innovations. All Rights Reserved.
 * Enhanced error handling with Phoenix-themed recovery
 */
'use client'

import React from 'react'
import { PhoenixCard, PhoenixCardContent, PhoenixCardHeader, PhoenixCardTitle } from './ui/phoenix-card'
import { PhoenixButton } from './ui/phoenix-button'
import { PhoenixBadge } from './ui/phoenix-badge'
import { PHOENIX_SECURITY } from '@/lib/phoenix-security'
import { Flame, RotateCcw, AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  phoenixPhase: 'ash' | 'ember' | 'rebirth'
  retryCount: number
}

interface PhoenixErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export default class PhoenixErrorBoundary extends React.Component<
  PhoenixErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: PhoenixErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      phoenixPhase: 'ember',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('🔥 Phoenix Error Boundary: Catching error', error)
    return {
      hasError: true,
      error,
      phoenixPhase: 'ash' // Start in ash phase when error occurs
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔥 Phoenix Error Details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      phoenixVersion: PHOENIX_SECURITY.VERSION
    })

    this.setState({
      error,
      errorInfo,
      phoenixPhase: 'ash'
    })

    // Log to external service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'phoenix_error', {
        event_category: 'Phoenix Error Boundary',
        event_label: error.message,
        value: this.state.retryCount
      })
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  // Phoenix recovery cycle
  handleRetry = () => {
    console.log('🔥 Phoenix: Starting recovery cycle...')
    
    this.setState(prevState => ({
      phoenixPhase: 'ember',
      retryCount: prevState.retryCount + 1
    }))

    // Simulate Phoenix transformation
    setTimeout(() => {
      this.setState({ phoenixPhase: 'rebirth' })
      
      // Complete the cycle and reset
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          phoenixPhase: 'ember'
        })
        console.log('🔥 Phoenix: Recovery complete - Rising from the ashes!')
      }, 2000)
    }, 1000)
  }

  // Force reload as last resort
  handleForceReload = () => {
    console.log('🔥 Phoenix: Force reload initiated')
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // Get Phoenix phase styling
  getPhaseConfig = () => {
    switch (this.state.phoenixPhase) {
      case 'ash':
        return {
          variant: 'ash' as const,
          title: 'Phoenix in Ashes',
          description: 'Something went wrong, but Phoenix will rise again',
          animation: 'animate-ash-scatter',
          icon: <AlertTriangle className="w-6 h-6 text-phoenix-charcoal" />
        }
      case 'ember':
        return {
          variant: 'ember' as const,
          title: 'Phoenix Ember Glowing',
          description: 'Recovery in progress...',
          animation: 'animate-ember-glow',
          icon: <Flame className="w-6 h-6 text-phoenix-ember animate-flame-flicker" />
        }
      case 'rebirth':
        return {
          variant: 'transformation' as const,
          title: 'Phoenix Rising',
          description: 'Transformation complete, preparing for flight',
          animation: 'animate-phoenix-rise',
          icon: <RotateCcw className="w-6 h-6 text-phoenix-gold animate-spin" />
        }
    }
  }

  render() {
    if (this.state.hasError) {
      const phaseConfig = this.getPhaseConfig()

      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      return (
        <div className="min-h-screen bg-ash-gradient flex items-center justify-center p-4">
          <PhoenixCard 
            variant={phaseConfig.variant}
            className={`max-w-md w-full ${phaseConfig.animation}`}
            phoenixEffect
          >
            <PhoenixCardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {phaseConfig.icon}
              </div>
              <PhoenixCardTitle className="text-xl">
                {phaseConfig.title}
              </PhoenixCardTitle>
              <p className="text-sm text-phoenix-charcoal/80 font-garamond">
                {phaseConfig.description}
              </p>
            </PhoenixCardHeader>

            <PhoenixCardContent className="space-y-4">
              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-glass-black p-3 rounded-phoenix">
                  <h4 className="text-xs font-futura font-bold text-wisdom-red mb-2">
                    Development Error Details:
                  </h4>
                  <code className="text-xs text-phoenix-charcoal font-mono break-all">
                    {this.state.error.message}
                  </code>
                </div>
              )}

              {/* Retry count badge */}
              <div className="flex justify-center">
                <PhoenixBadge variant="outline" size="sm">
                  Attempt {this.state.retryCount + 1}
                </PhoenixBadge>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-col sm:flex-row">
                <PhoenixButton
                  onClick={this.handleRetry}
                  variant="phoenix"
                  className="flex-1"
                  disabled={this.state.phoenixPhase !== 'ash'}
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Rise from Ashes
                </PhoenixButton>
                
                {this.state.retryCount > 2 && (
                  <PhoenixButton
                    onClick={this.handleForceReload}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reload
                  </PhoenixButton>
                )}
              </div>

              {/* Phoenix wisdom quote */}
              <div className="text-center pt-4 border-t border-phoenix-charcoal/20">
                <p className="text-xs text-phoenix-gold/80 font-garamond italic">
                  "From ashes, the Phoenix rises stronger than before"
                </p>
                <p className="text-xs text-phoenix-charcoal/60 mt-1">
                  {PHOENIX_SECURITY.COPYRIGHT}
                </p>
              </div>
            </PhoenixCardContent>
          </PhoenixCard>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for easy Phoenix error boundary wrapping
export function withPhoenixErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<PhoenixErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <PhoenixErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </PhoenixErrorBoundary>
  )
  
  WrappedComponent.displayName = `withPhoenixErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}