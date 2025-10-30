/**
 * WisdomOS AreaGenerator — "Commitments Spawn Fulfilment"
 *
 * Purpose: Spawn new Areas of Fulfilment from detected commitments.
 * Uses semantic clustering to avoid duplicates, generates dimensions.
 *
 * @module AreaGenerator
 * @version 1.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BaseAgent,
  AgentType,
  MessageEnvelope,
  EventType,
  LogLevel,
  AreaSpawnRequest,
  AreaSpawnResult,
} from '../types';

export class AreaGenerator extends BaseAgent {
  private supabase: SupabaseClient;

  // Semantic similarity threshold for area clustering
  private readonly SIMILARITY_THRESHOLD = 0.8;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super({
      name: AgentType.AREA_GENERATOR,
      version: 'v1.0',
      rate_limit_per_min: 30,
      max_concurrent: 3,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute area generation from commitment
   */
  async execute(
    message: MessageEnvelope<AreaSpawnRequest>
  ): Promise<AreaSpawnResult> {
    const { commitment_id, user_id, statement, confidence, entities } =
      message.payload;

    try {
      await this.log(
        LogLevel.INFO,
        `Generating area for commitment ${commitment_id}`,
        {
          message_id: message.message_id,
          user_id,
          commitment_id,
        }
      );

      // Step 1: Check if similar area already exists
      const existingArea = await this.findSimilarArea(user_id, statement, entities);

      if (existingArea) {
        // Link commitment to existing area
        await this.linkCommitmentToArea(commitment_id, existingArea.id);

        await this.log(
          LogLevel.INFO,
          `Linked commitment to existing area ${existingArea.code}`,
          {
            commitment_id,
            area_code: existingArea.code,
          }
        );

        return {
          area: existingArea,
          dimensions: [],
          is_new: false,
        };
      }

      // Step 2: Generate new area
      const newArea = await this.createArea(user_id, statement, entities);

      // Step 3: Generate dimensions for area
      const dimensions = await this.createDimensions(newArea.id, statement, entities);

      // Step 4: Link commitment to new area
      await this.linkCommitmentToArea(commitment_id, newArea.id);

      // Step 5: Update commitment with linked_area_id
      await this.supabase
        .from('fd_commitment')
        .update({ linked_area_id: newArea.id })
        .eq('id', commitment_id);

      // Step 6: Emit event
      await this.emit(EventType.AREA_SPAWNED, {
        area_id: newArea.id,
        area_code: newArea.code,
        user_id,
        commitment_id,
        dimensions: dimensions.map((d) => d.code),
      });

      await this.log(LogLevel.INFO, `Created new area ${newArea.code}`, {
        commitment_id,
        area_id: newArea.id,
        dimensions: dimensions.length,
      });

      return {
        area: newArea,
        dimensions,
        is_new: true,
      };
    } catch (error) {
      await this.log(
        LogLevel.ERROR,
        `Failed to generate area: ${error.message}`,
        {
          message_id: message.message_id,
          error: error.message,
        }
      );
      throw error;
    }
  }

  /**
   * Find similar area using semantic clustering
   */
  private async findSimilarArea(
    userId: string,
    statement: string,
    entities: any
  ): Promise<any | null> {
    // Get all user's areas
    const { data: areas, error } = await this.supabase
      .from('fd_area')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !areas || areas.length === 0) return null;

    // TODO: Implement proper semantic similarity using embeddings
    // For now, use simple keyword matching

    const statementLower = statement.toLowerCase();
    const domains = entities.domains || [];

    for (const area of areas) {
      const areaName = area.name.toLowerCase();

      // Check if any entity domain matches area name
      for (const domain of domains) {
        if (areaName.includes(domain.toLowerCase())) {
          return area;
        }
      }

      // Check if statement keywords match area name
      const keywords = this.extractKeywords(statement);
      for (const keyword of keywords) {
        if (areaName.includes(keyword)) {
          return area;
        }
      }
    }

    return null;
  }

  /**
   * Create new area from commitment
   */
  private async createArea(
    userId: string,
    statement: string,
    entities: any
  ): Promise<any> {
    // Generate area code (CMT_* prefix for commitment-spawned areas)
    const code = this.generateAreaCode(statement);

    // Generate area name
    const name = this.generateAreaName(statement, entities);

    // Generate emoji (based on domain)
    const emoji = this.selectEmoji(entities.domains);

    // Generate color (use palette)
    const color = this.selectColor();

    // Default weight (will be adjusted in quarterly reviews)
    const weight = 0.05;

    const { data, error } = await this.supabase
      .from('fd_area')
      .insert({
        user_id: userId,
        code,
        name,
        emoji,
        color,
        weight_default: weight,
        description: statement,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create dimensions for area
   */
  private async createDimensions(
    areaId: string,
    statement: string,
    entities: any
  ): Promise<any[]> {
    // Generate 3-4 dimensions based on commitment
    const dimensionNames = this.generateDimensionNames(statement, entities);

    const dimensions = dimensionNames.map((name, index) => ({
      area_id: areaId,
      code: this.slugify(name),
      name,
      description: `Dimension ${index + 1} for ${name}`,
      weight_default: 1.0 / dimensionNames.length,
    }));

    const { data, error } = await this.supabase
      .from('fd_dimension')
      .insert(dimensions)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Link commitment to area
   */
  private async linkCommitmentToArea(
    commitmentId: string,
    areaId: string
  ): Promise<void> {
    await this.supabase.from('fd_commitment_link').insert({
      commitment_id: commitmentId,
      area_id: areaId,
    });
  }

  /**
   * Generate area code from statement
   */
  private generateAreaCode(statement: string): string {
    const keywords = this.extractKeywords(statement);
    const prefix = keywords
      .slice(0, 2)
      .map((k) => k.substring(0, 3).toUpperCase())
      .join('_');
    return `CMT_${prefix}_${Date.now().toString().slice(-4)}`;
  }

  /**
   * Generate area name from statement
   */
  private generateAreaName(statement: string, entities: any): string {
    // Use first subject or domain as base
    if (entities.subjects && entities.subjects.length > 0) {
      return entities.subjects[0];
    }
    if (entities.domains && entities.domains.length > 0) {
      return entities.domains[0];
    }

    // Fallback: use first few words of statement
    const words = statement.split(/\s+/).slice(0, 4);
    return words.join(' ');
  }

  /**
   * Select emoji for area
   */
  private selectEmoji(domains: string[]): string {
    const emojiMap: Record<string, string> = {
      Work: '🧱',
      Health: '🩺',
      Family: '🏡',
      Finance: '💹',
      Learning: '📚',
      Music: '🎵',
      Writing: '✍️',
      Spiritual: '🕊️',
    };

    if (domains && domains.length > 0) {
      for (const domain of domains) {
        if (emojiMap[domain]) {
          return emojiMap[domain];
        }
      }
    }

    return '⭐'; // Default
  }

  /**
   * Select color for area
   */
  private selectColor(): string {
    const colors = [
      '#6B4EFF',
      '#FF7A59',
      '#2EC5B6',
      '#FFCE00',
      '#8855FF',
      '#3FA9F5',
      '#E83F6F',
      '#7CC576',
      '#1F6FEB',
      '#F97316',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Generate dimension names from commitment
   */
  private generateDimensionNames(statement: string, entities: any): string[] {
    // Default dimensions
    const dimensions = ['Cadence', 'Quality', 'Progress'];

    // Add domain-specific dimension if available
    if (entities.domains && entities.domains.length > 0) {
      dimensions.push(`${entities.domains[0]} Impact`);
    }

    return dimensions.slice(0, 4);
  }

  /**
   * Extract keywords from statement
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'i',
      'to',
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'for',
      'of',
      'with',
      'by',
      'will',
      'am',
      'is',
      'are',
    ]);

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }

  /**
   * Slugify text for code generation
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
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

export default AreaGenerator;
