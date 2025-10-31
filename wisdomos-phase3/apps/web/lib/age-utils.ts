/**
 * Age Calculation Utilities for WisdomOS
 * Used for Life Calendar, Autobiography Timeline, and personalized insights
 */

/**
 * Calculate current age from date of birth
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Current age in years
 */
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get life stage based on age
 * @param age - Age in years
 * @returns Life stage label
 */
export function getLifeStage(age: number): string {
  if (age < 0) return 'Unborn';
  if (age < 3) return 'Infant';
  if (age < 6) return 'Early Childhood';
  if (age < 13) return 'Childhood';
  if (age < 18) return 'Adolescence';
  if (age < 25) return 'Young Adult';
  if (age < 30) return 'Adult (Exploration)';
  if (age < 40) return 'Adult (Establishment)';
  if (age < 50) return 'Midlife (Building)';
  if (age < 60) return 'Midlife (Mastery)';
  if (age < 70) return 'Senior (Active)';
  if (age < 80) return 'Senior (Wisdom)';
  if (age < 90) return 'Elder';
  return 'Centenarian';
}

/**
 * Calculate life progress percentage
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @param expectedLifespan - Expected lifespan in years (default: 85)
 * @returns Percentage of life lived (0-100)
 */
export function getLifeProgress(dateOfBirth: string, expectedLifespan: number = 85): number {
  const age = calculateAge(dateOfBirth);
  return Math.min(100, Math.max(0, (age / expectedLifespan) * 100));
}

/**
 * Calculate remaining years
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @param expectedLifespan - Expected lifespan in years (default: 85)
 * @returns Number of years remaining
 */
export function getRemainingYears(dateOfBirth: string, expectedLifespan: number = 85): number {
  const age = calculateAge(dateOfBirth);
  return Math.max(0, expectedLifespan - age);
}

/**
 * Calculate remaining weeks (for Life Calendar visualization)
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @param expectedLifespan - Expected lifespan in years (default: 85)
 * @returns Number of weeks remaining
 */
export function getRemainingWeeks(dateOfBirth: string, expectedLifespan: number = 85): number {
  const remainingYears = getRemainingYears(dateOfBirth, expectedLifespan);
  return Math.round(remainingYears * 52);
}

/**
 * Get week number of life (for Life Calendar)
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Current week number (0-4420 for 85 years)
 */
export function getCurrentLifeWeek(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const diffMs = now.getTime() - dob.getTime();
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}

/**
 * Get days lived
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Total days lived
 */
export function getDaysLived(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const diffMs = now.getTime() - dob.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get milestone ages for life phases
 * @returns Array of milestone objects with age and description
 */
export function getLifeMilestones() {
  return [
    { age: 0, milestone: 'Birth', description: 'Beginning of life journey' },
    { age: 5, milestone: 'Early Learning', description: 'Foundation of personality' },
    { age: 13, milestone: 'Adolescence', description: 'Identity formation begins' },
    { age: 18, milestone: 'Adulthood', description: 'Independence and responsibility' },
    { age: 21, milestone: 'Full Adult', description: 'Legal and social maturity' },
    { age: 25, milestone: 'Career Launch', description: 'Professional establishment' },
    { age: 30, milestone: 'Self-Discovery', description: 'Deepening self-awareness' },
    { age: 40, milestone: 'Midlife Evaluation', description: 'Life review and redirection' },
    { age: 50, milestone: 'Wisdom Phase', description: 'Experience becomes wisdom' },
    { age: 60, milestone: 'Legacy Building', description: 'Contribution and mentorship' },
    { age: 70, milestone: 'Elder Wisdom', description: 'Sharing accumulated knowledge' },
    { age: 80, milestone: 'Life Mastery', description: 'Integration of life experience' },
  ];
}

/**
 * Get next milestone
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Next milestone object or null if past all milestones
 */
export function getNextMilestone(dateOfBirth: string) {
  const age = calculateAge(dateOfBirth);
  const milestones = getLifeMilestones();
  return milestones.find(m => m.age > age) || null;
}

/**
 * Calculate years until next milestone
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Years until next milestone or null
 */
export function getYearsToNextMilestone(dateOfBirth: string): number | null {
  const age = calculateAge(dateOfBirth);
  const nextMilestone = getNextMilestone(dateOfBirth);
  return nextMilestone ? nextMilestone.age - age : null;
}

/**
 * Format age for display
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Formatted age string (e.g., "32 years old")
 */
export function formatAge(dateOfBirth: string): string {
  const age = calculateAge(dateOfBirth);
  return `${age} year${age === 1 ? '' : 's'} old`;
}

/**
 * Get personalized message based on age
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Motivational message for current life stage
 */
export function getAgeBasedMessage(dateOfBirth: string): string {
  const age = calculateAge(dateOfBirth);
  const lifeStage = getLifeStage(age);

  const messages: Record<string, string> = {
    'Childhood': 'Building the foundation for your future self.',
    'Adolescence': 'Discovering who you are and who you want to become.',
    'Young Adult': 'Exploring possibilities and finding your path.',
    'Adult (Exploration)': 'Creating your unique life story.',
    'Adult (Establishment)': 'Building the life you envision.',
    'Midlife (Building)': 'Peak years of impact and contribution.',
    'Midlife (Mastery)': 'Refining expertise and deepening wisdom.',
    'Senior (Active)': 'Sharing wisdom while staying engaged.',
    'Senior (Wisdom)': 'Your life experience is invaluable.',
    'Elder': 'A lifetime of wisdom to share and celebrate.',
  };

  return messages[lifeStage] || 'Every day is an opportunity for growth.';
}

/**
 * Validate date of birth
 * @param dateOfBirth - Date string to validate
 * @returns True if valid, error message if invalid
 */
export function validateDateOfBirth(dateOfBirth: string): { valid: boolean; error?: string } {
  if (!dateOfBirth) {
    return { valid: false, error: 'Date of birth is required' };
  }

  const dob = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(dob.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (dob > now) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }

  const age = calculateAge(dateOfBirth);
  if (age > 125) {
    return { valid: false, error: 'Please enter a valid date of birth' };
  }

  if (age < 0) {
    return { valid: false, error: 'Date of birth must be in the past' };
  }

  return { valid: true };
}
