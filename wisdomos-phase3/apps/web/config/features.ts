/**
 * Feature Flags Configuration for Autobiography AI Enhancements
 *
 * These flags control various AI-powered features for the autobiography system.
 * All flags are read from environment variables and default to 'false' if not set.
 */

export interface FeatureFlags {
  /**
   * Enable bulk generation of world events for multiple years at once
   * Useful for historical context and timeline building
   */
  BULK_GENERATION: boolean

  /**
   * Enable manual curation mode where users can review and edit AI-generated content
   * before it's added to their autobiography
   */
  CURATION_MODE: boolean

  /**
   * Enable regional relevance filtering to prioritize events from user's region/country
   * Provides more culturally relevant context
   */
  REGIONAL_RELEVANCE: boolean

  /**
   * Enable memory linking to automatically connect world events to personal journal entries
   * Creates rich contextual connections between personal and historical narratives
   */
  MEMORY_LINKING: boolean
}

/**
 * Parse environment variable to boolean
 * Accepts: 'true', '1', 'yes', 'on' (case-insensitive) as true
 * Everything else is false
 */
function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
}

/**
 * Feature flags loaded from environment variables
 * These can be toggled per deployment environment (dev, staging, production)
 */
export const FEATURE_FLAGS: FeatureFlags = {
  BULK_GENERATION: parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_BULK_GENERATION),
  CURATION_MODE: parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_CURATION_MODE),
  REGIONAL_RELEVANCE: parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_REGION_RELEVANCE),
  MEMORY_LINKING: parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_MEMORY_LINKING),
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[feature]
}

/**
 * Get all enabled features as an array
 */
export function getEnabledFeatures(): (keyof FeatureFlags)[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature, _]) => feature as keyof FeatureFlags)
}

/**
 * Log feature flags status (useful for debugging)
 */
export function logFeatureFlags(): void {
  console.log('🚀 Autobiography AI Feature Flags:')
  console.log('  BULK_GENERATION:', FEATURE_FLAGS.BULK_GENERATION)
  console.log('  CURATION_MODE:', FEATURE_FLAGS.CURATION_MODE)
  console.log('  REGIONAL_RELEVANCE:', FEATURE_FLAGS.REGIONAL_RELEVANCE)
  console.log('  MEMORY_LINKING:', FEATURE_FLAGS.MEMORY_LINKING)
}
