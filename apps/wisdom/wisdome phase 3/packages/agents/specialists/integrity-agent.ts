/**
 * WisdomOS IntegrityAgent — Promise Tracking & Accountability
 *
 * Purpose: Compare commitments vs. actions, detect broken promises,
 * track integrity issues, support forgiveness workflow.
 *
 * @module IntegrityAgent
 * @version 1.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BaseAgent,
  AgentType,
  MessageEnvelope,
  EventType,
  LogLevel,
  IntegrityCheckRequest,
  IntegrityCheckResult,
} from '../types';

export class IntegrityAgent extends BaseAgent {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super({
      name: AgentType.INTEGRITY,
      version: 'v1.0',
      rate_limit_per_min: 20,
      max_concurrent: 2,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute integrity check for period
   */
  async execute(
    message: MessageEnvelope<IntegrityCheckRequest>
  ): Promise<IntegrityCheckResult> {
    const { user_id, period_start, period_end } = message.payload;

    try {
      await this.log(
        LogLevel.INFO,
        `Checking integrity for period ${period_start} to ${period_end}`,
        {
          message_id: message.message_id,
          user_id,
        }
      );

      // Step 1: Get all active commitments in period
      const commitments = await this.getCommitments(
        user_id,
        period_start,
        period_end
      );

      // Step 2: Check each commitment for integrity issues
      const issues: Array<{
        id: string;
        area_code: string;
        issue: string;
        severity: 'low' | 'medium' | 'high';
      }> = [];

      for (const commitment of commitments) {
        const issue = await this.checkCommitmentIntegrity(commitment);
        if (issue) {
          issues.push(issue);
        }
      }

      // Step 3: Save new issues to integrity log
      let issuesRaised = 0;
      for (const issue of issues) {
        await this.saveIntegrityIssue(user_id, issue);
        issuesRaised++;

        // Emit event
        await this.emit(EventType.INTEGRITY_ISSUE_RAISED, {
          user_id,
          issue_id: issue.id,
          area_code: issue.area_code,
          severity: issue.severity,
        });
      }

      // Step 4: Check for resolved issues
      const issuesResolved = await this.checkResolvedIssues(
        user_id,
        period_start,
        period_end
      );

      // Step 5: Get all open issues
      const openIssues = await this.getOpenIssues(user_id);

      await this.log(
        LogLevel.INFO,
        `Integrity check complete: ${issuesRaised} raised, ${issuesResolved} resolved`,
        {
          user_id,
          raised: issuesRaised,
          resolved: issuesResolved,
        }
      );

      return {
        issues_raised: issuesRaised,
        issues_resolved: issuesResolved,
        open_issues: openIssues,
      };
    } catch (error) {
      await this.log(
        LogLevel.ERROR,
        `Integrity check failed: ${error.message}`,
        {
          message_id: message.message_id,
          error: error.message,
        }
      );
      throw error;
    }
  }

  /**
   * Get commitments for period
   */
  private async getCommitments(
    userId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('fd_commitment')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('detected_at', periodStart)
      .lte('detected_at', periodEnd);

    if (error) throw error;
    return data || [];
  }

  /**
   * Check commitment for integrity issues
   */
  private async checkCommitmentIntegrity(
    commitment: any
  ): Promise<{
    id: string;
    area_code: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  } | null> {
    // Get linked area
    const { data: links } = await this.supabase
      .from('fd_commitment_link')
      .select('area_id')
      .eq('commitment_id', commitment.id)
      .limit(1);

    if (!links || links.length === 0) {
      return null; // No area linked yet
    }

    const areaId = links[0].area_id;

    // Get area info
    const { data: area } = await this.supabase
      .from('fd_area')
      .select('code, name')
      .eq('id', areaId)
      .single();

    if (!area) return null;

    // Check 1: Has there been any activity?
    const daysSinceDetection = this.daysSince(commitment.detected_at);
    const hasActivity = await this.hasRecentActivity(commitment.user_id, areaId);

    if (daysSinceDetection > 30 && !hasActivity) {
      return {
        id: `INT_${commitment.id.substring(0, 8)}`,
        area_code: area.code,
        issue: `No activity on commitment "${commitment.summary || commitment.statement.substring(0, 50)}" for ${daysSinceDetection} days`,
        severity: daysSinceDetection > 90 ? 'high' : 'medium',
      };
    }

    // Check 2: Is progress ratio stalled?
    if (commitment.progress_ratio !== null && commitment.progress_ratio < 0.1 && daysSinceDetection > 60) {
      return {
        id: `INT_${commitment.id.substring(0, 8)}`,
        area_code: area.code,
        issue: `Commitment "${commitment.summary || commitment.statement.substring(0, 50)}" shows minimal progress (${Math.round(commitment.progress_ratio * 100)}%)`,
        severity: 'medium',
      };
    }

    // Check 3: High confidence commitment with no linked actions
    if (commitment.confidence > 0.8) {
      const { count: actionCount } = await this.supabase
        .from('fd_action')
        .select('*', { count: 'exact', head: true })
        .eq('area_id', areaId)
        .eq('user_id', commitment.user_id);

      if (actionCount === 0 && daysSinceDetection > 14) {
        return {
          id: `INT_${commitment.id.substring(0, 8)}`,
          area_code: area.code,
          issue: `High-confidence commitment "${commitment.summary || commitment.statement.substring(0, 50)}" has no follow-up actions`,
          severity: 'low',
        };
      }
    }

    return null;
  }

  /**
   * Check if there's recent activity in area
   */
  private async hasRecentActivity(userId: string, areaId: string): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check for entries
    const { count: entryCount } = await this.supabase
      .from('fd_entry_link')
      .select('*', { count: 'exact', head: true })
      .eq('area_id', areaId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (entryCount && entryCount > 0) return true;

    // Check for actions
    const { count: actionCount } = await this.supabase
      .from('fd_action')
      .select('*', { count: 'exact', head: true })
      .eq('area_id', areaId)
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    return actionCount !== null && actionCount > 0;
  }

  /**
   * Save integrity issue
   */
  private async saveIntegrityIssue(
    userId: string,
    issue: {
      id: string;
      area_code: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }
  ): Promise<void> {
    // Check if this issue already exists
    const { data: existing } = await this.supabase
      .from('fd_integrity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('issue_description', issue.issue)
      .eq('status', 'open')
      .single();

    if (existing) return; // Already logged

    await this.supabase.from('fd_integrity_log').insert({
      user_id: userId,
      issue_type: 'commitment_gap',
      issue_description: issue.issue,
      severity: issue.severity,
      status: 'open',
      raised_at: new Date().toISOString(),
    });
  }

  /**
   * Check for resolved issues
   */
  private async checkResolvedIssues(
    userId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<number> {
    // Get open issues
    const { data: openIssues } = await this.supabase
      .from('fd_integrity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open');

    if (!openIssues || openIssues.length === 0) return 0;

    let resolved = 0;

    for (const issue of openIssues) {
      // Check if issue is resolved (has recent activity)
      const isResolved = await this.isIssueResolved(issue);

      if (isResolved) {
        await this.supabase
          .from('fd_integrity_log')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('id', issue.id);

        // Emit event
        await this.emit(EventType.INTEGRITY_ISSUE_RESOLVED, {
          user_id: userId,
          issue_id: issue.id,
        });

        resolved++;
      }
    }

    return resolved;
  }

  /**
   * Check if issue is resolved
   */
  private async isIssueResolved(issue: any): Promise<boolean> {
    // Simple heuristic: if raised more than 7 days ago and has recent activity
    const daysSinceRaised = this.daysSince(issue.raised_at);

    if (daysSinceRaised < 7) return false; // Too soon to resolve

    // Check for recent activity
    // TODO: Implement proper resolution logic based on issue type
    return false;
  }

  /**
   * Get all open issues
   */
  private async getOpenIssues(
    userId: string
  ): Promise<
    Array<{
      id: string;
      area_code: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }>
  > {
    const { data, error } = await this.supabase
      .from('fd_integrity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('severity', { ascending: false })
      .order('raised_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((issue) => ({
      id: issue.id,
      area_code: issue.area_code || 'UNKNOWN',
      issue: issue.issue_description,
      severity: issue.severity,
    }));
  }

  /**
   * Calculate days since date
   */
  private daysSince(date: string): number {
    const then = new Date(date);
    const now = new Date();
    const diff = now.getTime() - then.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
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

export default IntegrityAgent;
