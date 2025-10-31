'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Bell, CheckCircle, AlertCircle, Info, Heart, MessageCircle, Calendar, Settings, Archive, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'social' | 'system'
  title: string
  message: string
  created_at: string
  read: boolean
  action_url?: string
  action_text?: string
  metadata?: {
    from_user?: string
    course_id?: string
    event_id?: string
    post_id?: string
  }
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'social',
    title: 'New comment on your post',
    message: 'Sarah Chen commented on your post about mindful leadership practices.',
    created_at: '2025-01-20T15:30:00Z',
    read: false,
    action_url: '/dashboard/community',
    action_text: 'View Comment',
    metadata: {
      from_user: 'Sarah Chen',
      post_id: 'post-123'
    }
  },
  {
    id: '2',
    type: 'success',
    title: 'Course completed!',
    message: 'Congratulations! You\'ve successfully completed "Personal Growth Through Self-Reflection".',
    created_at: '2025-01-20T14:15:00Z',
    read: false,
    action_url: '/dashboard/courses',
    action_text: 'View Certificate',
    metadata: {
      course_id: 'course-456'
    }
  },
  {
    id: '3',
    type: 'info',
    title: 'Upcoming event reminder',
    message: 'Don\'t forget about the "Mindful Leadership Workshop" starting in 2 hours.',
    created_at: '2025-01-20T12:00:00Z',
    read: true,
    action_url: '/dashboard/community',
    action_text: 'Join Event',
    metadata: {
      event_id: 'event-789'
    }
  },
  {
    id: '4',
    type: 'social',
    title: 'New follower',
    message: 'Michael Rodriguez started following you.',
    created_at: '2025-01-19T18:45:00Z',
    read: true,
    action_url: '/dashboard/community',
    action_text: 'View Profile',
    metadata: {
      from_user: 'Michael Rodriguez'
    }
  },
  {
    id: '5',
    type: 'warning',
    title: 'Boundary audit alert',
    message: 'Your screen time has exceeded the recommended limit for 3 consecutive days.',
    created_at: '2025-01-19T16:20:00Z',
    read: false,
    action_url: '/dashboard/boundary-audit',
    action_text: 'Review Boundaries'
  },
  {
    id: '6',
    type: 'system',
    title: 'Weekly reflection reminder',
    message: 'It\'s time for your weekly reflection. Take a moment to review your progress.',
    created_at: '2025-01-19T09:00:00Z',
    read: true,
    action_url: '/dashboard/documents',
    action_text: 'Start Reflection'
  },
  {
    id: '7',
    type: 'social',
    title: 'Post liked',
    message: 'Your achievement post received 25 likes from the community.',
    created_at: '2025-01-18T20:30:00Z',
    read: true,
    action_url: '/dashboard/community',
    action_text: 'View Post',
    metadata: {
      post_id: 'post-456'
    }
  },
  {
    id: '8',
    type: 'error',
    title: 'Sync failed',
    message: 'Unable to sync your latest document changes. Please check your connection.',
    created_at: '2025-01-18T14:10:00Z',
    read: false,
    action_url: '/dashboard/documents',
    action_text: 'Retry Sync'
  }
]

const NOTIFICATION_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
  social: Heart,
  system: Bell
}

const NOTIFICATION_COLORS = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  social: 'bg-pink-100 text-pink-600',
  system: 'bg-gray-100 text-gray-600'
}

const NOTIFICATION_BG_COLORS = {
  info: 'bg-blue-50',
  success: 'bg-green-50',
  warning: 'bg-yellow-50',
  error: 'bg-red-50',
  social: 'bg-pink-50',
  system: 'bg-gray-50'
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  const handleMarkAsRead = (notificationId: string) => {
    trackEvent('notification_marked_read', { 
      user_id: user?.id, 
      notification_id: notificationId 
    })
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  const handleMarkAllAsRead = () => {
    trackEvent('notifications_marked_all_read', { user_id: user?.id })
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const handleDeleteNotification = (notificationId: string) => {
    trackEvent('notification_deleted', { 
      user_id: user?.id, 
      notification_id: notificationId 
    })
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    )
  }

  const handleBulkAction = (action: 'read' | 'delete') => {
    if (action === 'read') {
      setNotifications(prev => 
        prev.map(notif => 
          selectedNotifications.includes(notif.id)
            ? { ...notif, read: true }
            : notif
        )
      )
    } else if (action === 'delete') {
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.includes(notif.id))
      )
    }
    setSelectedNotifications([])
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'unread') return !notification.read
    if (selectedFilter === 'read') return notification.read
    return notification.type === selectedFilter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const formatDate = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <DashboardLayout 
      title="Notifications" 
      description={`Stay updated with your latest activities and alerts ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length - unreadCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Social</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.type === 'social').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            {/* Filter Tabs */}
            <div className="flex border border-gray-200 rounded-lg">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'social', label: 'Social' },
                { key: 'system', label: 'System' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    selectedFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('read')}
                >
                  Mark as Read
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Select All Checkbox */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedNotifications.length === filteredNotifications.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Select all</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-600">
                {selectedFilter === 'unread' 
                  ? 'You\'re all caught up! Check back later for new updates.'
                  : 'When you have new activity, notifications will appear here.'}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = NOTIFICATION_ICONS[notification.type]
              
              return (
                <Card 
                  key={notification.id} 
                  className={`p-4 hover:shadow-md transition-shadow ${
                    !notification.read ? NOTIFICATION_BG_COLORS[notification.type] : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className={`p-2 rounded-lg flex-shrink-0 ${NOTIFICATION_COLORS[notification.type]}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            {notification.metadata?.from_user && (
                              <span className="text-xs text-gray-500">
                                from {notification.metadata.from_user}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {notification.action_url && (
                          <Button size="sm" variant="outline">
                            {notification.action_text || 'View'}
                          </Button>
                        )}
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}