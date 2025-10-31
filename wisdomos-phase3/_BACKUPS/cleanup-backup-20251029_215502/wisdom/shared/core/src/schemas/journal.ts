import { z } from 'zod';

// Journal Entry Schemas
export const CreateJournalEntrySchema = z.object({
  lifeAreaId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  aiReframe: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateJournalEntrySchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  aiReframe: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const JournalFilterSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
  lifeAreaId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  hasReframe: z.boolean().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});

// Upset Reframe Schema
export const UpsetReframeSchema = z.object({
  originalContent: z.string().min(1).max(5000),
  lifeAreaId: z.string().uuid(),
  requestAI: z.boolean().default(true),
});

export const ReframeResponseSchema = z.object({
  original: z.string(),
  reframed: z.string(),
  sentiment: z.number().min(-1).max(1),
  suggestions: z.array(z.string()).optional(),
});

export type CreateJournalEntry = z.infer<typeof CreateJournalEntrySchema>;
export type UpdateJournalEntry = z.infer<typeof UpdateJournalEntrySchema>;
export type JournalFilter = z.infer<typeof JournalFilterSchema>;
export type UpsetReframe = z.infer<typeof UpsetReframeSchema>;
export type ReframeResponse = z.infer<typeof ReframeResponseSchema>;