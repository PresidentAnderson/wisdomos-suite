import { format, parseISO, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DRIFT_THRESHOLDS, CONTACT_THRESHOLDS, PHOENIX_THEME } from './constants';
import type { PhoenixCycle } from './types';

// Date utilities
export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatDateWithTimezone = (
  date: Date | string,
  timezone: string,
  formatStr: string = 'PPP'
): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, timezone, formatStr);
};

export const getDaysSince = (date: Date | string): number => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(new Date(), d);
};

export const getMonthBounds = (date: Date) => ({
  start: startOfMonth(date),
  end: endOfMonth(date),
});

// Phoenix cycle utilities
export const getNextCycle = (current: PhoenixCycle): PhoenixCycle => {
  const cycles: PhoenixCycle[] = ['ASHES', 'FIRE', 'REBIRTH', 'FLIGHT'];
  const currentIndex = cycles.indexOf(current);
  return cycles[(currentIndex + 1) % cycles.length];
};

export const getCycleColor = (cycle: PhoenixCycle): string => {
  return PHOENIX_THEME.cycles[cycle.toLowerCase() as keyof typeof PHOENIX_THEME.cycles].color;
};

export const getCycleIcon = (cycle: PhoenixCycle): string => {
  return PHOENIX_THEME.cycles[cycle.toLowerCase() as keyof typeof PHOENIX_THEME.cycles].icon;
};

// Drift calculation utilities
export const calculateDrift = (expected: number, actual: number): number => {
  if (expected === 0) return 0;
  return Math.max(-1, Math.min(1, (actual - expected) / expected));
};

export const getDriftStatus = (drift: number): 'green' | 'yellow' | 'red' => {
  const absDrift = Math.abs(drift);
  if (absDrift <= Math.abs(DRIFT_THRESHOLDS.green.max)) return 'green';
  if (absDrift <= Math.abs(DRIFT_THRESHOLDS.yellow.max)) return 'yellow';
  return 'red';
};

export const getDriftColor = (drift: number): string => {
  const status = getDriftStatus(drift);
  switch (status) {
    case 'green': return '#10B981';
    case 'yellow': return '#F59E0B';
    case 'red': return '#E63946';
  }
};

// Contact reminder utilities
export const getContactUrgency = (
  daysSinceContact: number,
  frequency: number
): 'low' | 'medium' | 'high' => {
  const threshold = CONTACT_THRESHOLDS[frequency as keyof typeof CONTACT_THRESHOLDS] || 7;
  const ratio = daysSinceContact / threshold;
  
  if (ratio < 0.8) return 'low';
  if (ratio < 1.2) return 'medium';
  return 'high';
};

export const getUrgencyColor = (urgency: 'low' | 'medium' | 'high'): string => {
  switch (urgency) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#E63946';
  }
};

// Score calculation utilities
export const calculateWisdomScore = (
  journals: number,
  resets: number,
  avgDrift: number,
  badges: number
): number => {
  const journalScore = journals * 10;
  const resetScore = resets * 50;
  const driftScore = (1 - Math.abs(avgDrift)) * 200;
  const badgeScore = badges * 100;
  
  return Math.round(journalScore + resetScore + driftScore + badgeScore);
};

export const calculateMomentum = (
  currentScore: number,
  previousScore: number,
  timeFrame: number = 7 // days
): number => {
  if (previousScore === 0) return currentScore > 0 ? 1 : 0;
  const change = (currentScore - previousScore) / previousScore;
  const dailyChange = change / timeFrame;
  return Math.max(-1, Math.min(1, dailyChange * 10)); // Normalize to -1 to 1
};

// Export utilities
export const generateExportFilename = (
  format: 'pdf' | 'markdown' | 'notion',
  prefix: string = 'wisdomos'
): string => {
  const date = format(new Date(), 'yyyy-MM-dd');
  const extensions = {
    pdf: '.pdf',
    markdown: '.md',
    notion: '.md',
  };
  return `${prefix}_${date}${extensions[format]}`;
};

// Validation utilities
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const isValidUUID = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};

// Text utilities
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Analytics utilities
export const trackEvent = (
  name: string,
  properties?: Record<string, any>
): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, properties);
  }
  // Also send to internal analytics if configured
  console.log('[Analytics]', name, properties);
};

// Storage utilities
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};