/**
 * Fulfillment Dashboard Client
 *
 * Client-side utilities for working with the fulfillment dashboard API.
 * Uses Supabase RPC to call PostgreSQL functions that return complete JSON payloads.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type {
  DashboardOverview,
  AreaDetail,
  AreaOverview,
  Signal,
} from '@/packages/types/fulfillment-dashboard';
import {
  getAllAreas,
  getAreasBySignal,
  getAreasNeedingAttention,
  getThrivingAreas,
  calculateHealthPercentage,
  getAreaById,
  getClusterById,
  countAreasBySignal,
} from '@/packages/types/fulfillment-dashboard';

export class FulfillmentDashboardClient {
  private supabase = createClientComponentClient();

  /**
   * Get complete dashboard overview
   * Returns: clusters → areas → dimensions + signals
   *
   * This is the primary method for rendering the dashboard.
   * Response is cached in materialized views for fast reads.
   */
  async getDashboardOverview(): Promise<DashboardOverview | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_dashboard_overview');

      if (error) {
        console.error('Error fetching dashboard overview:', error);
        return null;
      }

      return data as DashboardOverview;
    } catch (error) {
      console.error('Unexpected error fetching dashboard:', error);
      return null;
    }
  }

  /**
   * Get specific area detail with relationships
   * Returns: area info + cluster + signals + dimensions + subdimensions + relationships
   */
  async getAreaDetail(areaId: number): Promise<AreaDetail | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_area_detail', {
        p_area_id: areaId,
      });

      if (error) {
        console.error(`Error fetching area ${areaId} detail:`, error);
        return null;
      }

      return data as AreaDetail;
    } catch (error) {
      console.error(`Unexpected error fetching area ${areaId}:`, error);
      return null;
    }
  }

  /**
   * Refresh materialized views
   * Call this after updating scores to refresh dashboard data
   *
   * @param concurrent - Use REFRESH CONCURRENTLY for non-blocking refresh (default: true)
   */
  async refreshMaterializedViews(concurrent: boolean = true): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('refresh_fulfillment_materialized_views', {
        concurrent,
      });

      if (error) {
        console.error('Error refreshing materialized views:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error refreshing views:', error);
      return false;
    }
  }

  /**
   * Refresh and get dashboard in one call
   * Perfect for dashboard refresh button or periodic updates
   */
  async refreshAndGetDashboard(): Promise<DashboardOverview | null> {
    try {
      const { data, error } = await this.supabase.rpc('refresh_and_get_dashboard');

      if (error) {
        console.error('Error refreshing and getting dashboard:', error);
        return null;
      }

      return data as DashboardOverview;
    } catch (error) {
      console.error('Unexpected error refreshing dashboard:', error);
      return null;
    }
  }

  /**
   * Get all areas from dashboard (flattened)
   */
  async getAllAreas(): Promise<AreaOverview[]> {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) return [];
    return getAllAreas(dashboard);
  }

  /**
   * Get areas by signal status
   */
  async getAreasBySignal(
    signal: Signal,
    timeframe: 'daily' | 'weekly' = 'daily'
  ): Promise<AreaOverview[]> {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) return [];
    return getAreasBySignal(dashboard, signal, timeframe);
  }

  /**
   * Get areas needing attention (attention or breakdown)
   */
  async getAreasNeedingAttention(
    timeframe: 'daily' | 'weekly' = 'daily'
  ): Promise<AreaOverview[]> {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) return [];
    return getAreasNeedingAttention(dashboard, timeframe);
  }

  /**
   * Get thriving areas
   */
  async getThrivingAreas(
    timeframe: 'daily' | 'weekly' = 'daily'
  ): Promise<AreaOverview[]> {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) return [];
    return getThrivingAreas(dashboard, timeframe);
  }

  /**
   * Calculate overall health percentage
   */
  async calculateHealthPercentage(
    timeframe: 'daily' | 'weekly' = 'daily'
  ): Promise<number> {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) return 0;
    return calculateHealthPercentage(dashboard, timeframe);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(timeframe: 'daily' | 'weekly' = 'daily'): Promise<{
    total: number;
    thriving: number;
    stable: number;
    attention: number;
    breakdown: number;
    unknown: number;
    healthPercentage: number;
  }> {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) {
      return {
        total: 0,
        thriving: 0,
        stable: 0,
        attention: 0,
        breakdown: 0,
        unknown: 0,
        healthPercentage: 0,
      };
    }

    const counts = countAreasBySignal(dashboard, timeframe);
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const healthPercentage = calculateHealthPercentage(dashboard, timeframe);

    return {
      total,
      ...counts,
      healthPercentage,
    };
  }

  /**
   * Search areas by name
   */
  async searchAreas(query: string): Promise<AreaOverview[]> {
    const allAreas = await this.getAllAreas();
    const lowercaseQuery = query.toLowerCase();

    return allAreas.filter((area) =>
      area.area_name.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get area by ID (from cached dashboard)
   */
  async getAreaFromDashboard(areaId: number): Promise<AreaOverview | undefined> {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) return undefined;
    return getAreaById(dashboard, areaId);
  }

  /**
   * Get cluster by ID (from cached dashboard)
   */
  async getClusterFromDashboard(clusterId: number) {
    const dashboard = await this.getDashboardOverview();
    if (!dashboard) return undefined;
    return getClusterById(dashboard, clusterId);
  }

  /**
   * Subscribe to dashboard updates (realtime)
   * Note: This requires Supabase realtime to be enabled on score tables
   */
  subscribeToScoreUpdates(
    callback: (payload: any) => void
  ): { unsubscribe: () => void } {
    const channel = this.supabase
      .channel('score_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_scores',
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weekly_scores',
        },
        callback
      )
      .subscribe();

    return {
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
      },
    };
  }
}

