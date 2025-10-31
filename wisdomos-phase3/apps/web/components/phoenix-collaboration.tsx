/**
 * Phoenix Real-time Collaboration Component for WisdomOS
 * AXAI Innovations - Proprietary
 * 
 * Real-time collaboration features with Phoenix-themed UI
 */
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { PhoenixCard, PhoenixCardContent, PhoenixCardHeader, PhoenixCardTitle } from './ui/phoenix-card'
import { PhoenixBadge } from './ui/phoenix-badge'
import { subscribeToPhoenixCollaboration, getPhoenixSession } from '@/lib/supabase'
import { phoenixUtils } from '@/lib/utils'
import { Users, Flame, Zap, Eye } from 'lucide-react'

interface CollaborationEvent {
  id: string
  event_type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  user_id: string
  user_name?: string
  timestamp: Date
  data: any
}

interface ActiveUser {
  id: string
  name: string
  avatar?: string
  lastSeen: Date
  currentPage?: string
  phoenixPhase: 'ash' | 'ember' | 'transformation' | 'phoenix'
}

interface PhoenixCollaborationProps {
  organizationId: string
  currentUserId?: string
  className?: string
}

export default function PhoenixCollaboration({
  organizationId,
  currentUserId,
  className
}: PhoenixCollaborationProps) {
  const [events, setEvents] = useState<CollaborationEvent[]>([])
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Initialize Phoenix collaboration
  useEffect(() => {
    let subscription: any = null

    const initializeCollaboration = async () => {
      console.log('🔥 Phoenix: Initializing collaboration for organization:', organizationId)
      
      // Get current session
      const { session } = await getPhoenixSession()
      if (session?.user) {
        setCurrentUser(session.user)
      }

      // Set up real-time subscription
      subscription = subscribeToPhoenixCollaboration(
        organizationId,
        handleCollaborationEvent
      )

      setIsConnected(true)
    }

    initializeCollaboration()

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        console.log('🔥 Phoenix: Cleaning up collaboration subscription')
        subscription.unsubscribe()
      }
    }
  }, [organizationId])

  // Handle real-time collaboration events
  const handleCollaborationEvent = useCallback((payload: any) => {
    console.log('🔥 Phoenix Collaboration Event:', payload)
    
    const event: CollaborationEvent = {
      id: phoenixUtils.generatePhoenixId(),
      event_type: payload.eventType,
      table: payload.table,
      user_id: payload.new?.user_id || payload.old?.user_id || 'unknown',
      timestamp: new Date(),
      data: payload.new || payload.old
    }

    // Add event to history (keep only last 10)
    setEvents(prev => [event, ...prev.slice(0, 9)])

    // Update active users
    updateActiveUsers(event)
  }, [])

  // Update active users based on events
  const updateActiveUsers = (event: CollaborationEvent) => {
    if (event.user_id === currentUserId) return // Don't track self

    setActiveUsers(prev => {
      const existingIndex = prev.findIndex(user => user.id === event.user_id)
      const phoenixPhase = phoenixUtils.getPhoenixPhase(80, new Date()).phase as any

      const updatedUser: ActiveUser = {
        id: event.user_id,
        name: event.data?.name || `Phoenix User ${event.user_id.slice(-4)}`,
        lastSeen: new Date(),
        currentPage: event.table,
        phoenixPhase
      }

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = updatedUser
        return updated
      } else {
        return [updatedUser, ...prev.slice(0, 4)] // Keep only 5 active users
      }
    })
  }

  // Get event icon and color
  const getEventDisplay = (event: CollaborationEvent) => {
    const icons = {
      INSERT: <Zap className="w-3 h-3 text-wisdom-green" />,
      UPDATE: <Flame className="w-3 h-3 text-phoenix-orange" />,
      DELETE: <Eye className="w-3 h-3 text-wisdom-red" />
    }

    const colors = {
      INSERT: 'wisdom-green',
      UPDATE: 'phoenix-orange', 
      DELETE: 'wisdom-red'
    }

    return {
      icon: icons[event.event_type],
      color: colors[event.event_type]
    }
  }

  // Format table name for display
  const formatTableName = (table: string) => {
    const tableMap: Record<string, string> = {
      'life_areas': 'Life Areas',
      'contacts': 'Contacts',
      'journal_entries': 'Journal',
      'priority_items': 'Priorities',
      'upset_inquiries': 'Upset Inquiries'
    }
    return tableMap[table] || table
  }

  return (
    <div className={className}>
      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-wisdom-green animate-pulse-gold' : 'bg-wisdom-red'}`} />
        <span className="text-xs text-phoenix-charcoal font-futura">
          {isConnected ? '🔥 Phoenix Collaboration Active' : 'Connecting to Phoenix...'}
        </span>
      </div>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <PhoenixCard variant="default" className="mb-4">
          <PhoenixCardHeader>
            <PhoenixCardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Active Phoenix Users
            </PhoenixCardTitle>
          </PhoenixCardHeader>
          <PhoenixCardContent>
            <div className="space-y-2">
              {activeUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-md bg-glass-phoenix">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-phoenix-gradient flex items-center justify-center text-xs text-white font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-futura font-medium text-phoenix-gold">{user.name}</p>
                      <p className="text-xs text-phoenix-charcoal/70">
                        {user.currentPage && formatTableName(user.currentPage)}
                      </p>
                    </div>
                  </div>
                  <PhoenixBadge variant={user.phoenixPhase} size="sm">
                    {user.phoenixPhase}
                  </PhoenixBadge>
                </div>
              ))}
            </div>
          </PhoenixCardContent>
        </PhoenixCard>
      )}

      {/* Recent Activity */}
      {events.length > 0 && (
        <PhoenixCard variant="floating" phoenixEffect>
          <PhoenixCardHeader>
            <PhoenixCardTitle className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 animate-flame-flicker" />
              Phoenix Activity Stream
            </PhoenixCardTitle>
          </PhoenixCardHeader>
          <PhoenixCardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map(event => {
                const display = getEventDisplay(event)
                return (
                  <div key={event.id} className="flex items-center gap-2 p-2 rounded-md bg-glass-white hover:bg-glass-phoenix transition-colors">
                    {display.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-garamond text-phoenix-charcoal truncate">
                        <span className="font-medium">{event.event_type.toLowerCase()}</span> in{' '}
                        <span className="text-phoenix-gold">{formatTableName(event.table)}</span>
                      </p>
                      <p className="text-xs text-phoenix-charcoal/60">
                        {phoenixUtils.formatPhoenixTime(event.timestamp)}
                      </p>
                    </div>
                    <PhoenixBadge variant="outline" size="sm" className="text-xs">
                      {event.event_type}
                    </PhoenixBadge>
                  </div>
                )
              })}
            </div>
          </PhoenixCardContent>
        </PhoenixCard>
      )}

      {/* No Activity State */}
      {events.length === 0 && isConnected && (
        <PhoenixCard variant="ash" className="text-center py-8">
          <PhoenixCardContent>
            <Flame className="w-8 h-8 mx-auto mb-2 text-phoenix-charcoal/50" />
            <p className="text-sm text-phoenix-charcoal/70 font-garamond">
              Phoenix is listening for collaboration...
            </p>
            <p className="text-xs text-phoenix-charcoal/50 mt-1">
              Activity will appear here in real-time
            </p>
          </PhoenixCardContent>
        </PhoenixCard>
      )}
    </div>
  )
}