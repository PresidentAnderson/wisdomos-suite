/**
 * Feature Flag System for WisdomOS Editions
 *
 * This module defines feature availability across different editions
 */

export enum Edition {
  FREE = 'free',
  STUDENT = 'student',
  COMMUNITY_HUB = 'community-hub',
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  INSTITUTIONAL = 'institutional',
  PREMIUM = 'premium',
}

export interface FeatureFlags {
  // Phoenix Cycle Features
  ashesReflection: boolean;
  fireBreakthrough: boolean;
  rebirthFulfillment: boolean;
  flightLegacy: boolean;

  // Journaling Features
  basicJournaling: boolean;
  advancedJournaling: boolean;
  aiInsights: boolean;
  patternRecognition: boolean;

  // Community Features
  communityAccess: boolean;
  groupSessions: boolean;
  peerSupport: boolean;

  // Coaching Features
  aiCoach: boolean;
  humanCoach: boolean;
  personalizedGuidance: boolean;

  // Progress Tracking
  basicDashboard: boolean;
  advancedAnalytics: boolean;
  goalTracking: boolean;

  // Content & Resources
  basicContent: boolean;
  premiumContent: boolean;
  workshopAccess: boolean;

  // Limits
  maxJournalEntries: number | 'unlimited';
  maxConversations: number | 'unlimited';
  maxGoals: number | 'unlimited';
  storageLimit: string; // e.g., "100MB", "1GB", "unlimited"
}

export const EDITION_FEATURES: Record<Edition, FeatureFlags> = {
  [Edition.FREE]: {
    ashesReflection: true,
    fireBreakthrough: false,
    rebirthFulfillment: false,
    flightLegacy: false,
    basicJournaling: true,
    advancedJournaling: false,
    aiInsights: false,
    patternRecognition: false,
    communityAccess: true,
    groupSessions: false,
    peerSupport: true,
    aiCoach: false,
    humanCoach: false,
    personalizedGuidance: false,
    basicDashboard: true,
    advancedAnalytics: false,
    goalTracking: false,
    basicContent: true,
    premiumContent: false,
    workshopAccess: false,
    maxJournalEntries: 30,
    maxConversations: 5,
    maxGoals: 3,
    storageLimit: '100MB',
  },

  [Edition.STUDENT]: {
    ashesReflection: true,
    fireBreakthrough: true,
    rebirthFulfillment: true,
    flightLegacy: false,
    basicJournaling: true,
    advancedJournaling: true,
    aiInsights: true,
    patternRecognition: false,
    communityAccess: true,
    groupSessions: true,
    peerSupport: true,
    aiCoach: true,
    humanCoach: false,
    personalizedGuidance: true,
    basicDashboard: true,
    advancedAnalytics: true,
    goalTracking: true,
    basicContent: true,
    premiumContent: false,
    workshopAccess: true,
    maxJournalEntries: 'unlimited',
    maxConversations: 50,
    maxGoals: 10,
    storageLimit: '1GB',
  },

  [Edition.COMMUNITY_HUB]: {
    ashesReflection: true,
    fireBreakthrough: true,
    rebirthFulfillment: true,
    flightLegacy: true,
    basicJournaling: true,
    advancedJournaling: true,
    aiInsights: true,
    patternRecognition: true,
    communityAccess: true,
    groupSessions: true,
    peerSupport: true,
    aiCoach: true,
    humanCoach: false,
    personalizedGuidance: true,
    basicDashboard: true,
    advancedAnalytics: true,
    goalTracking: true,
    basicContent: true,
    premiumContent: true,
    workshopAccess: true,
    maxJournalEntries: 'unlimited',
    maxConversations: 'unlimited',
    maxGoals: 'unlimited',
    storageLimit: '5GB',
  },

  [Edition.STANDARD]: {
    ashesReflection: true,
    fireBreakthrough: true,
    rebirthFulfillment: true,
    flightLegacy: false,
    basicJournaling: true,
    advancedJournaling: true,
    aiInsights: true,
    patternRecognition: false,
    communityAccess: true,
    groupSessions: false,
    peerSupport: true,
    aiCoach: true,
    humanCoach: false,
    personalizedGuidance: true,
    basicDashboard: true,
    advancedAnalytics: true,
    goalTracking: true,
    basicContent: true,
    premiumContent: false,
    workshopAccess: false,
    maxJournalEntries: 'unlimited',
    maxConversations: 100,
    maxGoals: 20,
    storageLimit: '2GB',
  },

  [Edition.ADVANCED]: {
    ashesReflection: true,
    fireBreakthrough: true,
    rebirthFulfillment: true,
    flightLegacy: true,
    basicJournaling: true,
    advancedJournaling: true,
    aiInsights: true,
    patternRecognition: true,
    communityAccess: true,
    groupSessions: true,
    peerSupport: true,
    aiCoach: true,
    humanCoach: false,
    personalizedGuidance: true,
    basicDashboard: true,
    advancedAnalytics: true,
    goalTracking: true,
    basicContent: true,
    premiumContent: true,
    workshopAccess: true,
    maxJournalEntries: 'unlimited',
    maxConversations: 'unlimited',
    maxGoals: 'unlimited',
    storageLimit: '10GB',
  },

  [Edition.INSTITUTIONAL]: {
    ashesReflection: true,
    fireBreakthrough: true,
    rebirthFulfillment: true,
    flightLegacy: true,
    basicJournaling: true,
    advancedJournaling: true,
    aiInsights: true,
    patternRecognition: true,
    communityAccess: true,
    groupSessions: true,
    peerSupport: true,
    aiCoach: true,
    humanCoach: true,
    personalizedGuidance: true,
    basicDashboard: true,
    advancedAnalytics: true,
    goalTracking: true,
    basicContent: true,
    premiumContent: true,
    workshopAccess: true,
    maxJournalEntries: 'unlimited',
    maxConversations: 'unlimited',
    maxGoals: 'unlimited',
    storageLimit: 'unlimited',
  },

  [Edition.PREMIUM]: {
    ashesReflection: true,
    fireBreakthrough: true,
    rebirthFulfillment: true,
    flightLegacy: true,
    basicJournaling: true,
    advancedJournaling: true,
    aiInsights: true,
    patternRecognition: true,
    communityAccess: true,
    groupSessions: true,
    peerSupport: true,
    aiCoach: true,
    humanCoach: true,
    personalizedGuidance: true,
    basicDashboard: true,
    advancedAnalytics: true,
    goalTracking: true,
    basicContent: true,
    premiumContent: true,
    workshopAccess: true,
    maxJournalEntries: 'unlimited',
    maxConversations: 'unlimited',
    maxGoals: 'unlimited',
    storageLimit: 'unlimited',
  },
};

/**
 * Get feature flags for a specific edition
 */
export function getFeatureFlags(edition: Edition): FeatureFlags {
  return EDITION_FEATURES[edition];
}

/**
 * Check if a feature is enabled for a specific edition
 */
export function hasFeature(edition: Edition, feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags(edition);
  return Boolean(flags[feature]);
}

/**
 * Get limit value for a specific edition
 */
export function getLimit(
  edition: Edition,
  limit: 'maxJournalEntries' | 'maxConversations' | 'maxGoals' | 'storageLimit'
): number | string {
  const flags = getFeatureFlags(edition);
  return flags[limit];
}
