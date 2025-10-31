/**
 * Fulfilment Agent
 * Compute scores & trends (0-5), monthly/quarterly rollups, confidence
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';

export interface ScoreInput {
  entry_signal: number;
  action_completion: number;
  sentiment_mean: number;
}

export interface ScoreResult {
  score: number;
  confidence: number;
  trend: number;
}

export class FulfilmentAgent extends BaseAgent {
  // Weights for score calculation
  private readonly WEIGHT_ENTRY = 0.4;
  private readonly WEIGHT_ACTION = 0.4;
  private readonly WEIGHT_SENTIMENT = 0.2;

  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'FulfilmentAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `FulfilmentAgent handling: ${message.task}`);

    // Handle rollup requests
    if (message.payload.event_type === EventTypes.FULFILMENT_ROLLUP_REQUESTED) {
      await this.onRollupRequested(message.payload);
    }

    // Handle scheduled rollups
    if (message.intent === 'execute' && message.task.includes('rollup')) {
      await this.performRollup(message.payload as { user_id: string; period?: string });
    }
  }

  /**
   * Handle rollup requested event
   */
  private async onRollupRequested(eventPayload: any): Promise<void> {
    const { user_id, trigger } = eventPayload;

    await this.log('info', `Rollup requested for user ${user_id} (trigger: ${trigger})`);

    // In production, this would be debounced (e.g., once per day)
    // For now, trigger immediately
    await this.performRollup({ user_id, period: 'month' });
  }

  /**
   * Perform score rollup
   */
  private async performRollup(payload: { user_id: string; period?: string }): Promise<void> {
    const { user_id, period = 'month' } = payload;
    const currentMonth = new Date().toISOString().split('T')[0];

    await this.log('info', `Performing ${period} rollup for user ${user_id}`);

    // Get all areas for user
    const areas = await this.getUserAreas(user_id);

    for (const area of areas) {
      // Get dimensions for area
      const dimensions = await this.getAreaDimensions(area.id);

      for (const dimension of dimensions) {
        // Aggregate signals
        const signals = await this.aggregateSignals(user_id, area.id, dimension.id, currentMonth);

        // Compute score
        const result = this.computeScore(signals);

        // Write rollup
        await this.writeRollup(user_id, area.id, dimension.id, period, currentMonth, result);
      }
    }

    await this.emitEvent(EventTypes.FULFILMENT_ROLLUP_COMPLETED, {
      user_id,
      period,
      month: currentMonth,
    });

    await this.log('info', `Rollup completed for user ${user_id}`);
  }

  /**
   * Get user areas
   */
  private async getUserAreas(userId: string): Promise<Array<{ id: string; code: string }>> {
    // In production: SELECT id, code FROM fd_areas WHERE user_id = $1 AND active = true
    await this.log('debug', `Fetching areas for user ${userId}`);
    return [
      { id: 'area-1', code: 'WRK' },
      { id: 'area-2', code: 'REL' },
    ];
  }

  /**
   * Get area dimensions
   */
  private async getAreaDimensions(areaId: string): Promise<Array<{ id: string; code: string }>> {
    // In production: SELECT id, code FROM fd_dimensions WHERE area_id = $1 AND active = true
    await this.log('debug', `Fetching dimensions for area ${areaId}`);
    return [
      { id: 'dim-1', code: 'INT' },
      { id: 'dim-2', code: 'FOR' },
    ];
  }

  /**
   * Aggregate signals for a month
   */
  private async aggregateSignals(
    userId: string,
    areaId: string,
    dimensionId: string,
    month: string
  ): Promise<ScoreInput> {
    await this.log('debug', `Aggregating signals for ${areaId}/${dimensionId}`);

    // In production:
    // 1. Get entry signals from fd_entry_links
    // 2. Get action completion rates from fd_actions
    // 3. Get sentiment from fd_entries

    // Mock data
    return {
      entry_signal: 3.5,
      action_completion: 0.7,
      sentiment_mean: 0.6,
    };
  }

  /**
   * Compute score from signals
   * Formula: score = clamp0_5(a*entry_signal + b*action_completion*5 + c*(sentiment+1)*2.5)
   */
  computeScore(signals: ScoreInput): ScoreResult {
    const { entry_signal, action_completion, sentiment_mean } = signals;

    // Convert action completion (0-1) to 0-5 scale
    const actionScore = action_completion * 5;

    // Convert sentiment (-1 to +1) to 0-5 scale
    const sentimentScore = (sentiment_mean + 1) * 2.5;

    // Weighted sum
    const rawScore =
      this.WEIGHT_ENTRY * entry_signal +
      this.WEIGHT_ACTION * actionScore +
      this.WEIGHT_SENTIMENT * sentimentScore;

    // Clamp to 0-5
    const score = Math.max(0, Math.min(5, rawScore));

    // Calculate confidence based on number of observations
    // In production, this would use actual observation count
    const observations = 10; // mock
    const confidence = Math.min(1.0, Math.log(1 + observations) / 3);

    // Calculate trend (EMA comparison)
    // In production, fetch previous period scores
    const trend = 0.05; // +5% mock

    return {
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      trend: Math.round(trend * 100) / 100,
    };
  }

  /**
   * Write rollup to database
   */
  private async writeRollup(
    userId: string,
    areaId: string,
    dimensionId: string,
    periodType: string,
    periodStart: string,
    result: ScoreResult
  ): Promise<void> {
    await this.log('debug', 'Writing rollup', {
      userId,
      areaId,
      dimensionId,
      score: result.score,
    });

    // In production: INSERT INTO fd_score_rollups ON CONFLICT UPDATE
    // Also write to fd_score_raw for historical tracking
  }

  /**
   * Scheduled monthly rollup (cron job)
   * Runs at 02:00 America/Toronto
   */
  async scheduledMonthlyRollup(): Promise<void> {
    await this.log('info', 'Running scheduled monthly rollup');

    // In production: Get all active users and process rollups
    const activeUsers = await this.getActiveUsers();

    for (const userId of activeUsers) {
      await this.performRollup({ user_id: userId, period: 'month' });
    }
  }

  /**
   * Get active users
   */
  private async getActiveUsers(): Promise<string[]> {
    // In production: SELECT DISTINCT user_id FROM fd_entries WHERE created_at > NOW() - INTERVAL '30 days'
    return [];
  }
}
