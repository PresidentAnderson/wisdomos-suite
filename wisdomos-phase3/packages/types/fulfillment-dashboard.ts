/**
 * Fulfillment Dashboard API Types
 *
 * Types for the dashboard API functions that return complete JSON payloads
 * from materialized views for fast dashboard rendering.
 */

// ============================================================
// SIGNAL TYPES
// ============================================================

export type Signal = 'thriving' | 'stable' | 'attention' | 'breakdown' | null;

export interface SignalWithDate {
  date: string | null;
  signal: Signal;
}

export interface AreaSignals {
  daily: SignalWithDate;
  weekly: SignalWithDate;
}

// ============================================================
// DIMENSION TYPES
// ============================================================

export interface DimensionSignal {
  dimension_key: string;
  dimension_name: string;
  priority: 1 | 2; // 1=primary, 2=secondary
  daily: SignalWithDate;
  weekly: SignalWithDate;
}

export interface Subdimension {
  name: string;
  position: number;
}

// ============================================================
// RELATIONSHIP TYPES
// ============================================================

export interface Relationship {
  id: number;
  person: string;
  role: string;
  frequency: string;
  priority: number;
  notes: string | null;
  created_at: string;
}

// ============================================================
// CLUSTER TYPES
// ============================================================

export interface ClusterInfo {
  cluster_id: number;
  cluster_name: string;
  cluster_color: string;
}

// ============================================================
// AREA TYPES
// ============================================================

export interface AreaOverview {
  area_id: number;
  area_name: string;
  cluster_id: number;
  cluster_name: string;
  cluster_color: string;
  daily: SignalWithDate;
  weekly: SignalWithDate;
  dimensions: DimensionSignal[];
  subdimensions: Subdimension[];
}

export interface AreaDetail {
  area_id: number;
  area_name: string;
  cluster: ClusterInfo;
  signals: AreaSignals;
  dimensions: DimensionSignal[];
  subdimensions: Subdimension[];
  relationships: Relationship[];
}

// ============================================================
// DASHBOARD OVERVIEW RESPONSE
// ============================================================

export interface ClusterWithAreas {
  cluster_id: number;
  cluster_name: string;
  cluster_color: string;
  areas: AreaOverview[];
}

