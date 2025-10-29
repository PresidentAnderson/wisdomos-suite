import { supabase, handleSupabaseError } from '../supabase'
import { Contribution, TablesInsert, TablesUpdate } from '@/types/database'

export class ContributionService {
  
  async createContribution(contribution: TablesInsert<'contributions'>): Promise<{ data: Contribution | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .insert(contribution)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getContributions(
    organizationId: string, 
    userId?: string,
    options: {
      limit?: number
      offset?: number
      category?: string
      status?: 'planned' | 'active' | 'completed' | 'paused'
      minImpactLevel?: number
      maxImpactLevel?: number
    } = {}
  ): Promise<{ data: Contribution[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.minImpactLevel) {
        query = query.gte('impact_level', options.minImpactLevel)
      }

      if (options.maxImpactLevel) {
        query = query.lte('impact_level', options.maxImpactLevel)
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

  async getContributionById(contributionId: string): Promise<{ data: Contribution | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('id', contributionId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateContribution(contributionId: string, updates: TablesUpdate<'contributions'>): Promise<{ data: Contribution | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .update(updates)
        .eq('id', contributionId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deleteContribution(contributionId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', contributionId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateContributionStatus(contributionId: string, status: 'planned' | 'active' | 'completed' | 'paused'): Promise<{ data: Contribution | null; error: string | null }> {
    try {
      const updates: TablesUpdate<'contributions'> = { status }
      
      if (status === 'completed' && !await this.getContributionById(contributionId).then(r => r.data?.end_date)) {
        updates.end_date = new Date().toISOString()
      }

      if (status === 'active' && !await this.getContributionById(contributionId).then(r => r.data?.start_date)) {
        updates.start_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('contributions')
        .update(updates)
        .eq('id', contributionId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getActiveContributions(organizationId: string, userId?: string): Promise<{ data: Contribution[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('impact_level', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getContributionsByCategory(organizationId: string, userId?: string): Promise<{ 
    data: Record<string, Contribution[]> | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: contributions, error } = await query.order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)

      const groupedByCategory = contributions?.reduce((acc, contribution) => {
        if (!acc[contribution.category]) {
          acc[contribution.category] = []
        }
        acc[contribution.category].push(contribution)
        return acc
      }, {} as Record<string, Contribution[]>) || {}

      return { data: groupedByCategory, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async searchContributions(
    organizationId: string, 
    searchTerm: string, 
    userId?: string
  ): Promise<{ data: Contribution[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)

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

  async getContributionAnalytics(organizationId: string, userId?: string): Promise<{ 
    data: {
      totalContributions: number
      activeContributions: number
      completedContributions: number
      totalImpactScore: number
      averageImpactScore: number
      categoryDistribution: Record<string, number>
      statusDistribution: Record<string, number>
      impactTrends: Array<{ month: string; totalImpact: number; contributionsCount: number }>
      topCategories: Array<{ category: string; count: number; avgImpact: number }>
      beneficiaryReach: number
    } | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: contributions, error } = await query

      if (error) return handleSupabaseError(error)

      if (!contributions || contributions.length === 0) {
        return {
          data: {
            totalContributions: 0,
            activeContributions: 0,
            completedContributions: 0,
            totalImpactScore: 0,
            averageImpactScore: 0,
            categoryDistribution: {},
            statusDistribution: {},
            impactTrends: [],
            topCategories: [],
            beneficiaryReach: 0
          },
          error: null
        }
      }

      const activeContributions = contributions.filter(c => c.status === 'active').length
      const completedContributions = contributions.filter(c => c.status === 'completed').length
      const totalImpactScore = contributions.reduce((sum, c) => sum + c.impact_level, 0)
      const averageImpactScore = totalImpactScore / contributions.length

      // Category distribution
      const categoryDistribution = contributions.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Status distribution
      const statusDistribution = contributions.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Impact trends (last 12 months)
      const impactTrends: Array<{ month: string; totalImpact: number; contributionsCount: number }> = []
      const now = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = date.toISOString().substring(0, 7) // YYYY-MM format

        const monthContributions = contributions.filter(c => 
          c.created_at.startsWith(monthStr) || 
          (c.start_date && c.start_date.startsWith(monthStr))
        )

        const totalImpact = monthContributions.reduce((sum, c) => sum + c.impact_level, 0)

        impactTrends.push({
          month: monthStr,
          totalImpact,
          contributionsCount: monthContributions.length
        })
      }

      // Top categories by impact
      const categoryImpacts = contributions.reduce((acc, c) => {
        if (!acc[c.category]) {
          acc[c.category] = { totalImpact: 0, count: 0 }
        }
        acc[c.category].totalImpact += c.impact_level
        acc[c.category].count += 1
        return acc
      }, {} as Record<string, { totalImpact: number; count: number }>)

      const topCategories = Object.entries(categoryImpacts)
        .map(([category, data]) => ({
          category,
          count: data.count,
          avgImpact: data.totalImpact / data.count
        }))
        .sort((a, b) => b.avgImpact - a.avgImpact)
        .slice(0, 5)

      // Total beneficiary reach
      const allBeneficiaries = new Set(
        contributions.flatMap(c => c.beneficiaries)
      )
      const beneficiaryReach = allBeneficiaries.size

      return {
        data: {
          totalContributions: contributions.length,
          activeContributions,
          completedContributions,
          totalImpactScore,
          averageImpactScore,
          categoryDistribution,
          statusDistribution,
          impactTrends,
          topCategories,
          beneficiaryReach
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getHighImpactContributions(organizationId: string, userId?: string, minImpact: number = 7): Promise<{ data: Contribution[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contributions')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('impact_level', minImpact)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('impact_level', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAllCategories(organizationId: string, userId?: string): Promise<{ data: string[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contributions')
        .select('category')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) return handleSupabaseError(error)

      const categories = [...new Set(data?.map(c => c.category))].sort()

      return { data: categories, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAllBeneficiaries(organizationId: string, userId?: string): Promise<{ data: string[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contributions')
        .select('beneficiaries')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) return handleSupabaseError(error)

      const allBeneficiaries = [...new Set(
        data?.flatMap(c => c.beneficiaries) || []
      )].sort()

      return { data: allBeneficiaries, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const contributionService = new ContributionService()