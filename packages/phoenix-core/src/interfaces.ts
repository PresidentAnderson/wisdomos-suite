/**
 * @fileoverview Core Interfaces for WisdomOS Phoenix Transformation System
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import {
  PhoenixUser,
  Transformation,
  PhoenixCycle,
  ProgressEntry,
  TransformationType,
  PhoenixPhase,
  Metric
} from './types';

// ========================================
// Repository Interfaces
// ========================================

export interface IUserRepository {
  create(user: Omit<PhoenixUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<PhoenixUser>;
  findById(id: string): Promise<PhoenixUser | null>;
  findByEmail(email: string): Promise<PhoenixUser | null>;
  update(id: string, updates: Partial<PhoenixUser>): Promise<PhoenixUser>;
  delete(id: string): Promise<boolean>;
  updateLastActive(id: string): Promise<void>;
}

export interface ITransformationRepository {
  create(transformation: Omit<Transformation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transformation>;
  findById(id: string): Promise<Transformation | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Transformation[]>;
  update(id: string, updates: Partial<Transformation>): Promise<Transformation>;
  delete(id: string): Promise<boolean>;
  findActive(userId: string): Promise<Transformation[]>;
  findByStatus(status: string, userId?: string): Promise<Transformation[]>;
}

export interface IPhoenixCycleRepository {
  create(cycle: Omit<PhoenixCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<PhoenixCycle>;
  findById(id: string): Promise<PhoenixCycle | null>;
  findCurrentByUserId(userId: string): Promise<PhoenixCycle | null>;
  findAllByUserId(userId: string): Promise<PhoenixCycle[]>;
  update(id: string, updates: Partial<PhoenixCycle>): Promise<PhoenixCycle>;
  advancePhase(id: string, newPhase: PhoenixPhase, achievements?: string[], insights?: string[]): Promise<PhoenixCycle>;
}

export interface IProgressRepository {
  create(entry: Omit<ProgressEntry, 'id'>): Promise<ProgressEntry>;
  findById(id: string): Promise<ProgressEntry | null>;
  findByTransformation(transformationId: string, limit?: number, offset?: number): Promise<ProgressEntry[]>;
  findByUser(userId: string, limit?: number, offset?: number): Promise<ProgressEntry[]>;
  getLatestByTransformation(transformationId: string): Promise<ProgressEntry | null>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ProgressEntry[]>;
}

// ========================================
// Service Interfaces
// ========================================

export interface ITransformationService {
  createTransformation(userId: string, data: {
    type: TransformationType;
    title: string;
    description?: string;
    targetCompletionDate: Date;
    milestones?: string[];
    tags?: string[];
  }): Promise<Transformation>;
  
  updateProgress(transformationId: string, progress: number, notes?: string): Promise<Transformation>;
  completeTransformation(transformationId: string, notes?: string): Promise<Transformation>;
  cancelTransformation(transformationId: string, reason?: string): Promise<Transformation>;
  getActiveTransformations(userId: string): Promise<Transformation[]>;
  getTransformationHistory(userId: string, limit?: number, offset?: number): Promise<Transformation[]>;
}

export interface IPhoenixLifecycleService {
  initializePhoenixCycle(userId: string): Promise<PhoenixCycle>;
  getCurrentCycle(userId: string): Promise<PhoenixCycle | null>;
  advancePhase(userId: string, achievements?: string[], insights?: string[]): Promise<PhoenixCycle>;
  canAdvancePhase(userId: string): Promise<boolean>;
  getPhaseRequirements(phase: PhoenixPhase): Promise<string[]>;
  calculatePhaseProgress(userId: string): Promise<number>;
}

export interface IProgressTrackingService {
  recordProgress(transformationId: string, data: {
    progressPercentage: number;
    metrics?: Metric[];
    notes?: string;
    mood?: number;
    energy?: number;
    confidence?: number;
    attachments?: string[];
  }): Promise<ProgressEntry>;
  
  getProgressHistory(transformationId: string, days?: number): Promise<ProgressEntry[]>;
  calculateTrends(transformationId: string, metricName: string): Promise<'increasing' | 'decreasing' | 'stable'>;
  getInsights(userId: string): Promise<string[]>;
  generateProgressReport(userId: string, startDate: Date, endDate: Date): Promise<ProgressReport>;
}

export interface INotificationService {
  sendDailyReminder(userId: string): Promise<void>;
  sendWeeklyProgress(userId: string): Promise<void>;
  sendMilestoneAlert(userId: string, transformationId: string, milestone: string): Promise<void>;
  sendPhaseTransitionAlert(userId: string, newPhase: PhoenixPhase): Promise<void>;
  scheduleReminders(userId: string): Promise<void>;
  unsubscribe(userId: string, type: string): Promise<void>;
}

// ========================================
// Analytics Interfaces
// ========================================

export interface IAnalyticsService {
  trackEvent(event: AnalyticsEvent): Promise<void>;
  getUserAnalytics(userId: string): Promise<UserAnalytics>;
  getTransformationAnalytics(transformationId: string): Promise<TransformationAnalytics>;
  getSystemAnalytics(startDate: Date, endDate: Date): Promise<SystemAnalytics>;
}

export interface AnalyticsEvent {
  userId: string;
  event: string;
  properties: Record<string, unknown>;
  timestamp: Date;
}

export interface UserAnalytics {
  userId: string;
  totalTransformations: number;
  completedTransformations: number;
  currentPhase: PhoenixPhase;
  averageCompletionTime: number; // days
  mostCommonTransformationType: TransformationType;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastActivity: Date;
  };
  engagementScore: number; // 0-100
}

export interface TransformationAnalytics {
  transformationId: string;
  progressVelocity: number; // progress per day
  consistencyScore: number; // 0-100
  timeToCompletion: number | null; // days
  milestoneCompletionRate: number; // 0-1
  averageMood: number | null; // 1-10
  averageEnergy: number | null; // 1-10
  averageConfidence: number | null; // 1-10
}

export interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalTransformations: number;
  completionRate: number; // 0-1
  averageTimeToCompletion: number; // days
  phaseDistribution: Record<PhoenixPhase, number>;
  popularTransformationTypes: Array<{
    type: TransformationType;
    count: number;
  }>;
}

// ========================================
// Integration Interfaces
// ========================================

export interface IExternalIntegration {
  name: string;
  isEnabled: boolean;
  sync(userId: string): Promise<void>;
  disconnect(userId: string): Promise<void>;
}

export interface IHealthIntegration extends IExternalIntegration {
  getHealthMetrics(userId: string, startDate: Date, endDate: Date): Promise<HealthMetric[]>;
  syncSteps(userId: string): Promise<void>;
  syncSleep(userId: string): Promise<void>;
  syncHeartRate(userId: string): Promise<void>;
}

export interface ICalendarIntegration extends IExternalIntegration {
  getEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  createEvent(userId: string, event: CalendarEventInput): Promise<CalendarEvent>;
  scheduleTransformationReminders(userId: string, transformationId: string): Promise<void>;
}

export interface IProductivityIntegration extends IExternalIntegration {
  getTasks(userId: string): Promise<Task[]>;
  getCompletedTasks(userId: string, startDate: Date, endDate: Date): Promise<Task[]>;
  createTransformationTasks(userId: string, transformationId: string): Promise<Task[]>;
}

// ========================================
// Supporting Types for Integrations
// ========================================

export interface HealthMetric {
  type: 'steps' | 'sleep' | 'heart_rate' | 'weight' | 'calories';
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  location?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface ProgressReport {
  userId: string;
  startDate: Date;
  endDate: Date;
  summary: {
    totalTransformations: number;
    completedTransformations: number;
    averageProgress: number;
    totalProgressEntries: number;
  };
  transformations: Array<{
    id: string;
    title: string;
    type: TransformationType;
    progress: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  insights: string[];
  recommendations: string[];
}

// ========================================
// Event System Interfaces
// ========================================

export interface IEventBus {
  publish<T>(event: string, data: T): Promise<void>;
  subscribe<T>(event: string, handler: (data: T) => Promise<void>): void;
  unsubscribe(event: string, handler: Function): void;
}

export interface PhoenixEvent<T = unknown> {
  id: string;
  type: string;
  userId: string;
  timestamp: Date;
  data: T;
}

// Event Types
export type TransformationCreatedEvent = PhoenixEvent<{
  transformationId: string;
  type: TransformationType;
  title: string;
}>;

export type TransformationCompletedEvent = PhoenixEvent<{
  transformationId: string;
  completionTime: number; // days
  finalProgress: number;
}>;

export type PhaseAdvancedEvent = PhoenixEvent<{
  cycleId: string;
  fromPhase: PhoenixPhase;
  toPhase: PhoenixPhase;
  achievements: string[];
  insights: string[];
}>;

export type ProgressUpdatedEvent = PhoenixEvent<{
  transformationId: string;
  progressEntryId: string;
  previousProgress: number;
  newProgress: number;
}>;

// ========================================
// Factory Interfaces
// ========================================

export interface IServiceFactory {
  createTransformationService(): ITransformationService;
  createPhoenixLifecycleService(): IPhoenixLifecycleService;
  createProgressTrackingService(): IProgressTrackingService;
  createNotificationService(): INotificationService;
  createAnalyticsService(): IAnalyticsService;
}

export interface IRepositoryFactory {
  createUserRepository(): IUserRepository;
  createTransformationRepository(): ITransformationRepository;
  createPhoenixCycleRepository(): IPhoenixCycleRepository;
  createProgressRepository(): IProgressRepository;
}