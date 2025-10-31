/**
 * useJournalAnalysis Hook
 *
 * Purpose: React hook for journal AI analysis
 * Features:
 * - Trigger analysis with loading states
 * - Save scores to Supabase
 * - Error handling
 * - Optimistic updates
 *
 * @hook useJournalAnalysis
 */

import { useState, useCallback } from 'react';
import {
  analyzeJournalEntry,
  AnalyzedScore,
  JournalAnalysisResult,
} from '@/lib/ai-journal-analysis';
import {
  saveScoresToSupabase,
  SaveScoresResult,
  SaveScoresOptions,
} from '@/lib/journal-analysis-integration';

// =====================================================
// TYPES
// =====================================================

export interface UseJournalAnalysisResult {
  // State
  isAnalyzing: boolean;
  isSaving: boolean;
  analysisResult: JournalAnalysisResult | null;
  error: string | null;

  // Actions
  analyze: (journalText: string) => Promise<void>;
  saveScores: (scores: AnalyzedScore[], options: SaveScoresOptions) => Promise<SaveScoresResult>;
  reset: () => void;
}

// =====================================================
// HOOK
// =====================================================

export function useJournalAnalysis(): UseJournalAnalysisResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JournalAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Analyze journal text
   */
  const analyze = useCallback(async (journalText: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeJournalEntry(journalText);

      if ('error' in result) {
        setError(result.error);
        setAnalysisResult(null);
      } else {
        setAnalysisResult(result);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze journal entry');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Save scores to Supabase
   */
  const saveScores = useCallback(
    async (scores: AnalyzedScore[], options: SaveScoresOptions): Promise<SaveScoresResult> => {
      setIsSaving(true);
      setError(null);

      try {
        const result = await saveScoresToSupabase(scores, options);

        if (!result.success) {
          setError(result.errors?.join(', ') || 'Failed to save some scores');
        }

        return result;
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to save scores';
        setError(errorMsg);
        return {
          success: false,
          savedCount: 0,
          skippedCount: scores.length,
          errors: [errorMsg],
        };
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setIsSaving(false);
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    isSaving,
    analysisResult,
    error,
    analyze,
    saveScores,
    reset,
  };
}

/**
 * Hook for simplified workflow: analyze and save in one action
 */
export function useJournalAnalysisWithSave() {
  const {
    isAnalyzing,
    isSaving,
    analysisResult,
    error,
    analyze,
    saveScores,
    reset,
  } = useJournalAnalysis();

  const analyzeAndSave = useCallback(
    async (
      journalText: string,
      options: SaveScoresOptions & { minConfidence?: number }
    ): Promise<{ success: boolean; savedCount: number }> => {
      // Step 1: Analyze
      await analyze(journalText);

      // Check if analysis succeeded
      if (!analysisResult || error) {
        return { success: false, savedCount: 0 };
      }

      // Step 2: Filter by confidence
      const minConfidence = options.minConfidence || 0.3;
      const filteredScores = analysisResult.scores.filter(
        score => score.confidence >= minConfidence
      );

      if (filteredScores.length === 0) {
        return { success: true, savedCount: 0 };
      }

      // Step 3: Save
      const saveResult = await saveScores(filteredScores, options);

      return {
        success: saveResult.success,
        savedCount: saveResult.savedCount,
      };
    },
    [analyze, saveScores, analysisResult, error]
  );

  return {
    isAnalyzing,
    isSaving,
    isProcessing: isAnalyzing || isSaving,
    analysisResult,
    error,
    analyzeAndSave,
    reset,
  };
}
