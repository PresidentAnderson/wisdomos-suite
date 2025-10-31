/**
 * WisdomOS CommitmentAgent — NLP Commitment Detection
 *
 * Purpose: Detect commitments (declared intentions) from journal entries
 * using NLP. Extract intent verbs, entities, confidence scores.
 *
 * @module CommitmentAgent
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
  CommitmentDetectionResult,
} from '../types';

export class CommitmentAgent extends BaseAgent {
  private supabase: SupabaseClient;

  // Intent verb patterns for commitment detection
  private readonly STRONG_INTENT_VERBS = [
    'commit',
    'promise',
    'vow',
    'pledge',
    'swear',
    'declare',
  ];
  private readonly MODERATE_INTENT_VERBS = [
    'will',
    'plan',
    'aim',
    'intend',
    'determine',
    'resolve',
  ];
  private readonly WEAK_INTENT_VERBS = [
    'want',
    'hope',
    'wish',
    'consider',
    'might',
    'should',
  ];

  constructor(supabaseUrl: string, supabaseKey: string) {
    super({
      name: AgentType.COMMITMENT,
      version: 'v1.0',
      rate_limit_per_min: 60,
      max_concurrent: 5,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute commitment detection on journal entry
   */
  async execute(
    message: MessageEnvelope<JournalEntryPayload>
  ): Promise<CommitmentDetectionResult[]> {
    const { entry_id, user_id, content } = message.payload;

    try {
      await this.log(LogLevel.INFO, `Analyzing entry ${entry_id} for commitments`, {
        message_id: message.message_id,
        user_id,
        entry_id,
      });

      // Step 1: Detect commitments using NLP
      const commitments = await this.detectCommitments(content);

      // Step 2: Save detected commitments
      for (const commitment of commitments) {
        if (commitment.confidence >= 0.4) {
          // Only save if confidence > threshold
          const commitmentId = await this.saveCommitment(
            user_id,
            entry_id,
            commitment
          );

          // Step 3: Emit event
          await this.emit(EventType.COMMITMENT_DETECTED, {
            commitment_id: commitmentId,
            user_id,
            entry_id,
            statement: commitment.statement,
            confidence: commitment.confidence,
            entities: commitment.entities,
          });
        }
      }

      await this.log(
        LogLevel.INFO,
        `Found ${commitments.length} commitments in entry ${entry_id}`,
        {
          message_id: message.message_id,
          commitments: commitments.length,
        }
      );

      return commitments;
    } catch (error) {
      await this.log(
        LogLevel.ERROR,
        `Failed to analyze entry: ${error.message}`,
        {
          message_id: message.message_id,
          error: error.message,
        }
      );
      throw error;
    }
  }

  /**
   * Detect commitments from text using NLP
   */
  private async detectCommitments(
    text: string
  ): Promise<CommitmentDetectionResult[]> {
    // Split into sentences
    const sentences = this.splitIntoSentences(text);
    const commitments: CommitmentDetectionResult[] = [];

    for (const sentence of sentences) {
      const result = await this.analyzeSentence(sentence);
      if (result.has_commitment) {
        commitments.push(result);
      }
    }

    return commitments;
  }

  /**
   * Analyze a single sentence for commitment signals
   */
  private async analyzeSentence(
    sentence: string
  ): Promise<CommitmentDetectionResult> {
    const lowerSentence = sentence.toLowerCase();

    // Step 1: Detect intent verbs
    const intentVerbs = this.detectIntentVerbs(lowerSentence);

    // Step 2: Calculate confidence based on intent verbs
    const confidence = this.calculateConfidence(intentVerbs);

    // Step 3: Extract entities (subjects, projects, people, domains)
    const entities = await this.extractEntities(sentence);

    // Step 4: Determine if this is a commitment
    const hasCommitment = confidence >= 0.4 && entities.subjects.length > 0;

    return {
      has_commitment: hasCommitment,
      confidence,
      statement: sentence.trim(),
      intent_verbs: intentVerbs,
      entities,
    };
  }

  /**
   * Detect intent verbs in sentence
   */
  private detectIntentVerbs(text: string): string[] {
    const verbs: string[] = [];

    // Check strong verbs
    for (const verb of this.STRONG_INTENT_VERBS) {
      if (text.includes(verb)) {
        verbs.push(verb);
      }
    }

    // Check moderate verbs
    for (const verb of this.MODERATE_INTENT_VERBS) {
      if (text.includes(verb)) {
        verbs.push(verb);
      }
    }

    // Check weak verbs
    for (const verb of this.WEAK_INTENT_VERBS) {
      if (text.includes(verb)) {
        verbs.push(verb);
      }
    }

    return verbs;
  }

  /**
   * Calculate confidence score based on intent verbs
   */
  private calculateConfidence(intentVerbs: string[]): number {
    if (intentVerbs.length === 0) return 0.0;

    let score = 0.0;

    for (const verb of intentVerbs) {
      if (this.STRONG_INTENT_VERBS.includes(verb)) {
        score = Math.max(score, 0.95);
      } else if (this.MODERATE_INTENT_VERBS.includes(verb)) {
        score = Math.max(score, 0.75);
      } else if (this.WEAK_INTENT_VERBS.includes(verb)) {
        score = Math.max(score, 0.5);
      }
    }

    return Math.min(1.0, score);
  }

  /**
   * Extract entities from sentence using NLP
   */
  private async extractEntities(
    sentence: string
  ): Promise<{
    subjects: string[];
    projects: string[];
    people: string[];
    domains: string[];
  }> {
    // TODO: Implement proper NER (Named Entity Recognition)
    // using OpenAI/Anthropic or spaCy

    // For now, use basic pattern matching
    const subjects: string[] = [];
    const projects: string[] = [];
    const people: string[] = [];
    const domains: string[] = [];

    // Basic heuristic: capitalized words are likely entities
    const words = sentence.split(/\s+/);
    for (const word of words) {
      if (/^[A-Z][a-z]+/.test(word)) {
        subjects.push(word);
      }
    }

    // Detect domain keywords
    const domainKeywords = {
      Work: ['work', 'business', 'enterprise', 'career', 'job'],
      Health: ['health', 'fitness', 'exercise', 'diet', 'wellness'],
      Family: ['family', 'wife', 'husband', 'children', 'kids'],
      Finance: ['money', 'finance', 'invest', 'wealth', 'profit'],
      Learning: ['learn', 'study', 'course', 'education', 'skill'],
    };

    const lowerSentence = sentence.toLowerCase();
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      for (const keyword of keywords) {
        if (lowerSentence.includes(keyword)) {
          domains.push(domain);
          break;
        }
      }
    }

    return {
      subjects,
      projects,
      people,
      domains: [...new Set(domains)], // Remove duplicates
    };
  }

  /**
   * Save commitment to database
   */
  private async saveCommitment(
    userId: string,
    entryId: string,
    commitment: CommitmentDetectionResult
  ): Promise<string> {
    // Insert commitment
    const { data: commitmentData, error: commitmentError } = await this.supabase
      .from('fd_commitment')
      .insert({
        user_id: userId,
        statement: commitment.statement,
        confidence: commitment.confidence,
        intent_verbs: commitment.intent_verbs,
        entities: commitment.entities,
        source: 'journal',
        status: 'active',
        detected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (commitmentError) throw commitmentError;

    // Link commitment to entry
    await this.supabase.from('fd_commitment_entry_link').insert({
      commitment_id: commitmentData.id,
      entry_id: entryId,
    });

    return commitmentData.id;
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting (can be improved with NLP library)
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10); // Ignore very short sentences
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

export default CommitmentAgent;
