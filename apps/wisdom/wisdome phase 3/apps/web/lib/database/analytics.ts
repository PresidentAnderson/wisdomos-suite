import { supabase, handleSupabaseError } from '../supabase'
import { AnalyticsData, TablesInsert } from '@/types/database'

export class AnalyticsService {
  
  async trackEvent(data: TablesInsert<'analytics_data'>): Promise<{ data: AnalyticsData | null; error: string | null }> {
    try {
      const { data: result, error } = await supabase
        .from('analytics_data')
        .insert(data)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data: result, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAnalyticsData(
    organizationId: string,
    userId?: string,
    options: {
      dataTypes?: string[]
      startDate?: string
      endDate?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<{ data: AnalyticsData[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('analytics_data')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (options.dataTypes && options.dataTypes.length > 0) {
        query = query.in('data_type', options.dataTypes)
      }

      if (options.startDate) {
        query = query.gte('timestamp', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('timestamp', options.endDate)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 100) - 1)
      }

      const { data, error } = await query.order('timestamp', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAnalyticsDataByType(
    organizationId: string,
    dataType: string,
    userId?: string,
    timeRange: {
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<{ data: AnalyticsData[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('analytics_data')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('data_type', dataType)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (timeRange.startDate) {
        query = query.gte('timestamp', timeRange.startDate)
      }

      if (timeRange.endDate) {
        query = query.lte('timestamp', timeRange.endDate)
      }

      const { data, error } = await query.order('timestamp', { ascending: true })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async aggregateDataByType(
    organizationId: string,
    dataType: string,
    aggregationType: 'sum' | 'avg' | 'count' | 'min' | 'max',
    groupBy: 'day' | 'week' | 'month' | 'year',
    userId?: string,
    timeRange: {
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<{ 
    data: Array<{ 
      period: string
      value: number
      count: number 
    }> | null
    error: string | null 
  }> {
    try {
      // Get raw data first
      const { data: analyticsData, error } = await this.getAnalyticsDataByType(
        organizationId, 
        dataType, 
        userId, 
        timeRange
      )

      if (error) return { data: null, error }

      if (!analyticsData || analyticsData.length === 0) {
        return { data: [], error: null }
      }

      // Group data by the specified period
      const grouped = analyticsData.reduce((acc, record) => {
        const timestamp = new Date(record.timestamp)
        let periodKey: string

        switch (groupBy) {
          case 'day':
            periodKey = timestamp.toISOString().split('T')[0] // YYYY-MM-DD
            break
          case 'week':
            const startOfWeek = new Date(timestamp)
            startOfWeek.setDate(timestamp.getDate() - timestamp.getDay())
            periodKey = startOfWeek.toISOString().split('T')[0]
            break
          case 'month':
            periodKey = timestamp.toISOString().substring(0, 7) // YYYY-MM
            break
          case 'year':
            periodKey = timestamp.getFullYear().toString()
            break
          default:
            periodKey = timestamp.toISOString().split('T')[0]
        }

        if (!acc[periodKey]) {
          acc[periodKey] = { values: [], count: 0 }
        }

        // Extract numeric value from data_value
        let numericValue = 0
        if (typeof record.data_value === 'number') {
          numericValue = record.data_value
        } else if (typeof record.data_value === 'object' && record.data_value !== null) {
          // Try to extract a numeric value from the object
          const obj = record.data_value as any
          if (obj.value !== undefined) numericValue = Number(obj.value) || 0
          else if (obj.count !== undefined) numericValue = Number(obj.count) || 0
          else if (obj.score !== undefined) numericValue = Number(obj.score) || 0
          else numericValue = 1 // Default to 1 for counting
        } else {
          numericValue = 1 // Default to 1 for counting
        }

        acc[periodKey].values.push(numericValue)
        acc[periodKey].count++

        return acc
      }, {} as Record<string, { values: number[]; count: number }>)

      // Calculate aggregated values
      const result = Object.entries(grouped).map(([period, data]: [string, { values: number[]; count: number }]) => {
        let value: number

        switch (aggregationType) {
          case 'sum':
            value = data.values.reduce((sum, val) => sum + val, 0)
            break
          case 'avg':
            value = data.values.reduce((sum, val) => sum + val, 0) / data.values.length
            break
          case 'count':
            value = data.count
            break
          case 'min':
            value = Math.min(...data.values)
            break
          case 'max':
            value = Math.max(...data.values)
            break
          default:
            value = data.count
        }

        return {
          period,
          value: Math.round(value * 100) / 100, // Round to 2 decimal places
          count: data.count
        }
      }).sort((a, b) => a.period.localeCompare(b.period))

      return { data: result, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getDashboardMetrics(organizationId: string, userId?: string): Promise<{
    data: {
      totalEvents: number
      eventsToday: number
      eventsThisWeek: number
      eventsThisMonth: number
      topEventTypes: Array<{ type: string; count: number }>
      userActivity: Array<{ date: string; eventCount: number }>
      recentActivity: AnalyticsData[]
    } | null
    error: string | null
  }> {
    try {
      // Get all analytics data for the organization/user
      let query = supabase
        .from('analytics_data')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: allData, error } = await query.order('timestamp', { ascending: false })

      if (error) return handleSupabaseError(error)

      if (!allData || allData.length === 0) {
        return {
          data: {
            totalEvents: 0,
            eventsToday: 0,
            eventsThisWeek: 0,
            eventsThisMonth: 0,
            topEventTypes: [],
            userActivity: [],
            recentActivity: []
          },
          error: null
        }
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(today)
      thisWeek.setDate(today.getDate() - today.getDay()) // Start of week
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const eventsToday = allData.filter(event => 
        new Date(event.timestamp) >= today
      ).length

      const eventsThisWeek = allData.filter(event => 
        new Date(event.timestamp) >= thisWeek
      ).length

      const eventsThisMonth = allData.filter(event => 
        new Date(event.timestamp) >= thisMonth
      ).length

      // Top event types
      const eventTypeCounts = allData.reduce((acc, event) => {
        acc[event.data_type] = (acc[event.data_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topEventTypes = Object.entries(eventTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // User activity (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const userActivity: Array<{ date: string; eventCount: number }> = []
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        const eventCount = allData.filter(event => 
          event.timestamp.startsWith(dateStr)
        ).length

        userActivity.push({ date: dateStr, eventCount })
      }

      // Recent activity (last 20 events)
      const recentActivity = allData.slice(0, 20)

      return {
        data: {
          totalEvents: allData.length,
          eventsToday,
          eventsThisWeek,
          eventsThisMonth,
          topEventTypes,
          userActivity,
          recentActivity
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async trackFulfillmentScore(
    organizationId: string,
    userId: string,
    lifeAreaId: string,
    score: number,
    metadata: any = {}
  ): Promise<{ data: AnalyticsData | null; error: string | null }> {
    return this.trackEvent({
      organization_id: organizationId,
      user_id: userId,
      data_type: 'fulfillment_score',
      data_value: { score, lifeAreaId },
      metadata: { ...metadata, lifeAreaId }
    })
  }

  async trackUserAction(
    organizationId: string,
    userId: string,
    action: string,
    details: any = {},
    metadata: any = {}
  ): Promise<{ data: AnalyticsData | null; error: string | null }> {
    return this.trackEvent({
      organization_id: organizationId,
      user_id: userId,
      data_type: 'user_action',
      data_value: { action, ...details },
      metadata
    })
  }

  async trackFeatureUsage(
    organizationId: string,
    userId: string,
    feature: string,
    duration?: number,
    metadata: any = {}
  ): Promise<{ data: AnalyticsData | null; error: string | null }> {
    return this.trackEvent({
      organization_id: organizationId,
      user_id: userId,
      data_type: 'feature_usage',
      data_value: { feature, duration },
      metadata: { ...metadata, feature }
    })
  }

  async trackGoalProgress(
    organizationId: string,
    userId: string,
    goalId: string,
    progress: number,
    metadata: any = {}
  ): Promise<{ data: AnalyticsData | null; error: string | null }> {
    return this.trackEvent({
      organization_id: organizationId,
      user_id: userId,
      data_type: 'goal_progress',
      data_value: { goalId, progress },
      metadata: { ...metadata, goalId }
    })
  }

  async deleteOldAnalytics(olderThanDays: number = 365): Promise<{ error: string | null }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const { error } = await supabase
        .from('analytics_data')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getUniqueDataTypes(organizationId: string, userId?: string): Promise<{ data: string[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('analytics_data')
        .select('data_type')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) return handleSupabaseError(error)

      const uniqueTypes = [...new Set(data?.map(item => item.data_type))].sort()

      return { data: uniqueTypes, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const analyticsService = new AnalyticsService()