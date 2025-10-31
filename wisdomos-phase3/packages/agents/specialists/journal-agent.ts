/**
 * WisdomOS JournalAgent — Entry Ingestion & Classification
 *
 * Purpose: Ingest journal entries, classify to Areas/Dimensions,
 * extract sentiment, propose scores.
 *
 * @module JournalAgent
 * @version 1.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BaseAgent,
  AgentType,
  MessageEnvelope,
  EventType,
  LogLevel,
  JournalEntryPayload,
} from '../types';

export class JournalAgent extends BaseAgent {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super({
      name: AgentType.JOURNAL,
      version: 'v1.0',
      rate_limit_per_min: 60,
      max_concurrent: 5,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute journal entry processing
   */
  async execute(message: MessageEnvelope<JournalEntryPayload>): Promise<any> {
    const { entry_id, user_id, content, date, tags } = message.payload;

    try {
      await this.log(LogLevel.INFO, `Processing entry ${entry_id}`, {
        message_id: message.message_id,
        user_id,
        entry_id,
      });

      // Step 1: Save entry to fd_entry
      const entry = await this.saveEntry(user_id, content, date);

      // Step 2: Classify to Areas/Dimensions (NLP or user tags)
      const classification = await this.classifyEntry(content, tags);

      // Step 3: Link entry to areas/dimensions
      await this.linkEntryToAreas(entry.id, classification);

      // Step 4: Extract sentiment (optional)
      const sentiment = await this.extractSentiment(content);

      // Step 5: Propose dimension scores (AI suggestion)
      const proposedScores = await this.proposeScores(
        user_id,
        classification,
        sentiment
      );

      // Step 6: Emit event
      await this.emit(EventType.JOURNAL_ENTRY_CREATED, {
        entry_id: entry.id,
        user_id,
        classification,
        sentiment,
        proposed_scores: proposedScores,
      });

      await this.log(LogLevel.INFO, `Entry ${entry_id} processed successfully`, {
        message_id: message.message_id,
        classification,
      });

      return {
        success: true,
        entry_id: entry.id,
        classification,
        sentiment,
        proposed_scores: proposedScores,
      };
    } catch (error) {
      await this.log(LogLevel.ERROR, `Failed to process entry: ${error.message}`, {
        message_id: message.message_id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Save entry to fd_entry table
   */
  private async saveEntry(
    userId: string,
    content: string,
    date: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('fd_entry')
      .insert({
        user_id: userId,
        content,
        entry_date: date,
        source: 'journal',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Classify entry to Areas/Dimensions using NLP or user tags
   */
  private async classifyEntry(
    content: string,
    tags?: Array<{
      area_code: string;
      dimension_code?: string;
      strength?: number;
    }>
  ): Promise<
    Array<{
      area_code: string;
      dimension_code?: string;
      strength: number;
    }>
  > {
    // If user provided tags, use them
    if (tags && tags.length > 0) {
      return tags.map((t) => ({
        area_code: t.area_code,
        dimension_code: t.dimension_code,
        strength: t.strength || 0.5,
      }));
    }

    // Otherwise, use NLP to detect areas
    // TODO: Implement NLP classification (OpenAI/Anthropic)
    // For now, return empty classification
    return [];
  }

  /**
   * Link entry to areas/dimensions
   */
  private async linkEntryToAreas(
    entryId: string,
    classification: Array<{
      area_code: string;
      dimension_code?: string;
      strength: number;
    }>
  ): Promise<void> {
    if (classification.length === 0) return;

    // Get area IDs from codes
    const areaCodes = classification.map((c) => c.area_code);
    const { data: areas } = await this.supabase
      .from('fd_area')
      .select('id, code')
      .in('code', areaCodes);

    if (!areas) return;

    const areaMap = new Map(areas.map((a) => [a.code, a.id]));

    // Create links
    const links = classification.map((c) => ({
      entry_id: entryId,
      area_id: areaMap.get(c.area_code),
      dimension_code: c.dimension_code,
      strength: c.strength,
      source: 'agent',
    }));

    await this.supabase.from('fd_entry_link').insert(links);
  }

  /**
   * Extract sentiment from content
   */
  private async extractSentiment(
    content: string
  ): Promise<{ polarity: number; subjectivity: number }> {
    // TODO: Implement sentiment analysis (OpenAI/Anthropic)
    // For now, return neutral
    return {
      polarity: 0.0, // -1 (negative) to +1 (positive)
      subjectivity: 0.5, // 0 (objective) to 1 (subjective)
    };
  }

  /**
   * Propose dimension scores based on entry content
   */
  private async proposeScores(
    userId: string,
    classification: Array<{
      area_code: string;
      dimension_code?: string;
      strength: number;
    }>,
    sentiment: { polarity: number; subjectivity: number }
  ): Promise<
    Array<{
      area_code: string;
      dimension_code?: string;
      proposed_score: number;
      confidence: number;
    }>
  > {
    // TODO: Implement AI score proposal
    // For now, return basic heuristic based on sentiment
    return classification
      .filter((c) => c.dimension_code)
      .map((c) => ({
        area_code: c.area_code,
        dimension_code: c.dimension_code,
        proposed_score: Math.max(0, Math.min(5, 2.5 + sentiment.polarity * 2)), // 0-5 scale
        confidence: c.strength,
      }));
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

export default JournalAgent;
