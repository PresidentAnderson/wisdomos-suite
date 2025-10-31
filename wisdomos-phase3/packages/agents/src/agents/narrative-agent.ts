/**
 * Narrative Agent
 * Build autobiography (1975-2100), chapters by era/decade, coherence scores
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type { MessageEnvelope } from '../types/contracts';
import { EventTypes } from '../types/contracts';
import { v4 as uuidv4 } from 'uuid';

export interface Era {
  id: string;
  code: string;
  name: string;
  start_year: number;
  end_year: number;
}

export interface Chapter {
  id: string;
  userId: string;
  eraId: string;
  areaId?: string;
  title: string;
  summary: string;
  coherenceScore: number;
  themeTags: string[];
}

export class NarrativeAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, agentType: 'NarrativeAgent' });
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `NarrativeAgent handling: ${message.task}`);

    // Listen for journal entry created
    if (message.payload.event_type === EventTypes.JOURNAL_ENTRY_CREATED) {
      await this.onJournalEntryCreated(message.payload);
    }

    // Listen for fulfilment rollup completed
    if (message.payload.event_type === EventTypes.FULFILMENT_ROLLUP_COMPLETED) {
      await this.onFulfilmentRollupCompleted(message.payload);
    }

    // Handle chapter generation
    if (message.intent === 'execute' && message.task.includes('generate_chapter')) {
      await this.generateChapter(message.payload as { user_id: string; era_id: string; area_id?: string });
    }
  }

  /**
   * Handle journal entry created event
   */
  private async onJournalEntryCreated(eventPayload: any): Promise<void> {
    const { entry_id, user_id } = eventPayload;

    await this.log('info', `Processing entry ${entry_id} for narrative`);

    // 1. Get entry details
    const entry = await this.fetchEntry(entry_id);

    // 2. Determine era based on entry date
    const era = await this.getEraForDate(entry.entry_date);

    if (!era) {
      await this.log('warn', `No era found for date ${entry.entry_date}`);
      return;
    }

    // 3. Embed entry and cluster by theme/area
    const themes = await this.extractThemes(entry.content);
    const areaId = entry.area_id;

    // 4. Find or create chapter
    const chapter = await this.findOrCreateChapter(user_id, era.id, areaId);

    // 5. Link entry to chapter
    await this.linkEntryToChapter(chapter.id, entry_id, themes);

    // 6. Update chapter summary and coherence
    await this.updateChapter(chapter.id, user_id);

    await this.emitEvent(EventTypes.AUTOBIOGRAPHY_CHAPTER_UPDATED, {
      chapter_id: chapter.id,
      entry_id,
      era_code: era.code,
    });
  }

  /**
   * Handle fulfilment rollup completed event
   */
  private async onFulfilmentRollupCompleted(eventPayload: any): Promise<void> {
    const { user_id, period, month } = eventPayload;

    await this.log('info', `Updating chapters after rollup for user ${user_id}`);

    // Refresh chapters with new score data
    // In production, this would re-analyze and update chapter summaries
  }

  /**
   * Fetch entry from database
   */
  private async fetchEntry(entryId: string): Promise<any> {
    // In production: SELECT * FROM fd_entries WHERE id = $1
    await this.log('debug', `Fetching entry ${entryId}`);
    return {
      id: entryId,
      content: 'Mock entry content',
      entry_date: '1999-12-31',
      area_id: 'area-1',
    };
  }

  /**
   * Get era for a given date
   */
  private async getEraForDate(date: string): Promise<Era | null> {
    const year = parseInt(date.split('-')[0]);

    // In production: SELECT * FROM fd_eras WHERE start_year <= $1 AND end_year >= $1
    await this.log('debug', `Finding era for year ${year}`);

    // Mock eras
    const eras: Era[] = [
      { id: 'era-1', code: '1975-1984', name: 'Foundation Years', start_year: 1975, end_year: 1984 },
      { id: 'era-2', code: '1985-1994', name: 'Growth Decade', start_year: 1985, end_year: 1994 },
      { id: 'era-3', code: '1995-2004', name: 'Digital Age', start_year: 1995, end_year: 2004 },
      { id: 'era-4', code: '2005-2014', name: 'Expansion', start_year: 2005, end_year: 2014 },
      { id: 'era-5', code: '2015-2024', name: 'Transformation', start_year: 2015, end_year: 2024 },
      { id: 'era-6', code: '2025-2034', name: 'Mastery', start_year: 2025, end_year: 2034 },
    ];

    return eras.find((era) => year >= era.start_year && year <= era.end_year) || null;
  }

  /**
   * Extract themes from entry content
   */
  private async extractThemes(content: string): Promise<string[]> {
    // In production: Use LLM to extract key themes and topics
    await this.log('debug', 'Extracting themes from content');

    // Mock themes
    return ['career', 'growth', 'reflection'];
  }

  /**
   * Find or create chapter
   */
  private async findOrCreateChapter(
    userId: string,
    eraId: string,
    areaId?: string
  ): Promise<Chapter> {
    // In production: SELECT FROM fd_autobiography_chapters WHERE user_id = $1 AND era_id = $2 AND area_id = $3
    await this.log('debug', `Finding chapter for era ${eraId}`);

    // If not found, create
    const chapterId = uuidv4();
    const chapter: Chapter = {
      id: chapterId,
      userId,
      eraId,
      areaId,
      title: 'Chapter Title', // Generate based on era and area
      summary: '',
      coherenceScore: 0,
      themeTags: [],
    };

    // In production: INSERT INTO fd_autobiography_chapters
    return chapter;
  }

  /**
   * Link entry to chapter
   */
  private async linkEntryToChapter(
    chapterId: string,
    entryId: string,
    themes: string[]
  ): Promise<void> {
    await this.log('debug', `Linking entry ${entryId} to chapter ${chapterId}`);

    // Calculate relevance score based on themes
    const relevanceScore = 0.85;

    // In production: INSERT INTO fd_autobiography_links
    await this.emitEvent(EventTypes.AUTOBIOGRAPHY_LINK_CREATED, {
      chapter_id: chapterId,
      entry_id: entryId,
      relevance_score: relevanceScore,
    });
  }

  /**
   * Update chapter summary and coherence
   */
  private async updateChapter(chapterId: string, userId: string): Promise<void> {
    await this.log('info', `Updating chapter ${chapterId}`);

    // 1. Get all entries linked to this chapter
    const entries = await this.getChapterEntries(chapterId);

    // 2. Generate summary using LLM
    const summary = await this.generateSummary(entries);

    // 3. Calculate coherence score
    const coherenceScore = await this.calculateCoherence(entries);

    // 4. Extract theme tags
    const themeTags = await this.extractCommonThemes(entries);

    // 5. Update chapter
    // In production: UPDATE fd_autobiography_chapters SET summary = $1, coherence_score = $2, theme_tags = $3
    await this.log('debug', `Chapter updated with coherence ${coherenceScore}`);
  }

  /**
   * Get chapter entries
   */
  private async getChapterEntries(chapterId: string): Promise<any[]> {
    // In production: SELECT e.* FROM fd_entries e JOIN fd_autobiography_links l ON l.entry_id = e.id WHERE l.chapter_id = $1
    return [];
  }

  /**
   * Generate chapter summary
   */
  private async generateSummary(entries: any[]): Promise<string> {
    // In production: Use LLM to generate coherent chapter summary
    await this.log('debug', `Generating summary from ${entries.length} entries`);
    return 'This chapter explores key moments and themes...';
  }

  /**
   * Calculate coherence score
   */
  private async calculateCoherence(entries: any[]): Promise<number> {
    // In production: Measure semantic coherence of entries using embeddings
    // Returns 0.0 to 1.0
    return 0.75;
  }

  /**
   * Extract common themes
   */
  private async extractCommonThemes(entries: any[]): Promise<string[]> {
    // In production: Use LLM/clustering to find common themes
    return ['transformation', 'growth', 'challenges'];
  }

  /**
   * Generate chapter for specific era/area
   */
  async generateChapter(payload: {
    user_id: string;
    era_id: string;
    area_id?: string;
  }): Promise<string> {
    const { user_id, era_id, area_id } = payload;

    await this.log('info', `Generating chapter for user ${user_id}, era ${era_id}`);

    const chapter = await this.findOrCreateChapter(user_id, era_id, area_id);
    await this.updateChapter(chapter.id, user_id);

    return chapter.id;
  }
}
