import { supabase, handleSupabaseError } from '../supabase'
import { PriorityItem, TablesInsert, TablesUpdate } from '@/types/database'

export class PriorityItemService {
  
  async createPriorityItem(item: TablesInsert<'priority_items'>): Promise<{ data: PriorityItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('priority_items')
        .insert(item)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getPriorityItems(
    organizationId: string, 
    userId?: string,
    options: {
      limit?: number
      offset?: number
      quadrant?: 1 | 2 | 3 | 4
      status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      dueDate?: string
    } = {}
  ): Promise<{ data: PriorityItem[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('priority_items')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (options.quadrant) {
        query = query.eq('quadrant', options.quadrant)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.dueDate) {
        query = query.lte('due_date', options.dueDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getPriorityItemById(itemId: string): Promise<{ data: PriorityItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('priority_items')
        .select('*')
        .eq('id', itemId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updatePriorityItem(itemId: string, updates: TablesUpdate<'priority_items'>): Promise<{ data: PriorityItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('priority_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deletePriorityItem(itemId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('priority_items')
        .delete()
        .eq('id', itemId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateItemStatus(itemId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<{ data: PriorityItem | null; error: string | null }> {
    try {
      const updates: TablesUpdate<'priority_items'> = { status }
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('priority_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateItemQuadrant(itemId: string, importance: number, urgency: number): Promise<{ data: PriorityItem | null; error: string | null }> {
    try {
      // Calculate quadrant based on importance and urgency
      let quadrant: 1 | 2 | 3 | 4
      
      if (importance > 5 && urgency > 5) {
        quadrant = 1 // Important & Urgent
      } else if (importance > 5 && urgency <= 5) {
        quadrant = 2 // Important & Not Urgent
      } else if (importance <= 5 && urgency > 5) {
        quadrant = 3 // Not Important & Urgent
      } else {
        quadrant = 4 // Not Important & Not Urgent
      }

      const { data, error } = await supabase
        .from('priority_items')
        .update({ importance, urgency, quadrant })
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getPriorityMatrix(organizationId: string, userId?: string): Promise<{ 
    data: {
      quadrant1: PriorityItem[] // Important & Urgent
      quadrant2: PriorityItem[] // Important & Not Urgent
      quadrant3: PriorityItem[] // Not Important & Urgent
      quadrant4: PriorityItem[] // Not Important & Not Urgent
    } | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('priority_items')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('status', 'completed')
        .neq('status', 'cancelled')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: items, error } = await query.order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)

      const matrix = {
        quadrant1: items?.filter(item => item.quadrant === 1) || [],
        quadrant2: items?.filter(item => item.quadrant === 2) || [],
        quadrant3: items?.filter(item => item.quadrant === 3) || [],
        quadrant4: items?.filter(item => item.quadrant === 4) || []
      }

      return { data: matrix, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getOverdueItems(organizationId: string, userId?: string): Promise<{ data: PriorityItem[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('priority_items')
        .select('*')
        .eq('organization_id', organizationId)
        .lt('due_date', new Date().toISOString())
        .neq('status', 'completed')
        .neq('status', 'cancelled')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('due_date', { ascending: true })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getUpcomingItems(organizationId: string, userId?: string, days: number = 7): Promise<{ data: PriorityItem[] | null; error: string | null }> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      let query = supabase
        .from('priority_items')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('due_date', new Date().toISOString())
        .lte('due_date', futureDate.toISOString())
        .neq('status', 'completed')
        .neq('status', 'cancelled')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('due_date', { ascending: true })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getPriorityAnalytics(organizationId: string, userId?: string): Promise<{ 
    data: {
      totalItems: number
      itemsCompleted: number
      itemsOverdue: number
      itemsUpcoming: number
      completionRate: number
      quadrantDistribution: Record<string, number>
      averageCompletionTime: number
      productivityTrends: Array<{ date: string; completed: number; created: number }>
    } | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('priority_items')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: items, error } = await query

      if (error) return handleSupabaseError(error)

      if (!items || items.length === 0) {
        return {
          data: {
            totalItems: 0,
            itemsCompleted: 0,
            itemsOverdue: 0,
            itemsUpcoming: 0,
            completionRate: 0,
            quadrantDistribution: {},
            averageCompletionTime: 0,
            productivityTrends: []
          },
          error: null
        }
      }

      const now = new Date()
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

      const itemsCompleted = items.filter(item => item.status === 'completed').length
      const itemsOverdue = items.filter(item => 
        item.due_date && 
        new Date(item.due_date) < now && 
        !['completed', 'cancelled'].includes(item.status)
      ).length
      const itemsUpcoming = items.filter(item => 
        item.due_date && 
        new Date(item.due_date) >= now && 
        new Date(item.due_date) <= sevenDaysFromNow &&
        !['completed', 'cancelled'].includes(item.status)
      ).length

      const completionRate = items.length > 0 ? (itemsCompleted / items.length) * 100 : 0

      // Quadrant distribution
      const quadrantDistribution = items.reduce((acc, item) => {
        acc[`quadrant${item.quadrant}`] = (acc[`quadrant${item.quadrant}`] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Average completion time
      const completedItems = items.filter(item => item.status === 'completed' && item.completed_at)
      const avgCompletionTime = completedItems.length > 0 
        ? completedItems.reduce((sum, item) => {
            const created = new Date(item.created_at)
            const completed = new Date(item.completed_at!)
            return sum + (completed.getTime() - created.getTime())
          }, 0) / completedItems.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0

      // Productivity trends (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const productivityTrends: Array<{ date: string; completed: number; created: number }> = []
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        const completed = items.filter(item => 
          item.completed_at && 
          item.completed_at.startsWith(dateStr)
        ).length

        const created = items.filter(item => 
          item.created_at.startsWith(dateStr)
        ).length

        productivityTrends.push({ date: dateStr, completed, created })
      }

      return {
        data: {
          totalItems: items.length,
          itemsCompleted,
          itemsOverdue,
          itemsUpcoming,
          completionRate,
          quadrantDistribution,
          averageCompletionTime: avgCompletionTime,
          productivityTrends
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async bulkUpdatePriorities(updates: Array<{ id: string; importance: number; urgency: number }>): Promise<{ error: string | null }> {
    try {
      const promises = updates.map(({ id, importance, urgency }) => {
        // Calculate quadrant
        let quadrant: 1 | 2 | 3 | 4
        
        if (importance > 5 && urgency > 5) {
          quadrant = 1
        } else if (importance > 5 && urgency <= 5) {
          quadrant = 2
        } else if (importance <= 5 && urgency > 5) {
          quadrant = 3
        } else {
          quadrant = 4
        }

        return supabase
          .from('priority_items')
          .update({ importance, urgency, quadrant })
          .eq('id', id)
      })

      const results = await Promise.allSettled(promises)
      const failed = results.filter(result => result.status === 'rejected')
      
      if (failed.length > 0) {
        return { error: `Failed to update ${failed.length} priority items` }
      }

      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const priorityItemService = new PriorityItemService()