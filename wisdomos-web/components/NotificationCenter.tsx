'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  icon: string
  actionUrl?: string
  read: boolean
  createdAt: Date
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
    connectToStream()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const connectToStream = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const eventSource = new EventSource(`/api/notifications/stream`, {
      headers: { 'Authorization': `Bearer ${token}` }
    } as any)

    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('Notification stream connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'notification') {
          // Add new notification to the list
          setNotifications(prev => [data.data, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(data.data.title, {
              body: data.data.message,
              icon: '/icon-192.png'
            })
          }
        }
      } catch (error) {
        console.error('Failed to parse notification:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      console.error('Notification stream disconnected')
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connectToStream()
        }
      }, 5000)
    }

    eventSourceRef.current = eventSource
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const token = localStorage.getItem('token')
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      })
      
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id])
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setIsOpen(false)
    }
  }

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestPermission()
  }, [])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-black hover:bg-white/10 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 ${
                    !notification.read ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{notification.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-black font-medium">{notification.title}</h4>
                          <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-cyan-400 rounded-full mt-2" />
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <button
                onClick={() => {
                  router.push('/notifications')
                  setIsOpen(false)
                }}
                className="w-full text-center text-cyan-400 hover:text-cyan-300 text-sm"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}