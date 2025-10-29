import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

export interface FulfillmentEntry {
  id: string;
  lifeAreaId: string;
  lifeAreaName?: string;
  lifeAreaSlug?: string;
  sourceType: 'contribution' | 'manual' | 'journal' | 'assessment';
  sourceId?: string;
  title: string;
  description?: string;
  meta: any;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface LifeArea {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export function useFulfillmentEntries(lifeAreaSlug?: string) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FulfillmentEntry[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch life areas
  const fetchLifeAreas = useCallback(async () => {
    try {
      const response = await fetch('/api/life-areas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch life areas');
      
      const data = await response.json();
      setLifeAreas(data);
    } catch (err) {
      console.error('Failed to fetch life areas:', err);
    }
  }, []);

  // Fetch fulfillment entries
  const fetchEntries = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const url = lifeAreaSlug 
        ? `/api/fulfillment-entries?lifeArea=${lifeAreaSlug}`
        : '/api/fulfillment-entries';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch fulfillment entries');
      
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user, lifeAreaSlug]);

  // Create manual fulfillment entry
  const createEntry = useCallback(async (data: {
    lifeAreaId: string;
    title: string;
    description?: string;
    priority?: number;
    status?: string;
  }) => {
    try {
      const response = await fetch('/api/fulfillment-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...data,
          sourceType: 'manual',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create entry');
      
      const newEntry = await response.json();
      setEntries(prev => [newEntry, ...prev]);

      return newEntry;
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
      throw err;
    }
  }, []);

  // Update fulfillment entry
  const updateEntry = useCallback(async (id: string, data: Partial<FulfillmentEntry>) => {
    try {
      const response = await fetch(`/api/fulfillment-entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update entry');
      
      const updatedEntry = await response.json();
      setEntries(prev =>
        prev.map(e => e.id === id ? updatedEntry : e)
      );

      return updatedEntry;
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
      throw err;
    }
  }, []);

  // Delete fulfillment entry (only manual entries)
  const deleteEntry = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/fulfillment-entries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete entry');

      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
      throw err;
    }
  }, []);

  // Get entries grouped by life area
  const getEntriesByLifeArea = useCallback(() => {
    const grouped: Record<string, FulfillmentEntry[]> = {};
    
    entries.forEach(entry => {
      const areaId = entry.lifeAreaId;
      if (!grouped[areaId]) {
        grouped[areaId] = [];
      }
      grouped[areaId].push(entry);
    });
    
    return grouped;
  }, [entries]);

  // Get entries by source type
  const getEntriesBySource = useCallback((sourceType: string) => {
    return entries.filter(e => e.sourceType === sourceType);
  }, [entries]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchLifeAreas();
      fetchEntries();
    }
  }, [user, fetchLifeAreas, fetchEntries]);

  return {
    entries,
    lifeAreas,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
    getEntriesByLifeArea,
    getEntriesBySource,
  };
}

// Hook for managing mirror rules
export function useMirrorRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/mirror-rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch rules');
      
      const data = await response.json();
      setRules(data);
    } catch (err) {
      console.error('Failed to fetch mirror rules:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateRule = useCallback(async (sourceType: string, targetAreas: string[], isActive: boolean) => {
    try {
      const response = await fetch('/api/mirror-rules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          sourceType,
          targetAreas,
          isActive,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update rule');
      
      await fetchRules();
    } catch (err) {
      console.error('Failed to update mirror rule:', err);
      throw err;
    }
  }, [fetchRules]);

  useEffect(() => {
    if (user) {
      fetchRules();
    }
  }, [user, fetchRules]);

  return {
    rules,
    loading,
    updateRule,
    refetch: fetchRules,
  };
}