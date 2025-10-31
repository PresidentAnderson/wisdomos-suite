/**
 * Base Agent Class
 * All specialist agents extend this class
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AgentType,
  IntentType,
  MessageEnvelope,
  EventPayload,
  EventType,
  AgentLog,
  LogLevel,
} from '../types/contracts';

export interface AgentConfig {
  agentType: AgentType;
  version: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export abstract class BaseAgent {
  protected agentType: AgentType;
  protected version: string;
  protected supabaseUrl?: string;
  protected supabaseKey?: string;

  constructor(config: AgentConfig) {
    this.agentType = config.agentType;
    this.version = config.version;
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
  }

  /**
   * Create a standard message envelope
   */
  protected createMessage(
    intent: IntentType,
    task: string,
    payload: Record<string, any>,
    dependencies: string[] = []
  ): MessageEnvelope {
    return {
      message_id: uuidv4(),
      created_at: new Date().toISOString(),
      actor: this.agentType,
      intent,
      task,
      payload,
      dependencies,
      provenance: {
        source: 'system',
        version: this.version,
        timestamp: new Date().toISOString(),
      },
      ttl_sec: 600, // 10 minutes default
      retry: {
        count: 0,
        max: 3,
        backoff: 'exponential',
      },
    };
  }

  /**
   * Emit an event to the event bus
   */
  protected async emitEvent(
    type: EventType,
    payload: Record<string, any>
  ): Promise<void> {
    const event: EventPayload = {
      event_id: uuidv4(),
      type,
      payload,
      created_at: new Date().toISOString(),
      processed_by: [this.agentType],
    };

    // In production, this would publish to Supabase Realtime
    // For now, we log and can integrate with queue_events table
    await this.log('info', `Event emitted: ${type}`, { event });
  }

  /**
   * Log agent activity
   */
  protected async log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    const logEntry: AgentLog = {
      id: uuidv4(),
      agent: this.agentType,
      level,
      message,
      context,
      created_at: new Date().toISOString(),
    };

    // In production, write to agent_logs table
    console.log(`[${level.toUpperCase()}] [${this.agentType}] ${message}`, context || '');
  }

  /**
   * Handle incoming message
   * Subclasses must implement this
   */
  abstract handleMessage(message: MessageEnvelope): Promise<void>;

  /**
   * Get agent name
   */
  getName(): AgentType {
    return this.agentType;
  }

  /**
   * Get agent version
   */
  getVersion(): string {
    return this.version;
  }
}
