import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

export interface Contribution {
  id: string;
  category: 'Doing' | 'Being' | 'Having';
  title: string;
  description?: string;
  contributions: string[];
  impact?: string;
  commitment?: string;
  tags?: string[];
  visibility: 'private' | 'shared' | 'public';
  createdAt: string;
  updatedAt: string;
}

export interface ContributionStatistics {
  total: number;
  byCategory: Array<{ category: string; _count: number }>;
  recent: Array<{ id: string; title: string; category: string; createdAt: string }>;
}

export function useContributions() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [statistics, setStatistics] = useState<ContributionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all contributions
  const fetchContributions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/contributions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch contributions');
      
      const data = await response.json();
      setContributions(data);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/contributions/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, [user]);

  // Create contribution
  const createContribution = useCallback(async (data: Omit<Contribution, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create contribution');
      
      const newContribution = await response.json();
      setContributions(prev => [newContribution, ...prev]);
      
      // Refresh statistics
      await fetchStatistics();
      
      return newContribution;
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
      throw err;
    }
  }, [fetchStatistics]);

  // Update contribution
  const updateContribution = useCallback(async (id: string, data: Partial<Contribution>) => {
    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update contribution');
      
      const updatedContribution = await response.json();
      setContributions(prev => 
        prev.map(c => c.id === id ? updatedContribution : c)
      );

      return updatedContribution;
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
      throw err;
    }
  }, []);

  // Delete contribution
  const deleteContribution = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete contribution');
      
      setContributions(prev => prev.filter(c => c.id !== id));
      
      // Refresh statistics
      await fetchStatistics();
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'Unknown error');
      throw err;
    }
  }, [fetchStatistics]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchContributions();
      fetchStatistics();
    }
  }, [user, fetchContributions, fetchStatistics]);

  return {
    contributions,
    statistics,
    loading,
    error,
    createContribution,
    updateContribution,
    deleteContribution,
    refetch: fetchContributions,
  };
}

// Optimistic update hook for better UX
export function useOptimisticContributions() {
  const [optimisticContributions, setOptimisticContributions] = useState<Contribution[]>([]);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  
  const addOptimistic = useCallback((contribution: Contribution) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...contribution, id: tempId };
    
    setOptimisticContributions(prev => [optimisticItem, ...prev]);
    setPendingActions(prev => new Set(prev).add(tempId));
    
    return tempId;
  }, []);
  
  const removeOptimistic = useCallback((tempId: string) => {
    setOptimisticContributions(prev => prev.filter(c => c.id !== tempId));
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  }, []);
  
  const replaceOptimistic = useCallback((tempId: string, realContribution: Contribution) => {
    setOptimisticContributions(prev => 
      prev.map(c => c.id === tempId ? realContribution : c)
    );
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  }, []);
  
  return {
    optimisticContributions,
    pendingActions,
    addOptimistic,
    removeOptimistic,
    replaceOptimistic,
  };
}