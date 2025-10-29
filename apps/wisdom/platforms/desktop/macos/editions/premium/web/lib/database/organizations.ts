import { supabase, handleSupabaseError } from '../supabase'
import { Organization, TablesInsert, TablesUpdate } from '@/types/database'

export class OrganizationService {
  
  async createOrganization(organization: TablesInsert<'organizations'>): Promise<{ data: Organization | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert(organization)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getOrganizationById(organizationId: string): Promise<{ data: Organization | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getOrganizationBySlug(slug: string): Promise<{ data: Organization | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateOrganization(organizationId: string, updates: TablesUpdate<'organizations'>): Promise<{ data: Organization | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organizationId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deleteOrganization(organizationId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async isSlugAvailable(slug: string): Promise<{ available: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return { available: false, error: handleSupabaseError(error).error }
      }
      
      return { available: !data, error: null }
    } catch (error) {
      return { available: false, error: handleSupabaseError(error).error }
    }
  }

  async updateOrganizationSettings(organizationId: string, settings: any): Promise<{ data: Organization | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({ settings })
        .eq('id', organizationId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getOrganizationStats(organizationId: string): Promise<{ 
    data: {
      totalUsers: number
      totalContacts: number
      totalJournalEntries: number
      totalUpsetInquiries: number
      totalPriorityItems: number
      totalContributions: number
      totalAutobiographyEvents: number
    } | null
    error: string | null 
  }> {
    try {
      const [
        { count: totalUsers },
        { count: totalContacts },
        { count: totalJournalEntries },
        { count: totalUpsetInquiries },
        { count: totalPriorityItems },
        { count: totalContributions },
        { count: totalAutobiographyEvents }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }).eq('organization_id', organizationId),
        supabase.from('contacts').select('*', { count: 'exact' }).eq('organization_id', organizationId),
        supabase.from('journal_entries').select('*', { count: 'exact' }).eq('organization_id', organizationId),
        supabase.from('upset_inquiries').select('*', { count: 'exact' }).eq('organization_id', organizationId),
        supabase.from('priority_items').select('*', { count: 'exact' }).eq('organization_id', organizationId),
        supabase.from('contributions').select('*', { count: 'exact' }).eq('organization_id', organizationId),
        supabase.from('autobiography_events').select('*', { count: 'exact' }).eq('organization_id', organizationId)
      ])

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalContacts: totalContacts || 0,
          totalJournalEntries: totalJournalEntries || 0,
          totalUpsetInquiries: totalUpsetInquiries || 0,
          totalPriorityItems: totalPriorityItems || 0,
          totalContributions: totalContributions || 0,
          totalAutobiographyEvents: totalAutobiographyEvents || 0
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const organizationService = new OrganizationService()