/**
 * Integrity Agent
 * Track promises vs. actions, raise/resolve integrity issues, enforce time-lock edits
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface IntegrityIssue {
  id: string;
  userId: string;
  commitmentId?: string;
  actionId?: string;
  issueType: 'promise_broken' | 'action_missed' | 'inconsistency' | 'resolved';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface TimeLockViolation {
  entryId: string;
  originalDate: string;
  attemptedEditDate: string;
  daysDifference: number;
  allowed: boolean;
  reason?: string;
}

export class IntegrityAgent extends BaseAgent {
  private readonly TIME_LOCK_DAYS = 90; // ±90 days edit window
  private readonly GRACE_PERIOD_DAYS = 7; // 7-day grace period for recent entries

  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'IntegrityAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `IntegrityAgent handling: ${message.task}`);

    // Listen for action completion/failure
    if (message.payload.event_type === 'action.completed' || message.payload.event_type === 'action.failed') {
      await this.onActionEvent(message.payload);
    }

    // Listen for fulfilment rollups (monthly integrity check)
    if (message.payload.event_type === EventTypes.FULFILMENT_ROLLUP_COMPLETED) {
      await this.onMonthlyIntegrityCheck(message.payload);
    }

    // Handle entry edit requests
    if (message.intent === 'validate' && message.task.includes('entry_edit')) {
      await this.validateEntryEdit(message.payload as { entry_id: string; user_id: string; reason?: string });
    }

    // Handle integrity issue resolution
    if (message.intent === 'execute' && message.task.includes('resolve_issue')) {
      await this.resolveIntegrityIssue(message.payload as { issue_id: string; resolution_note: string });
    }
  }

  /**
   * Handle action completion/failure event
   */
  private async onActionEvent(eventPayload: any): Promise<void> {
    const { action_id, user_id, status, commitment_id } = eventPayload;

    await this.log('info', `Processing action event: ${status}`, { action_id });

    if (status === 'failed' || status === 'cancelled') {
      // Check if this action was tied to a commitment
      if (commitment_id) {
        const commitment = await this.getCommitment(commitment_id);

        if (commitment && commitment.status === 'active') {
          // Raise integrity issue
          await this.raiseIntegrityIssue({
            userId: user_id,
            commitmentId: commitment_id,
            actionId: action_id,
            issueType: 'action_missed',
            description: `Action failed for commitment: "${commitment.statement.substring(0, 100)}"`,
            severity: this.calculateSeverity(commitment, eventPayload),
          });
        }
      }
    }
  }

  /**
   * Monthly integrity check (cron-triggered)
   */
  private async onMonthlyIntegrityCheck(eventPayload: any): Promise<void> {
    const { user_id, month } = eventPayload;

    await this.log('info', `Running monthly integrity check for user ${user_id}`);

    // Get all active commitments
    const commitments = await this.getActiveCommitments(user_id);

    for (const commitment of commitments) {
      // Check if actions exist for this commitment
      const actions = await this.getCommitmentActions(commitment.id, month);

      // Check if commitment target date passed
      if (commitment.target_date) {
        const targetDate = new Date(commitment.target_date);
        const now = new Date();

        if (targetDate < now) {
          // Check if commitment was fulfilled
          const fulfilled = await this.isCommitmentFulfilled(commitment.id);

          if (!fulfilled) {
            await this.raiseIntegrityIssue({
              userId: user_id,
              commitmentId: commitment.id,
              issueType: 'promise_broken',
              description: `Commitment target date passed without fulfillment: "${commitment.statement.substring(0, 100)}"`,
              severity: 'high',
            });

            // Update commitment status
            await this.updateCommitmentStatus(commitment.id, 'broken');
          }
        }
      }

      // Check for inconsistencies (e.g., high scores but low action completion)
      const inconsistency = await this.detectInconsistency(commitment.id, month);
      if (inconsistency) {
        await this.raiseIntegrityIssue({
          userId: user_id,
          commitmentId: commitment.id,
          issueType: 'inconsistency',
          description: inconsistency.description,
          severity: 'medium',
        });
      }
    }

    // Calculate integrity score for the month
    const integrityScore = await this.calculateIntegrityScore(user_id, month);

    await this.log('info', `Integrity score for ${user_id}: ${integrityScore}`);

    await this.emitEvent(EventTypes.INTEGRITY_ISSUE_RAISED, {
      user_id,
      month,
      integrity_score: integrityScore,
    });
  }

  /**
   * Validate entry edit request (time-lock enforcement)
   */
  async validateEntryEdit(payload: { entry_id: string; user_id: string; reason?: string }): Promise<TimeLockViolation> {
    const { entry_id, user_id, reason } = payload;

    await this.log('info', `Validating entry edit: ${entry_id}`);

    // Get entry details
    const entry = await this.getEntry(entry_id);

    if (!entry) {
      throw new Error('Entry not found');
    }

    if (entry.user_id !== user_id) {
      throw new Error('Unauthorized');
    }

    // Calculate days difference
    const entryDate = new Date(entry.entry_date);
    const now = new Date();
    const daysDifference = Math.abs(Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Check if within time-lock window
    const allowed = daysDifference <= this.TIME_LOCK_DAYS;

    const violation: TimeLockViolation = {
      entryId: entry_id,
      originalDate: entry.entry_date,
      attemptedEditDate: now.toISOString(),
      daysDifference,
      allowed,
      reason: !allowed ? `Edit attempted ${daysDifference} days after entry date (limit: ${this.TIME_LOCK_DAYS} days)` : undefined,
    };

    if (!allowed && !entry.edit_locked_at) {
      // Log time-lock violation
      await this.logSecurityEvent({
        user_id,
        event_type: 'time_lock_violation',
        entry_id,
        days_difference: daysDifference,
        reason,
      });

      // Lock the entry
      await this.lockEntry(entry_id, reason);
    }

    // Check grace period for recent entries
    if (daysDifference <= this.GRACE_PERIOD_DAYS) {
      violation.allowed = true;
    }

    return violation;
  }

  /**
   * Raise an integrity issue
   */
  private async raiseIntegrityIssue(issue: Omit<IntegrityIssue, 'id' | 'status'>): Promise<string> {
    const issueId = uuidv4();

    const fullIssue: IntegrityIssue = {
      id: issueId,
      ...issue,
      status: 'open',
    };

    await this.log('warn', `Integrity issue raised: ${issue.issueType}`, { issue: fullIssue });

    // In production: INSERT INTO fd_integrity_logs
    await this.saveIntegrityIssue(fullIssue);

    await this.emitEvent(EventTypes.INTEGRITY_ISSUE_RAISED, {
      issue_id: issueId,
      user_id: issue.userId,
      type: issue.issueType,
      severity: issue.severity,
    });

    return issueId;
  }

  /**
   * Resolve an integrity issue
   */
  async resolveIntegrityIssue(payload: { issue_id: string; resolution_note: string }): Promise<void> {
    const { issue_id, resolution_note } = payload;

    await this.log('info', `Resolving integrity issue: ${issue_id}`);

    // In production: UPDATE fd_integrity_logs
    await this.updateIntegrityIssue(issue_id, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNote: resolution_note,
    });

    await this.emitEvent(EventTypes.INTEGRITY_ISSUE_RESOLVED, {
      issue_id,
      resolved_at: new Date().toISOString(),
    });
  }

  /**
   * Calculate severity based on commitment and context
   */
  private calculateSeverity(commitment: any, context: any): 'low' | 'medium' | 'high' {
    // Check commitment confidence
    if (commitment.confidence >= 0.9) return 'high';
    if (commitment.confidence >= 0.75) return 'medium';
    return 'low';
  }

  /**
   * Calculate integrity score (0-100)
   */
  private async calculateIntegrityScore(userId: string, month: string): Promise<number> {
    // Get all integrity issues for the month
    const issues = await this.getIntegrityIssues(userId, month);

    // Get all commitments
    const commitments = await this.getActiveCommitments(userId);

    if (commitments.length === 0) return 100; // No commitments = no integrity issues

    // Calculate score
    const openIssues = issues.filter((i) => i.status === 'open');
    const highSeverityIssues = openIssues.filter((i) => i.severity === 'high').length;
    const mediumSeverityIssues = openIssues.filter((i) => i.severity === 'medium').length;
    const lowSeverityIssues = openIssues.filter((i) => i.severity === 'low').length;

    // Weighted scoring
    const deductions = highSeverityIssues * 20 + mediumSeverityIssues * 10 + lowSeverityIssues * 5;

    const score = Math.max(0, 100 - deductions);

    return score;
  }

  /**
   * Detect inconsistencies between commitments and actions
   */
  private async detectInconsistency(commitmentId: string, month: string): Promise<{ description: string } | null> {
    // In production: Complex analysis of commitment vs actions vs scores
    // Stub for now
    return null;
  }

  /**
   * Check if commitment is fulfilled
   */
  private async isCommitmentFulfilled(commitmentId: string): Promise<boolean> {
    // In production: Check actions, scores, and user validation
    return false; // Stub
  }

  // Database helper methods (stubs - replace with actual DB calls)

  private async getCommitment(commitmentId: string): Promise<any> {
    await this.log('debug', `Fetching commitment ${commitmentId}`);
    return { id: commitmentId, statement: 'Mock commitment', status: 'active', confidence: 0.85 };
  }

  private async getActiveCommitments(userId: string): Promise<any[]> {
    await this.log('debug', `Fetching active commitments for user ${userId}`);
    return [];
  }

  private async getCommitmentActions(commitmentId: string, month: string): Promise<any[]> {
    return [];
  }

  private async getEntry(entryId: string): Promise<any> {
    await this.log('debug', `Fetching entry ${entryId}`);
    return {
      id: entryId,
      user_id: 'user-123',
      entry_date: new Date().toISOString().split('T')[0],
      content: 'Mock content',
    };
  }

  private async saveIntegrityIssue(issue: IntegrityIssue): Promise<void> {
    await this.log('debug', 'Saving integrity issue', { issue });
    // In production: INSERT INTO fd_integrity_logs
  }

  private async updateIntegrityIssue(issueId: string, updates: Partial<IntegrityIssue>): Promise<void> {
    await this.log('debug', 'Updating integrity issue', { issueId, updates });
    // In production: UPDATE fd_integrity_logs
  }

  private async getIntegrityIssues(userId: string, month: string): Promise<IntegrityIssue[]> {
    return [];
  }

  private async updateCommitmentStatus(commitmentId: string, status: string): Promise<void> {
    await this.log('debug', `Updating commitment ${commitmentId} status to ${status}`);
    // In production: UPDATE fd_commitments
  }

  private async lockEntry(entryId: string, reason?: string): Promise<void> {
    await this.log('info', `Locking entry ${entryId}`, { reason });
    // In production: UPDATE fd_entries SET edit_locked_at = NOW(), edit_reason = reason
  }

  private async logSecurityEvent(event: any): Promise<void> {
    await this.log('warn', 'Security event logged', { event });
    // In production: INSERT INTO agent_logs or security audit table
  }
}
