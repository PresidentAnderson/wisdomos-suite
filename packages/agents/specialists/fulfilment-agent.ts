/**
 * WisdomOS FulfilmentAgent — Score Aggregation & GFS Calculation
 *
 * Purpose: Aggregate entries, actions, sentiment to calculate area scores (0-5),
 * compute Global Fulfillment Score (GFS 0-100), and detect trends.
 *
 * @module FulfilmentAgent
 * @version 1.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BaseAgent,
  AgentType,
  MessageEnvelope,
  EventType,
  LogLevel,
  FulfilmentRollupRequest,
  FulfilmentRollupResult,
} from '../types';

export class FulfilmentAgent extends BaseAgent {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super({
      name: AgentType.FULFILMENT,
      version: 'v1.0',
      rate_limit_per_min: 30,
      max_concurrent: 3,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute fulfillment rollup (monthly or quarterly)
   */
  async execute(
    message: MessageEnvelope<FulfilmentRollupRequest>
  ): Promise<FulfilmentRollupResult> {
    const { user_id, period, period_type } = message.payload;

    try {
      await this.log(
        LogLevel.INFO,
        `Calculating ${period_type} rollup for ${period}`,
        {
          message_id: message.message_id,
          user_id,
          period,
        }
      );

      // Step 1: Get all active areas for user
      const areas = await this.getUserAreas(user_id);

      // Step 2: Calculate scores for each area
      const areaScores = [];
      for (const area of areas) {
        const score = await this.calculateAreaScore(user_id, area.id, period);
        areaScores.push({
          code: area.code,
          name: area.name,
          score: score.score,
          trend_30d: score.trend_30d,
        });
      }

      // Step 3: Calculate Global Fulfillment Score (GFS)
      const gfs = this.calculateGFS(areas, areaScores);

      // Step 4: Calculate overall confidence
      const confidence = this.calculateConfidence(areaScores);

      // Step 5: Save rollup to database
      await this.saveRollup(user_id, period, areaScores, gfs, confidence);

      // Step 6: Emit event
      await this.emit(EventType.FULFILMENT_ROLLUP_COMPLETED, {
        user_id,
        period,
        gfs,
        confidence,
        areas: areaScores.length,
      });

      await this.log(LogLevel.INFO, `Rollup completed: GFS = ${gfs}`, {
        user_id,
        period,
        gfs,
      });

      return {
        period,
        gfs,
        confidence,
        areas: areaScores,
      };
    } catch (error) {
      await this.log(LogLevel.ERROR, `Rollup failed: ${error.message}`, {
        message_id: message.message_id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all active areas for user
   */
  private async getUserAreas(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('fd_area')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`) // User areas + canonical areas
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate area score for period
   */
  private async calculateAreaScore(
    userId: string,
    areaId: string,
    period: string
  ): Promise<{ score: number; trend_30d?: number }> {
    // Get all dimensions for this area
    const { data: dimensions } = await this.supabase
      .from('fd_dimension')
      .select('*')
      .eq('area_id', areaId);

    if (!dimensions || dimensions.length === 0) {
      return { score: 0, trend_30d: 0 };
    }

    // Get raw scores for this period
    const { data: rawScores } = await this.supabase
      .from('fd_score_raw')
      .select('*')
      .eq('user_id', userId)
      .eq('area_id', areaId)
      .gte('score_date', this.getPeriodStart(period))
      .lte('score_date', this.getPeriodEnd(period));

    if (!rawScores || rawScores.length === 0) {
      // No scores yet, calculate from entries
      return await this.calculateScoreFromEntries(userId, areaId, period);
    }

    // Calculate weighted average of dimension scores
    let weightedSum = 0;
    let totalWeight = 0;

    for (const dimension of dimensions) {
      const dimensionScores = rawScores.filter(
        (s) => s.dimension_id === dimension.id
      );

      if (dimensionScores.length > 0) {
        // Average scores for this dimension
        const avg =
          dimensionScores.reduce((sum, s) => sum + s.score, 0) /
          dimensionScores.length;
        weightedSum += avg * dimension.weight_default;
        totalWeight += dimension.weight_default;
      }
    }

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Calculate 30-day trend
    const trend = await this.calculate30DayTrend(userId, areaId);

    return {
      score: Math.round(score * 100) / 100, // Round to 2 decimals
      trend_30d: trend,
    };
  }

  /**
   * Calculate score from journal entries (when no manual scores exist)
   */
  private async calculateScoreFromEntries(
    userId: string,
    areaId: string,
    period: string
  ): Promise<{ score: number; trend_30d?: number }> {
    // Get all entries linked to this area in period
    const { data: entries } = await this.supabase
      .from('fd_entry_link')
      .select('entry_id, strength')
      .eq('area_id', areaId)
      .gte('created_at', this.getPeriodStart(period))
      .lte('created_at', this.getPeriodEnd(period));

    if (!entries || entries.length === 0) {
      return { score: 0, trend_30d: 0 };
    }

    // Heuristic: More entries = higher score
    const entryCount = entries.length;
    const avgStrength =
      entries.reduce((sum, e) => sum + (e.strength || 0.5), 0) / entryCount;

    // Score = base + entry bonus
    let score = 2.0; // Base score

    if (entryCount >= 10) score += 1.5;
    else if (entryCount >= 5) score += 1.0;
    else if (entryCount >= 2) score += 0.5;

    score = Math.min(5, score * avgStrength);

    return {
      score: Math.round(score * 100) / 100,
      trend_30d: 0,
    };
  }

  /**
   * Calculate 30-day trend
   */
  private async calculate30DayTrend(
    userId: string,
    areaId: string
  ): Promise<number> {
    // Get scores from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentScores } = await this.supabase
      .from('fd_score_raw')
      .select('score, score_date')
      .eq('user_id', userId)
      .eq('area_id', areaId)
      .gte('score_date', thirtyDaysAgo.toISOString())
      .order('score_date', { ascending: true });

    if (!recentScores || recentScores.length < 2) {
      return 0;
    }

    // Simple linear trend: (last - first) / days
    const first = recentScores[0].score;
    const last = recentScores[recentScores.length - 1].score;
    return Math.round((last - first) * 100) / 100;
  }

  /**
   * Calculate Global Fulfillment Score (GFS)
   */
  private calculateGFS(
    areas: any[],
    areaScores: Array<{ code: string; score: number }>
  ): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const area of areas) {
      const areaScore = areaScores.find((s) => s.code === area.code);
      if (areaScore) {
        weightedSum += areaScore.score * area.weight_default;
        totalWeight += area.weight_default;
      }
    }

    // GFS = Σ(AreaScore × AreaWeight) × 20
    const gfs = totalWeight > 0 ? (weightedSum / totalWeight) * 20 : 0;
    return Math.round(gfs * 100) / 100;
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(
    areaScores: Array<{ code: string; score: number }>
  ): number {
    // Confidence based on number of scored areas
    const scoredAreas = areaScores.filter((s) => s.score > 0).length;
    const totalAreas = areaScores.length;

    if (totalAreas === 0) return 0.0;

    const coverage = scoredAreas / totalAreas;
    return Math.round(coverage * 100) / 100;
  }

  /**
   * Save rollup to database
   */
  private async saveRollup(
    userId: string,
    period: string,
    areaScores: Array<{ code: string; name: string; score: number; trend_30d?: number }>,
    gfs: number,
    confidence: number
  ): Promise<void> {
    // Get area IDs
    const areaCodes = areaScores.map((s) => s.code);
    const { data: areas } = await this.supabase
      .from('fd_area')
      .select('id, code')
      .in('code', areaCodes);

    if (!areas) return;

    const areaMap = new Map(areas.map((a) => [a.code, a.id]));

    // Insert rollup records
    const rollupRecords = areaScores.map((s) => ({
      user_id: userId,
      area_id: areaMap.get(s.code),
      period,
      score: s.score,
      confidence,
      trend_30d: s.trend_30d || 0,
      calculated_at: new Date().toISOString(),
    }));

    await this.supabase.from('fd_score_rollup').upsert(rollupRecords, {
      onConflict: 'user_id,area_id,period',
    });

    // Update monthly review summary
    await this.supabase
      .from('fd_review_month')
      .upsert(
        {
          user_id: userId,
          period,
          gfs,
          confidence,
          reviewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,period',
        }
      );
  }

  /**
   * Get period start date
   */
  private getPeriodStart(period: string): string {
    if (period.includes('-Q')) {
      // Quarterly: "2025-Q1"
      const [year, quarter] = period.split('-Q');
      const month = (parseInt(quarter) - 1) * 3 + 1;
      return `${year}-${String(month).padStart(2, '0')}-01`;
    } else {
      // Monthly: "2025-10"
      return `${period}-01`;
    }
  }

  /**
   * Get period end date
   */
  private getPeriodEnd(period: string): string {
    if (period.includes('-Q')) {
      // Quarterly
      const [year, quarter] = period.split('-Q');
      const month = parseInt(quarter) * 3;
      const lastDay = new Date(parseInt(year), month, 0).getDate();
      return `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    } else {
      // Monthly
      const [year, month] = period.split('-');
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      return `${year}-${month}-${lastDay}`;
    }
  }

  /**
   * Emit event to event bus
   */
  protected async emit(type: EventType, payload: any): Promise<string> {
    const { data, error } = await this.supabase.rpc('fn_emit_event', {
      p_type: type,
      p_payload: payload,
      p_source: this.config.name,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Log agent activity
   */
  protected async log(
    level: LogLevel,
    message: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    await this.supabase.rpc('fn_log_agent', {
      p_agent: this.config.name,
      p_level: level,
      p_message: message,
      p_context: context,
    });
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default FulfilmentAgent;