export interface DashboardOverview {
  version: string;
  clusters: ClusterWithAreas[];
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type SignalColor = {
  thriving: string;
  stable: string;
  attention: string;
  breakdown: string;
  unknown: string;
};

export const SIGNAL_COLORS: SignalColor = {
  thriving: '#10b981',   // green-500
  stable: '#3b82f6',     // blue-500
  attention: '#f59e0b',  // amber-500
  breakdown: '#ef4444',  // red-500
  unknown: '#6b7280',    // gray-500
};

export const SIGNAL_LABELS: Record<Signal | 'unknown', string> = {
  thriving: 'Thriving',
  stable: 'Stable',
  attention: 'Needs Attention',
  breakdown: 'Breakdown',
  null: 'Unknown',
  unknown: 'Unknown',
};

export const SIGNAL_DESCRIPTIONS: Record<Signal | 'unknown', string> = {
  thriving: 'This area is flourishing with high fulfillment and engagement',
  stable: 'This area is functioning well with moderate fulfillment',
  attention: 'This area needs focus and improvement',
  breakdown: 'This area requires immediate attention and intervention',
  null: 'Not enough data to assess this area',
  unknown: 'Not enough data to assess this area',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get color for a signal
 */
export function getSignalColor(signal: Signal): string {
  if (!signal) return SIGNAL_COLORS.unknown;
  return SIGNAL_COLORS[signal];
}

/**
 * Get label for a signal
 */
export function getSignalLabel(signal: Signal): string {
  if (!signal) return SIGNAL_LABELS.unknown;
  return SIGNAL_LABELS[signal];
}

/**
 * Get description for a signal
 */
export function getSignalDescription(signal: Signal): string {
  if (!signal) return SIGNAL_DESCRIPTIONS.unknown;
  return SIGNAL_DESCRIPTIONS[signal];
}

/**
 * Check if a signal indicates a problem (attention or breakdown)
 */
export function isProblematicSignal(signal: Signal): boolean {
  return signal === 'attention' || signal === 'breakdown';
}

/**
 * Check if a signal indicates health (thriving or stable)
 */
export function isHealthySignal(signal: Signal): boolean {
  return signal === 'thriving' || signal === 'stable';
}

/**
 * Get all areas from dashboard overview
 */
export function getAllAreas(dashboard: DashboardOverview): AreaOverview[] {
  return dashboard.clusters.flatMap((cluster) => cluster.areas);
}

/**
 * Get areas by signal status
 */
export function getAreasBySignal(
  dashboard: DashboardOverview,
  signal: Signal,
  timeframe: 'daily' | 'weekly' = 'daily'
): AreaOverview[] {
  return getAllAreas(dashboard).filter(
    (area) => area[timeframe].signal === signal
  );
}

/**
 * Get areas needing attention (attention or breakdown)
 */
export function getAreasNeedingAttention(
  dashboard: DashboardOverview,
  timeframe: 'daily' | 'weekly' = 'daily'
): AreaOverview[] {
  return getAllAreas(dashboard).filter((area) =>
    isProblematicSignal(area[timeframe].signal)
  );
}

/**
 * Get thriving areas
 */
export function getThrivingAreas(
  dashboard: DashboardOverview,
  timeframe: 'daily' | 'weekly' = 'daily'
): AreaOverview[] {
  return getAllAreas(dashboard).filter(
    (area) => area[timeframe].signal === 'thriving'
  );
}

/**
 * Calculate overall health percentage
 */
export function calculateHealthPercentage(
  dashboard: DashboardOverview,
  timeframe: 'daily' | 'weekly' = 'daily'
): number {
  const allAreas = getAllAreas(dashboard);
  const healthyAreas = allAreas.filter((area) =>
    isHealthySignal(area[timeframe].signal)
  );

  if (allAreas.length === 0) return 0;
  return Math.round((healthyAreas.length / allAreas.length) * 100);
}

/**
 * Get area by ID from dashboard
 */
export function getAreaById(
  dashboard: DashboardOverview,
  areaId: number
): AreaOverview | undefined {
  return getAllAreas(dashboard).find((area) => area.area_id === areaId);
}

/**
 * Get cluster by ID from dashboard
 */
export function getClusterById(
  dashboard: DashboardOverview,
  clusterId: number
): ClusterWithAreas | undefined {
  return dashboard.clusters.find((cluster) => cluster.cluster_id === clusterId);
}

/**
 * Get primary dimensions for an area
 */
export function getPrimaryDimensions(area: AreaOverview | AreaDetail): DimensionSignal[] {
  return area.dimensions.filter((dim) => dim.priority === 1);
}

/**
 * Get secondary dimensions for an area
 */
export function getSecondaryDimensions(area: AreaOverview | AreaDetail): DimensionSignal[] {
  return area.dimensions.filter((dim) => dim.priority === 2);
}

/**
 * Format date for display
 */
export function formatSignalDate(dateString: string | null): string {
  if (!dateString) return 'No data';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get signal trend (comparing daily to weekly)
 */
export function getSignalTrend(area: AreaOverview): 'improving' | 'declining' | 'stable' | 'unknown' {
  const { daily, weekly } = area;

  if (!daily.signal || !weekly.signal) return 'unknown';

  const signalRanking = {
    thriving: 4,
    stable: 3,
    attention: 2,
    breakdown: 1,
  };

  const dailyRank = signalRanking[daily.signal];
  const weeklyRank = signalRanking[weekly.signal];

  if (dailyRank > weeklyRank) return 'improving';
  if (dailyRank < weeklyRank) return 'declining';
  return 'stable';
}

/**
 * Get trend icon for display
 */
export function getTrendIcon(area: AreaOverview): '↗' | '↘' | '→' | '?' {
  const trend = getSignalTrend(area);
  switch (trend) {
    case 'improving':
      return '↗';
    case 'declining':
      return '↘';
    case 'stable':
      return '→';
    default:
      return '?';
  }
}

/**
 * Count areas by signal
 */
export function countAreasBySignal(
  dashboard: DashboardOverview,
  timeframe: 'daily' | 'weekly' = 'daily'
): Record<string, number> {
  const allAreas = getAllAreas(dashboard);

  return {
    thriving: allAreas.filter((a) => a[timeframe].signal === 'thriving').length,
    stable: allAreas.filter((a) => a[timeframe].signal === 'stable').length,
    attention: allAreas.filter((a) => a[timeframe].signal === 'attention').length,
    breakdown: allAreas.filter((a) => a[timeframe].signal === 'breakdown').length,
    unknown: allAreas.filter((a) => !a[timeframe].signal).length,
  };
}

// ============================================================
// API RESPONSE TYPES FOR SUPABASE RPC CALLS
// ============================================================

export interface RefreshMaterializedViewsResponse {
  success: boolean;
  message?: string;
}

export interface DashboardApiError {
  error: string;
  details?: string;
}

// ============================================================
// EXPORT ALL TYPES
// ============================================================

export type {
  Signal,
  SignalWithDate,
  AreaSignals,
  DimensionSignal,
  Subdimension,
  Relationship,
  ClusterInfo,
  AreaOverview,
  AreaDetail,
  ClusterWithAreas,
  DashboardOverview,
  SignalColor,
};
