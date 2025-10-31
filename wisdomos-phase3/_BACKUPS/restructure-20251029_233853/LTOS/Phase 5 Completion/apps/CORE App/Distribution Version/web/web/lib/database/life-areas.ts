import { supabase, handleSupabaseError } from '../supabase'
import { LifeArea, LifeAreaInsert, LifeAreaUpdate } from '@/types/database'

export class LifeAreaService {
  
  async createLifeArea(lifeArea: LifeAreaInsert): Promise<{ data: LifeArea | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('life_areas')
        .insert(lifeArea)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getLifeAreas(organizationId: string, userId?: string): Promise<{ data: LifeArea[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('life_areas')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getLifeAreaById(lifeAreaId: string): Promise<{ data: LifeArea | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('life_areas')
        .select('*')
        .eq('id', lifeAreaId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateLifeArea(lifeAreaId: string, updates: LifeAreaUpdate): Promise<{ data: LifeArea | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('life_areas')
        .update(updates)
        .eq('id', lifeAreaId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deleteLifeArea(lifeAreaId: string): Promise<{ error: string | null }> {
    try {
      // First delete all contact links
      await supabase
        .from('contact_life_area_links')
        .delete()
        .eq('life_area_id', lifeAreaId)

      // Then delete the life area
      const { error } = await supabase
        .from('life_areas')
        .delete()
        .eq('id', lifeAreaId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateLifeAreaPosition(lifeAreaId: string, position: { x: number; y: number }): Promise<{ data: LifeArea | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('life_areas')
        .update({ position })
        .eq('id', lifeAreaId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateLifeAreaFulfillmentScore(lifeAreaId: string, fulfillmentScore: number): Promise<{ data: LifeArea | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('life_areas')
        .update({ fulfillment_score: fulfillmentScore })
        .eq('id', lifeAreaId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async bulkUpdateLifeAreas(updates: Array<{ id: string; updates: LifeAreaUpdate }>): Promise<{ error: string | null }> {
    try {
      const promises = updates.map(({ id, updates }) => 
        supabase
          .from('life_areas')
          .update(updates)
          .eq('id', id)
      )

      const results = await Promise.allSettled(promises)
      const failed = results.filter(result => result.status === 'rejected')
      
      if (failed.length > 0) {
        return { error: `Failed to update ${failed.length} life areas` }
      }

      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getLifeAreaAnalytics(organizationId: string, userId?: string): Promise<{ 
    data: {
      averageFulfillmentScore: number
      totalLifeAreas: number
      fulfillmentDistribution: Record<string, number>
      lowestFulfillmentAreas: LifeArea[]
      highestFulfillmentAreas: LifeArea[]
    } | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('life_areas')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: lifeAreas, error } = await query

      if (error) return handleSupabaseError(error)

      if (!lifeAreas || lifeAreas.length === 0) {
        return {
          data: {
            averageFulfillmentScore: 0,
            totalLifeAreas: 0,
            fulfillmentDistribution: {},
            lowestFulfillmentAreas: [],
            highestFulfillmentAreas: []
          },
          error: null
        }
      }

      const averageFulfillmentScore = lifeAreas.reduce((sum, area) => sum + area.fulfillment_score, 0) / lifeAreas.length

      const fulfillmentDistribution = lifeAreas.reduce((acc, area) => {
        const range = Math.floor(area.fulfillment_score)
        acc[range] = (acc[range] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const sortedByFulfillment = [...lifeAreas].sort((a, b) => a.fulfillment_score - b.fulfillment_score)
      const lowestFulfillmentAreas = sortedByFulfillment.slice(0, 3)
      const highestFulfillmentAreas = sortedByFulfillment.slice(-3).reverse()

      return {
        data: {
          averageFulfillmentScore,
          totalLifeAreas: lifeAreas.length,
          fulfillmentDistribution,
          lowestFulfillmentAreas,
          highestFulfillmentAreas
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const lifeAreaService = new LifeAreaService()