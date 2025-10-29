// Phoenix-themed type definitions
export type PhoenixCycle = 'ASHES' | 'FIRE' | 'REBIRTH' | 'FLIGHT';

export interface PhoenixTheme {
  cycles: {
    ashes: {
      name: string;
      description: string;
      color: string;
      icon: string;
    };
    fire: {
      name: string;
      description: string;
      color: string;
      icon: string;
    };
    rebirth: {
      name: string;
      description: string;
      color: string;
      icon: string;
    };
    flight: {
      name: string;
      description: string;
      color: string;
      icon: string;
    };
  };
  colors: {
    solarGold: string;
    phoenixRed: string;
    emberOrange: string;
    midnightIndigo: string;
    ashGray: string;
    smokeWhite: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    version: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Event Types
export type EventType = 
  | 'WIN'
  | 'COMMITMENT_KEPT'
  | 'COMMITMENT_BROKEN'
  | 'UPSET'
  | 'INSIGHT'
  | 'BOUNDARY_RESET'
  | 'TASK_COMPLETED'
  | 'TASK_MISSED';

export interface Event {
  id: string;
  userId: string;
  lifeAreaId: string;
  type: EventType;
  impact: number; // -2 to +2
  title: string;
  notes?: string;
  occurredAt: Date;
  createdAt: Date;
}

// Badge Types
export type BadgeType = 
  | 'ASHES_MASTER'
  | 'FLAME_WALKER'
  | 'RISING_STAR'
  | 'FULL_FLIGHT'
  | 'BOUNDARY_GUARDIAN'
  | 'TRANSFORMATION_CATALYST'
  | 'PHOENIX_BORN'
  | 'ETERNAL_FLAME';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: Rarity;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface Metrics {
  journalEntryLatency: number; // P50 < 3s
  resetRitualCompletion: number; // > 75%
  weeklyRetention: number; // > 40%
  crashFreeRate: number; // > 99.5%
}