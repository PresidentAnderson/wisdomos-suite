import { supabase } from './supabase'
import { Database } from '@/types/database.types'
import { trackEvent } from './analytics'

type Tables = Database['public']['Tables']
type Document = Tables['documents']['Row']
type DocumentInsert = Tables['documents']['Insert']
type DocumentUpdate = Tables['documents']['Update']
type Activity = Tables['activities']['Row']
type ActivityInsert = Tables['activities']['Insert']
type Notification = Tables['notifications']['Row']
type NotificationInsert = Tables['notifications']['Insert']
type AnalyticsEvent = Tables['analytics_events']['Row']
type AnalyticsEventInsert = Tables['analytics_events']['Insert']
type Course = Tables['courses']['Row']
type CourseInsert = Tables['courses']['Insert']

// Document operations
export const documentService = {
  // Get all documents for a user
  async getAllByUser(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      throw error
    }

    return data || []
  },

  // Get documents by type
  async getByType(userId: string, type: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents by type:', error)
      throw error
    }

    return data || []
  },

  // Get single document
  async getById(id: string, userId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching document:', error)
      return null
    }

    return data
  },

  // Create new document
  async create(document: DocumentInsert): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single()

    if (error) {
      console.error('Error creating document:', error)
      throw error
    }

    // Track document creation
    if (data) {
      trackEvent('document_created', {
        document_id: data.id,
        document_type: data.type,
        user_id: data.user_id
      }, data.user_id)

      // Create activity record
      await activityService.create({
        user_id: data.user_id,
        type: 'document_created',
        title: `Created ${data.type.replace('_', ' ')}`,
        description: data.title,
        metadata: {
          document_id: data.id,
          document_type: data.type
        }
      })
    }

    return data
  },

  // Update document
  async update(id: string, updates: DocumentUpdate, userId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        version: supabase.sql`version + 1`
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating document:', error)
      throw error
    }

    // Track document update
    if (data) {
      trackEvent('document_updated', {
        document_id: data.id,
        document_type: data.type,
        user_id: data.user_id
      }, data.user_id)

      // Create activity record
      await activityService.create({
        user_id: data.user_id,
        type: 'document_updated',
        title: `Updated ${data.type.replace('_', ' ')}`,
        description: data.title,
        metadata: {
          document_id: data.id,
          document_type: data.type
        }
      })
    }

    return data
  },

  // Delete document
  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting document:', error)
      throw error
    }

    trackEvent('document_deleted', {
      document_id: id,
      user_id: userId
    }, userId)

    return true
  },

  // Get public documents
  async getPublic(limit: number = 10): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        profiles:user_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching public documents:', error)
      throw error
    }

    return data || []
  },

  // Search documents
  async search(userId: string, query: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error searching documents:', error)
      throw error
    }

    return data || []
  }
}

// Activity operations
export const activityService = {
  // Get activities for user
  async getByUser(userId: string, limit: number = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching activities:', error)
      throw error
    }

    return data || []
  },

  // Create activity
  async create(activity: ActivityInsert): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return null
    }

    return data
  },

  // Get public activities
  async getPublic(limit: number = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching public activities:', error)
      throw error
    }

    return data || []
  }
}

// Notification operations
export const notificationService = {
  // Get notifications for user
  async getByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }

    return data || []
  },

  // Create notification
  async create(notification: NotificationInsert): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return data
  },

  // Mark as read
  async markAsRead(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  },

  // Mark all as read
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  },

  // Delete notification
  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting notification:', error)
      return false
    }

    return true
  }
}

// Analytics operations
export const analyticsService = {
  // Create analytics event
  async createEvent(event: AnalyticsEventInsert): Promise<boolean> {
    const { error } = await supabase
      .from('analytics_events')
      .insert([event])

    if (error) {
      console.error('Error creating analytics event:', error)
      return false
    }

    return true
  },

  // Get user analytics
  async getUserEvents(userId: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user analytics:', error)
      throw error
    }

    return data || []
  },

  // Get analytics summary
  async getSummary(userId: string, days: number = 30): Promise<any> {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_name, created_at')
      .eq('user_id', userId)
      .gte('created_at', fromDate.toISOString())

    if (error) {
      console.error('Error fetching analytics summary:', error)
      throw error
    }

    // Process the data to create summary
    const summary = {
      totalEvents: data?.length || 0,
      eventsByType: {},
      eventsByDay: {}
    }

    data?.forEach(event => {
      const eventType = event.event_name
      const day = new Date(event.created_at).toDateString()

      summary.eventsByType[eventType] = (summary.eventsByType[eventType] || 0) + 1
      summary.eventsByDay[day] = (summary.eventsByDay[day] || 0) + 1
    })

    return summary
  }
}

// Course operations
export const courseService = {
  // Get all published courses
  async getPublished(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:author_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      throw error
    }

    return data || []
  },

  // Get course by ID
  async getById(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:author_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching course:', error)
      return null
    }

    return data
  },

  // Create course (admin only)
  async create(course: CourseInsert): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      throw error
    }

    return data
  },

  // Update course (admin only)
  async update(id: string, updates: Partial<Course>): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating course:', error)
      throw error
    }

    return data
  },

  // Delete course (admin only)
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting course:', error)
      return false
    }

    return true
  }
}

// Profile operations
export const profileService = {
  // Update profile stats
  async updateStats(userId: string, stats: any): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        stats,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile stats:', error)
      return false
    }

    return true
  },

  // Get user profile
  async getProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      throw error
    }

    return data
  }
}

// Utility functions for data export/import
export const dataService = {
  // Export all user data
  async exportUserData(userId: string): Promise<any> {
    const [documents, activities, notifications] = await Promise.all([
      documentService.getAllByUser(userId),
      activityService.getByUser(userId),
      notificationService.getByUser(userId)
    ])

    return {
      documents,
      activities,
      notifications,
      exportDate: new Date().toISOString(),
      userId
    }
  },

  // Import user data
  async importUserData(userId: string, data: any): Promise<boolean> {
    try {
      // Import documents
      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          await documentService.create({
            ...doc,
            user_id: userId,
            id: undefined // Let Supabase generate new IDs
          })
        }
      }

      // Import activities
      if (data.activities && data.activities.length > 0) {
        for (const activity of data.activities) {
          await activityService.create({
            ...activity,
            user_id: userId,
            id: undefined // Let Supabase generate new IDs
          })
        }
      }

      return true
    } catch (error) {
      console.error('Error importing user data:', error)
      return false
    }
  }
}