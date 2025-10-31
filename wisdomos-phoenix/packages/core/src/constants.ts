// Phoenix Theme Constants
export const PHOENIX_THEME = {
  cycles: {
    ashes: {
      name: 'From the Ashes',
      description: 'Acknowledging what needs to die',
      color: '#6B7280',
      icon: '🌑',
    },
    fire: {
      name: 'Through the Fire',
      description: 'Burning away the old',
      color: '#E63946',
      icon: '🔥',
    },
    rebirth: {
      name: 'Into Rebirth',
      description: 'Emerging transformed',
      color: '#FF914D',
      icon: '✨',
    },
    flight: {
      name: 'Taking Flight',
      description: 'Soaring to new heights',
      color: '#FFD700',
      icon: '🦅',
    },
  },
  colors: {
    solarGold: '#FFD700',
    phoenixRed: '#E63946',
    emberOrange: '#FF914D',
    midnightIndigo: '#1D3557',
    ashGray: '#6B7280',
    smokeWhite: '#F9FAFB',
  },
} as const;

// Life Area Default Colors
export const LIFE_AREA_COLORS = [
  '#FFD700', // Solar Gold
  '#E63946', // Phoenix Red
  '#FF914D', // Ember Orange
  '#1D3557', // Midnight Indigo
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
] as const;

// Life Area Icons
export const LIFE_AREA_ICONS = [
  '🔥', // Fire
  '✨', // Sparkles
  '🌟', // Star
  '💫', // Dizzy
  '🦅', // Eagle
  '🌅', // Sunrise
  '🏔️', // Mountain
  '🌊', // Wave
  '🌳', // Tree
  '💎', // Gem
] as const;

// Reset Ritual Timings (in seconds)
export const RESET_TIMINGS = {
  pause: 30,
  scan: 60,
  acknowledge: 45,
  recommit: 45,
  recalibrate: 30,
} as const;

// Contact Frequency Thresholds (in days)
export const CONTACT_THRESHOLDS = {
  1: 30,  // Monthly
  2: 21,  // Every 3 weeks
  3: 14,  // Bi-weekly
  4: 10,  // Every 10 days
  5: 7,   // Weekly
  6: 5,   // Every 5 days
  7: 3,   // Every 3 days
  8: 2,   // Every other day
  9: 1,   // Daily
  10: 0.5, // Multiple times daily
} as const;

// Drift Thresholds
export const DRIFT_THRESHOLDS = {
  green: { min: -0.2, max: 0.2 },
  yellow: { min: -0.5, max: 0.5 },
  red: { min: -1, max: 1 },
} as const;

// Badge Requirements
export const BADGE_REQUIREMENTS = {
  ASHES_MASTER: { journals: 10, resets: 3 },
  FLAME_WALKER: { journals: 25, resets: 7 },
  RISING_STAR: { journals: 50, resets: 15 },
  FULL_FLIGHT: { journals: 100, resets: 30 },
  BOUNDARY_GUARDIAN: { audits: 12, drift: 0.2 },
  TRANSFORMATION_CATALYST: { resets: 50, areas: 5 },
  PHOENIX_BORN: { level: 10, score: 1000 },
  ETERNAL_FLAME: { level: 25, score: 5000 },
} as const;

// API Rate Limits
export const RATE_LIMITS = {
  journal: { window: 60, max: 30 }, // 30 per minute
  reset: { window: 300, max: 5 },   // 5 per 5 minutes
  audit: { window: 3600, max: 20 }, // 20 per hour
  export: { window: 86400, max: 10 }, // 10 per day
} as const;

// Export Formats
export const EXPORT_FORMATS = {
  pdf: {
    name: 'PDF',
    extension: '.pdf',
    mimeType: 'application/pdf',
  },
  markdown: {
    name: 'Markdown',
    extension: '.md',
    mimeType: 'text/markdown',
  },
  notion: {
    name: 'Notion',
    extension: '.md',
    mimeType: 'text/markdown',
  },
} as const;