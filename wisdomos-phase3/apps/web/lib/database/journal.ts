import { supabase, handleSupabaseError } from '../supabase'
import { JournalEntry, TablesInsert, TablesUpdate } from '@/types/database'

export class JournalService {
  
  async createJournalEntry(entry: TablesInsert<'journal_entries'>): Promise<{ data: JournalEntry | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getJournalEntries(
    organizationId: string, 
    userId?: string,
    options: {
      limit?: number
      offset?: number
      includePrivate?: boolean
      tags?: string[]
      mood?: string
      startDate?: string
      endDate?: string
    } = {}
  ): Promise<{ data: JournalEntry[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        if (options.includePrivate) {
          query = query.eq('user_id', userId)
        } else {
          query = query.or(`user_id.eq.${userId},is_private.eq.false`)
        }
      } else {
        query = query.eq('is_private', false)
      }

      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags)
      }

      if (options.mood) {
        query = query.eq('mood', options.mood)
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

  async getJournalEntryById(entryId: string): Promise<{ data: JournalEntry | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async updateJournalEntry(entryId: string, updates: TablesUpdate<'journal_entries'>): Promise<{ data: JournalEntry | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single()
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async deleteJournalEntry(entryId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
      
      if (error) return handleSupabaseError(error)
      return { error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async searchJournalEntries(
    organizationId: string, 
    searchTerm: string, 
    userId?: string,
    includePrivate: boolean = false
  ): Promise<{ data: JournalEntry[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)

      if (userId) {
        if (includePrivate) {
          query = query.eq('user_id', userId)
        } else {
          query = query.or(`user_id.eq.${userId},is_private.eq.false`)
        }
      } else {
        query = query.eq('is_private', false)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) return handleSupabaseError(error)
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getJournalAnalytics(organizationId: string, userId?: string): Promise<{ 
    data: {
      totalEntries: number
      entriesThisMonth: number
      averageEntriesPerWeek: number
      moodDistribution: Record<string, number>
      topTags: Array<{ tag: string; count: number }>
      writingStreak: number
      longestStreak: number
    } | null
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: entries, error } = await query.order('created_at', { ascending: false })

      if (error) return handleSupabaseError(error)

      if (!entries || entries.length === 0) {
        return {
          data: {
            totalEntries: 0,
            entriesThisMonth: 0,
            averageEntriesPerWeek: 0,
            moodDistribution: {},
            topTags: [],
            writingStreak: 0,
            longestStreak: 0
          },
          error: null
        }
      }

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const entriesThisMonth = entries.filter(entry => 
        new Date(entry.created_at) >= thisMonth
      ).length

      // Calculate mood distribution
      const moodDistribution = entries
        .filter(entry => entry.mood)
        .reduce((acc, entry) => {
          acc[entry.mood!] = (acc[entry.mood!] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      // Calculate top tags
      const allTags = entries.flatMap(entry => entry.tags)
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Calculate writing streaks
      const sortedEntries = entries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      let writingStreak = 0
      let longestStreak = 0
      let currentStreak = 0
      let lastEntryDate: Date | null = null

      for (const entry of sortedEntries) {
        const entryDate = new Date(entry.created_at)
        entryDate.setHours(0, 0, 0, 0)

        if (lastEntryDate) {
          const daysDiff = Math.floor((lastEntryDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDiff === 1) {
            currentStreak++
          } else if (daysDiff > 1) {
            longestStreak = Math.max(longestStreak, currentStreak)
            currentStreak = 1
          }
        } else {
          currentStreak = 1
          // Check if today or yesterday
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          
          if (entryDate.getTime() === today.getTime() || entryDate.getTime() === yesterday.getTime()) {
            writingStreak = currentStreak
          }
        }

        lastEntryDate = entryDate
      }

      longestStreak = Math.max(longestStreak, currentStreak)

      // Calculate average entries per week (last 8 weeks)
      const eightWeeksAgo = new Date()
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
      
      const recentEntries = entries.filter(entry => 
        new Date(entry.created_at) >= eightWeeksAgo
      )
      
      const averageEntriesPerWeek = recentEntries.length / 8

      return {
        data: {
          totalEntries: entries.length,
          entriesThisMonth,
          averageEntriesPerWeek,
          moodDistribution,
          topTags,
          writingStreak,
          longestStreak
        },
        error: null
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  async getAllTags(organizationId: string, userId?: string): Promise<{ data: string[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('journal_entries')
        .select('tags')
        .eq('organization_id', organizationId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) return handleSupabaseError(error)

      const allTags = data
        ?.flatMap(entry => entry.tags)
        .filter((tag, index, array) => array.indexOf(tag) === index)
        .sort() || []

      return { data: allTags, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

export const journalService = new JournalService()