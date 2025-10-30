/**
 * @fileoverview Constants for WisdomOS Core
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { PhoenixConfig } from './types';

// ========================================
// System Constants
// ========================================

export const SYSTEM_CONSTANTS = {
  // Version information
  VERSION: '1.0.0',
  BUILD: process.env.NODE_ENV || 'development',
  
  // API limitations
  MAX_TRANSFORMATIONS_PER_USER: 5,
  MAX_PROGRESS_ENTRIES_PER_DAY: 10,
  MAX_MILESTONES_PER_TRANSFORMATION: 20,
  MAX_TAGS_PER_TRANSFORMATION: 10,
  
  // Text limitations
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_NOTES_LENGTH: 1000,
  MAX_MILESTONE_LENGTH: 100,
  MAX_TAG_LENGTH: 30,
  
  // Time constants
  MIN_TRANSFORMATION_DURATION_DAYS: 1,
  MAX_TRANSFORMATION_DURATION_DAYS: 365,
  DEFAULT_TRANSFORMATION_DURATION_DAYS: 30,
  PHOENIX_CYCLE_DEFAULT_DURATION_DAYS: 90,
  
  // Progress tracking
  MIN_PROGRESS_UPDATE_INTERVAL_HOURS: 1,
  METRIC_SYNC_FREQUENCY_MINUTES: 15,
  
  // Scoring ranges
  MOOD_ENERGY_CONFIDENCE_MIN: 1,
  MOOD_ENERGY_CONFIDENCE_MAX: 10,
  PROGRESS_MIN: 0,
  PROGRESS_MAX: 100,
  
  // Phoenix phase requirements
  PHASE_ADVANCE_PROGRESS_THRESHOLD: 0.8, // 80%
  HABIT_FORMATION_MINIMUM_DAYS: 21,
  HABIT_MAINTENANCE_MINIMUM_DAYS: 66,
  CONSISTENCY_STREAK_MINIMUM_DAYS: 7,
  
  // File and media
  MAX_ATTACHMENT_SIZE_MB: 10,
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  SUPPORTED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx', 'txt'],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Rate limiting
  API_RATE_LIMIT_REQUESTS_PER_MINUTE: 60,
  API_RATE_LIMIT_REQUESTS_PER_HOUR: 1000,
} as const;

// ========================================
// Phoenix Phase Constants
// ========================================

export const PHOENIX_PHASE_CONSTANTS = {
  ASHES: {
    NAME: 'Ashes',
    DESCRIPTION: 'Recognition and preparation phase',
    ICON: '🔥',
    COLOR: '#6B7280',
    AVERAGE_DURATION_DAYS: 14,
    MIN_DURATION_DAYS: 7,
    MAX_DURATION_DAYS: 30,
  },
  BURNING: {
    NAME: 'Burning',
    DESCRIPTION: 'Active transformation and learning phase',
    ICON: '💫',
    COLOR: '#EF4444',
    AVERAGE_DURATION_DAYS: 30,
    MIN_DURATION_DAYS: 21,
    MAX_DURATION_DAYS: 60,
  },
  RISING: {
    NAME: 'Rising',
    DESCRIPTION: 'Integration and emergence phase',
    ICON: '🌅',
    COLOR: '#F59E0B',
    AVERAGE_DURATION_DAYS: 21,
    MIN_DURATION_DAYS: 14,
    MAX_DURATION_DAYS: 45,
  },
  SOARING: {
    NAME: 'Soaring',
    DESCRIPTION: 'Mastery and transcendence phase',
    ICON: '🦅',
    COLOR: '#10B981',
    AVERAGE_DURATION_DAYS: 25,
    MIN_DURATION_DAYS: 14,
    MAX_DURATION_DAYS: 60,
  },
} as const;

// ========================================
// Transformation Type Constants
// ========================================

export const TRANSFORMATION_TYPE_CONSTANTS = {
  MINDSET_SHIFT: {
    NAME: 'Mindset Shift',
    DESCRIPTION: 'Transform limiting beliefs and develop empowering thought patterns',
    ICON: '🧠',
    COLOR: '#8B5CF6',
    DIFFICULTY: 9,
    AVERAGE_DURATION_DAYS: 45,
    CATEGORY: 'Mental',
  },
  SKILL_DEVELOPMENT: {
    NAME: 'Skill Development',
    DESCRIPTION: 'Acquire new abilities and enhance existing competencies',
    ICON: '🎯',
    COLOR: '#3B82F6',
    DIFFICULTY: 5,
    AVERAGE_DURATION_DAYS: 60,
    CATEGORY: 'Professional',
  },
  HABIT_FORMATION: {
    NAME: 'Habit Formation',
    DESCRIPTION: 'Build positive routines and break negative patterns',
    ICON: '🔄',
    COLOR: '#10B981',
    DIFFICULTY: 8,
    AVERAGE_DURATION_DAYS: 66,
    CATEGORY: 'Behavioral',
  },
  GOAL_ACHIEVEMENT: {
    NAME: 'Goal Achievement',
    DESCRIPTION: 'Set and accomplish meaningful objectives',
    ICON: '🏆',
    COLOR: '#F59E0B',
    DIFFICULTY: 4,
    AVERAGE_DURATION_DAYS: 30,
    CATEGORY: 'Achievement',
  },
  RELATIONSHIP_BUILDING: {
    NAME: 'Relationship Building',
    DESCRIPTION: 'Strengthen connections and build new relationships',
    ICON: '🤝',
    COLOR: '#EC4899',
    DIFFICULTY: 7,
    AVERAGE_DURATION_DAYS: 90,
    CATEGORY: 'Social',
  },
  CAREER_ADVANCEMENT: {
    NAME: 'Career Advancement',
    DESCRIPTION: 'Progress professionally and achieve career goals',
    ICON: '📈',
    COLOR: '#06B6D4',
    DIFFICULTY: 6,
    AVERAGE_DURATION_DAYS: 120,
    CATEGORY: 'Professional',
  },
  HEALTH_OPTIMIZATION: {
    NAME: 'Health Optimization',
    DESCRIPTION: 'Improve physical and mental well-being',
    ICON: '💪',
    COLOR: '#84CC16',
    DIFFICULTY: 6,
    AVERAGE_DURATION_DAYS: 90,
    CATEGORY: 'Physical',
  },
  FINANCIAL_GROWTH: {
    NAME: 'Financial Growth',
    DESCRIPTION: 'Build wealth and achieve financial independence',
    ICON: '💰',
    COLOR: '#EAB308',
    DIFFICULTY: 7,
    AVERAGE_DURATION_DAYS: 180,
    CATEGORY: 'Financial',
  },
} as const;

// ========================================
// Status Constants
// ========================================

export const TRANSFORMATION_STATUS_CONSTANTS = {
  PENDING: {
    NAME: 'Pending',
    DESCRIPTION: 'Transformation is created but not yet started',
    ICON: '⏸️',
    COLOR: '#6B7280',
  },
  IN_PROGRESS: {
    NAME: 'In Progress',
    DESCRIPTION: 'Transformation is actively being worked on',
    ICON: '🔄',
    COLOR: '#3B82F6',
  },
  COMPLETED: {
    NAME: 'Completed',
    DESCRIPTION: 'Transformation has been successfully completed',
    ICON: '✅',
    COLOR: '#10B981',
  },
  FAILED: {
    NAME: 'Failed',
    DESCRIPTION: 'Transformation was not completed successfully',
    ICON: '❌',
    COLOR: '#EF4444',
  },
  CANCELLED: {
    NAME: 'Cancelled',
    DESCRIPTION: 'Transformation was cancelled before completion',
    ICON: '🚫',
    COLOR: '#F59E0B',
  },
} as const;

// ========================================
// Notification Constants
// ========================================

export const NOTIFICATION_CONSTANTS = {
  TYPES: {
    DAILY_REMINDER: 'daily_reminder',
    WEEKLY_PROGRESS: 'weekly_progress',
    MILESTONE_ALERT: 'milestone_alert',
    PHASE_TRANSITION: 'phase_transition',
    TRANSFORMATION_COMPLETED: 'transformation_completed',
    GOAL_DEADLINE_APPROACHING: 'goal_deadline_approaching',
    STREAK_MILESTONE: 'streak_milestone',
    INSIGHT_GENERATED: 'insight_generated',
  },
  DEFAULT_SETTINGS: {
    dailyReminders: true,
    weeklyProgress: true,
    milestoneAlerts: true,
    phaseTransitions: true,
    completionCelebrations: true,
    deadlineWarnings: true,
    streakMilestones: true,
    insights: true,
  },
  DELIVERY_TIMES: {
    DAILY_REMINDER: '09:00',
    WEEKLY_PROGRESS: '10:00', // Sunday mornings
    DEADLINE_WARNING_DAYS: 3,
  },
} as const;

// ========================================
// Analytics Constants
// ========================================

export const ANALYTICS_CONSTANTS = {
  EVENTS: {
    TRANSFORMATION_CREATED: 'transformation_created',
    TRANSFORMATION_STARTED: 'transformation_started',
    TRANSFORMATION_COMPLETED: 'transformation_completed',
    TRANSFORMATION_CANCELLED: 'transformation_cancelled',
    PROGRESS_UPDATED: 'progress_updated',
    PHASE_ADVANCED: 'phase_advanced',
    MILESTONE_REACHED: 'milestone_reached',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    SETTINGS_UPDATED: 'settings_updated',
  },
  METRICS: {
    COMPLETION_RATE: 'completion_rate',
    AVERAGE_COMPLETION_TIME: 'average_completion_time',
    USER_ENGAGEMENT_SCORE: 'user_engagement_score',
    TRANSFORMATION_DIFFICULTY_SCORE: 'transformation_difficulty_score',
    PHASE_PROGRESSION_RATE: 'phase_progression_rate',
    STREAK_LENGTH: 'streak_length',
    CONSISTENCY_SCORE: 'consistency_score',
  },
  ENGAGEMENT_THRESHOLDS: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
  },
} as const;

// ========================================
// Error Constants
// ========================================

export const ERROR_CONSTANTS = {
  CODES: {
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
    INVALID_FORMAT: 'INVALID_FORMAT',
    
    // Authentication errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    
    // Transformation errors
    TRANSFORMATION_NOT_FOUND: 'TRANSFORMATION_NOT_FOUND',
    MAX_TRANSFORMATIONS_EXCEEDED: 'MAX_TRANSFORMATIONS_EXCEEDED',
    DUPLICATE_TRANSFORMATION_TITLE: 'DUPLICATE_TRANSFORMATION_TITLE',
    INVALID_STATUS_UPDATE: 'INVALID_STATUS_UPDATE',
    INSUFFICIENT_PROGRESS: 'INSUFFICIENT_PROGRESS',
    CANNOT_CANCEL_COMPLETED: 'CANNOT_CANCEL_COMPLETED',
    
    // Phoenix lifecycle errors
    NO_ACTIVE_CYCLE: 'NO_ACTIVE_CYCLE',
    ACTIVE_CYCLE_EXISTS: 'ACTIVE_CYCLE_EXISTS',
    PHASE_REQUIREMENTS_NOT_MET: 'PHASE_REQUIREMENTS_NOT_MET',
    INVALID_PHASE_TRANSITION: 'INVALID_PHASE_TRANSITION',
    
    // System errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SERVER_ERROR: 'SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  },
  MESSAGES: {
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
    VALIDATION_FAILED: 'Please check your input and try again.',
    UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action.',
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    RATE_LIMIT_MESSAGE: 'Too many requests. Please slow down and try again later.',
    SERVICE_UNAVAILABLE_MESSAGE: 'Service is temporarily unavailable. Please try again later.',
  },
} as const;

// ========================================
// Default Configuration
// ========================================

export const DEFAULT_PHOENIX_CONFIG: PhoenixConfig = {
  maxTransformationsPerUser: SYSTEM_CONSTANTS.MAX_TRANSFORMATIONS_PER_USER,
  defaultTransformationDuration: SYSTEM_CONSTANTS.DEFAULT_TRANSFORMATION_DURATION_DAYS,
  phoenixCycleDuration: SYSTEM_CONSTANTS.PHOENIX_CYCLE_DEFAULT_DURATION_DAYS,
  
  notificationSettings: {
    dailyReminders: NOTIFICATION_CONSTANTS.DEFAULT_SETTINGS.dailyReminders,
    weeklyProgress: NOTIFICATION_CONSTANTS.DEFAULT_SETTINGS.weeklyProgress,
    milestoneAlerts: NOTIFICATION_CONSTANTS.DEFAULT_SETTINGS.milestoneAlerts,
    phaseTransitions: NOTIFICATION_CONSTANTS.DEFAULT_SETTINGS.phaseTransitions,
  },
  
  progressTracking: {
    minimumUpdateInterval: SYSTEM_CONSTANTS.MIN_PROGRESS_UPDATE_INTERVAL_HOURS,
    automaticProgressDetection: true,
    metricSyncFrequency: SYSTEM_CONSTANTS.METRIC_SYNC_FREQUENCY_MINUTES,
  },
};

// ========================================
// Regular Expressions
// ========================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9-]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  
  // Content validation
  NO_HTML: /^[^<>]*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,
} as const;

// ========================================
// API Endpoints (for reference)
// ========================================

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  REGISTER: '/auth/register',
  
  // Users
  USER_PROFILE: '/users/profile',
  USER_SETTINGS: '/users/settings',
  
  // Transformations
  TRANSFORMATIONS: '/transformations',
  TRANSFORMATION_BY_ID: '/transformations/:id',
  TRANSFORMATION_PROGRESS: '/transformations/:id/progress',
  
  // Phoenix Cycles
  PHOENIX_CYCLES: '/phoenix/cycles',
  CURRENT_CYCLE: '/phoenix/current',
  ADVANCE_PHASE: '/phoenix/advance',
  
  // Analytics
  USER_ANALYTICS: '/analytics/user',
  SYSTEM_ANALYTICS: '/analytics/system',
  TRANSFORMATION_ANALYTICS: '/analytics/transformations/:id',
  
  // Progress Tracking
  PROGRESS_ENTRIES: '/progress',
  PROGRESS_HISTORY: '/progress/history',
  PROGRESS_INSIGHTS: '/progress/insights',
} as const;

// ========================================
// Environment Variables (defaults)
// ========================================

export const ENV_DEFAULTS = {
  NODE_ENV: 'development',
  PORT: '4000',
  LOG_LEVEL: 'info',
  
  // Database
  DATABASE_URL: 'postgresql://localhost:5432/wisdomos',
  DATABASE_SSL: 'false',
  
  // Redis (for caching and sessions)
  REDIS_URL: 'redis://localhost:6379',
  
  // JWT
  JWT_SECRET: 'your-jwt-secret',
  JWT_EXPIRES_IN: '7d',
  
  // External APIs
  OPENAI_API_KEY: '',
  SENDGRID_API_KEY: '',
  TWILIO_ACCOUNT_SID: '',
  
  // File storage
  AWS_S3_BUCKET: '',
  AWS_REGION: 'us-east-1',
  
  // Monitoring
  SENTRY_DSN: '',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX_REQUESTS: '100',
} as const;