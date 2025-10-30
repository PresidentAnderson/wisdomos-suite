'use client';

/**
 * Journal Analysis Modal
 *
 * Purpose: Modal wrapper for journal analysis that can be integrated into journal workflow
 * Usage: Show after journal entry is saved to offer AI analysis
 *
 * @component JournalAnalysisModal
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { JournalAnalysisPreview } from '@/components/fulfillment/JournalAnalysisPreview';
import { useJournalAnalysis } from '@/hooks/useJournalAnalysis';
import { AnalyzedScore } from '@/lib/ai-journal-analysis';

// =====================================================
// TYPES
// =====================================================

interface JournalAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalText: string;
  journalId?: string;
  userId: string;
  tenantId: string;
  autoAnalyze?: boolean;
  onScoresSaved?: (scores: AnalyzedScore[]) => void;
}

// =====================================================
// COMPONENT
// =====================================================

export function JournalAnalysisModal({
  isOpen,
  onClose,
  journalText,
  journalId,
  userId,
  tenantId,
  autoAnalyze = true,
  onScoresSaved,
}: JournalAnalysisModalProps) {
  const { saveScores } = useJournalAnalysis();

  // Handle save
  const handleSave = async (scores: AnalyzedScore[]) => {
    const result = await saveScores(scores, {
      userId,
      tenantId,
      journalEntryId: journalId,
      source: 'journal_ai',
      provenance: 'journal-analysis-modal-v1',
    });

    if (result.success) {
      // Notify parent
      if (onScoresSaved) {
        onScoresSaved(scores);
      }

      // Show success message (optional)
      console.log(`Successfully saved ${result.savedCount} scores`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <JournalAnalysisPreview
              journalText={journalText}
              journalId={journalId}
              userId={userId}
              tenantId={tenantId}
              onSave={handleSave}
              onClose={onClose}
              autoAnalyze={autoAnalyze}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline Analysis Component (for embedding in journal forms)
 */
export function InlineJournalAnalysis({
  journalText,
  userId,
  tenantId,
  onScoresSaved,
}: {
  journalText: string;
  userId: string;
  tenantId: string;
  onScoresSaved?: (scores: AnalyzedScore[]) => void;
}) {
  const { saveScores } = useJournalAnalysis();

  const handleSave = async (scores: AnalyzedScore[]) => {
    const result = await saveScores(scores, {
      userId,
      tenantId,
      source: 'journal_ai',
    });

    if (result.success && onScoresSaved) {
      onScoresSaved(scores);
    }
  };

  return (
    <div className="w-full">
      <JournalAnalysisPreview
        journalText={journalText}
        userId={userId}
        tenantId={tenantId}
        onSave={handleSave}
        autoAnalyze={false}
      />
    </div>
  );
}
