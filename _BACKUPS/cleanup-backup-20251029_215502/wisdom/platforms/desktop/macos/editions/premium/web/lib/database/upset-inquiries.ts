import { supabase, handleSupabaseError } from '../supabase'
import { UpsetInquiry, TablesInsert, TablesUpdate } from '@/types/database'

export class UpsetInquiryService {
  
  async createUpsetInquiry(inquiry: TablesInsert<'upset_inquiries'>): Promise<{ data: UpsetInquiry | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('upset_inquiries')
        .insert(inquiry)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getUpsetInquiries(
    organizationId: string, 
    userId?: string,
    options: {
      limit?: number
      offset?: number
      status?: 'pending' | 'in_progress' | 'resolved'
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<{ data: UpsetInquiry[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('upset_inquiries')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (options.status) {
        query = query.eq('resolution_status', options.status)
      }

      if (options.startDate) {
        query = query.gte('created_at', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('created_at', options.endDate)
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

  async getUpsetInquiryById(inquiryId: string): Promise<{ data: UpsetInquiry | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('upset_inquiries')
        .select('*')
        .eq('id', inquiryId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateUpsetInquiry(inquiryId: string, updates: TablesUpdate<'upset_inquiries'>): Promise<{ data: UpsetInquiry | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('upset_inquiries')
        .update(updates)
        .eq('id', inquiryId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deleteUpsetInquiry(inquiryId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('upset_inquiries')
        .delete()
        .eq('id', inquiryId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateResolutionStatus(inquiryId: string, status: 'pending' | 'in_progress' | 'resolved'): Promise<{ data: UpsetInquiry | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('upset_inquiries')
        .update({ resolution_status: status })
        .eq('id', inquiryId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async searchUpsetInquiries(
    organizationId: string, 
    searchTerm: string, 
    userId?: string
  ): Promise<{ data: UpsetInquiry[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('upset_inquiries')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`title.ilike.%${searchTerm}%,upset_description.ilike.%${searchTerm}%,insights_gained.ilike.%${searchTerm}%`)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getUpsetInquiryAnalytics(organizationId: string, userId?: string): Promise<{ 
    data: {
      totalInquiries: number
      inquiriesThisMonth: number
      statusDistribution: Record<string, number>
      averageResolutionTime: number
      topTriggers: Array<{ trigger: string; count: number }>
      emotionPatterns: Record<string, number>
      insightfulInquiries: UpsetInquiry[]
    } | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('upset_inquiries')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: inquiries, error } = await query.order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)

      if (!inquiries || inquiries.length === 0) {
        return {
          data: {
            totalInquiries: 0,
            inquiriesThisMonth: 0,
            statusDistribution: {},
            averageResolutionTime: 0,
            topTriggers: [],
            emotionPatterns: {},
            insightfulInquiries: []
          },
          error: null
        }
      }

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const inquiriesThisMonth = inquiries.filter(inquiry => 
        new Date(inquiry.created_at) >= thisMonth
      ).length

      // Status distribution
      const statusDistribution = inquiries.reduce((acc, inquiry) => {
        acc[inquiry.resolution_status] = (acc[inquiry.resolution_status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Average resolution time (for resolved inquiries)
      const resolvedInquiries = inquiries.filter(i => i.resolution_status === 'resolved')
      const avgResolutionTime = resolvedInquiries.length > 0 
        ? resolvedInquiries.reduce((sum, inquiry) => {
            const created = new Date(inquiry.created_at)
            const updated = new Date(inquiry.updated_at)
            return sum + (updated.getTime() - created.getTime())
          }, 0) / resolvedInquiries.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0

      // Top triggers
      const triggerCounts = inquiries
        .filter(i => i.trigger_event)
        .reduce((acc, inquiry) => {
          const trigger = inquiry.trigger_event!.toLowerCase()
          acc[trigger] = (acc[trigger] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      const topTriggers = Object.entries(triggerCounts)
        .map(([trigger, count]) => ({ trigger, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Emotion patterns
      const emotionPatterns = inquiries
        .filter(i => i.emotions_felt)
        .reduce((acc, inquiry) => {
          const emotions = inquiry.emotions_felt!.toLowerCase().split(/[,;]/)
          emotions.forEach(emotion => {
            const cleanEmotion = emotion.trim()
            if (cleanEmotion) {
              acc[cleanEmotion] = (acc[cleanEmotion] || 0) + 1
            }
          })
          return acc
        }, {} as Record<string, number>)

      // Insightful inquiries (those with insights and resolved status)
      const insightfulInquiries = inquiries
        .filter(i => i.insights_gained && i.insights_gained.length > 100 && i.resolution_status === 'resolved')
        .sort((a, b) => (b.insights_gained?.length || 0) - (a.insights_gained?.length || 0))
        .slice(0, 5)

      return {
        data: {
          totalInquiries: inquiries.length,
          inquiriesThisMonth,
          statusDistribution,
          averageResolutionTime: avgResolutionTime,
          topTriggers,
          emotionPatterns,
          insightfulInquiries
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getRecentInsights(organizationId: string, userId?: string, limit: number = 10): Promise<{ data: string[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('upset_inquiries')
        .select('insights_gained')
        .eq('organization_id', organizationId)
        .not('insights_gained', 'is', null)
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('updated_at', { ascending: false })

      if (error) return handleSupabaseError(error)

      const insights = data?.map(inquiry => inquiry.insights_gained).filter(Boolean) || []

      return { data: insights, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const upsetInquiryService = new UpsetInquiryService()