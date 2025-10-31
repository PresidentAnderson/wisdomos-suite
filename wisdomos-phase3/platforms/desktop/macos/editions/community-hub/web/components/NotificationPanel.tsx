'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Trophy, 
  Flame, 
  Target, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Zap,
  MoreVertical,
  Check,
  Trash2
} from 'lucide-react';
import { useNotifications, type Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPanel() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    isVisible,
    setIsVisible 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getIcon = (iconName?: string) => {
    const className = "w-4 h-4";
    switch (iconName) {
      case 'trophy': return <Trophy className={`${className} text-black`} />;
      case 'flame': return <Flame className={`${className} text-black`} />;
      case 'target': return <Target className={`${className} text-black`} />;
      case 'calendar': return <Calendar className={`${className} text-black`} />;
      case 'check': return <CheckCircle className={`${className} text-black`} />;
      case 'alert': return <AlertCircle className={`${className} text-black`} />;
      case 'zap': return <Zap className={`${className} text-black`} />;
      default: return <Info className={`${className} text-black`} />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'streak': return 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'reminder': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'insight': return 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'social': return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <>
      {/* Bell Icon with Badge */}
      <div className="relative">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-6 h-6 text-black dark:text-black" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-25"
              onClick={() => setIsVisible(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-black dark:text-black">
                    Notifications
                  </h3>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-white dark:bg-gray-600 text-black dark:text-black shadow-sm'
                        : 'text-black dark:text-black hover:text-black dark:hover:text-black'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'unread'
                        ? 'bg-white dark:bg-gray-600 text-black dark:text-black shadow-sm'
                        : 'text-black dark:text-black hover:text-black dark:hover:text-black'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-black dark:text-black hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-black dark:text-black hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-black dark:text-black mx-auto mb-3" />
                    <p className="text-black dark:text-black font-medium">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-black dark:text-black text-sm mt-1">
                      {filter === 'unread' 
                        ? 'All caught up! Check back later for updates.'
                        : 'We\'ll notify you when something important happens.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    <AnimatePresence>
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`
                            p-3 rounded-lg border transition-all cursor-pointer
                            ${getTypeColor(notification.type)}
                            ${!notification.read 
                              ? 'shadow-sm' 
                              : 'opacity-75 hover:opacity-100'
                            }
                            hover:shadow-md
                          `}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id);
                            }
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl;
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getIcon(notification.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-black dark:text-black">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                  >
                                    <X className="w-3 h-3 text-black" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-black dark:text-black mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-black dark:text-black">
                                  {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                </span>
                                {notification.actionUrl && notification.actionLabel && (
                                  <span className="text-xs text-black dark:text-black font-medium">
                                    {notification.actionLabel} →
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {filteredNotifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full text-center text-sm text-black dark:text-black hover:text-black dark:hover:text-black font-medium transition-colors">
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}