// Editable Autobiography System Types

export interface AutobiographyEntry {
  id: string;
  userId: string;
  year: number;
  title: string;
  narrative: string;
  earliestSimilarOccurrence?: {
    year: number;
    description: string;
  };
  meaning: string;
  insight: string;
  commitment: string;
  lifeAreas: string[]; // IDs of connected life areas
  tags: string[];
  
  // Emotional and pattern data
  emotionalCharge: -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  category: 'milestone' | 'challenge' | 'celebration' | 'loss' | 'beginning' | 'ending' | 'pattern';
  
  // People involved
  people: AutobiographyPerson[];
  
  // Status and metadata
  completionStatus: 'draft' | 'partial' | 'complete' | 'reviewed';
  isReframed: boolean;
  reframedNarrative?: string;
  
  // Revision tracking
  version: number;
  revisions: EntryRevision[];
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy?: string;
  
  // Auto-save state
  isDirty: boolean;
  lastAutoSave?: Date;
}

export interface AutobiographyPerson {
  id: string;
  name: string;
  relationship: string;
  role: 'central' | 'supporting' | 'witness' | 'catalyst';
  impact: 'positive' | 'neutral' | 'challenging' | 'transformative';
  stillPresent: boolean;
  notes?: string;
}

export interface EntryRevision {
  id: string;
  entryId: string;
  version: number;
  fields: Partial<AutobiographyEntry>; // What changed
  changedFields: string[]; // Which fields changed
  changeNote?: string;
  editedBy: string;
  editedAt: Date;
}

export interface AutobiographyPattern {
  id: string;
  userId: string;
  name: string;
  description: string;
  firstOccurrence: number; // Year
  recurrences: PatternRecurrence[];
  category: 'relationship' | 'career' | 'health' | 'spiritual' | 'creative' | 'behavioral';
  isResolved: boolean;
  resolvedYear?: number;
  insights: string[];
  relatedEntries: string[]; // Entry IDs
}

export interface PatternRecurrence {
  year: number;
  entryId: string;
  description: string;
  similarity: number; // 0-100% similar to first occurrence
}

export interface AutobiographyExport {
  format: 'markdown' | 'json' | 'pdf' | 'docx';
  includeRevisions: boolean;
  includePatterns: boolean;
  yearRange?: {
    start: number;
    end: number;
  };
  groupBy: 'year' | 'category' | 'lifeArea' | 'pattern';
}

export interface AutobiographySettings {
  userId: string;
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // seconds
  showRevisionHistory: boolean;
  defaultView: 'timeline' | 'narrative' | 'patterns' | 'insights';
  privacyLevel: 'private' | 'shared' | 'public';
  enableAIInsights: boolean;
  enablePatternDetection: boolean;
}

// Database operations
export interface AutobiographyDatabase {
  // CRUD operations
  createEntry(entry: Omit<AutobiographyEntry, 'id' | 'version' | 'revisions' | 'createdAt' | 'updatedAt'>): Promise<AutobiographyEntry>;
  updateEntry(id: string, updates: Partial<AutobiographyEntry>, changeNote?: string): Promise<AutobiographyEntry>;
  deleteEntry(id: string): Promise<boolean>;
  getEntry(id: string): Promise<AutobiographyEntry | null>;
  getEntriesByYear(userId: string, year: number): Promise<AutobiographyEntry[]>;
  getEntriesByRange(userId: string, startYear: number, endYear: number): Promise<AutobiographyEntry[]>;
  
  // Revision operations
  getRevisionHistory(entryId: string): Promise<EntryRevision[]>;
  restoreRevision(entryId: string, revisionId: string): Promise<AutobiographyEntry>;
  
  // Pattern operations
  detectPatterns(userId: string): Promise<AutobiographyPattern[]>;
  linkPattern(patternId: string, entryId: string): Promise<void>;
  
  // Search and filter
  searchEntries(userId: string, query: string): Promise<AutobiographyEntry[]>;
  getEntriesByLifeArea(userId: string, lifeAreaId: string): Promise<AutobiographyEntry[]>;
  getEntriesByTag(userId: string, tag: string): Promise<AutobiographyEntry[]>;
  
  // Export operations
  exportToMarkdown(userId: string, options: AutobiographyExport): Promise<string>;
  exportToJSON(userId: string, options: AutobiographyExport): Promise<object>;
}

// UI State Management
export interface AutobiographyUIState {
  selectedEntry: AutobiographyEntry | null;
  editingEntry: AutobiographyEntry | null;
  viewMode: 'read' | 'edit' | 'compare';
  selectedYear: number;
  filters: {
    lifeAreas: string[];
    tags: string[];
    categories: string[];
    completionStatus: string[];
  };
  sortBy: 'year' | 'updated' | 'emotional' | 'completion';
  showRevisions: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSyncTime: Date | null;
}