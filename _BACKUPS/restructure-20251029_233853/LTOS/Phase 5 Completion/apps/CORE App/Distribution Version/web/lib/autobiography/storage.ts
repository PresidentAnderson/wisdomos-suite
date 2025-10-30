'use client';

import type { AutobiographyEntry } from './types';

const STORAGE_KEY = 'wisdomos_autobiography_entries';
const DRAFT_KEY = 'wisdomos_autobiography_draft';

export function cacheEntries(entries: AutobiographyEntry[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to cache entries:', error);
  }
}

export function getCachedEntries(): AutobiographyEntry[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached entries:', error);
    return null;
  }
}

export function saveDraft(entry: Partial<AutobiographyEntry>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      ...entry,
      savedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

export function getDraft(): (Partial<AutobiographyEntry> & { savedAt: string }) | null {
  if (typeof window === 'undefined') return null;

  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Failed to get draft:', error);
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

export function clearCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}
