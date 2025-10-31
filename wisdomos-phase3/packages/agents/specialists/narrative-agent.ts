/**
 * WisdomOS NarrativeAgent — Autobiography Builder
 *
 * Purpose: Cluster journal entries by theme/era, link to autobiography
 * chapters, calculate coherence scores, build life narrative.
 *
 * @module NarrativeAgent
 * @version 1.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BaseAgent,
  AgentType,
  MessageEnvelope,
  EventType,
  LogLevel,
  NarrativeUpdateRequest,
  NarrativeUpdateResult,
} from '../types';

export class NarrativeAgent extends BaseAgent {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    super({
      name: AgentType.NARRATIVE,
      version: 'v1.0',
      rate_limit_per_min: 20,
      max_concurrent: 2,
    });

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Execute narrative update
   */
  async execute(
    message: MessageEnvelope<NarrativeUpdateRequest>
  ): Promise<NarrativeUpdateResult> {
    const { user_id, entry_ids, era } = message.payload;

    try {
      await this.log(
        LogLevel.INFO,
        `Updating narrative for ${entry_ids.length} entries`,
        {
          message_id: message.message_id,
          user_id,
          entry_count: entry_ids.length,
        }
      );

      // Step 1: Get entries
      const entries = await this.getEntries(entry_ids);

      // Step 2: Cluster entries by theme
      const clusters = await this.clusterByTheme(entries);

      // Step 3: Find or create chapters for clusters
      const chaptersUpdated: string[] = [];
      let linksCreated = 0;

      for (const cluster of clusters) {
        const chapter = await this.findOrCreateChapter(
          user_id,
          cluster.theme,
          era || cluster.suggestedEra
        );

        // Link entries to chapter
        for (const entry of cluster.entries) {
          await this.linkEntryToChapter(entry.id, chapter.id, cluster.theme);
          linksCreated++;
        }

        chaptersUpdated.push(chapter.id);

        // Update chapter summary
        await this.updateChapterSummary(chapter.id, cluster.entries);
      }

      // Step 4: Calculate narrative coherence
      const coherence = await this.calculateCoherence(user_id, chaptersUpdated);

      // Step 5: Emit event
      await this.emit(EventType.AUTOBIOGRAPHY_CHAPTER_UPDATED, {
        user_id,
        chapters_updated: chaptersUpdated,
        links_created: linksCreated,
        coherence_score: coherence,
      });

      await this.log(
        LogLevel.INFO,
        `Narrative updated: ${chaptersUpdated.length} chapters, coherence ${coherence}`,
        {
          user_id,
          chapters: chaptersUpdated.length,
          links: linksCreated,
        }
      );

      return {
        chapters_updated: chaptersUpdated,
        links_created: linksCreated,
        coherence_score: coherence,
      };
    } catch (error) {
      await this.log(
        LogLevel.ERROR,
        `Narrative update failed: ${error.message}`,
        {
          message_id: message.message_id,
          error: error.message,
        }
      );
      throw error;
    }
  }

  /**
   * Get entries by IDs
   */
  private async getEntries(entryIds: string[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('fd_entry')
      .select('*')
      .in('id', entryIds);

    if (error) throw error;
    return data || [];
  }

  /**
   * Cluster entries by theme using NLP
   */
  private async clusterByTheme(
    entries: any[]
  ): Promise<
    Array<{
      theme: string;
      entries: any[];
      suggestedEra?: string;
    }>
  > {
    // TODO: Implement proper semantic clustering using embeddings
    // For now, use simple keyword-based clustering

    const clusters = new Map<string, any[]>();

    for (const entry of entries) {
      const theme = await this.extractTheme(entry.content);
      const existing = clusters.get(theme) || [];
      existing.push(entry);
      clusters.set(theme, existing);
    }

    return Array.from(clusters.entries()).map(([theme, entries]) => ({
      theme,
      entries,
      suggestedEra: this.suggestEra(entries),
    }));
  }

  /**
   * Extract theme from entry content
   */
  private async extractTheme(content: string): Promise<string> {
    // TODO: Implement NLP theme extraction
    // For now, use keyword matching

    const themes = [
      { name: 'Career Growth', keywords: ['work', 'career', 'job', 'promotion'] },
      { name: 'Relationships', keywords: ['family', 'friend', 'love', 'partner'] },
      { name: 'Health Journey', keywords: ['health', 'fitness', 'exercise', 'diet'] },
      { name: 'Creative Expression', keywords: ['music', 'write', 'art', 'create'] },
      { name: 'Financial Evolution', keywords: ['money', 'finance', 'invest', 'wealth'] },
      { name: 'Spiritual Development', keywords: ['spiritual', 'prayer', 'meditation', 'faith'] },
      { name: 'Learning & Growth', keywords: ['learn', 'study', 'course', 'skill'] },
    ];

    const lowerContent = content.toLowerCase();

    for (const theme of themes) {
      for (const keyword of theme.keywords) {
        if (lowerContent.includes(keyword)) {
          return theme.name;
        }
      }
    }

    return 'General Reflections';
  }

  /**
   * Suggest era based on entries
   */
  private suggestEra(entries: any[]): string {
    if (entries.length === 0) return 'Current';

    // Get most recent entry date
    const dates = entries
      .map((e) => new Date(e.entry_date))
      .sort((a, b) => b.getTime() - a.getTime());

    const recentDate = dates[0];
    const year = recentDate.getFullYear();

    // Era heuristics (can be customized)
    if (year >= 2025) return 'Era of Expansion 2025–2030';
    if (year >= 2020) return 'Era of Transformation 2020–2025';
    if (year >= 2015) return 'Era of Foundation 2015–2020';
    return 'Era of Beginnings';
  }

  /**
   * Find or create autobiography chapter
   */
  private async findOrCreateChapter(
    userId: string,
    theme: string,
    era?: string
  ): Promise<any> {
    // Try to find existing chapter
    const { data: existing } = await this.supabase
      .from('fd_autobiography_chapter')
      .select('*')
      .eq('user_id', userId)
      .eq('theme', theme)
      .eq('era', era || 'Current')
      .single();

    if (existing) return existing;

    // Create new chapter
    const { data, error } = await this.supabase
      .from('fd_autobiography_chapter')
      .insert({
        user_id: userId,
        title: `${theme} — ${era || 'Current'}`,
        theme,
        era: era || 'Current',
        summary: '',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Link entry to chapter
   */
  private async linkEntryToChapter(
    entryId: string,
    chapterId: string,
    theme: string
  ): Promise<void> {
    await this.supabase.from('fd_autobiography_link').upsert(
      {
        chapter_id: chapterId,
        entry_id: entryId,
        theme,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'chapter_id,entry_id',
      }
    );
  }

  /**
   * Update chapter summary
   */
  private async updateChapterSummary(
    chapterId: string,
    entries: any[]
  ): Promise<void> {
    // TODO: Generate AI summary of entries
    // For now, use simple concatenation

    const summary = entries
      .slice(0, 3)
      .map((e) => e.content.substring(0, 100))
      .join(' ... ');

    await this.supabase
      .from('fd_autobiography_chapter')
      .update({
        summary: summary + '...',
        updated_at: new Date().toISOString(),
      })
      .eq('id', chapterId);
  }

  /**
   * Calculate narrative coherence score
   */
  private async calculateCoherence(
    userId: string,
    chapterIds: string[]
  ): Promise<number> {
    // Get all links for these chapters
    const { data: links } = await this.supabase
      .from('fd_autobiography_link')
      .select('*')
      .in('chapter_id', chapterIds);

    if (!links || links.length === 0) return 0.5;

    // Coherence = (linked_entries / total_entries) × theme_consistency
    const linkedEntries = links.length;

    // Get total entries for user
    const { count: totalEntries } = await this.supabase
      .from('fd_entry')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (!totalEntries) return 0.5;

    const coverage = linkedEntries / totalEntries;

    // Theme consistency (simple heuristic)
    const themes = new Set(links.map((l) => l.theme));
    const consistency = Math.min(1.0, themes.size / 10); // More themes = higher consistency

    const coherence = (coverage * 0.7 + consistency * 0.3);
    return Math.round(coherence * 100) / 100;
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

export default NarrativeAgent;
