'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Trophy, 
  Zap, 
  Target, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Flame
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  type: 'achievement' | 'streak' | 'reminder' | 'insight' | 'social' | 'system';
  title: string;
  message: string;
  icon?: 'trophy' | 'flame' | 'target' | 'calendar' | 'check' | 'alert' | 'info' | 'zap';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
  autoHide?: boolean;
  hideDelay?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-hide notifications if specified
    if (notification.autoHide !== false) {
      const delay = notification.hideDelay || 5000;
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, delay);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Real-time notifications from Supabase
  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time database changes
    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'boundary_audits',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          addNotification({
            type: 'achievement',
            title: 'New Boundary Audit Created!',
            message: 'Great job on creating a new boundary audit. Your wisdom journey continues!',
            icon: 'trophy',
            priority: 'medium',
            actionUrl: '/tools/boundary-audit',
            actionLabel: 'View Audit'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'boundary_audits',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if ((payload.new as any).status === 'completed') {
            addNotification({
              type: 'achievement',
              title: 'Boundary Audit Completed!',
              message: 'Congratulations on completing your boundary audit. You\'re building healthier boundaries!',
              icon: 'check',
              priority: 'high',
              actionUrl: '/analytics',
              actionLabel: 'View Progress'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const achievement = payload.new as any;
          addNotification({
            type: 'achievement',
            title: '🏆 New Achievement Unlocked!',
            message: `You earned: ${achievement.achievement_name}`,
            icon: 'trophy',
            priority: 'high',
            autoHide: false,
            actionUrl: '/achievements',
            actionLabel: 'View Achievements'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification]);

  // Streak reminders and insights
  useEffect(() => {
    if (!user) return;

    const checkStreak = () => {
      const now = new Date();
      const hour = now.getHours();

      // Evening streak reminder (8 PM)
      if (hour === 20) {
        addNotification({
          type: 'reminder',
          title: 'Keep Your Streak Alive! 🔥',
          message: 'Don\'t break your wisdom streak! Take a few minutes to reflect on your day.',
          icon: 'flame',
          priority: 'medium',
          actionUrl: '/tools/boundary-audit',
          actionLabel: 'Quick Entry'
        });
      }

      // Morning motivation (9 AM)
      if (hour === 9) {
        addNotification({
          type: 'insight',
          title: 'Good Morning, Wisdom Seeker!',
          message: 'Start your day with intention. What boundary will you strengthen today?',
          icon: 'target',
          priority: 'low',
          actionUrl: '/dashboard',
          actionLabel: 'View Dashboard'
        });
      }
    };

    // Check immediately and then every hour
    checkStreak();
    const interval = setInterval(checkStreak, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, addNotification]);

  // Achievement triggers
  useEffect(() => {
    if (!user) return;

    const checkAchievements = async () => {
      // This would typically check against user's actual data
      // For demo purposes, we'll simulate achievement triggers
      const welcomeShown = localStorage.getItem('welcome_shown');
      
      if (!welcomeShown) {
        setTimeout(() => {
          addNotification({
            type: 'system',
            title: 'Welcome to WisdomOS! 🎉',
            message: 'Your wisdom journey starts here. Explore the tools and start building better boundaries.',
            icon: 'info',
            priority: 'high',
            autoHide: false,
            actionUrl: '/dashboard',
            actionLabel: 'Get Started'
          });
          localStorage.setItem('welcome_shown', 'true');
        }, 2000);
      }
    };

    checkAchievements();
  }, [user, addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      isVisible,
      setIsVisible
    }}>
      {children}
      <NotificationToasts notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Toast notifications component
function NotificationToasts({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  // Only show recent, high-priority notifications as toasts
  const toastNotifications = notifications
    .filter(n => !n.read && (n.priority === 'high' || n.type === 'achievement'))
    .slice(0, 3);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="w-5 h-5 text-black" />;
      case 'flame': return <Flame className="w-5 h-5 text-black" />;
      case 'target': return <Target className="w-5 h-5 text-black" />;
      case 'calendar': return <Calendar className="w-5 h-5 text-black" />;
      case 'check': return <CheckCircle className="w-5 h-5 text-black" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-black" />;
      case 'zap': return <Zap className="w-5 h-5 text-black" />;
      default: return <Info className="w-5 h-5 text-black" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      default: return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-4">
      <AnimatePresence>
        {toastNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className={`
              max-w-sm p-4 rounded-lg border shadow-lg backdrop-blur-sm
              ${getPriorityColor(notification.priority)}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIcon(notification.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-black dark:text-black text-sm">
                  {notification.title}
                </h4>
                <p className="text-black dark:text-black text-sm mt-1">
                  {notification.message}
                </p>
                {notification.actionUrl && notification.actionLabel && (
                  <div className="mt-3">
                    <a
                      href={notification.actionUrl}
                      className="text-black dark:text-black hover:underline text-sm font-medium"
                    >
                      {notification.actionLabel}
                    </a>
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="text-black hover:text-black dark:hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}