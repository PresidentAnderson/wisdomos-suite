/**
 * Journal Agent
 * Ingest entries, classify (Area, Dimension, Weight), sentiment, persist + emit
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface JournalEntry {
  content: string;
  date: string; // ISO date
  tags?: string[];
  source?: 'manual' | 'import' | 'api' | 'sync';
  userId: string;
}

export interface ClassificationResult {
  area_id: string;
  dimension_id?: string;
  weight: number;
  confidence: number;
  signal_value: number;
}

export class JournalAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'JournalAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `JournalAgent handling: ${message.task}`);

    if (message.intent === 'execute' && message.task.includes('journal/entry')) {
      await this.ingestEntry(message.payload as JournalEntry);
    }
  }

  /**
   * HTTP endpoint handler for /journal/entry
   */
  async handleHttpEntry(request: JournalEntry): Promise<{ entryId: string; success: boolean }> {
    const entryId = await this.ingestEntry(request);
    return { entryId, success: true };
  }

  /**
   * Ingest a journal entry
   */
  private async ingestEntry(entry: JournalEntry): Promise<string> {
    await this.log('info', 'Ingesting journal entry', { entry });

    // 1. Validate entry
    if (!entry.content || !entry.userId) {
      throw new Error('Invalid entry: content and userId required');
    }

    // 2. Analyze sentiment
    const sentimentScore = await this.analyzeSentiment(entry.content);

    // 3. Save entry to database
    const entryId = uuidv4();
    const entryData = {
      id: entryId,
      user_id: entry.userId,
      content: entry.content,
      entry_date: entry.date || new Date().toISOString().split('T')[0],
      entry_timestamp: new Date().toISOString(),
      source: entry.source || 'manual',
      tags: entry.tags || [],
      sentiment_score: sentimentScore,
      created_at: new Date().toISOString(),
    };

    await this.saveEntry(entryData);

    // 4. Classify entry (determine Area/Dimension links)
    const classifications = await this.classify(entry.content, entry.userId);

    // 5. Save links
    for (const classification of classifications) {
      await this.saveLink(entryId, classification);
    }

    // 6. Emit event
    await this.emitEvent(EventTypes.JOURNAL_ENTRY_CREATED, {
      entry_id: entryId,
      user_id: entry.userId,
      classifications: classifications.length,
    });

    // 7. Request fulfilment rollup (debounced daily in production)
    await this.emitEvent(EventTypes.FULFILMENT_ROLLUP_REQUESTED, {
      user_id: entry.userId,
      trigger: 'journal_entry',
    });

    await this.log('info', `Entry ${entryId} ingested successfully`);

    return entryId;
  }

  /**
   * Classify entry content to Areas/Dimensions
   */
  private async classify(content: string, userId: string): Promise<ClassificationResult[]> {
    // In production, this would use LLM or ML model for classification
    // For now, we provide a stub implementation

    await this.log('debug', 'Classifying entry content');

    // Stub: Return mock classification
    // In production, this would:
    // 1. Embed the content
    // 2. Compare against Area/Dimension embeddings
    // 3. Calculate cosine similarity
    // 4. Return top matches with confidence scores

    const mockClassifications: ClassificationResult[] = [
      {
        area_id: 'mock-area-1',
        dimension_id: 'mock-dimension-1',
        weight: 0.8,
        confidence: 0.75,
        signal_value: 3.5,
      },
    ];

    return mockClassifications;
  }

  /**
   * Analyze sentiment of content
   */
  private async analyzeSentiment(content: string): Promise<number> {
    // In production, use sentiment analysis model
    // Returns -1.0 (negative) to +1.0 (positive)

    // Stub: basic keyword matching
    const positiveWords = ['happy', 'great', 'excellent', 'wonderful', 'joy', 'success'];
    const negativeWords = ['sad', 'terrible', 'awful', 'bad', 'failure', 'disappointed'];

    const contentLower = content.toLowerCase();
    let score = 0;

    for (const word of positiveWords) {
      if (contentLower.includes(word)) score += 0.2;
    }

    for (const word of negativeWords) {
      if (contentLower.includes(word)) score -= 0.2;
    }

    // Clamp to -1.0 to +1.0
    return Math.max(-1.0, Math.min(1.0, score));
  }

  /**
   * Save entry to database
   */
  private async saveEntry(entryData: any): Promise<void> {
    await this.log('debug', 'Saving entry to database', { entryId: entryData.id });
    // In production: INSERT INTO fd_entries
    // For now, just log
  }

  /**
   * Save classification link
   */
  private async saveLink(entryId: string, classification: ClassificationResult): Promise<void> {
    await this.log('debug', 'Saving entry link', { entryId, classification });
    // In production: INSERT INTO fd_entry_links
    // For now, just log
  }
}
