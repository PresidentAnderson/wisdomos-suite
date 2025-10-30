'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEntries,
  fetchEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  analyzeEntry,
} from '@/lib/autobiography/api-helpers';
import type {
  AutobiographyEntry,
  CreateEntryInput,
  UpdateEntryInput,
  EntryFilters,
} from '@/lib/autobiography/types';
import { useToast } from '@/hooks/use-toast';

export function useAutobiographyEntries(filters?: EntryFilters) {
  return useQuery({
    queryKey: ['autobiography-entries', filters],
    queryFn: () => fetchEntries(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAutobiographyEntry(id: string) {
  return useQuery({
    queryKey: ['autobiography-entry', id],
    queryFn: () => fetchEntry(id),
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateEntryInput) => createEntry(data),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: ['autobiography-entries'] });
      queryClient.invalidateQueries({ queryKey: ['chapter-progress'] });
      toast({
        title: 'Entry created',
        description: 'Your autobiography entry has been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEntryInput }) =>
      updateEntry(id, data),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: ['autobiography-entries'] });
      queryClient.invalidateQueries({ queryKey: ['autobiography-entry', updatedEntry.id] });
      toast({
        title: 'Entry updated',
        description: 'Your changes have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autobiography-entries'] });
      queryClient.invalidateQueries({ queryKey: ['chapter-progress'] });
      toast({
        title: 'Entry deleted',
        description: 'Your entry has been permanently removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAnalyzeEntry() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ text, promptText }: { text: string; promptText: string }) =>
      analyzeEntry(text, promptText),
    onError: (error: Error) => {
      toast({
        title: 'Analysis failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Hook for getting entries by chapter
export function useChapterEntries(chapter: string) {
  return useAutobiographyEntries({ chapter });
}

// Hook for getting entry statistics
export function useEntryStats() {
  const { data: entries } = useAutobiographyEntries();

  if (!entries) {
    return {
      totalEntries: 0,
      totalWords: 0,
      averageWordsPerEntry: 0,
      entriesByChapter: {},
      entriesBySentiment: {},
      allTags: [],
    };
  }

  const totalEntries = entries.length;
  const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const averageWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

  const entriesByChapter = entries.reduce((acc, entry) => {
    acc[entry.chapter] = (acc[entry.chapter] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const entriesBySentiment = entries.reduce((acc, entry) => {
    if (entry.sentiment) {
      acc[entry.sentiment] = (acc[entry.sentiment] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.tags))
  ).sort();

  return {
    totalEntries,
    totalWords,
    averageWordsPerEntry,
    entriesByChapter,
    entriesBySentiment,
    allTags,
  };
}
