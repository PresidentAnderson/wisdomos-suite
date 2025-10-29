import { z } from 'zod';

// Life Area Schemas
export const LifeAreaStatusSchema = z.enum(['GREEN', 'YELLOW', 'RED']);

export const CreateLifeAreaSchema = z.object({
  name: z.string().min(1).max(100),
  phoenixName: z.string().optional(), // e.g., "Phoenix of Creativity"
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().optional(),
  description: z.string().max(500).optional(),
});

export const UpdateLifeAreaSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phoenixName: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  description: z.string().max(500).optional(),
  status: LifeAreaStatusSchema.optional(),
  score: z.number().min(0).max(100).optional(),
});

export const LifeAreaMetricsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  score: z.number(),
  momentum: z.number(), // Rate of change
  drift: z.number().min(-1).max(1), // Boundary drift
  lastActivity: z.date().optional(),
  journalCount: z.number(),
  resetCount: z.number(),
  relationshipCount: z.number(),
  status: LifeAreaStatusSchema,
});

export const LifeAreaTrendSchema = z.object({
  lifeAreaId: z.string().uuid(),
  period: z.enum(['day', 'week', 'month', 'year']),
  dataPoints: z.array(z.object({
    date: z.date(),
    score: z.number(),
    journalCount: z.number(),
    eventCount: z.number(),
    sentiment: z.number().optional(),
  })),
});

export type LifeAreaStatus = z.infer<typeof LifeAreaStatusSchema>;
export type CreateLifeArea = z.infer<typeof CreateLifeAreaSchema>;
export type UpdateLifeArea = z.infer<typeof UpdateLifeAreaSchema>;
export type LifeAreaMetrics = z.infer<typeof LifeAreaMetricsSchema>;
export type LifeAreaTrend = z.infer<typeof LifeAreaTrendSchema>;