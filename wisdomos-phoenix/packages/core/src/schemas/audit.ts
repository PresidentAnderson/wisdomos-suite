import { z } from 'zod';

// Monthly Audit Schemas
export const AuditEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lifeAreaId: z.string().uuid(),
  month: z.date(), // First day of month
  drift: z.number().min(-1).max(1).default(0),
  action: z.string().optional(),
  colorSymbol: z.string().regex(/^#[0-9A-F]{6}$/i), // Hex color
  notes: z.string().optional(),
});

export const CreateAuditLogSchema = z.object({
  lifeAreaId: z.string().uuid(),
  month: z.date(),
  drift: z.number().min(-1).max(1),
  action: z.string().optional(),
  colorSymbol: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  notes: z.string().optional(),
});

export const MonthlyAuditSummarySchema = z.object({
  month: z.date(),
  lifeAreas: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    phoenixName: z.string().optional(),
    color: z.string(),
    averageDrift: z.number(),
    totalResets: z.number(),
    dailyColors: z.array(z.object({
      day: z.number().int().min(1).max(31),
      color: z.string(),
      hasEntry: z.boolean(),
    })),
  })),
  overallDrift: z.number(),
  totalActions: z.number(),
});

export const AuditExportOptionsSchema = z.object({
  format: z.enum(['pdf', 'markdown', 'notion']),
  month: z.date(),
  includeJournals: z.boolean().default(false),
  includeResets: z.boolean().default(true),
  includeNotes: z.boolean().default(true),
});

// Calendar View Types
export const CalendarDaySchema = z.object({
  date: z.date(),
  lifeAreaColors: z.array(z.object({
    lifeAreaId: z.string().uuid(),
    color: z.string(),
    hasJournal: z.boolean(),
    hasReset: z.boolean(),
    drift: z.number().optional(),
  })),
});

export const CalendarMonthSchema = z.object({
  month: z.date(),
  days: z.array(CalendarDaySchema),
});

export type AuditEntry = z.infer<typeof AuditEntrySchema>;
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>;
export type MonthlyAuditSummary = z.infer<typeof MonthlyAuditSummarySchema>;
export type AuditExportOptions = z.infer<typeof AuditExportOptionsSchema>;
export type CalendarDay = z.infer<typeof CalendarDaySchema>;
export type CalendarMonth = z.infer<typeof CalendarMonthSchema>;