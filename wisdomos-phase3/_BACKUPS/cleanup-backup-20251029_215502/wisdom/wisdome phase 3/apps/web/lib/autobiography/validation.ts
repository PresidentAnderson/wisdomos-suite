import { z } from 'zod';
import { VALIDATION } from './constants';

// Entry creation schema
export const createEntrySchema = z.object({
  chapter: z.string().min(1, 'Chapter is required'),
  promptId: z.string().min(1, 'Prompt ID is required'),
  promptText: z.string().min(1, 'Prompt text is required'),
  response: z.string()
    .min(VALIDATION.minResponseLength, `Response must be at least ${VALIDATION.minResponseLength} characters`)
    .max(VALIDATION.maxResponseLength, `Response must not exceed ${VALIDATION.maxResponseLength} characters`),
  audioUrl: z.string().url().optional(),
  tags: z.array(z.string().max(VALIDATION.maxTagLength))
    .max(VALIDATION.maxTags, `Maximum ${VALIDATION.maxTags} tags allowed`)
    .optional()
    .default([]),
  isPublic: z.boolean().optional().default(false),
});

// Entry update schema
export const updateEntrySchema = z.object({
  response: z.string()
    .min(VALIDATION.minResponseLength)
    .max(VALIDATION.maxResponseLength)
    .optional(),
  audioUrl: z.string().url().optional(),
  tags: z.array(z.string().max(VALIDATION.maxTagLength))
    .max(VALIDATION.maxTags)
    .optional(),
  isPublic: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Entry filters schema
export const entryFiltersSchema = z.object({
  chapter: z.string().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sentiment: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Voice settings schema
export const voiceSettingsSchema = z.object({
  enabled: z.boolean(),
  voice: z.string(),
  rate: z.number().min(0.5).max(2.0),
  pitch: z.number().min(0.5).max(2.0),
  volume: z.number().min(0).max(1.0),
  autoPlay: z.boolean(),
});

// Types from schemas
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type EntryFilters = z.infer<typeof entryFiltersSchema>;
export type VoiceSettings = z.infer<typeof voiceSettingsSchema>;

// Validation helper functions
export function validateEntry(data: unknown): CreateEntryInput {
  return createEntrySchema.parse(data);
}

export function validateEntryUpdate(data: unknown): UpdateEntryInput {
  return updateEntrySchema.parse(data);
}

export function validateFilters(data: unknown): EntryFilters {
  return entryFiltersSchema.parse(data);
}

export function validateVoiceSettings(data: unknown): VoiceSettings {
  return voiceSettingsSchema.parse(data);
}

// Word count helper
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Sanitize tags
export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter((tag, index, arr) => tag.length > 0 && arr.indexOf(tag) === index)
    .slice(0, VALIDATION.maxTags);
}

// Calculate reading time (average 200 words per minute)
export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}
