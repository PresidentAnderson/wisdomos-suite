/**
 * Commitment Agent + Area Generator
 * "Commitments spawn Areas of Fulfilment"
 *
 * Listens for journal entries, detects commitments, spawns Areas
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface Commitment {
  id: string;
  userId: string;
  entryId?: string;
  statement: string;
  confidence: number;
  status: 'detected' | 'confirmed' | 'active' | 'fulfilled' | 'broken' | 'cancelled';
  targetDate?: string;
}

export class CommitmentAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'CommitmentAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `CommitmentAgent handling: ${message.task}`);

    // Listen for journal entry created events
    if (message.payload.event_type === EventTypes.JOURNAL_ENTRY_CREATED) {
      await this.onJournalEntryCreated(message.payload);
    }

    // Handle commitment confirmation
    if (message.intent === 'execute' && message.task.includes('confirm_commitment')) {
      await this.confirmCommitment(message.payload.commitment_id);
    }
  }

  /**
   * Handle journal entry created event
   */
  async onJournalEntryCreated(eventPayload: any): Promise<void> {
    const { entry_id, user_id } = eventPayload;

    await this.log('info', `Processing entry ${entry_id} for commitments`);

    // 1. Fetch entry text
    const text = await this.fetchEntryText(entry_id);

    // 2. Detect commitments
    const { confidence, statements } = await this.detectCommitments(text);

    // 3. Process each detected commitment
    for (const statement of statements) {
      const commitmentId = await this.upsertCommitment(user_id, entry_id, statement, confidence);

      // 4. Auto-spawn area if confidence > 0.75
      if (confidence > 0.75) {
        await this.spawnAreaFromCommitment(commitmentId, user_id);
      } else {
        // Queue for user confirmation
        await this.emitEvent(EventTypes.COMMITMENT_DETECTED, {
          commitment_id: commitmentId,
          statement,
          confidence,
          requires_confirmation: true,
        });
      }
    }
  }

  /**
   * Fetch entry text from database
   */
  private async fetchEntryText(entryId: string): Promise<string> {
    // In production: SELECT content FROM fd_entries WHERE id = $1
    await this.log('debug', `Fetching entry text for ${entryId}`);
    return 'Mock entry text about commitment to exercise daily';
  }

  /**
   * Detect commitments in text using LLM/NLP
   */
  private async detectCommitments(text: string): Promise<{
    confidence: number;
    statements: string[];
  }> {
    await this.log('debug', 'Detecting commitments in text');

    // In production, use LLM to detect commitment language:
    // - "I commit to..."
    // - "I will..."
    // - "Starting today, I'm going to..."
    // - "My goal is to..."

    // Stub implementation
    const commitmentKeywords = [
      'commit to',
      'i will',
      'going to',
      'my goal is',
      'promise to',
      'plan to',
    ];

    const textLower = text.toLowerCase();
    const hasCommitment = commitmentKeywords.some((keyword) => textLower.includes(keyword));

    if (hasCommitment) {
      return {
        confidence: 0.85,
        statements: [text.substring(0, 200)], // Extract first 200 chars as statement
      };
    }

    return {
      confidence: 0.0,
      statements: [],
    };
  }

  /**
   * Upsert commitment to database
   */
  private async upsertCommitment(
    userId: string,
    entryId: string,
    statement: string,
    confidence: number
  ): Promise<string> {
    const commitmentId = uuidv4();

    const commitment: Commitment = {
      id: commitmentId,
      userId,
      entryId,
      statement,
      confidence,
      status: confidence > 0.75 ? 'active' : 'detected',
    };

    await this.log('info', 'Creating commitment', { commitmentId, confidence });

    // In production: INSERT INTO fd_commitments
    return commitmentId;
  }

  /**
   * Spawn Area from Commitment
   */
  private async spawnAreaFromCommitment(commitmentId: string, userId: string): Promise<string> {
    await this.log('info', `Spawning area for commitment ${commitmentId}`);

    // In production: Call fn_commitment_spawn(commitment_id)
    // This function:
    // 1. Checks for existing similar area (cosine similarity > 0.8)
    // 2. If found, map commitment to existing area
    // 3. If not found, create new CMT_xxx area

    // For now, mock the process
    const areaId = await this.createCommitmentArea(commitmentId, userId);

    await this.emitEvent(EventTypes.AREA_SPAWNED, {
      area_id: areaId,
      commitment_id: commitmentId,
      user_id: userId,
    });

    await this.emitEvent(EventTypes.COMMITMENT_DETECTED, {
      commitment_id: commitmentId,
      area_id: areaId,
      auto_spawned: true,
    });

    return areaId;
  }

  /**
   * Create a new commitment-spawned area
   */
  private async createCommitmentArea(commitmentId: string, userId: string): Promise<string> {
    const areaId = uuidv4();

    // Generate CMT_xxx code
    const areaCode = `CMT_${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    await this.log('info', 'Creating commitment area', { areaId, areaCode });

    // In production: INSERT INTO fd_areas
    // Also create default dimensions (INT, FOR)

    return areaId;
  }

  /**
   * Confirm a commitment (user action)
   */
  async confirmCommitment(commitmentId: string): Promise<void> {
    await this.log('info', `Confirming commitment ${commitmentId}`);

    // In production: UPDATE fd_commitments SET status = 'active'
    // Then spawn area if not already spawned

    await this.emitEvent(EventTypes.COMMITMENT_CONFIRMED, {
      commitment_id: commitmentId,
    });
  }
}
