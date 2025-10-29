/**
 * Fulfillment Display v5 — TypeScript Types & Interfaces
 *
 * Complete type definitions for FD-v5 data model
 * Auto-generated from database schema
 */

// =====================================================
// ENUMS
// =====================================================

export enum FDActionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum FDScoreSource {
  MANUAL = 'manual',
  AI = 'ai',
  COMPUTED = 'computed',
}

export enum FDForgivenessAct {
  REFLECTION = 'reflection',
  LETTER = 'letter',
  CONVERSATION = 'conversation',
  AMENDS = 'amends',
  RELEASE = 'release',
}

export enum FDChapterStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  PUBLISHED = 'published',
}

export enum FDIntegritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// =====================================================
// CORE MODELS
// =====================================================

export interface FDArea {
  id: string;
  code: string; // 'WRK', 'PUR', 'MUS', etc.
  name: string;
  emoji: string;
  color: string; // Hex color
  weight_default: number; // 0-1
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FDDimension {
  id: string;
  area_id: string;
  code: string; // 'OPS_THROUGHPUT', 'QUALITY', etc.
  name: string;
  weight_default: number; // 0-1
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FDEntry {
  id: string;
  user_id: string;
  tenant_id: string;
  date: string; // ISO date
  content_md: string;
  sentiment?: number; // -1 to 1
  ai_summary?: string;
  lang: string; // 'en', 'es', etc.
  sources: string[]; // Array of source URLs/references
  created_at: string;
  updated_at: string;
}

export interface FDEntryLink {
  id: string;
  entry_id: string;
  area_id: string;
  dimension_id?: string;
  strength: number; // 0-1 relevance weight
  created_at: string;
}

export interface FDAction {
  id: string;
  user_id: string;
  tenant_id: string;
  area_id: string;
  dimension_id?: string;
  title: string;
  description?: string;
  status: FDActionStatus;
  due_date?: string; // ISO date
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FDScoreRaw {
  id: string;
  user_id: string;
  tenant_id: string;
  area_id: string;
  dimension_id?: string;
  period: string; // 'YYYY-MM' or 'YYYY-QQ'
  score: number; // 0-5
  source: FDScoreSource;
  provenance?: string; // Who/what created this
  created_at: string;
  updated_at: string;
}

export interface FDScoreRollup {
  id: string;
  user_id: string;
  tenant_id: string;
  area_id: string;
  period: string; // 'YYYY-MM' or 'YYYY-QQ'
  score: number; // 0-5
  confidence: number; // 0-1
  trend_7d?: number; // Delta from 7 days ago
  trend_30d?: number; // Delta from 30 days ago
  trend_90d?: number; // Delta from 90 days ago
  created_at: string;
  updated_at: string;
}

export interface FDReviewMonth {
  id: string;
  user_id: string;
  tenant_id: string;
  month: string; // 'YYYY-MM'
  report_json: FDMonthlyReport;
  gfs: number; // Global Fulfillment Score 0-100
  confidence: number; // 0-1
  notes_md?: string;
  created_at: string;
  updated_at: string;
}

export interface FDReviewQuarter {
  id: string;
  user_id: string;
  tenant_id: string;
  quarter: string; // 'YYYY-Q1', 'YYYY-Q2', etc.
  report_json: FDQuarterlyReport;
  gfs: number; // Global Fulfillment Score 0-100
  confidence: number; // 0-1
  reweights_json?: FDAreaWeight[];
  notes_md?: string;
  created_at: string;
  updated_at: string;
}

export interface FDIntegrityLog {
  id: string;
  user_id: string;
  tenant_id: string;
  area_id: string;
  entry_id?: string;
  issue: string;
  severity: FDIntegritySeverity;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FDForgivenessLog {
  id: string;
  user_id: string;
  tenant_id: string;
  area_id: string;
  entry_id?: string;
  act_type: FDForgivenessAct;
  description: string;
  completed_at?: string;
  emotional_relief?: number; // 0-1
  created_at: string;
  updated_at: string;
}

export interface FDAutobiographyChapter {
  id: string;
  user_id: string;
  tenant_id: string;
  title: string;
  subtitle?: string;
  chapter_number?: number;
  status: FDChapterStatus;
  content_md?: string;
  coherence_score?: number; // 0-1
  date_range_start?: string; // ISO date
  date_range_end?: string; // ISO date
  created_at: string;
  updated_at: string;
}

export interface FDAutobiographyLink {
  id: string;
  chapter_id: string;
  entry_id: string;
  weight: number; // 0-1 relevance
  created_at: string;
}

export interface FDUserAreaWeight {
  id: string;
  user_id: string;
  area_id: string;
  weight: number; // 0-1
  effective_from: string; // ISO date
  notes?: string;
  created_at: string;
}

// =====================================================
// REPORT STRUCTURES
// =====================================================

export interface FDMonthlyReport {
  period: string; // 'YYYY-MM'
  gfs: number; // 0-100
  confidence: number; // 0-1
  areas: FDAreaScore[];
  profitability?: FDProfitabilityBoard;
  integrity_open: number;
  forgiveness_acts: number;
  generated_at: string;
}

export interface FDQuarterlyReport {
  quarter: string; // 'YYYY-Q1'
  gfs: number; // 0-100
  confidence: number; // 0-1
  months: FDMonthlyReport[];
  area_summary: FDAreaQuarterlySummary[];
  reweights?: FDAreaWeight[];
  okrs?: FDQuarterlyOKR[];
  generated_at: string;
}

export interface FDAreaScore {
  code: string;
  name: string;
  emoji: string;
  score: number; // 0-5
  weight: number; // 0-1
  trend_30d?: number;
  confidence: number; // 0-1
  dimensions?: FDDimensionScore[];
}

export interface FDDimensionScore {
  code: string;
  name: string;
  score: number; // 0-5
  trend_7d?: number;
}

export interface FDAreaQuarterlySummary {
  area: FDAreaScore;
  monthly_scores: number[]; // 3 months
  avg_score: number;
  trend: 'up' | 'down' | 'stable';
  highlights: string[];
  concerns: string[];
}

export interface FDAreaWeight {
  code: string;
  weight: number; // 0-1
  rationale?: string;
}

export interface FDQuarterlyOKR {
  area_code: string;
  objective: string;
  key_results: string[];
  target_score: number; // 0-5
}

// =====================================================
// PROFITABILITY & CONTRIBUTION BOARD
// =====================================================

export interface FDProfitabilityBoard {
  period: string; // 'YYYY-MM' or 'YYYY-QQ'
  work_streams: FDWorkStream[];
  total_revenue: number;
  total_costs: number;
  net_profit: number;
  profit_ratio: number; // (Rev-Costs)/Time
  contribution_notes: string;
  next_bets: string[];
}

export interface FDWorkStream {
  code: string; // 'WRK', 'MUS', 'WRT', 'SPE'
  name: string;
  revenue: number;
  costs: number;
  profit: number;
  profit_ratio: number;
  time_invested_hours: number;
  notes: string;
}

// =====================================================
// INTERPRETATION KEY
// =====================================================

export interface FDScoreInterpretation {
  score: number; // 0-5
  status: 'critical' | 'friction' | 'healthy' | 'excellent';
  icon: string;
  message: string;
  action_prompt: string;
}

export const FD_INTERPRETATION_KEY: FDScoreInterpretation[] = [
  {
    score: 0,
    status: 'critical',
    icon: '🚨',
    message: 'Critical gap',
    action_prompt: 'Pick 1 micro-action',
  },
  {
    score: 1,
    status: 'critical',
    icon: '🚨',
    message: 'Critical gap',
    action_prompt: 'Pick 1 micro-action',
  },
  {
    score: 2,
    status: 'friction',
    icon: '⚠️',
    message: 'Friction',
    action_prompt: 'Schedule a weekly ritual',
  },
  {
    score: 3,
    status: 'friction',
    icon: '⚠️',
    message: 'Friction',
    action_prompt: 'Schedule a weekly ritual',
  },
  {
    score: 4,
    status: 'healthy',
    icon: '✅',
    message: 'Healthy',
    action_prompt: 'Maintain cadence',
  },
  {
    score: 5,
    status: 'excellent',
    icon: '🟢',
    message: 'Excellent',
    action_prompt: 'Consider mentoring/teaching-back',
  },
];

// Helper function to get interpretation
export function getScoreInterpretation(score: number): FDScoreInterpretation {
  const roundedScore = Math.round(score);
  return FD_INTERPRETATION_KEY[roundedScore] || FD_INTERPRETATION_KEY[0];
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

// GET /fd/areas
export interface FDGetAreasResponse {
  areas: FDArea[];
}

// GET /fd/scores?period=2025-10
export interface FDGetScoresRequest {
  period: string; // 'YYYY-MM' or 'YYYY-QQ'
  user_id?: string;
}

export interface FDGetScoresResponse {
  period: string;
  gfs: number;
  confidence: number;
  areas: FDAreaScore[];
}

// POST /fd/score
export interface FDUpsertScoreRequest {
  area_code: string;
  dimension_code?: string;
  period: string; // 'YYYY-MM'
  score: number; // 0-5
  source?: FDScoreSource;
  provenance?: string;
}

export interface FDUpsertScoreResponse {
  score: FDScoreRaw;
  message: string;
}

// POST /fd/entry
export interface FDCreateEntryRequest {
  content: string;
  date?: string; // ISO date, defaults to today
  tags: Array<{
    area_code: string;
    dimension_code?: string;
    strength?: number; // 0-1
  }>;
  lang?: string;
  sources?: string[];
}

export interface FDCreateEntryResponse {
  entry: FDEntry;
  links: FDEntryLink[];
  ai_summary?: string;
  proposed_scores?: FDProposedScore[];
}

// POST /fd/review/month
export interface FDGenerateMonthlyReviewRequest {
  month: string; // 'YYYY-MM'
  user_id?: string;
}

export interface FDGenerateMonthlyReviewResponse {
  review: FDReviewMonth;
  pdf_url?: string;
  html: string;
}

// POST /fd/review/quarter
export interface FDGenerateQuarterlyReviewRequest {
  quarter: string; // 'YYYY-Q1'
  reweights?: FDAreaWeight[];
  okrs?: FDQuarterlyOKR[];
}

export interface FDGenerateQuarterlyReviewResponse {
  review: FDReviewQuarter;
  pdf_url?: string;
  html: string;
}

// GET /fd/profitability
export interface FDGetProfitabilityRequest {
  period: string; // 'YYYY-MM' or 'YYYY-QQ'
  period_type: 'month' | 'quarter';
}

export interface FDGetProfitabilityResponse {
  board: FDProfitabilityBoard;
}

// =====================================================
// AGENT INTERFACES
// =====================================================

export interface FDAgentProposedUpdate {
  type: 'score' | 'link' | 'action' | 'integrity' | 'forgiveness';
  data: any;
  confidence: number; // 0-1
  rationale: string;
}

export interface FDAgentResponse {
  proposed_updates: FDAgentProposedUpdate[];
  rationale: string;
  provenance: string; // Agent name/version
}

export interface FDProposedScore {
  area_code: string;
  dimension_code?: string;
  score: number; // 0-5
  confidence: number; // 0-1
  rationale: string;
}

// =====================================================
// UI COMPONENT PROPS
// =====================================================

export interface FDDashboardProps {
  user_id: string;
  period?: string; // Default: current month
}

export interface FDAreaDetailProps {
  area_code: string;
  user_id: string;
  period?: string;
}

export interface FDMonthlyReviewProps {
  month: string;
  user_id: string;
}

export interface FDQuarterlyReviewProps {
  quarter: string;
  user_id: string;
}

export interface FDProfitabilityBoardProps {
  period: string;
  period_type: 'month' | 'quarter';
  user_id: string;
}

export interface FDScoreRadarProps {
  area: FDAreaScore;
  show_dimensions?: boolean;
}

export interface FDInterpretationKeyProps {
  variant?: 'compact' | 'full';
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type FDPeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface FDDateRange {
  start: string; // ISO date
  end: string; // ISO date
}

export interface FDTrendData {
  period: string;
  value: number;
}

// Helper: Calculate GFS
export function calculateGFS(areaScores: FDAreaScore[]): number {
  const weightedSum = areaScores.reduce((sum, area) => {
    return sum + area.score * area.weight;
  }, 0);
  return Math.round(weightedSum * 20);
}

// Helper: Format period
export function formatPeriod(period: string): string {
  if (period.match(/^\d{4}-\d{2}$/)) {
    // 'YYYY-MM' -> 'January 2025'
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (period.match(/^\d{4}-Q[1-4]$/)) {
    // 'YYYY-Q1' -> 'Q1 2025'
    return period.replace(/(\d{4})-Q(\d)/, 'Q$2 $1');
  }
  return period;
}

// Helper: Get current period
export function getCurrentPeriod(type: 'month' | 'quarter'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (type === 'month') {
    return `${year}-${month.toString().padStart(2, '0')}`;
  } else {
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  FD_INTERPRETATION_KEY,
  getScoreInterpretation,
  calculateGFS,
  formatPeriod,
  getCurrentPeriod,
};
