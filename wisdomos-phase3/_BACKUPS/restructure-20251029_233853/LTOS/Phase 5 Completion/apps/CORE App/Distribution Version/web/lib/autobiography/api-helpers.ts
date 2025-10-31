import type {
  AutobiographyEntry,
  CreateEntryInput,
  UpdateEntryInput,
  EntryFilters,
  ChapterProgress,
  AIInsights,
} from './types';

// Client-side API helpers
const BASE_URL = '/api/autobiography';

export async function fetchEntries(filters?: EntryFilters): Promise<AutobiographyEntry[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.chapter) params.append('chapter', filters.chapter);
    if (filters.search) params.append('search', filters.search);
    if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
  }

  const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch entries: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchEntry(id: string): Promise<AutobiographyEntry> {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Entry not found');
    }
    throw new Error(`Failed to fetch entry: ${response.statusText}`);
  }

  return response.json();
}

export async function createEntry(data: CreateEntryInput): Promise<AutobiographyEntry> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to create entry');
  }

  return response.json();
}

export async function updateEntry(id: string, data: UpdateEntryInput): Promise<AutobiographyEntry> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Failed to update entry');
  }

  return response.json();
}

export async function deleteEntry(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete entry: ${response.statusText}`);
  }
}

export async function analyzeEntry(text: string, promptText: string): Promise<AIInsights> {
  const response = await fetch('/api/ai/analyze-entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, promptText }),
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze entry: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchChapterProgress(chapter: string): Promise<ChapterProgress | null> {
  const response = await fetch(`${BASE_URL}/progress/${chapter}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch chapter progress: ${response.statusText}`);
  }

  return response.json();
}

// Upload audio file
export async function uploadAudio(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch('/api/upload/audio', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload audio: ${response.statusText}`);
  }

  const { url } = await response.json();
  return url;
}

// Export entries as JSON
export async function exportEntries(filters?: EntryFilters): Promise<Blob> {
  const entries = await fetchEntries(filters);
  const json = JSON.stringify(entries, null, 2);
  return new Blob([json], { type: 'application/json' });
}

// Export entries as PDF (requires server-side implementation)
export async function exportEntriesPDF(filters?: EntryFilters): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.chapter) params.append('chapter', filters.chapter);
    if (filters.search) params.append('search', filters.search);
    if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
  }

  const url = params.toString()
    ? `${BASE_URL}/export/pdf?${params}`
    : `${BASE_URL}/export/pdf`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to export PDF: ${response.statusText}`);
  }

  return response.blob();
}

// Batch operations
export async function batchUpdateTags(entryIds: string[], tags: string[]): Promise<void> {
  const response = await fetch(`${BASE_URL}/batch/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entryIds, tags }),
  });

  if (!response.ok) {
    throw new Error(`Failed to batch update tags: ${response.statusText}`);
  }
}

export async function batchDelete(entryIds: string[]): Promise<void> {
  const response = await fetch(`${BASE_URL}/batch/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entryIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to batch delete entries: ${response.statusText}`);
  }
}
