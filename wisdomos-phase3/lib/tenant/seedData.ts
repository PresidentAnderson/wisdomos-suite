/**
 * Seed Data for New Tenants
 *
 * Default life areas template with 30 Phoenix Fulfillment areas
 * organized into 6 thematic clusters
 */

import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16)

export interface LifeAreaSeed {
  id: string
  slug: string
  name: string
  description: string
  cluster: string
  sortOrder: number
  currentScore: number
  status: string
}

export const lifeAreasSeedData: LifeAreaSeed[] = [
  // ============================================
  // SYSTEMIC / STRUCTURAL (5 areas)
  // ============================================
  {
    id: nanoid(),
    slug: 'work',
    name: 'Work & Purpose',
    description: 'Career, professional performance, job satisfaction, and alignment with purpose',
    cluster: 'SYSTEMIC_STRUCTURAL',
    sortOrder: 1,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'finance',
    name: 'Financial Abundance',
    description: 'Money, income, investments, savings, debt management, and financial security',
    cluster: 'SYSTEMIC_STRUCTURAL',
    sortOrder: 2,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'living-environment',
    name: 'Living Environment',
    description: 'Home, physical space, organization, comfort, and environmental quality',
    cluster: 'SYSTEMIC_STRUCTURAL',
    sortOrder: 3,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'legal-civic',
    name: 'Legal & Civic',
    description: 'Legal matters, civic engagement, administrative tasks, and citizenship',
    cluster: 'SYSTEMIC_STRUCTURAL',
    sortOrder: 4,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'time-energy-management',
    name: 'Time & Energy Management',
    description: 'Productivity, time allocation, energy optimization, and work-life balance',
    cluster: 'SYSTEMIC_STRUCTURAL',
    sortOrder: 5,
    currentScore: 50.0,
    status: 'BALANCED'
  },

  // ============================================
  // RELATIONAL / HUMAN (5 areas)
  // ============================================
  {
    id: nanoid(),
    slug: 'romantic-intimacy',
    name: 'Romantic & Intimacy',
    description: 'Romantic relationships, intimacy, partnership, and emotional connection',
    cluster: 'RELATIONAL_HUMAN',
    sortOrder: 6,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'family',
    name: 'Family',
    description: 'Family relationships, dynamics, support systems, and belonging',
    cluster: 'RELATIONAL_HUMAN',
    sortOrder: 7,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'friendships',
    name: 'Friendships',
    description: 'Friendships, social connections, peer relationships, and companionship',
    cluster: 'RELATIONAL_HUMAN',
    sortOrder: 8,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'professional-network',
    name: 'Professional Network',
    description: 'Professional relationships, networking, mentorship, and career connections',
    cluster: 'RELATIONAL_HUMAN',
    sortOrder: 9,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'community-belonging',
    name: 'Community & Belonging',
    description: 'Community involvement, social belonging, and collective participation',
    cluster: 'RELATIONAL_HUMAN',
    sortOrder: 10,
    currentScore: 50.0,
    status: 'BALANCED'
  },

  // ============================================
  // INNER / PERSONAL (5 areas)
  // ============================================
  {
    id: nanoid(),
    slug: 'physical-health',
    name: 'Physical Health',
    description: 'Exercise, nutrition, sleep, physical fitness, and bodily wellbeing',
    cluster: 'INNER_PERSONAL',
    sortOrder: 11,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'mental-health',
    name: 'Mental Health',
    description: 'Psychological wellbeing, mental clarity, therapy, and mental resilience',
    cluster: 'INNER_PERSONAL',
    sortOrder: 12,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'emotional-wellbeing',
    name: 'Emotional Wellbeing',
    description: 'Emotional regulation, processing feelings, and emotional intelligence',
    cluster: 'INNER_PERSONAL',
    sortOrder: 13,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'personal-growth',
    name: 'Personal Growth',
    description: 'Self-development, learning, skill-building, and personal evolution',
    cluster: 'INNER_PERSONAL',
    sortOrder: 14,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'spirituality-meaning',
    name: 'Spirituality & Meaning',
    description: 'Spiritual practice, existential questions, meaning-making, and connection to the transcendent',
    cluster: 'INNER_PERSONAL',
    sortOrder: 15,
    currentScore: 50.0,
    status: 'BALANCED'
  },

  // ============================================
  // CREATIVE / EXPRESSIVE (5 areas)
  // ============================================
  {
    id: nanoid(),
    slug: 'creative-expression',
    name: 'Creative Expression',
    description: 'Artistic pursuits, creativity, self-expression, and artistic fulfillment',
    cluster: 'CREATIVE_EXPRESSIVE',
    sortOrder: 16,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'hobbies-play',
    name: 'Hobbies & Play',
    description: 'Leisure activities, hobbies, play, and recreational enjoyment',
    cluster: 'CREATIVE_EXPRESSIVE',
    sortOrder: 17,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'style-aesthetics',
    name: 'Style & Aesthetics',
    description: 'Personal style, aesthetic preferences, beauty, and self-presentation',
    cluster: 'CREATIVE_EXPRESSIVE',
    sortOrder: 18,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'humor-levity',
    name: 'Humor & Levity',
    description: 'Laughter, humor, lightness, and joyful moments',
    cluster: 'CREATIVE_EXPRESSIVE',
    sortOrder: 19,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'sensuality-pleasure',
    name: 'Sensuality & Pleasure',
    description: 'Sensory experiences, pleasure, sensuality, and embodied enjoyment',
    cluster: 'CREATIVE_EXPRESSIVE',
    sortOrder: 20,
    currentScore: 50.0,
    status: 'BALANCED'
  },

  // ============================================
  // EXPLORATORY / EXPANSIVE (5 areas)
  // ============================================
  {
    id: nanoid(),
    slug: 'travel-adventure',
    name: 'Travel & Adventure',
    description: 'Travel, exploration, adventure, and new experiences',
    cluster: 'EXPLORATORY_EXPANSIVE',
    sortOrder: 21,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'learning-education',
    name: 'Learning & Education',
    description: 'Education, learning new skills, intellectual growth, and knowledge acquisition',
    cluster: 'EXPLORATORY_EXPANSIVE',
    sortOrder: 22,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'innovation-experimentation',
    name: 'Innovation & Experimentation',
    description: 'Innovation, experimentation, trying new things, and pushing boundaries',
    cluster: 'EXPLORATORY_EXPANSIVE',
    sortOrder: 23,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'nature-environment',
    name: 'Nature & Environment',
    description: 'Connection to nature, environmental stewardship, and outdoor experiences',
    cluster: 'EXPLORATORY_EXPANSIVE',
    sortOrder: 24,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'curiosity-wonder',
    name: 'Curiosity & Wonder',
    description: 'Curiosity, wonder, asking questions, and exploring the unknown',
    cluster: 'EXPLORATORY_EXPANSIVE',
    sortOrder: 25,
    currentScore: 50.0,
    status: 'BALANCED'
  },

  // ============================================
  // INTEGRATIVE / LEGACY (5 areas)
  // ============================================
  {
    id: nanoid(),
    slug: 'purpose-mission',
    name: 'Purpose & Mission',
    description: 'Life purpose, mission, calling, and overarching direction',
    cluster: 'INTEGRATIVE_LEGACY',
    sortOrder: 26,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'values-integrity',
    name: 'Values & Integrity',
    description: 'Core values, ethical living, integrity, and value alignment',
    cluster: 'INTEGRATIVE_LEGACY',
    sortOrder: 27,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'legacy-impact',
    name: 'Legacy & Impact',
    description: 'Legacy building, lasting impact, and what you leave behind',
    cluster: 'INTEGRATIVE_LEGACY',
    sortOrder: 28,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'contribution-service',
    name: 'Contribution & Service',
    description: 'Service to others, contribution, volunteering, and giving back',
    cluster: 'INTEGRATIVE_LEGACY',
    sortOrder: 29,
    currentScore: 50.0,
    status: 'BALANCED'
  },
  {
    id: nanoid(),
    slug: 'wisdom-integration',
    name: 'Wisdom & Integration',
    description: 'Integrating life experiences into wisdom, reflection, and holistic understanding',
    cluster: 'INTEGRATIVE_LEGACY',
    sortOrder: 30,
    currentScore: 50.0,
    status: 'BALANCED'
  }
]
