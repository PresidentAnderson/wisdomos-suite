/**
 * @fileoverview Core Types for WisdomOS Phoenix Transformation System
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { z } from 'zod';

// ========================================
// Phoenix User Types
// ========================================

export const PhoenixUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().default('UTC'),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActiveAt: z.date().optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional()
});

export type PhoenixUser = z.infer<typeof PhoenixUserSchema>;

// ========================================
// Transformation Types
// ========================================

export enum TransformationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TransformationType {
  MINDSET_SHIFT = 'mindset_shift',
  SKILL_DEVELOPMENT = 'skill_development',
  HABIT_FORMATION = 'habit_formation',
  GOAL_ACHIEVEMENT = 'goal_achievement',
  RELATIONSHIP_BUILDING = 'relationship_building',
  CAREER_ADVANCEMENT = 'career_advancement',
  HEALTH_OPTIMIZATION = 'health_optimization',
  FINANCIAL_GROWTH = 'financial_growth'
}

export const TransformationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(TransformationType),
  status: z.nativeEnum(TransformationStatus),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date(),
  targetCompletionDate: z.date(),
  actualCompletionDate: z.date().optional(),
  progress: z.number().min(0).max(100).default(0),
  milestones: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Transformation = z.infer<typeof TransformationSchema>;

// ========================================
// Phoenix Lifecycle Types
// ========================================

export enum PhoenixPhase {
  ASHES = 'ashes',        // Initial destruction/recognition phase
  BURNING = 'burning',    // Active transformation phase
  RISING = 'rising',      // Emergence and growth phase
  SOARING = 'soaring'     // Mastery and transcendence phase
}

export const PhoenixCycleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  currentPhase: z.nativeEnum(PhoenixPhase),
  cycleNumber: z.number().int().positive(),
  startDate: z.date(),
  expectedCompletionDate: z.date().optional(),
  actualCompletionDate: z.date().optional(),
  transformations: z.array(z.string().uuid()).default([]),
  phaseHistory: z.array(z.object({
    phase: z.nativeEnum(PhoenixPhase),
    enteredAt: z.date(),
    exitedAt: z.date().optional(),
    achievements: z.array(z.string()).default([]),
    challenges: z.array(z.string()).default([]),
    insights: z.array(z.string()).default([])
  })).default([]),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type PhoenixCycle = z.infer<typeof PhoenixCycleSchema>;

// ========================================
// Progress Tracking Types
// ========================================

export const MetricSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().optional(),
  targetValue: z.number().optional(),
  currentValue: z.number(),
  previousValue: z.number().optional(),
  lastUpdated: z.date(),
  trend: z.enum(['increasing', 'decreasing', 'stable']).optional()
});

export type Metric = z.infer<typeof MetricSchema>;

export const ProgressEntrySchema = z.object({
  id: z.string().uuid(),
  transformationId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.date(),
  progressPercentage: z.number().min(0).max(100),
  metrics: z.array(MetricSchema).default([]),
  notes: z.string().optional(),
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  confidence: z.number().int().min(1).max(10).optional(),
  attachments: z.array(z.string()).default([])
});

export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;

// ========================================
// Error Types
// ========================================

export class PhoenixError extends Error {
  constructor(
    message: string,
    public code: string,
    public userId?: string,
    public transformationId?: string
  ) {
    super(message);
    this.name = 'PhoenixError';
  }
}

export class ValidationError extends PhoenixError {
  constructor(message: string, public field: string, userId?: string) {
    super(message, 'VALIDATION_ERROR', userId);
    this.name = 'ValidationError';
  }
}

export class TransformationError extends PhoenixError {
  constructor(message: string, transformationId: string, userId?: string) {
    super(message, 'TRANSFORMATION_ERROR', userId, transformationId);
    this.name = 'TransformationError';
  }
}

// ========================================
// API Response Types
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// Configuration Types
// ========================================

export interface PhoenixConfig {
  maxTransformationsPerUser: number;
  defaultTransformationDuration: number; // days
  phoenixCycleDuration: number; // days
  notificationSettings: {
    dailyReminders: boolean;
    weeklyProgress: boolean;
    milestoneAlerts: boolean;
    phaseTransitions: boolean;
  };
  progressTracking: {
    minimumUpdateInterval: number; // hours
    automaticProgressDetection: boolean;
    metricSyncFrequency: number; // minutes
  };
}

// ========================================
// Export Schemas for Validation
// ========================================

export const schemas = {
  PhoenixUser: PhoenixUserSchema,
  Transformation: TransformationSchema,
  PhoenixCycle: PhoenixCycleSchema,
  Metric: MetricSchema,
  ProgressEntry: ProgressEntrySchema
} as const;