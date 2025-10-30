// Core types for the autobiography feature
export interface AutobiographyEntry {
  id: string;
  userId: string;
  chapter: string;
  promptId: string;
  promptText: string;
  response: string;
  audioUrl?: string | null;
  wordCount: number;
  sentiment?: string | null;
  aiInsights?: AIInsights | null;
  tags: string[];
  isPublic: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AIInsights {
  sentiment: string;
  themes: string[];
  insights: string;
  suggestions: string[];
}

export interface ChapterProgress {
  id: string;
  userId: string;
  chapter: string;
  completedPrompts: number;
  totalPrompts: number;
  lastAccessedAt: Date | string;
}

export interface AutobiographyPrompt {
  id: string;
  question: string;
  description?: string;
  coachingTip?: string;
  examples?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompts: AutobiographyPrompt[];
  order: number;
}

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
}

export interface VoiceCoachState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error?: string | null;
}

export interface CreateEntryInput {
  chapter: string;
  promptId: string;
  promptText: string;
  response: string;
  audioUrl?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateEntryInput {
  response?: string;
  audioUrl?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface EntryFilters {
  chapter?: string;
  search?: string;
  tags?: string[];
  sentiment?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
