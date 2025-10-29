/**
 * Security Agent
 * Encryption, RLS enforcement, audit trails, IP protection
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';
import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface SecurityViolation {
  id: string;
  userId: string;
  violationType: 'unauthorized_access' | 'rls_bypass' | 'data_breach' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
}

export class SecurityAgent extends BaseAgent {
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;

  // IP Protection banners
  private readonly IP_BANNERS = {
    'King Legend Inc.': 'PVT Hostel Products',
    '15145597 Canada Inc.': 'Atlas/Wisdom Platform',
    'AxAi Innovation': 'White-label Products',
  };

  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'SecurityAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `SecurityAgent handling: ${message.task}`);

    // Handle encryption requests
    if (message.intent === 'execute' && message.task.includes('encrypt')) {
      await this.encryptData(message.payload as { data: string; userId: string; resourceType: string; resourceId: string });
    }

    // Handle decryption requests
    if (message.intent === 'execute' && message.task.includes('decrypt')) {
      await this.decryptData(message.payload as { encrypted: string; iv: string; authTag: string; userId: string; resourceType: string; resourceId: string });
    }

    // Handle audit logging
    if (message.intent === 'execute' && message.task.includes('audit')) {
      await this.logAuditEntry(message.payload as Omit<AuditEntry, 'id'>);
    }

    // Handle RLS validation
    if (message.intent === 'validate' && message.task.includes('rls')) {
      await this.validateRLSAccess(message.payload as { userId: string; resourceType: string; resourceId: string; action: 'read' | 'write' | 'delete' });
    }

    // Handle security violation detection
    if (message.payload.event_type === 'security.violation.detected') {
      await this.onSecurityViolation(message.payload);
    }
  }

  /**
   * Encrypt sensitive data (field-level encryption)
   */
  async encryptData(payload: {
    data: string;
    userId: string;
    resourceType: string;
    resourceId: string;
  }): Promise<{ encrypted: string; iv: string; authTag: string }> {
    const { data, userId, resourceType, resourceId } = payload;

    await this.log('info', `Encrypting ${resourceType} for user ${userId}`);

    // Get encryption key (in production, from key management service)
    const key = await this.getEncryptionKey(userId);

    // Generate IV
    const iv = randomBytes(this.IV_LENGTH);

    // Encrypt (simplified - in production use crypto.createCipheriv)
    const encrypted = Buffer.from(data).toString('base64');
    const authTag = this.generateAuthTag(encrypted, key);

    // Log audit trail
    await this.logAuditEntry({
      userId,
      action: 'encrypt',
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
    });

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(payload: {
    encrypted: string;
    iv: string;
    authTag: string;
    userId: string;
    resourceType: string;
    resourceId: string;
  }): Promise<string> {
    const { encrypted, iv, authTag, userId, resourceType, resourceId } = payload;

    await this.log('info', `Decrypting ${resourceType} for user ${userId}`);

    // Verify auth tag
    const key = await this.getEncryptionKey(userId);
    const expectedAuthTag = this.generateAuthTag(encrypted, key);

    if (authTag !== expectedAuthTag) {
      throw new Error('Authentication tag verification failed');
    }

    // Decrypt (simplified)
    const decrypted = Buffer.from(encrypted, 'base64').toString('utf-8');

    // Log audit trail
    await this.logAuditEntry({
      userId,
      action: 'decrypt',
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
    });

    return decrypted;
  }

  /**
   * Validate RLS (Row-Level Security) access
   */
  async validateRLSAccess(payload: {
    userId: string;
    resourceType: string;
    resourceId: string;
    action: 'read' | 'write' | 'delete';
  }): Promise<{ allowed: boolean; reason?: string }> {
    const { userId, resourceType, resourceId, action } = payload;

    await this.log('debug', `Validating RLS access: ${action} on ${resourceType}`);

    // In production: Query database to check RLS policies
    // For now, basic validation

    // Check if resource belongs to user
    const resource = await this.getResource(resourceType, resourceId);

    if (!resource) {
      return {
        allowed: false,
        reason: 'Resource not found',
      };
    }

    if (resource.user_id !== userId) {
      // Log security violation
      await this.raiseSecurityViolation({
        userId,
        violationType: 'unauthorized_access',
        severity: 'high',
        description: `Attempted ${action} on ${resourceType} ${resourceId} belonging to another user`,
        metadata: { resourceType, resourceId, action },
      });

      return {
        allowed: false,
        reason: 'Access denied: Resource belongs to another user',
      };
    }

    return { allowed: true };
  }

  /**
   * Log audit entry
   */
  async logAuditEntry(entry: Omit<AuditEntry, 'id'>): Promise<string> {
    const auditId = uuidv4();

    const fullEntry: AuditEntry = {
      id: auditId,
      ...entry,
    };

    await this.log('info', `Audit: ${entry.action} on ${entry.resourceType}`, { audit: fullEntry });

    // In production: INSERT INTO audit_trail or agent_logs
    await this.saveAuditEntry(fullEntry);

    await this.emitEvent(EventTypes.SECURITY_AUDIT_LOGGED, {
      audit_id: auditId,
      user_id: entry.userId,
      action: entry.action,
    });

    return auditId;
  }

  /**
   * Raise security violation
   */
  private async raiseSecurityViolation(violation: Omit<SecurityViolation, 'id'>): Promise<string> {
    const violationId = uuidv4();

    const fullViolation: SecurityViolation = {
      id: violationId,
      ...violation,
    };

    await this.log('error', `Security violation: ${violation.violationType}`, { violation: fullViolation });

    // Save violation
    await this.saveSecurityViolation(fullViolation);

    // Emit event
    await this.emitEvent(EventTypes.SECURITY_VIOLATION_DETECTED, {
      violation_id: violationId,
      user_id: violation.userId,
      type: violation.violationType,
      severity: violation.severity,
    });

    // For critical violations, take immediate action
    if (violation.severity === 'critical') {
      await this.handleCriticalViolation(fullViolation);
    }

    return violationId;
  }

  /**
   * Handle security violation event
   */
  private async onSecurityViolation(eventPayload: any): Promise<void> {
    const { violation_id, user_id, type, severity } = eventPayload;

    await this.log('warn', `Processing security violation: ${type}`, { violation_id });

    // Track violation patterns
    const recentViolations = await this.getRecentViolations(user_id);

    if (recentViolations.length >= 3) {
      // Multiple violations - escalate
      await this.escalateSecurityAlert(user_id, recentViolations);
    }
  }

  /**
   * Handle critical security violations
   */
  private async handleCriticalViolation(violation: SecurityViolation): Promise<void> {
    await this.log('error', 'Critical security violation - taking action', { violation });

    // In production:
    // 1. Lock user account
    // 2. Send alert to security team
    // 3. Revoke active sessions
    // 4. Require password reset
  }

  /**
   * Escalate security alert
   */
  private async escalateSecurityAlert(userId: string, violations: SecurityViolation[]): Promise<void> {
    await this.log('error', `Escalating security alert for user ${userId}`, {
      violation_count: violations.length,
    });

    // In production:
    // 1. Send notification to admin
    // 2. Temporarily lock account
    // 3. Require security review
  }

  /**
   * Encrypt entry content (automatic for sensitive data)
   */
  async encryptEntryContent(entryId: string, content: string, userId: string): Promise<void> {
    await this.log('info', `Encrypting content for entry ${entryId}`);

    const { encrypted, iv, authTag } = await this.encryptData({
      data: content,
      userId,
      resourceType: 'fd_entry',
      resourceId: entryId,
    });

    // In production: UPDATE fd_entries SET content_encrypted = encrypted
    await this.saveEncryptedContent(entryId, encrypted, iv, authTag);
  }

  /**
   * Add IP protection banner to documents
   */
  getIPBanner(): string {
    return Object.entries(this.IP_BANNERS)
      .map(([company, products]) => `${company} — ${products}`)
      .join('\n');
  }

  /**
   * Generate auth tag for encrypted data
   */
  private generateAuthTag(data: string, key: Buffer): string {
    return createHash('sha256')
      .update(data)
      .update(key)
      .digest('hex');
  }

  /**
   * Get encryption key for user (from key management service)
   */
  private async getEncryptionKey(userId: string): Promise<Buffer> {
    // In production: Fetch from key management service (AWS KMS, HashiCorp Vault)
    // For now, derive from master key + user ID
    const masterKey = process.env.ENCRYPTION_MASTER_KEY || 'default-dev-key';
    return Buffer.from(
      createHash('sha256')
        .update(masterKey)
        .update(userId)
        .digest('hex')
        .substring(0, this.KEY_LENGTH * 2),
      'hex'
    );
  }

  // Database helper methods (stubs)

  private async getResource(resourceType: string, resourceId: string): Promise<any> {
    await this.log('debug', `Fetching resource: ${resourceType}/${resourceId}`);
    return { id: resourceId, user_id: 'user-123' };
  }

  private async saveAuditEntry(entry: AuditEntry): Promise<void> {
    await this.log('debug', 'Saving audit entry', { entry });
    // In production: INSERT INTO audit_trail
  }

  private async saveSecurityViolation(violation: SecurityViolation): Promise<void> {
    await this.log('debug', 'Saving security violation', { violation });
    // In production: INSERT INTO security_violations
  }

  private async getRecentViolations(userId: string): Promise<SecurityViolation[]> {
    // In production: SELECT FROM security_violations WHERE user_id = ? AND created_at > NOW() - INTERVAL '1 hour'
    return [];
  }

  private async saveEncryptedContent(entryId: string, encrypted: string, iv: string, authTag: string): Promise<void> {
    await this.log('debug', `Saving encrypted content for entry ${entryId}`);
    // In production: UPDATE fd_entries
  }
}
