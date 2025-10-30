import { z } from 'zod';

// User Schemas
export const UserProfileSchema = z.object({
  timezone: z.string().default('UTC'),
  language: z.enum(['en', 'fr', 'es']).default('en'),
  phoenixLevel: z.number().int().min(0).default(0),
  wisdomScore: z.number().min(0).default(0),
  notifications: z.object({
    journalReminders: z.boolean().default(true),
    resetSuggestions: z.boolean().default(true),
    contactReminders: z.boolean().default(true),
    monthlyAudit: z.boolean().default(true),
  }),
  privacy: z.object({
    shareAnalytics: z.boolean().default(false),
    aiProcessing: z.boolean().default(true),
    exportData: z.boolean().default(true),
  }),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8),
  profile: UserProfileSchema.optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  profile: UserProfileSchema.partial().optional(),
});

export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'phoenix']).default('phoenix'),
  defaultLifeAreaView: z.enum(['grid', 'list', 'map']).default('map'),
  journalPrompts: z.boolean().default(true),
  autoSave: z.boolean().default(true),
  exportFormat: z.enum(['pdf', 'markdown', 'notion']).default('pdf'),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;