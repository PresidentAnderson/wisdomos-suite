// Phoenix System Types
export enum PhoenixStage {
  ASHES = 'ASHES',
  FIRE = 'FIRE', 
  REBIRTH = 'REBIRTH',
  FLIGHT = 'FLIGHT'
}

export enum LifeAreaStatus {
  BREAKDOWN = 'BREAKDOWN',
  ATTENTION = 'ATTENTION',
  THRIVING = 'THRIVING'
}

export enum EntryType {
  REFLECTION = 'REFLECTION',
  GRATITUDE = 'GRATITUDE',
  BREAKTHROUGH = 'BREAKTHROUGH',
  GOAL_SETTING = 'GOAL_SETTING',
  PROGRESS = 'PROGRESS',
  CHALLENGE = 'CHALLENGE'
}

export enum AchievementType {
  FIRST_JOURNAL = 'FIRST_JOURNAL',
  CYCLE_COMPLETE = 'CYCLE_COMPLETE',
  STREAK_7_DAYS = 'STREAK_7_DAYS',
  STREAK_30_DAYS = 'STREAK_30_DAYS',
  LIFE_AREA_MASTER = 'LIFE_AREA_MASTER',
  PHOENIX_RISEN = 'PHOENIX_RISEN',
  BREAKTHROUGH = 'BREAKTHROUGH',
  GRATITUDE_MASTER = 'GRATITUDE_MASTER',
  GOAL_ACHIEVER = 'GOAL_ACHIEVER',
  REFLECTION_SAGE = 'REFLECTION_SAGE'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoenixName?: string;
  currentStage: PhoenixStage;
  cycleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalJournalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalCycles: number;
  achievementCount: number;
  lifeAreaScores: Record<string, number>;
}

// Phoenix Cycle Types
export interface PhoenixCycleData {
  id: string;
  cycleNumber: number;
  stage: PhoenixStage;
  startedAt: string;
  completedAt?: string;
  ashesReflection?: string;
  fireBreakthrough?: string;
  rebirthVision?: string;
  flightLegacy?: string;
  completionScore: number;
  stageProgress?: Record<string, any>;
}

// Life Area Types
export interface LifeAreaData {
  id: string;
  name: string;
  phoenixName: string;
  description?: string;
  icon?: string;
  color?: string;
  status: LifeAreaStatus;
  score: number;
  lastReview?: string;
  currentGoal?: string;
  goalProgress: number;
  goalDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

// Journal Types
export interface JournalEntryData {
  id: string;
  title?: string;
  content: string;
  mood?: number;
  energy?: number;
  stage?: PhoenixStage;
  lifeAreaId?: string;
  type: EntryType;
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalPrompt {
  id: string;
  stage: PhoenixStage;
  category: string;
  prompt: string;
  followUpQuestions?: string[];
}

// Achievement Types
export interface AchievementData {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
  condition?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

// Phoenix Theme Types
export interface PhoenixTheme {
  colors: {
    phoenix: {
      gold: string;
      red: string;
      orange: string;
      indigo: string;
      ash: string;
      ember: string;
      flame: string;
      smoke: string;
    };
    wisdom: {
      green: string;
      yellow: string;
      red: string;
    };
  };
  gradients: {
    phoenix: string;
    ash: string;
    ember: string;
  };
  animations: {
    phoenixRise: string;
    emberGlow: string;
    flameFlicker: string;
  };
}

// UI Component Types
export interface PhoenixButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface LifeAreaCardProps {
  lifeArea: LifeAreaData;
  interactive?: boolean;
  showProgress?: boolean;
  className?: string;
  onClick?: (lifeArea: LifeAreaData) => void;
}

export interface PhoenixLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

// Form Types
export interface JournalEntryForm {
  title?: string;
  content: string;
  mood?: number;
  energy?: number;
  stage?: PhoenixStage;
  lifeAreaId?: string;
  type: EntryType;
  tags: string[];
  isPrivate: boolean;
}

export interface LifeAreaForm {
  name: string;
  phoenixName: string;
  description?: string;
  icon?: string;
  color?: string;
  currentGoal?: string;
  goalDeadline?: string;
}

// Dashboard Types
export interface DashboardData {
  user: UserProfile;
  stats: UserStats;
  currentCycle?: PhoenixCycleData;
  lifeAreas: LifeAreaData[];
  recentEntries: JournalEntryData[];
  recentAchievements: AchievementData[];
  phoenixProgress: {
    stage: PhoenixStage;
    stageProgress: number;
    nextStageUnlocked: boolean;
  };
}

// Analytics Types
export interface UserAnalytics {
  journalingFrequency: Record<string, number>;
  moodTrends: Array<{ date: string; mood: number; energy: number }>;
  lifeAreaProgress: Record<string, number[]>;
  achievementTimeline: Array<{ date: string; achievement: AchievementData }>;
  phoenixCycleHistory: PhoenixCycleData[];
}