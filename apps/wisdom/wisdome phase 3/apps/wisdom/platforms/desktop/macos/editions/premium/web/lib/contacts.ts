import { supabase, handleSupabaseError } from './supabase'
import { Contact, ContactInsert, ContactUpdate, LifeArea, ContactLifeAreaLink, ContactWithLifeAreas, LifeAreaWithContacts } from '@/types/database'

export class ContactService {
  
  // CRUD Operations for Contacts
  
  async createContact(contact: ContactInsert): Promise<{ data: Contact | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getContacts(organizationId: string, userId?: string): Promise<{ data: Contact[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contacts')
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

  async getContactById(contactId: string): Promise<{ data: Contact | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateContact(contactId: string, updates: ContactUpdate): Promise<{ data: Contact | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deleteContact(contactId: string): Promise<{ error: string | null }> {
    try {
      // First delete all life area links
      await supabase
        .from('contact_life_area_links')
        .delete()
        .eq('contact_id', contactId)

      // Then delete the contact
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Unified Contact System - Link contacts to life areas

  async linkContactToLifeArea(
    contactId: string, 
    lifeAreaId: string, 
    linkData: {
      influence_score?: number
      relationship_type?: string
      frequency?: number
      position?: { x: number; y: number }
      notes?: string
    } = {}
  ): Promise<{ data: ContactLifeAreaLink | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contact_life_area_links')
        .insert({
          contact_id: contactId,
          life_area_id: lifeAreaId,
          ...linkData
        })
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async unlinkContactFromLifeArea(contactId: string, lifeAreaId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('contact_life_area_links')
        .delete()
        .eq('contact_id', contactId)
        .eq('life_area_id', lifeAreaId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateContactLifeAreaLink(
    contactId: string, 
    lifeAreaId: string, 
    updates: Partial<ContactLifeAreaLink>
  ): Promise<{ data: ContactLifeAreaLink | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contact_life_area_links')
        .update(updates)
        .eq('contact_id', contactId)
        .eq('life_area_id', lifeAreaId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get contacts with their life area connections
  async getContactsWithLifeAreas(organizationId: string, userId?: string): Promise<{ data: ContactWithLifeAreas[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contacts')
        .select(`
          *,
          life_area_links:contact_life_area_links(
            *,
            life_area:life_areas(*)
          )
        `)
        .eq('organization_id', organizationId)
        .order('name')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      
      if (error) return handleSupabaseError(error)
      return { data: data as ContactWithLifeAreas[], error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getContactWithLifeAreas(contactId: string): Promise<{ data: ContactWithLifeAreas | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          life_area_links:contact_life_area_links(
            *,
            life_area:life_areas(*)
          )
        `)
        .eq('id', contactId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data: data as ContactWithLifeAreas, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Get life areas with their contact connections
  async getLifeAreasWithContacts(organizationId: string, userId?: string): Promise<{ data: LifeAreaWithContacts[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('life_areas')
        .select(`
          *,
          contact_links:contact_life_area_links(
            *,
            contact:contacts(*)
          )
        `)
        .eq('organization_id', organizationId)
        .order('name')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      
      if (error) return handleSupabaseError(error)
      return { data: data as LifeAreaWithContacts[], error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getLifeAreaWithContacts(lifeAreaId: string): Promise<{ data: LifeAreaWithContacts | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('life_areas')
        .select(`
          *,
          contact_links:contact_life_area_links(
            *,
            contact:contacts(*)
          )
        `)
        .eq('id', lifeAreaId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data: data as LifeAreaWithContacts, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Search and filtering
  async searchContacts(
    organizationId: string, 
    searchTerm: string, 
    filters: {
      categories?: string[]
      relationship_status?: 'green' | 'yellow' | 'red'
      userId?: string
    } = {}
  ): Promise<{ data: Contact[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`)

      if (filters.categories && filters.categories.length > 0) {
        query = query.overlaps('categories', filters.categories)
      }

      if (filters.relationship_status) {
        query = query.eq('relationship_status', filters.relationship_status)
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      const { data, error } = await query.order('name')
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Contact analytics and insights
  async getContactInfluenceAnalytics(organizationId: string, userId?: string): Promise<{ 
    data: {
      totalContacts: number
      contactsByStatus: Record<string, number>
      contactsByLifeArea: Array<{ lifeAreaName: string; contactCount: number; averageInfluence: number }>
      topInfluentialContacts: Array<{ contact: Contact; totalInfluence: number; lifeAreasCount: number }>
    } | null
    error: string | null 
  }> {
    try {
      // Get total contacts
      let contactsQuery = supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)

      if (userId) {
        contactsQuery = contactsQuery.eq('user_id', userId)
      }

      const { count: totalContacts, error: contactsError } = await contactsQuery

      if (contactsError) return handleSupabaseError(contactsError)

      // Get contacts by status
      const { data: statusData, error: statusError } = await supabase
        .from('contacts')
        .select('relationship_status')
        .eq('organization_id', organizationId)

      if (statusError) return handleSupabaseError(statusError)

      const contactsByStatus = statusData.reduce((acc, contact) => {
        acc[contact.relationship_status] = (acc[contact.relationship_status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Get contacts by life area with influence scores
      let lifeAreasQuery = supabase
        .from('life_areas')
        .select(`
          name,
          contact_links:contact_life_area_links(
            influence_score,
            contact:contacts(*)
          )
        `)
        .eq('organization_id', organizationId)

      if (userId) {
        lifeAreasQuery = lifeAreasQuery.eq('user_id', userId)
      }

      const { data: lifeAreasData, error: lifeAreasError } = await lifeAreasQuery

      if (lifeAreasError) return handleSupabaseError(lifeAreasError)

      const contactsByLifeArea = lifeAreasData.map((lifeArea: any) => ({
        lifeAreaName: lifeArea.name,
        contactCount: lifeArea.contact_links.length,
        averageInfluence: lifeArea.contact_links.length > 0 
          ? lifeArea.contact_links.reduce((sum: number, link: any) => sum + link.influence_score, 0) / lifeArea.contact_links.length
          : 0
      }))

      // Get top influential contacts
      const { data: influentialData, error: influentialError } = await supabase
        .from('contacts')
        .select(`
          *,
          life_area_links:contact_life_area_links(influence_score)
        `)
        .eq('organization_id', organizationId)

      if (influentialError) return handleSupabaseError(influentialError)

      const topInfluentialContacts = influentialData
        .map((contact: any) => ({
          contact,
          totalInfluence: contact.life_area_links.reduce((sum: number, link: any) => sum + link.influence_score, 0),
          lifeAreasCount: contact.life_area_links.length
        }))
        .sort((a: any, b: any) => b.totalInfluence - a.totalInfluence)
        .slice(0, 10)

      return {
        data: {
          totalContacts: totalContacts || 0,
          contactsByStatus,
          contactsByLifeArea,
          topInfluentialContacts
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Update last contact date
  async updateLastContactDate(contactId: string, date: Date = new Date()): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ last_contact_at: date.toISOString() })
        .eq('id', contactId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Bulk operations
  async bulkCreateContacts(contacts: ContactInsert[]): Promise<{ data: Contact[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contacts)
        .select()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async bulkUpdateContacts(updates: Array<{ id: string; updates: ContactUpdate }>): Promise<{ error: string | null }> {
    try {
      const promises = updates.map(({ id, updates }) => 
        supabase
          .from('contacts')
          .update(updates)
          .eq('id', id)
      )

      const results = await Promise.allSettled(promises)
      const failed = results.filter(result => result.status === 'rejected')
      
      if (failed.length > 0) {
        return { error: `Failed to update ${failed.length} contacts` }
      }

      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// Export singleton instance
export const contactService = new ContactService()