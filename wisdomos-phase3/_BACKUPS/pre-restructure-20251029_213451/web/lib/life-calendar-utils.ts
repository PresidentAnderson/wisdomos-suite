/**
 * Life Calendar Utilities
 * Helpers for initializing and managing the 120-year life calendar based on user's date of birth
 */

export interface LifeCalendarData {
  age: number
  yearsPassed: number
  yearsRemaining: number
  monthsPassed: number
  monthsRemaining: number
  weeksPassed: number
  weeksRemaining: number
  percentComplete: number
  currentLifeStage: LifeStage
  milestones: Milestone[]
}

export interface LifeStage {
  name: string
  ageRange: [number, number]
  description: string
  phoenixPhase: 'ashes' | 'fire' | 'rebirth' | 'flight'
}

export interface Milestone {
  age: number
  year: number
  title: string
  isPast: boolean
  isFuture: boolean
}

const LIFE_EXPECTANCY = 120 // WisdomOS uses 120-year life calendar
const MONTHS_PER_YEAR = 12
const WEEKS_PER_YEAR = 52

/**
 * Calculate current age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }

  return age
}

/**
 * Get life stages based on Phoenix transformation framework
 */
export function getLifeStages(): LifeStage[] {
  return [
    {
      name: 'Foundation (Ashes)',
      ageRange: [0, 25],
      description: 'Building foundations, learning, early identity formation',
      phoenixPhase: 'ashes'
    },
    {
      name: 'Ignition (Fire)',
      ageRange: [26, 45],
      description: 'Career building, family formation, establishing purpose',
      phoenixPhase: 'fire'
    },
    {
      name: 'Transformation (Rebirth)',
      ageRange: [46, 65],
      description: 'Peak productivity, wisdom accumulation, legacy building',
      phoenixPhase: 'rebirth'
    },
    {
      name: 'Mastery (Flight)',
      ageRange: [66, 85],
      description: 'Mentorship, contribution, sharing accumulated wisdom',
      phoenixPhase: 'flight'
    },
    {
      name: 'Transcendence (Eternal Flame)',
      ageRange: [86, 120],
      description: 'Deep wisdom, spiritual growth, lasting impact',
      phoenixPhase: 'flight'
    }
  ]
}

/**
 * Determine current life stage based on age
 */
export function getCurrentLifeStage(age: number): LifeStage {
  const stages = getLifeStages()
  return stages.find(stage => age >= stage.ageRange[0] && age <= stage.ageRange[1]) || stages[0]
}

/**
 * Generate milestone years (every 5 years)
 */
export function generateMilestones(dateOfBirth: Date, currentAge: number): Milestone[] {
  const milestones: Milestone[] = []
  const birthYear = dateOfBirth.getFullYear()

  for (let age = 5; age <= LIFE_EXPECTANCY; age += 5) {
    milestones.push({
      age,
      year: birthYear + age,
      title: getMilestoneTitle(age),
      isPast: age <= currentAge,
      isFuture: age > currentAge
    })
  }

  return milestones
}

/**
 * Get contextual title for milestone age
 */
function getMilestoneTitle(age: number): string {
  const milestones: Record<number, string> = {
    5: 'Early Childhood',
    10: 'Pre-adolescence',
    15: 'Adolescence',
    18: 'Legal Adulthood',
    21: 'Young Adult',
    25: 'Quarter Century',
    30: 'Established Adult',
    35: 'Mid-Career',
    40: 'Wisdom Begins',
    45: 'Peak Performance',
    50: 'Half Century',
    55: 'Legacy Building',
    60: 'Pre-Retirement',
    65: 'Traditional Retirement',
    70: 'Elder Wisdom',
    75: 'Senior Mastery',
    80: 'Octogenarian',
    85: 'Advanced Elder',
    90: 'Nonagenarian',
    95: 'Near Centenarian',
    100: 'Centenarian',
    105: 'Supercentenarian',
    110: 'Rare Achievement',
    115: 'Extraordinary Longevity',
    120: 'Maximum Life Span'
  }

  return milestones[age] || `Age ${age}`
}

/**
 * Initialize complete life calendar data for a user
 */
export function initializeLifeCalendar(dateOfBirth: Date): LifeCalendarData {
  const age = calculateAge(dateOfBirth)
  const yearsPassed = age
  const yearsRemaining = Math.max(0, LIFE_EXPECTANCY - age)
  const monthsPassed = yearsPassed * MONTHS_PER_YEAR + new Date().getMonth()
  const monthsRemaining = LIFE_EXPECTANCY * MONTHS_PER_YEAR - monthsPassed
  const weeksPassed = Math.floor((new Date().getTime() - dateOfBirth.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const weeksRemaining = LIFE_EXPECTANCY * WEEKS_PER_YEAR - weeksPassed
  const percentComplete = (age / LIFE_EXPECTANCY) * 100

  return {
    age,
    yearsPassed,
    yearsRemaining,
    monthsPassed,
    monthsRemaining,
    weeksPassed,
    weeksRemaining,
    percentComplete: Math.min(100, Math.max(0, percentComplete)),
    currentLifeStage: getCurrentLifeStage(age),
    milestones: generateMilestones(dateOfBirth, age)
  }
}

/**
 * Get motivational message based on age and life stage
 */
export function getLifeCalendarMessage(calendar: LifeCalendarData): string {
  const { age, percentComplete, currentLifeStage } = calendar

  if (age < 25) {
    return `You're in the ${currentLifeStage.name} phase. This is your time to build foundations and explore possibilities. ${Math.floor(calendar.weeksRemaining).toLocaleString()} weeks ahead of you.`
  } else if (age < 45) {
    return `You're in the ${currentLifeStage.name} phase. Peak energy and opportunity. Make every week count - ${Math.floor(calendar.weeksRemaining).toLocaleString()} weeks of potential await.`
  } else if (age < 65) {
    return `You're in the ${currentLifeStage.name} phase. Transform accumulated experience into wisdom and legacy. ${Math.floor(calendar.weeksRemaining).toLocaleString()} weeks to make your greatest impact.`
  } else if (age < 85) {
    return `You're in the ${currentLifeStage.name} phase. Share your wisdom and mentor the next generation. ${Math.floor(calendar.weeksRemaining).toLocaleString()} weeks of meaningful contribution ahead.`
  } else {
    return `You're in the ${currentLifeStage.name} phase. You've achieved extraordinary longevity. Every moment is precious - ${Math.floor(calendar.weeksRemaining).toLocaleString()} weeks to continue your legacy.`
  }
}

/**
 * Format life calendar for display
 */
export function formatLifeCalendar(calendar: LifeCalendarData): string {
  return `
Age: ${calendar.age}
Life Progress: ${calendar.percentComplete.toFixed(1)}%
Years Passed: ${calendar.yearsPassed} | Remaining: ${calendar.yearsRemaining}
Weeks Passed: ${calendar.weeksPassed.toLocaleString()} | Remaining: ${calendar.weeksRemaining.toLocaleString()}
Current Phase: ${calendar.currentLifeStage.name} (${calendar.currentLifeStage.phoenixPhase.toUpperCase()})
${getLifeCalendarMessage(calendar)}
  `.trim()
}