// ============================================================
// SINGLETON INSTANCE & CONVENIENCE EXPORTS
// ============================================================

export const fulfillmentDashboardClient = new FulfillmentDashboardClient();

// Convenience functions that use the singleton
export const getDashboardOverview = () =>
  fulfillmentDashboardClient.getDashboardOverview();

export const getAreaDetail = (areaId: number) =>
  fulfillmentDashboardClient.getAreaDetail(areaId);

export const refreshMaterializedViews = (concurrent: boolean = true) =>
  fulfillmentDashboardClient.refreshMaterializedViews(concurrent);

export const refreshAndGetDashboard = () =>
  fulfillmentDashboardClient.refreshAndGetDashboard();

export const getAllAreasFromDashboard = () =>
  fulfillmentDashboardClient.getAllAreas();

export const getAreasBySignalFromDashboard = (
  signal: Signal,
  timeframe: 'daily' | 'weekly' = 'daily'
) => fulfillmentDashboardClient.getAreasBySignal(signal, timeframe);

export const getAreasNeedingAttentionFromDashboard = (
  timeframe: 'daily' | 'weekly' = 'daily'
) => fulfillmentDashboardClient.getAreasNeedingAttention(timeframe);

export const getThrivingAreasFromDashboard = (
  timeframe: 'daily' | 'weekly' = 'daily'
) => fulfillmentDashboardClient.getThrivingAreas(timeframe);

export const calculateDashboardHealthPercentage = (
  timeframe: 'daily' | 'weekly' = 'daily'
) => fulfillmentDashboardClient.calculateHealthPercentage(timeframe);

export const getDashboardStats = (timeframe: 'daily' | 'weekly' = 'daily') =>
  fulfillmentDashboardClient.getDashboardStats(timeframe);

export const searchAreasInDashboard = (query: string) =>
  fulfillmentDashboardClient.searchAreas(query);

export const subscribeToScoreUpdates = (callback: (payload: any) => void) =>
  fulfillmentDashboardClient.subscribeToScoreUpdates(callback);

// ============================================================
// REACT HOOKS (OPTIONAL)
// ============================================================

/**
 * React hook for dashboard overview
 * Usage:
 *   const { dashboard, loading, error, refresh } = useDashboardOverview();
 */
export function useDashboardOverview() {
  const [dashboard, setDashboard] = React.useState<DashboardOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardOverview();
      if (data) {
        setDashboard(data);
      } else {
        setError('Failed to load dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refresh = React.useCallback(async () => {
    const data = await refreshAndGetDashboard();
    if (data) {
      setDashboard(data);
    }
  }, []);

  return { dashboard, loading, error, refresh };
}

/**
 * React hook for area detail
 * Usage:
 *   const { area, loading, error } = useAreaDetail(16);
 */
export function useAreaDetail(areaId: number) {
  const [area, setArea] = React.useState<AreaDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadArea() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAreaDetail(areaId);
        if (mounted) {
          if (data) {
            setArea(data);
          } else {
            setError('Failed to load area');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadArea();

    return () => {
      mounted = false;
    };
  }, [areaId]);

  return { area, loading, error };
}

// Note: Import React for hooks
import * as React from 'react';
