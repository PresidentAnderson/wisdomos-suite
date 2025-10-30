import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  userService,
  organizationService,
  contactService,
  lifeAreaService,
  journalService,
  upsetInquiryService,
  priorityItemService,
  contributionService,
  autobiographyService,
  analyticsService
} from '@/lib/database'
import { supabase, subscribeToTable } from '@/lib/supabase'
import type {
  User,
  Organization,
  Contact,
  LifeArea,
  ContactWithLifeAreas,
  LifeAreaWithContacts,
  JournalEntry,
  UpsetInquiry,
  PriorityItem,
  Contribution,
  AutobiographyEvent,
  AnalyticsData
} from '@/types/database'

// Generic hook for database operations
export function useDatabase() {
  const { user } = useAuth()

  return {
    user: userService,
    organization: organizationService,
    contact: contactService,
    lifeArea: lifeAreaService,
    journal: journalService,
    upsetInquiry: upsetInquiryService,
    priorityItem: priorityItemService,
    contribution: contributionService,
    autobiography: autobiographyService,
    analytics: analyticsService
  }
}

// Real-time hooks for specific entities

export function useContacts(organizationId?: string, userId?: string) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await contactService.getContacts(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setContacts(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const subscription = subscribeToTable(
      'contacts',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setContacts(prev => [payload.new as Contact, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setContacts(prev => prev.map(contact => 
            contact.id === payload.new.id ? payload.new as Contact : contact
          ))
        } else if (payload.eventType === 'DELETE') {
          setContacts(prev => prev.filter(contact => contact.id !== payload.old.id))
        }
      },
      `organization_id=eq.${organizationId}`
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [organizationId])

  return {
    contacts,
    loading,
    error,
    refetch: loadContacts
  }
}

export function useContactsWithLifeAreas(organizationId?: string, userId?: string) {
  const [contacts, setContacts] = useState<ContactWithLifeAreas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await contactService.getContactsWithLifeAreas(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setContacts(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  return {
    contacts,
    loading,
    error,
    refetch: loadContacts
  }
}

export function useLifeAreas(organizationId?: string, userId?: string) {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLifeAreas = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await lifeAreaService.getLifeAreas(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setLifeAreas(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadLifeAreas()
  }, [loadLifeAreas])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const subscription = subscribeToTable(
      'life_areas',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setLifeAreas(prev => [payload.new as LifeArea, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setLifeAreas(prev => prev.map(area => 
            area.id === payload.new.id ? payload.new as LifeArea : area
          ))
        } else if (payload.eventType === 'DELETE') {
          setLifeAreas(prev => prev.filter(area => area.id !== payload.old.id))
        }
      },
      `organization_id=eq.${organizationId}`
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [organizationId])

  return {
    lifeAreas,
    loading,
    error,
    refetch: loadLifeAreas
  }
}

export function useLifeAreasWithContacts(organizationId?: string, userId?: string) {
  const [lifeAreas, setLifeAreas] = useState<LifeAreaWithContacts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLifeAreas = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await contactService.getLifeAreasWithContacts(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setLifeAreas(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadLifeAreas()
  }, [loadLifeAreas])

  return {
    lifeAreas,
    loading,
    error,
    refetch: loadLifeAreas
  }
}

export function useJournalEntries(
  organizationId?: string, 
  userId?: string,
  options: {
    limit?: number
    includePrivate?: boolean
    tags?: string[]
    mood?: string
  } = {}
) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadJournalEntries = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await journalService.getJournalEntries(organizationId, userId, options)
    
    if (error) {
      setError(error)
    } else {
      setJournalEntries(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId, JSON.stringify(options)])

  useEffect(() => {
    loadJournalEntries()
  }, [loadJournalEntries])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const subscription = subscribeToTable(
      'journal_entries',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setJournalEntries(prev => [payload.new as JournalEntry, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setJournalEntries(prev => prev.map(entry => 
            entry.id === payload.new.id ? payload.new as JournalEntry : entry
          ))
        } else if (payload.eventType === 'DELETE') {
          setJournalEntries(prev => prev.filter(entry => entry.id !== payload.old.id))
        }
      },
      `organization_id=eq.${organizationId}`
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [organizationId])

  return {
    journalEntries,
    loading,
    error,
    refetch: loadJournalEntries
  }
}

export function useUpsetInquiries(organizationId?: string, userId?: string) {
  const [upsetInquiries, setUpsetInquiries] = useState<UpsetInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUpsetInquiries = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await upsetInquiryService.getUpsetInquiries(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setUpsetInquiries(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadUpsetInquiries()
  }, [loadUpsetInquiries])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const subscription = subscribeToTable(
      'upset_inquiries',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setUpsetInquiries(prev => [payload.new as UpsetInquiry, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setUpsetInquiries(prev => prev.map(inquiry => 
            inquiry.id === payload.new.id ? payload.new as UpsetInquiry : inquiry
          ))
        } else if (payload.eventType === 'DELETE') {
          setUpsetInquiries(prev => prev.filter(inquiry => inquiry.id !== payload.old.id))
        }
      },
      `organization_id=eq.${organizationId}`
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [organizationId])

  return {
    upsetInquiries,
    loading,
    error,
    refetch: loadUpsetInquiries
  }
}

export function usePriorityItems(organizationId?: string, userId?: string) {
  const [priorityItems, setPriorityItems] = useState<PriorityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPriorityItems = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await priorityItemService.getPriorityItems(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setPriorityItems(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadPriorityItems()
  }, [loadPriorityItems])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const subscription = subscribeToTable(
      'priority_items',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setPriorityItems(prev => [payload.new as PriorityItem, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setPriorityItems(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new as PriorityItem : item
          ))
        } else if (payload.eventType === 'DELETE') {
          setPriorityItems(prev => prev.filter(item => item.id !== payload.old.id))
        }
      },
      `organization_id=eq.${organizationId}`
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [organizationId])

  return {
    priorityItems,
    loading,
    error,
    refetch: loadPriorityItems
  }
}

export function usePriorityMatrix(organizationId?: string, userId?: string) {
  const [matrix, setMatrix] = useState<{
    quadrant1: PriorityItem[]
    quadrant2: PriorityItem[]
    quadrant3: PriorityItem[]
    quadrant4: PriorityItem[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMatrix = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await priorityItemService.getPriorityMatrix(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setMatrix(data)
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadMatrix()
  }, [loadMatrix])

  return {
    matrix,
    loading,
    error,
    refetch: loadMatrix
  }
}

export function useContributions(organizationId?: string, userId?: string) {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContributions = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await contributionService.getContributions(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setContributions(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadContributions()
  }, [loadContributions])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const subscription = subscribeToTable(
      'contributions',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setContributions(prev => [payload.new as Contribution, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setContributions(prev => prev.map(contribution => 
            contribution.id === payload.new.id ? payload.new as Contribution : contribution
          ))
        } else if (payload.eventType === 'DELETE') {
          setContributions(prev => prev.filter(contribution => contribution.id !== payload.old.id))
        }
      },
      `organization_id=eq.${organizationId}`
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [organizationId])

  return {
    contributions,
    loading,
    error,
    refetch: loadContributions
  }
}

export function useAutobiographyEvents(organizationId?: string, userId?: string) {
  const [autobiographyEvents, setAutobiographyEvents] = useState<AutobiographyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAutobiographyEvents = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await autobiographyService.getAutobiographyEvents(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setAutobiographyEvents(data || [])
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadAutobiographyEvents()
  }, [loadAutobiographyEvents])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const subscription = subscribeToTable(
      'autobiography_events',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setAutobiographyEvents(prev => [payload.new as AutobiographyEvent, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setAutobiographyEvents(prev => prev.map(event => 
            event.id === payload.new.id ? payload.new as AutobiographyEvent : event
          ))
        } else if (payload.eventType === 'DELETE') {
          setAutobiographyEvents(prev => prev.filter(event => event.id !== payload.old.id))
        }
      },
      `organization_id=eq.${organizationId}`
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [organizationId])

  return {
    autobiographyEvents,
    loading,
    error,
    refetch: loadAutobiographyEvents
  }
}

// Analytics hook
export function useAnalytics(organizationId?: string, userId?: string) {
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    setError(null)

    const { data, error } = await analyticsService.getDashboardMetrics(organizationId, userId)
    
    if (error) {
      setError(error)
    } else {
      setDashboardMetrics(data)
    }
    
    setLoading(false)
  }, [organizationId, userId])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  // Track events convenience methods
  const trackFulfillmentScore = useCallback(async (lifeAreaId: string, score: number, metadata: any = {}) => {
    if (!organizationId || !userId) return

    return analyticsService.trackFulfillmentScore(organizationId, userId, lifeAreaId, score, metadata)
  }, [organizationId, userId])

  const trackUserAction = useCallback(async (action: string, details: any = {}, metadata: any = {}) => {
    if (!organizationId || !userId) return

    return analyticsService.trackUserAction(organizationId, userId, action, details, metadata)
  }, [organizationId, userId])

  const trackFeatureUsage = useCallback(async (feature: string, duration?: number, metadata: any = {}) => {
    if (!organizationId || !userId) return

    return analyticsService.trackFeatureUsage(organizationId, userId, feature, duration, metadata)
  }, [organizationId, userId])

  return {
    dashboardMetrics,
    loading,
    error,
    refetch: loadAnalytics,
    trackFulfillmentScore,
    trackUserAction,
    trackFeatureUsage
  }
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T[],
  idKey: keyof T = 'id' as keyof T
) {
  const [data, setData] = useState<T[]>(initialData)

  const optimisticAdd = useCallback((newItem: T) => {
    setData(prev => [newItem, ...prev])
  }, [])

  const optimisticUpdate = useCallback((id: any, updates: Partial<T>) => {
    setData(prev => prev.map(item => 
      item[idKey] === id ? { ...item, ...updates } : item
    ))
  }, [idKey])

  const optimisticDelete = useCallback((id: any) => {
    setData(prev => prev.filter(item => item[idKey] !== id))
  }, [idKey])

  const syncData = useCallback((newData: T[]) => {
    setData(newData)
  }, [])

  return {
    data,
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete,
    syncData
  }
}