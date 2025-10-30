'use client'

import { useEffect, useState, useCallback } from 'react'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/app'
import { Database } from '@/types/database.types'
import { trackEvent } from '@/lib/analytics'
// Toast temporarily disabled
const toast = { error: (msg: string) => console.error(msg), success: (msg: string) => console.log(msg) }

type Tables = Database['public']['Tables']
type Document = Tables['documents']['Row']
type Activity = Tables['activities']['Row']
type Notification = Tables['notifications']['Row']

export function useRealtimeDocuments() {
  const { user } = useAuth()
  const { addDocument, updateDocument, deleteDocument } = useAppStore()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user) return

    const documentsChannel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Document>) => {
          if (payload.new) {
            addDocument(payload.new as Document)
            toast.success('New document created!')
            trackEvent('realtime_document_created', { document_id: payload.new.id })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Document>) => {
          if (payload.new) {
            updateDocument(payload.new.id, payload.new)
            toast.success('Document updated!')
            trackEvent('realtime_document_updated', { document_id: payload.new.id })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Document>) => {
          if (payload.old) {
            deleteDocument(payload.old.id)
            toast.success('Document deleted!')
            trackEvent('realtime_document_deleted', { document_id: payload.old.id })
          }
        }
      )
      .subscribe((status) => {
        console.log('Documents realtime status:', status)
        if (status === 'SUBSCRIBED') {
          trackEvent('realtime_documents_subscribed')
        }
      })

    setChannel(documentsChannel)

    return () => {
      documentsChannel.unsubscribe()
    }
  }, [user, addDocument, updateDocument, deleteDocument])

  return { isConnected: channel?.state === 'joined' }
}

export function useRealtimeActivities() {
  const { user } = useAuth()
  const { addActivity } = useAppStore()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user) return

    const activitiesChannel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Activity>) => {
          if (payload.new) {
            addActivity(payload.new as Activity)
            trackEvent('realtime_activity_created', { activity_id: payload.new.id })
          }
        }
      )
      .subscribe((status) => {
        console.log('Activities realtime status:', status)
        if (status === 'SUBSCRIBED') {
          trackEvent('realtime_activities_subscribed')
        }
      })

    setChannel(activitiesChannel)

    return () => {
      activitiesChannel.unsubscribe()
    }
  }, [user, addActivity])

  return { isConnected: channel?.state === 'joined' }
}

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const { addNotification, markNotificationAsRead } = useAppStore()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const showNotificationToast = useCallback((notification: Notification) => {
    const toastOptions = {
      duration: 5000,
      onClick: notification.action_url ? () => {
        window.location.href = notification.action_url!
      } : undefined
    }

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions)
        break
      case 'warning':
        toast(notification.message, { ...toastOptions, icon: '⚠️' })
        break
      case 'error':
        toast.error(notification.message, toastOptions)
        break
      default:
        toast(notification.message, toastOptions)
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.type === 'error',
        actions: notification.action_url ? [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ] : undefined
      })
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          if (payload.new) {
            const notification = payload.new as Notification
            addNotification(notification)
            showNotificationToast(notification)
            trackEvent('realtime_notification_received', { 
              notification_id: notification.id,
              notification_type: notification.type 
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          if (payload.new && payload.new.is_read) {
            markNotificationAsRead(payload.new.id)
          }
        }
      )
      .subscribe((status) => {
        console.log('Notifications realtime status:', status)
        if (status === 'SUBSCRIBED') {
          trackEvent('realtime_notifications_subscribed')
        }
      })

    setChannel(notificationsChannel)

    return () => {
      notificationsChannel.unsubscribe()
    }
  }, [user, addNotification, markNotificationAsRead, showNotificationToast])

  return { isConnected: channel?.state === 'joined' }
}

export function useRealtimePresence(channelName: string = 'general') {
  const { user, profile } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!user || !profile) return

    const presenceChannel = supabase
      .channel(`presence-${channelName}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState()
        const users = Object.keys(newState).map(key => ({
          userId: key,
          ...newState[key][0]
        }))
        setOnlineUsers(users)
        trackEvent('realtime_presence_synced', { 
          channel: channelName,
          online_users: users.length 
        })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
        trackEvent('realtime_user_joined', { 
          channel: channelName,
          user_id: key 
        })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
        trackEvent('realtime_user_left', { 
          channel: channelName,
          user_id: key 
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            online_at: new Date().toISOString()
          })
          trackEvent('realtime_presence_subscribed', { channel: channelName })
        }
      })

    setChannel(presenceChannel)

    return () => {
      presenceChannel.unsubscribe()
    }
  }, [user, profile, channelName])

  return { onlineUsers, isConnected: channel?.state === 'joined' }
}

// Hook for collaborative document editing
export function useRealtimeCollaboration(documentId: string) {
  const { user } = useAuth()
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const broadcastChange = useCallback((change: any) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'document-change',
        payload: {
          documentId,
          userId: user?.id,
          change,
          timestamp: Date.now()
        }
      })
    }
  }, [channel, documentId, user?.id])

  const broadcastCursor = useCallback((cursor: any) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'cursor-change',
        payload: {
          documentId,
          userId: user?.id,
          cursor,
          timestamp: Date.now()
        }
      })
    }
  }, [channel, documentId, user?.id])

  useEffect(() => {
    if (!user || !documentId) return

    const collaborationChannel = supabase
      .channel(`document-${documentId}`)
      .on('broadcast', { event: 'document-change' }, (payload) => {
        if (payload.payload.userId !== user.id) {
          // Handle incoming document changes
          console.log('Document change from:', payload.payload.userId, payload.payload.change)
          trackEvent('realtime_document_change_received', { 
            document_id: documentId,
            from_user: payload.payload.userId 
          })
        }
      })
      .on('broadcast', { event: 'cursor-change' }, (payload) => {
        if (payload.payload.userId !== user.id) {
          // Handle incoming cursor changes
          console.log('Cursor change from:', payload.payload.userId, payload.payload.cursor)
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = collaborationChannel.presenceState()
        const users = Object.keys(newState).map(key => ({
          userId: key,
          ...newState[key][0]
        }))
        setCollaborators(users.filter(u => u.userId !== user.id))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await collaborationChannel.track({
            user_id: user.id,
            document_id: documentId,
            editing: true,
            last_seen: new Date().toISOString()
          })
          trackEvent('realtime_collaboration_joined', { document_id: documentId })
        }
      })

    setChannel(collaborationChannel)

    return () => {
      collaborationChannel.unsubscribe()
    }
  }, [user, documentId])

  return {
    collaborators,
    broadcastChange,
    broadcastCursor,
    isConnected: channel?.state === 'joined'
  }
}

// Hook to manage all realtime connections
export function useRealtimeManager() {
  const documentsConnection = useRealtimeDocuments()
  const activitiesConnection = useRealtimeActivities()
  const notificationsConnection = useRealtimeNotifications()
  const presenceConnection = useRealtimePresence()

  const isConnected = documentsConnection.isConnected && 
                     activitiesConnection.isConnected && 
                     notificationsConnection.isConnected &&
                     presenceConnection.isConnected

  const onlineUsers = presenceConnection.onlineUsers

  useEffect(() => {
    if (isConnected) {
      trackEvent('realtime_fully_connected')
    }
  }, [isConnected])

  return {
    isConnected,
    onlineUsers,
    connections: {
      documents: documentsConnection.isConnected,
      activities: activitiesConnection.isConnected,
      notifications: notificationsConnection.isConnected,
      presence: presenceConnection.isConnected
    }
  }
}