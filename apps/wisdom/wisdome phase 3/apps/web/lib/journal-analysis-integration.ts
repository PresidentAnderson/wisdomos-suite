/**
 * Journal Analysis Integration
 *
 * Purpose: Integrate AI journal analysis with existing journal workflow
 * Features:
 * - Auto-analyze journal entries on save
 * - Store scores in fd_score_raw table
 * - Link journal entries to fulfillment areas
 * - Handle errors gracefully
 *
 * @module journal-analysis-integration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { analyzeJournalEntry, AnalyzedScore } from './ai-journal-analysis';

// =====================================================
// TYPES
// =====================================================

export interface JournalAnalysisOptions {
  autoAnalyze?: boolean;
  saveImmediately?: boolean;
  minConfidence?: number; // Only save scores above this confidence
}

export interface SaveScoresOptions {
  userId: string;
  tenantId: string;
  journalEntryId?: string;
  period?: string; // 'YYYY-MM' format, defaults to current month
  source?: 'journal_ai' | 'journal_manual';
  provenance?: string;
}

export interface SaveScoresResult {
  success: boolean;
  savedCount: number;
  skippedCount: number;
  errors?: string[];
}

// =====================================================
// SUPABASE CLIENT
// =====================================================

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}

// =====================================================
// MAIN INTEGRATION FUNCTIONS
// =====================================================

/**
 * Analyze journal entry and return scores
 */
export async function analyzeJournal(
  journalText: string,
  options?: JournalAnalysisOptions
): Promise<AnalyzedScore[]> {
  const minConfidence = options?.minConfidence || 0.3;

  const result = await analyzeJournalEntry(journalText);

  if ('error' in result) {
    throw new Error(result.error);
  }

  // Filter by confidence threshold
  return result.scores.filter(score => score.confidence >= minConfidence);
}

/**
 * Save analyzed scores to Supabase fd_score_raw table
 */
