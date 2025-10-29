/**
 * Analytics Agent
 * KPI tracking: Activation, Retention, Outcome, Integrity
 * PostHog/LogSnag integration, dashboard metrics
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';

export interface KPI {
  name: string;
  value: number;
  target: number;
  achieved: boolean;
  period: string;
}

export interface ActivationMetrics {
  userId: string;
  signupDate: string;
  areasScored: number;
  firstEntryDate?: string;
  firstCommitmentDate?: string;
  daysToActivation: number;
  activated: boolean; // ≥3 areas scored in 48h
}

export interface RetentionMetrics {
  userId: string;
  consecutiveMonthlyReviews: number;
  lastReviewDate?: string;
  retained: boolean; // 3+ consecutive monthly reviews
  churnRisk: 'low' | 'medium' | 'high';
}

export interface OutcomeMetrics {
  userId: string;
  initialGFS: number;
  currentGFS: number;
  gfsChange: number;
  daysTracked: number;
  outcomeAchieved: boolean; // +10 GFS in 90 days
}

export interface IntegrityMetrics {
  userId: string;
  openIntegrityIssues: number;
  weeksBelowThreshold: number; // weeks with <3 open issues
  totalWeeks: number;
  integrityScore: number; // percentage
  healthy: boolean; // <3 issues for 80% of weeks
}

export class AnalyticsAgent extends BaseAgent {
  // KPI Thresholds
  private readonly ACTIVATION_THRESHOLD = {
    AREAS_SCORED: 3,
    HOURS: 48,
  };

  private readonly RETENTION_THRESHOLD = {
    CONSECUTIVE_REVIEWS: 3,
  };

  private readonly OUTCOME_THRESHOLD = {
    GFS_INCREASE: 10,
    DAYS: 90,
  };

  private readonly INTEGRITY_THRESHOLD = {
    MAX_OPEN_ISSUES: 3,
    PERCENTAGE_WEEKS: 0.8,
  };

  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'AnalyticsAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `AnalyticsAgent handling: ${message.task}`);

    // Track events
    if (message.intent === 'execute' && message.task.includes('track_event')) {
      await this.trackEvent(message.payload as { event: string; userId: string; properties?: Record<string, any> });
    }

    // Calculate KPIs
    if (message.intent === 'execute' && message.task.includes('calculate_kpis')) {
      await this.calculateKPIs(message.payload as { userId: string });
    }

    // Listen for significant events to track
    await this.handleEventTracking(message);
  }

  /**
   * Handle event tracking for analytics
   */
  private async handleEventTracking(message: MessageEnvelope): Promise<void> {
    const eventType = message.payload.event_type;

    if (!eventType) return;

    switch (eventType) {
      case EventTypes.JOURNAL_ENTRY_CREATED:
        await this.trackEvent({
          event: 'journal_entry_created',
          userId: message.payload.user_id,
          properties: { entry_id: message.payload.entry_id },
        });
        break;

      case EventTypes.AREA_SPAWNED:
        await this.trackEvent({
          event: 'area_spawned',
          userId: message.payload.user_id,
          properties: { area_id: message.payload.area_id, commitment_id: message.payload.commitment_id },
        });
        break;

      case EventTypes.FULFILMENT_ROLLUP_COMPLETED:
        await this.trackEvent({
          event: 'monthly_review_completed',
          userId: message.payload.user_id,
          properties: { period: message.payload.period },
        });
        break;

      case EventTypes.INTEGRITY_ISSUE_RAISED:
        await this.trackEvent({
          event: 'integrity_issue_raised',
          userId: message.payload.user_id,
          properties: { issue_id: message.payload.issue_id, type: message.payload.type },
        });
        break;
    }
  }

  /**
   * Track event (PostHog, LogSnag, etc.)
   */
  async trackEvent(payload: { event: string; userId: string; properties?: Record<string, any> }): Promise<void> {
    const { event, userId, properties } = payload;

    await this.log('info', `Tracking event: ${event} for user ${userId}`, { properties });

    // In production: Send to PostHog
    await this.sendToPostHog({
      distinct_id: userId,
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'wisdomos',
        version: this.getVersion(),
      },
    });

    // Also log to LogSnag for important events
    if (this.isImportantEvent(event)) {
      await this.sendToLogSnag({
        project: 'wisdomos',
        channel: 'user-activity',
        event,
        description: `User ${userId}: ${event}`,
        icon: this.getEventIcon(event),
        notify: false,
      });
    }
  }

  /**
   * Calculate all KPIs for a user
   */
  async calculateKPIs(payload: { userId: string }): Promise<{
    activation: ActivationMetrics;
    retention: RetentionMetrics;
    outcome: OutcomeMetrics;
    integrity: IntegrityMetrics;
  }> {
    const { userId } = payload;

    await this.log('info', `Calculating KPIs for user ${userId}`);

    const [activation, retention, outcome, integrity] = await Promise.all([
      this.calculateActivation(userId),
      this.calculateRetention(userId),
      this.calculateOutcome(userId),
      this.calculateIntegrity(userId),
    ]);

    // Track KPI dashboard view
    await this.trackEvent({
      event: 'kpi_dashboard_viewed',
      userId,
      properties: {
        activation: activation.activated,
        retention: retention.retained,
        outcome: outcome.outcomeAchieved,
        integrity: integrity.healthy,
      },
    });

    return { activation, retention, outcome, integrity };
  }

  /**
   * Calculate Activation KPI
   * Target: ≥3 Areas scored in 48h
   */
  async calculateActivation(userId: string): Promise<ActivationMetrics> {
    await this.log('debug', `Calculating activation for user ${userId}`);

    // Get user signup date
    const user = await this.getUser(userId);
    const signupDate = user.created_at;

    // Get areas with scores
    const areasWithScores = await this.getAreasWithScores(userId);
    const areasScored = areasWithScores.length;

    // Get first entry date
    const firstEntry = await this.getFirstEntry(userId);
    const firstEntryDate = firstEntry?.created_at;

    // Get first commitment date
    const firstCommitment = await this.getFirstCommitment(userId);
    const firstCommitmentDate = firstCommitment?.created_at;

    // Calculate time to activation
    const signupTime = new Date(signupDate).getTime();
    let activationTime = signupTime;

    if (areasScored >= this.ACTIVATION_THRESHOLD.AREAS_SCORED) {
      // Find when 3rd area was scored
      const thirdAreaScoreDate = areasWithScores[2]?.first_score_date;
      if (thirdAreaScoreDate) {
        activationTime = new Date(thirdAreaScoreDate).getTime();
      }
    }

    const daysToActivation = Math.floor((activationTime - signupTime) / (1000 * 60 * 60 * 24));
    const hoursToActivation = (activationTime - signupTime) / (1000 * 60 * 60);

    const activated =
      areasScored >= this.ACTIVATION_THRESHOLD.AREAS_SCORED &&
      hoursToActivation <= this.ACTIVATION_THRESHOLD.HOURS;

    const metrics: ActivationMetrics = {
      userId,
      signupDate,
      areasScored,
      firstEntryDate,
      firstCommitmentDate,
      daysToActivation,
      activated,
    };

    // Track activation milestone
    if (activated) {
      await this.trackEvent({
        event: 'user_activated',
        userId,
        properties: {
          days_to_activation: daysToActivation,
          areas_scored: areasScored,
        },
      });
    }

    return metrics;
  }

  /**
   * Calculate Retention KPI
   * Target: 3 consecutive monthly reviews
   */
  async calculateRetention(userId: string): Promise<RetentionMetrics> {
    await this.log('debug', `Calculating retention for user ${userId}`);

    // Get monthly reviews (rollup completed events)
    const reviews = await this.getMonthlyReviews(userId);

    // Find consecutive streak
    let consecutiveMonthlyReviews = 0;
    let lastReviewDate: string | undefined;

    if (reviews.length > 0) {
      lastReviewDate = reviews[0].created_at;
      consecutiveMonthlyReviews = this.calculateConsecutiveStreak(reviews);
    }

    const retained = consecutiveMonthlyReviews >= this.RETENTION_THRESHOLD.CONSECUTIVE_REVIEWS;

    // Calculate churn risk
    let churnRisk: 'low' | 'medium' | 'high' = 'low';

    if (!lastReviewDate) {
      churnRisk = 'high';
    } else {
      const daysSinceLastReview = this.daysSince(lastReviewDate);
      if (daysSinceLastReview > 60) churnRisk = 'high';
      else if (daysSinceLastReview > 35) churnRisk = 'medium';
    }

    const metrics: RetentionMetrics = {
      userId,
      consecutiveMonthlyReviews,
      lastReviewDate,
      retained,
      churnRisk,
    };

    // Track retention milestone
    if (retained && consecutiveMonthlyReviews === this.RETENTION_THRESHOLD.CONSECUTIVE_REVIEWS) {
      await this.trackEvent({
        event: 'user_retained',
        userId,
        properties: {
          consecutive_reviews: consecutiveMonthlyReviews,
        },
      });
    }

    return metrics;
  }

  /**
   * Calculate Outcome KPI
   * Target: +10 GFS in 90 days
   */
  async calculateOutcome(userId: string): Promise<OutcomeMetrics> {
    await this.log('debug', `Calculating outcome for user ${userId}`);

    // Get first GFS score
    const firstScore = await this.getFirstGFSScore(userId);
    const initialGFS = firstScore?.score || 0;
    const startDate = firstScore?.created_at;

    // Get current GFS score
    const currentScore = await this.getCurrentGFSScore(userId);
    const currentGFS = currentScore?.score || 0;

    const gfsChange = currentGFS - initialGFS;

    // Calculate days tracked
    const daysTracked = startDate ? this.daysSince(startDate) : 0;

    // Check if outcome achieved
    const outcomeAchieved = gfsChange >= this.OUTCOME_THRESHOLD.GFS_INCREASE && daysTracked <= this.OUTCOME_THRESHOLD.DAYS;

    const metrics: OutcomeMetrics = {
      userId,
      initialGFS,
      currentGFS,
      gfsChange,
      daysTracked,
      outcomeAchieved,
    };

    // Track outcome milestone
    if (outcomeAchieved) {
      await this.trackEvent({
        event: 'outcome_achieved',
        userId,
        properties: {
          gfs_change: gfsChange,
          days_tracked: daysTracked,
        },
      });
    }

    return metrics;
  }

  /**
   * Calculate Integrity KPI
   * Target: <3 open issues for 80% of weeks
   */
  async calculateIntegrity(userId: string): Promise<IntegrityMetrics> {
    await this.log('debug', `Calculating integrity for user ${userId}`);

    // Get current open integrity issues
    const openIssues = await this.getOpenIntegrityIssues(userId);
    const openIntegrityIssues = openIssues.length;

    // Get weekly integrity data
    const weeklyData = await this.getWeeklyIntegrityData(userId);

    const totalWeeks = weeklyData.length;
    const weeksBelowThreshold = weeklyData.filter(
      (week) => week.open_issues < this.INTEGRITY_THRESHOLD.MAX_OPEN_ISSUES
    ).length;

    const integrityScore = totalWeeks > 0 ? (weeksBelowThreshold / totalWeeks) * 100 : 100;

    const healthy = integrityScore >= this.INTEGRITY_THRESHOLD.PERCENTAGE_WEEKS * 100;

    const metrics: IntegrityMetrics = {
      userId,
      openIntegrityIssues,
      weeksBelowThreshold,
      totalWeeks,
      integrityScore,
      healthy,
    };

    return metrics;
  }

  // Helper methods

  private calculateConsecutiveStreak(reviews: any[]): number {
    if (reviews.length === 0) return 0;

    let streak = 1;
    for (let i = 1; i < reviews.length; i++) {
      const current = new Date(reviews[i].period);
      const previous = new Date(reviews[i - 1].period);

      // Check if consecutive months
      const monthsDiff = (current.getFullYear() - previous.getFullYear()) * 12 + (current.getMonth() - previous.getMonth());

      if (Math.abs(monthsDiff) === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private daysSince(dateString: string): number {
    const then = new Date(dateString).getTime();
    const now = Date.now();
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
  }

  private isImportantEvent(event: string): boolean {
    const importantEvents = [
      'user_activated',
      'user_retained',
      'outcome_achieved',
      'area_spawned',
      'integrity_issue_raised',
    ];
    return importantEvents.includes(event);
  }

  private getEventIcon(event: string): string {
    const icons: Record<string, string> = {
      user_activated: '🎉',
      user_retained: '🏆',
      outcome_achieved: '📈',
      area_spawned: '✨',
      integrity_issue_raised: '⚠️',
    };
    return icons[event] || '📊';
  }

  // Database helper methods (stubs)

  private async sendToPostHog(data: any): Promise<void> {
    await this.log('debug', 'Sending to PostHog', { data });
    // In production: POST to PostHog API
  }

  private async sendToLogSnag(data: any): Promise<void> {
    await this.log('debug', 'Sending to LogSnag', { data });
    // In production: POST to LogSnag API
  }

  private async getUser(userId: string): Promise<any> {
    return { id: userId, created_at: new Date().toISOString() };
  }

  private async getAreasWithScores(userId: string): Promise<any[]> {
    return [];
  }

  private async getFirstEntry(userId: string): Promise<any> {
    return null;
  }

  private async getFirstCommitment(userId: string): Promise<any> {
    return null;
  }

  private async getMonthlyReviews(userId: string): Promise<any[]> {
    return [];
  }

  private async getFirstGFSScore(userId: string): Promise<any> {
    return null;
  }

  private async getCurrentGFSScore(userId: string): Promise<any> {
    return null;
  }

  private async getOpenIntegrityIssues(userId: string): Promise<any[]> {
    return [];
  }

  private async getWeeklyIntegrityData(userId: string): Promise<any[]> {
    return [];
  }
}
