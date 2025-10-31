import { supabase, handleSupabaseError } from '../supabase'
import { AutobiographyEvent, TablesInsert, TablesUpdate } from '@/types/database'

export class AutobiographyService {
  
  async createAutobiographyEvent(event: TablesInsert<'autobiography_events'>): Promise<{ data: AutobiographyEvent | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('autobiography_events')
        .insert(event)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAutobiographyEvents(
    organizationId: string, 
    userId?: string,
    options: {
      limit?: number
      offset?: number
      eventType?: string
      lifeStage?: string
      startDate?: string
      endDate?: string
      minEmotionalImpact?: number
      maxEmotionalImpact?: number
    } = {}
  ): Promise<{ data: AutobiographyEvent[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (options.eventType) {
        query = query.eq('event_type', options.eventType)
      }

      if (options.lifeStage) {
        query = query.eq('life_stage', options.lifeStage)
      }

      if (options.startDate) {
        query = query.gte('event_date', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('event_date', options.endDate)
      }

      if (options.minEmotionalImpact) {
        query = query.gte('emotional_impact', options.minEmotionalImpact)
      }

      if (options.maxEmotionalImpact) {
        query = query.lte('emotional_impact', options.maxEmotionalImpact)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query.order('event_date', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAutobiographyEventById(eventId: string): Promise<{ data: AutobiographyEvent | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('autobiography_events')
        .select('*')
        .eq('id', eventId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateAutobiographyEvent(eventId: string, updates: TablesUpdate<'autobiography_events'>): Promise<{ data: AutobiographyEvent | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('autobiography_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deleteAutobiographyEvent(eventId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('autobiography_events')
        .delete()
        .eq('id', eventId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getEventsByLifeStage(organizationId: string, userId?: string): Promise<{ 
    data: Record<string, AutobiographyEvent[]> | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: events, error } = await query.order('event_date', { ascending: true })

      if (error) return handleSupabaseError(error)

      const groupedByLifeStage = events?.reduce((acc, event) => {
        if (!acc[event.life_stage]) {
          acc[event.life_stage] = []
        }
        acc[event.life_stage].push(event)
        return acc
      }, {} as Record<string, AutobiographyEvent[]>) || {}

      return { data: groupedByLifeStage, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getEventsByEventType(organizationId: string, userId?: string): Promise<{ 
    data: Record<string, AutobiographyEvent[]> | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: events, error } = await query.order('event_date', { ascending: true })

      if (error) return handleSupabaseError(error)

      const groupedByEventType = events?.reduce((acc, event) => {
        if (!acc[event.event_type]) {
          acc[event.event_type] = []
        }
        acc[event.event_type].push(event)
        return acc
      }, {} as Record<string, AutobiographyEvent[]>) || {}

      return { data: groupedByEventType, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getTimelineEvents(
    organizationId: string, 
    userId?: string,
    startYear?: number,
    endYear?: number
  ): Promise<{ data: AutobiographyEvent[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (startYear) {
        query = query.gte('event_date', `${startYear}-01-01`)
      }

      if (endYear) {
        query = query.lte('event_date', `${endYear}-12-31`)
      }

      const { data, error } = await query.order('event_date', { ascending: true })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async searchAutobiographyEvents(
    organizationId: string, 
    searchTerm: string, 
    userId?: string
  ): Promise<{ data: AutobiographyEvent[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,lessons_learned.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('event_date', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAutobiographyAnalytics(organizationId: string, userId?: string): Promise<{ 
    data: {
      totalEvents: number
      eventsThisYear: number
      averageEmotionalImpact: number
      lifeStageDistribution: Record<string, number>
      eventTypeDistribution: Record<string, number>
      emotionalImpactTrends: Array<{ year: number; avgImpact: number; eventCount: number }>
      mostSignificantEvents: AutobiographyEvent[]
      peopleInvolved: Array<{ person: string; eventCount: number }>
      locationFrequency: Record<string, number>
      lessonsLearned: string[]
    } | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: events, error } = await query

      if (error) return handleSupabaseError(error)

      if (!events || events.length === 0) {
        return {
          data: {
            totalEvents: 0,
            eventsThisYear: 0,
            averageEmotionalImpact: 0,
            lifeStageDistribution: {},
            eventTypeDistribution: {},
            emotionalImpactTrends: [],
            mostSignificantEvents: [],
            peopleInvolved: [],
            locationFrequency: {},
            lessonsLearned: []
          },
          error: null
        }
      }

      const currentYear = new Date().getFullYear()
      const eventsThisYear = events.filter(event => 
        new Date(event.event_date).getFullYear() === currentYear
      ).length

      const averageEmotionalImpact = events.reduce((sum, event) => sum + event.emotional_impact, 0) / events.length

      // Life stage distribution
      const lifeStageDistribution = events.reduce((acc, event) => {
        acc[event.life_stage] = (acc[event.life_stage] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Event type distribution
      const eventTypeDistribution = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Emotional impact trends by year
      const yearlyData = events.reduce((acc, event) => {
        const year = new Date(event.event_date).getFullYear()
        if (!acc[year]) {
          acc[year] = { totalImpact: 0, count: 0 }
        }
        acc[year].totalImpact += event.emotional_impact
        acc[year].count += 1
        return acc
      }, {} as Record<number, { totalImpact: number; count: number }>)

      const emotionalImpactTrends = Object.entries(yearlyData)
        .map(([year, data]) => ({
          year: parseInt(year),
          avgImpact: data.totalImpact / data.count,
          eventCount: data.count
        }))
        .sort((a, b) => a.year - b.year)

      // Most significant events (highest emotional impact)
      const mostSignificantEvents = events
        .sort((a, b) => b.emotional_impact - a.emotional_impact)
        .slice(0, 5)

      // People involved analysis
      const allPeople = events.flatMap(event => event.people_involved)
      const peopleCounts = allPeople.reduce((acc, person) => {
        acc[person] = (acc[person] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const peopleInvolved = Object.entries(peopleCounts)
        .map(([person, eventCount]) => ({ person, eventCount }))
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 10)

      // Location frequency
      const locationFrequency = events
        .filter(event => event.location)
        .reduce((acc, event) => {
          acc[event.location!] = (acc[event.location!] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      // Lessons learned
      const lessonsLearned = events
        .filter(event => event.lessons_learned)
        .map(event => event.lessons_learned!)
        .slice(0, 10)

      return {
        data: {
          totalEvents: events.length,
          eventsThisYear,
          averageEmotionalImpact,
          lifeStageDistribution,
          eventTypeDistribution,
          emotionalImpactTrends,
          mostSignificantEvents,
          peopleInvolved,
          locationFrequency,
          lessonsLearned
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getHighImpactEvents(organizationId: string, userId?: string, minImpact: number = 7): Promise<{ data: AutobiographyEvent[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('emotional_impact', minImpact)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('emotional_impact', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAllLifeStages(organizationId: string, userId?: string): Promise<{ data: string[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('life_stage')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) return handleSupabaseError(error)

      const lifeStages = [...new Set(data?.map(e => e.life_stage))].sort()

      return { data: lifeStages, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAllEventTypes(organizationId: string, userId?: string): Promise<{ data: string[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('event_type')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) return handleSupabaseError(error)

      const eventTypes = [...new Set(data?.map(e => e.event_type))].sort()

      return { data: eventTypes, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getEventsWithPerson(organizationId: string, personName: string, userId?: string): Promise<{ data: AutobiographyEvent[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('autobiography_events')
        .select('*')
        .eq('organization_id', organizationId)
        .contains('people_involved', [personName])

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('event_date', { ascending: true })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const autobiographyService = new AutobiographyService()