export async function saveScoresToSupabase(
  scores: AnalyzedScore[],
  options: SaveScoresOptions
): Promise<SaveScoresResult> {
  const {
    userId,
    tenantId,
    journalEntryId,
    period,
    source = 'journal_ai',
    provenance = 'ai-journal-analysis-v1',
  } = options;

  const supabase = getSupabaseClient();
  const errors: string[] = [];
  let savedCount = 0;
  let skippedCount = 0;

  // Determine period (default to current month)
  const currentPeriod = period || getCurrentMonthPeriod();

  // Get area IDs from codes
  const areaCodes = scores.map(s => s.area_code);
  const { data: areas, error: areasError } = await supabase
    .from('fd_area')
    .select('id, code')
    .in('code', areaCodes);

  if (areasError) {
    errors.push(`Failed to fetch areas: ${areasError.message}`);
    return { success: false, savedCount: 0, skippedCount: scores.length, errors };
  }

  if (!areas || areas.length === 0) {
    errors.push('No matching areas found in database');
    return { success: false, savedCount: 0, skippedCount: scores.length, errors };
  }

  // Create area code to ID map
  const areaMap = new Map(areas.map(a => [a.code, a.id]));

  // Insert scores
  for (const score of scores) {
    const areaId = areaMap.get(score.area_code);

    if (!areaId) {
      errors.push(`Area ${score.area_code} not found in database`);
      skippedCount++;
      continue;
    }

    const { error: insertError } = await supabase
      .from('fd_score_raw')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        area_id: areaId,
        period: currentPeriod,
        score: score.score,
        source,
        provenance: `${provenance} | confidence: ${score.confidence.toFixed(2)} | ${score.reasoning}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      errors.push(`Failed to save score for ${score.area_code}: ${insertError.message}`);
      skippedCount++;
    } else {
      savedCount++;
    }
  }

  // If we have a journal entry ID, create links
  if (journalEntryId && savedCount > 0) {
    await linkJournalToAreas(journalEntryId, scores, areaMap);
  }

  return {
    success: errors.length === 0,
    savedCount,
    skippedCount,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Link journal entry to life areas in fd_entry_link table
 */
async function linkJournalToAreas(
  entryId: string,
  scores: AnalyzedScore[],
  areaMap: Map<string, string>
): Promise<void> {
  const supabase = getSupabaseClient();

  const links = scores
    .map(score => {
      const areaId = areaMap.get(score.area_code);
      if (!areaId) return null;

      return {
        entry_id: entryId,
        area_id: areaId,
        strength: score.confidence,
        created_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  if (links.length > 0) {
    const { error } = await supabase
      .from('fd_entry_link')
      .insert(links);

    if (error) {
      console.error('Failed to create entry links:', error);
    }
  }
}

/**
 * Complete workflow: Analyze and save journal entry
 */
export async function analyzeAndSaveJournal(
  journalText: string,
  options: SaveScoresOptions & JournalAnalysisOptions
): Promise<{
  analysis: AnalyzedScore[];
  saveResult: SaveScoresResult;
}> {
  // Step 1: Analyze
  const scores = await analyzeJournal(journalText, options);

  // Step 2: Save (if enabled)
  let saveResult: SaveScoresResult;

  if (options.saveImmediately !== false) {
    saveResult = await saveScoresToSupabase(scores, options);
  } else {
    saveResult = {
      success: true,
      savedCount: 0,
      skippedCount: scores.length,
    };
  }

  return {
    analysis: scores,
    saveResult,
  };
}

/**
 * Create a journal entry in fd_entry table
 */
export async function createJournalEntry(
  content: string,
  options: {
    userId: string;
    tenantId: string;
    date?: string; // ISO date
    sentiment?: number;
    aiSummary?: string;
    lang?: string;
    sources?: string[];
  }
): Promise<{ id: string } | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('fd_entry')
    .insert({
      user_id: options.userId,
      tenant_id: options.tenantId,
      date: options.date || new Date().toISOString().split('T')[0],
      content_md: content,
      sentiment: options.sentiment,
      ai_summary: options.aiSummary,
      lang: options.lang || 'en',
      sources: options.sources || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create journal entry:', error);
    return null;
  }

  return data;
}

/**
 * Complete workflow: Create entry, analyze, and save scores
 */
export async function createAnalyzeAndSaveJournal(
  journalText: string,
  options: {
    userId: string;
    tenantId: string;
    date?: string;
    lang?: string;
    sources?: string[];
    minConfidence?: number;
  }
): Promise<{
  entryId: string | null;
  analysis: AnalyzedScore[];
  saveResult: SaveScoresResult;
}> {
  // Step 1: Analyze to get summary and sentiment
  const analysisResult = await analyzeJournalEntry(journalText);

  if ('error' in analysisResult) {
    throw new Error(analysisResult.error);
  }

  // Step 2: Create journal entry
  const entry = await createJournalEntry(journalText, {
    userId: options.userId,
    tenantId: options.tenantId,
    date: options.date,
    sentiment: analysisResult.sentiment,
    aiSummary: analysisResult.summary,
    lang: options.lang,
    sources: options.sources,
  });

  if (!entry) {
    throw new Error('Failed to create journal entry');
  }

  // Step 3: Save scores
  const minConfidence = options.minConfidence || 0.3;
  const filteredScores = analysisResult.scores.filter(
    score => score.confidence >= minConfidence
  );

  const saveResult = await saveScoresToSupabase(filteredScores, {
    userId: options.userId,
    tenantId: options.tenantId,
    journalEntryId: entry.id,
  });

  return {
    entryId: entry.id,
    analysis: filteredScores,
    saveResult,
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonthPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get period for a specific date
 */
export function getPeriodForDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Fetch existing scores for a period
 */
export async function getExistingScores(
  userId: string,
  period: string
): Promise<Array<{ area_code: string; score: number; source: string }>> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('fd_score_raw')
    .select(`
      score,
      source,
      fd_area!inner (code)
    `)
    .eq('user_id', userId)
    .eq('period', period);

  if (error) {
    console.error('Failed to fetch existing scores:', error);
    return [];
  }

  return (data || []).map(item => ({
    area_code: (item.fd_area as any).code,
    score: item.score,
    source: item.source,
  }));
}

/**
 * Check if user has recent AI analysis
 */
export async function hasRecentAnalysis(
  userId: string,
  hoursThreshold: number = 24
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const thresholdDate = new Date();
  thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

  const { data, error } = await supabase
    .from('fd_score_raw')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'journal_ai')
    .gte('created_at', thresholdDate.toISOString())
    .limit(1);

  if (error) {
    console.error('Failed to check recent analysis:', error);
    return false;
  }

  return (data?.length || 0) > 0;
}
