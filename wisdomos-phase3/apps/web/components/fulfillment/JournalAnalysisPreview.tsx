'use client';

/**
 * Journal Analysis Preview Component
 *
 * Purpose: Display AI-extracted fulfillment scores from journal entries
 * Features:
 * - Phoenix-themed animated loading state
 * - Score visualization per life area
 * - AI reasoning display
 * - Accept/reject/adjust scores
 * - Batch save to Supabase
 *
 * @component JournalAnalysisPreview
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Check,
  X,
  Edit2,
  Save,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Brain,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  analyzeJournalEntry,
  getAreaName,
  getScoreInterpretation,
  isOpenAIAvailable,
  AnalyzedScore,
  JournalAnalysisResult,
  LIFE_AREAS,
} from '@/lib/ai-journal-analysis';

// =====================================================
// TYPES
// =====================================================

interface JournalAnalysisPreviewProps {
  journalText: string;
  journalId?: string;
  userId: string;
  tenantId: string;
  onSave?: (scores: AnalyzedScore[]) => Promise<void>;
  onClose?: () => void;
  autoAnalyze?: boolean;
}

interface ScoreEdit {
  area_code: string;
  score: number;
}

// =====================================================
// COMPONENT
// =====================================================

export function JournalAnalysisPreview({
  journalText,
  journalId,
  userId,
  tenantId,
  onSave,
  onClose,
  autoAnalyze = false,
}: JournalAnalysisPreviewProps) {
  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JournalAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedScores, setSelectedScores] = useState<Set<string>>(new Set());
  const [editingScores, setEditingScores] = useState<Map<string, number>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Auto-analyze on mount if enabled
  useEffect(() => {
    if (autoAnalyze && journalText && !analysisResult && !isAnalyzing) {
      handleAnalyze();
    }
  }, [autoAnalyze, journalText]);

  // Handle analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeJournalEntry(journalText);

      if ('error' in result) {
        setError(result.error);
        setAnalysisResult(null);
      } else {
        setAnalysisResult(result);
        // Auto-select all scores
        setSelectedScores(new Set(result.scores.map(s => s.area_code)));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze journal entry');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle score toggle
  const toggleScore = (areaCode: string) => {
    const newSelected = new Set(selectedScores);
    if (newSelected.has(areaCode)) {
      newSelected.delete(areaCode);
    } else {
      newSelected.add(areaCode);
    }
    setSelectedScores(newSelected);
  };

  // Handle score edit
  const handleEditScore = (areaCode: string, newScore: number) => {
    const newEdits = new Map(editingScores);
    newEdits.set(areaCode, Math.max(0, Math.min(5, newScore)));
    setEditingScores(newEdits);
  };

  // Handle save
  const handleSave = async () => {
    if (!analysisResult || selectedScores.size === 0) return;

    setIsSaving(true);
    try {
      // Get selected scores with edits applied
      const scoresToSave = analysisResult.scores
        .filter(score => selectedScores.has(score.area_code))
        .map(score => ({
          ...score,
          score: editingScores.get(score.area_code) ?? score.score,
        }));

      if (onSave) {
        await onSave(scoresToSave);
      }

      // Success - close modal
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if OpenAI is available
  const openAIAvailable = isOpenAIAvailable();

  // =====================================================
  // RENDER: No Analysis Yet
  // =====================================================

  if (!isAnalyzing && !analysisResult && !error) {
    return (
      <div className="bg-gradient-to-br from-phoenix-gold/10 via-white to-phoenix-orange/10 rounded-2xl p-8 border-2 border-phoenix-gold/20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-phoenix-gold to-phoenix-orange rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900">
            AI Journal Analysis
          </h3>

          <p className="text-gray-600 max-w-md mx-auto">
            Let AI analyze your journal entry to automatically extract fulfillment scores
            across your life areas.
          </p>

          {!openAIAvailable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">OpenAI API key not configured</p>
                  <p className="mt-1">
                    Add <code className="bg-yellow-100 px-1 rounded">OPENAI_API_KEY</code> to
                    your environment variables to enable AI analysis.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!openAIAvailable}
              className="bg-gradient-to-r from-phoenix-gold to-phoenix-orange text-white hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Entry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER: Analyzing State
  // =====================================================

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-br from-phoenix-gold/10 via-white to-phoenix-orange/10 rounded-2xl p-12 border-2 border-phoenix-gold/20">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Phoenix Animation */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-phoenix-gold to-phoenix-orange rounded-full relative"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-phoenix-orange rounded-full"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing Your Journal...
            </h3>
            <p className="text-gray-600">
              AI is reading your entry and extracting insights
            </p>
          </div>

          {/* Loading dots */}
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-phoenix-orange rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // =====================================================
  // RENDER: Error State
  // =====================================================

  if (error && !analysisResult) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-red-900">
            Analysis Failed
          </h3>

          <p className="text-red-700 max-w-md mx-auto">
            {error}
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={handleAnalyze}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER: Results
  // =====================================================

  if (!analysisResult) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-phoenix-gold to-phoenix-orange p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-white" />
              <h3 className="text-2xl font-bold text-white">
                Analysis Complete
              </h3>
            </div>
            <p className="text-white/90 text-sm">
              {analysisResult.summary}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Overall Sentiment */}
        <div className="mt-4 bg-white/20 backdrop-blur rounded-lg p-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            {analysisResult.sentiment > 0 ? (
              <>
                <ThumbsUp className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Positive tone</span>
              </>
            ) : analysisResult.sentiment < 0 ? (
              <>
                <ThumbsDown className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Challenging tone</span>
              </>
            ) : (
              <>
                <Minus className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Neutral tone</span>
              </>
            )}
          </div>
          <div className="flex-1 bg-white/30 rounded-full h-2">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.abs(analysisResult.sentiment) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Scores List */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {analysisResult.scores.length} area(s) detected. Select scores to save:
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedScores(new Set(analysisResult.scores.map(s => s.area_code)))}
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedScores(new Set())}
            >
              Deselect All
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {analysisResult.scores.map((score, index) => {
            const isSelected = selectedScores.has(score.area_code);
            const editedScore = editingScores.get(score.area_code) ?? score.score;
            const interpretation = getScoreInterpretation(editedScore);
            const area = LIFE_AREAS[score.area_code as keyof typeof LIFE_AREAS];

            return (
              <motion.div
                key={score.area_code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-phoenix-orange bg-phoenix-orange/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleScore(score.area_code)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      isSelected
                        ? 'bg-phoenix-orange border-phoenix-orange'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Area Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{area?.emoji || '📊'}</span>
                      <h4 className="font-semibold text-gray-900">
                        {area?.name || score.area_code}
                      </h4>
                      <Badge
                        variant="secondary"
                        className={`ml-auto ${
                          interpretation.status === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : interpretation.status === 'friction'
                            ? 'bg-yellow-100 text-yellow-700'
                            : interpretation.status === 'healthy'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {interpretation.message}
                      </Badge>
                    </div>

                    {/* Score Display */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Score:</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditScore(score.area_code, val);
                              }}
                              className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                                editedScore >= val
                                  ? 'bg-phoenix-orange text-white'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium text-gray-900">
                          {Math.round(score.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 italic">
                        "{score.reasoning}"
                      </p>
                    </div>

                    {/* Edited indicator */}
                    {editingScores.has(score.area_code) && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-phoenix-orange">
                        <Edit2 className="w-3 h-3" />
                        <span>Score adjusted</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedScores.size} score(s) selected
            {analysisResult.token_usage && (
              <span className="ml-3 text-gray-400">
                • {analysisResult.token_usage.total} tokens used
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={selectedScores.size === 0 || isSaving}
              className="bg-gradient-to-r from-phoenix-gold to-phoenix-orange text-white hover:opacity-90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save {selectedScores.size} Score(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
