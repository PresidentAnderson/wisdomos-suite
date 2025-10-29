import { z } from 'zod';

// Boundary Reset Ritual Steps
export enum ResetStep {
  PAUSE = 'pause',
  SCAN = 'scan',
  ACKNOWLEDGE = 'acknowledge',
  RECOMMIT = 'recommit',
  RECALIBRATE = 'recalibrate',
}

export const ResetStepDataSchema = z.object({
  step: z.nativeEnum(ResetStep),
  content: z.string().optional(),
  breathCount: z.number().int().positive().optional(),
  timestamp: z.date(),
});

export const StartResetSchema = z.object({
  lifeAreaId: z.string().uuid(),
  reason: z.string().optional(),
});

export const UpdateResetStepSchema = z.object({
  resetId: z.string().uuid(),
  step: z.nativeEnum(ResetStep),
  data: ResetStepDataSchema,
});

export const CompleteResetSchema = z.object({
  resetId: z.string().uuid(),
  outcome: z.string().optional(),
  createAuditEntry: z.boolean().default(true),
});

// Reset Ritual Flow
export const ResetRitualSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  lifeAreaId: z.string().uuid(),
  steps: z.array(ResetStepDataSchema),
  completed: z.boolean(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
});

export type ResetStepData = z.infer<typeof ResetStepDataSchema>;
export type StartReset = z.infer<typeof StartResetSchema>;
export type UpdateResetStep = z.infer<typeof UpdateResetStepSchema>;
export type CompleteReset = z.infer<typeof CompleteResetSchema>;
export type ResetRitual = z.infer<typeof ResetRitualSchema>;