import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Database } from '@/types/database.types'

type Document = Database['public']['Tables']['documents']['Row']
type Activity = Database['public']['Tables']['activities']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']

interface AppState {
  // Documents
  documents: Document[]
  selectedDocument: Document | null
  
  // Activities
  activities: Activity[]
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  
  // UI State
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  currentPage: string
  
  // Loading states
  documentsLoading: boolean
  activitiesLoading: boolean
  notificationsLoading: boolean
  
  // Actions
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  setSelectedDocument: (document: Document | null) => void
  
  setActivities: (activities: Activity[]) => void
  addActivity: (activity: Activity) => void
  
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setCurrentPage: (page: string) => void
  
  setDocumentsLoading: (loading: boolean) => void
  setActivitiesLoading: (loading: boolean) => void
  setNotificationsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      documents: [],
      selectedDocument: null,
      activities: [],
      notifications: [],
      unreadCount: 0,
      sidebarOpen: true,
      theme: 'light',
      currentPage: 'dashboard',
      documentsLoading: false,
      activitiesLoading: false,
      notificationsLoading: false,
      
      // Document actions
      setDocuments: (documents) => set({ documents }),
      addDocument: (document) => 
        set((state) => ({ 
          documents: [document, ...state.documents] 
        })),
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map(doc => 
            doc.id === id ? { ...doc, ...updates } : doc
          )
        })),
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== id),
          selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument
        })),
      setSelectedDocument: (document) => set({ selectedDocument: document }),
      
      // Activity actions
      setActivities: (activities) => set({ activities }),
      addActivity: (activity) =>
        set((state) => ({
          activities: [activity, ...state.activities.slice(0, 49)] // Keep last 50
        })),
      
      // Notification actions
      setNotifications: (notifications) => 
        set({ 
          notifications,
          unreadCount: notifications.filter(n => !n.is_read).length
        }),
      addNotification: (notification) =>
        set((state) => {
          const newNotifications = [notification, ...state.notifications]
          return {
            notifications: newNotifications,
            unreadCount: newNotifications.filter(n => !n.is_read).length
          }
        }),
      markNotificationAsRead: (id) =>
        set((state) => {
          const updatedNotifications = state.notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
          )
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.is_read).length
          }
        }),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0
        })),
      
      // UI actions
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setTheme: (theme) => set({ theme }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      
      // Loading actions
      setDocumentsLoading: (documentsLoading) => set({ documentsLoading }),
      setActivitiesLoading: (activitiesLoading) => set({ activitiesLoading }),
      setNotificationsLoading: (notificationsLoading) => set({ notificationsLoading })
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)