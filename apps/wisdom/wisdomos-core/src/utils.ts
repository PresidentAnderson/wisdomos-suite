/**
 * @fileoverview Utility Functions for WisdomOS Core
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { PhoenixPhase, TransformationType, TransformationStatus } from './types';

// ========================================
// Date and Time Utilities
// ========================================

export class DateUtils {
  /**
   * Format date for display
   */
  static formatDate(date: Date, formatString = 'MMM dd, yyyy'): string {
    return format(date, formatString);
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(date: Date, formatString = 'MMM dd, yyyy HH:mm'): string {
    return format(date, formatString);
  }

  /**
   * Get week boundaries
   */
  static getWeekBoundaries(date: Date = new Date()): { start: Date; end: Date } {
    return {
      start: startOfWeek(date),
      end: endOfWeek(date)
    };
  }

  /**
   * Get month boundaries
   */
  static getMonthBoundaries(date: Date = new Date()): { start: Date; end: Date } {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date)
    };
  }

  /**
   * Get date range for analytics
   */
  static getDateRange(period: 'week' | 'month' | 'quarter' | 'year', date: Date = new Date()): { start: Date; end: Date } {
    switch (period) {
      case 'week':
        return DateUtils.getWeekBoundaries(date);
      case 'month':
        return DateUtils.getMonthBoundaries(date);
      case 'quarter':
        // Get quarter boundaries
        const quarter = Math.floor((date.getMonth() + 3) / 3);
        const startMonth = (quarter - 1) * 3;
        const start = new Date(date.getFullYear(), startMonth, 1);
        const end = new Date(date.getFullYear(), startMonth + 3, 0);
        return { start, end };
      case 'year':
        return {
          start: new Date(date.getFullYear(), 0, 1),
          end: new Date(date.getFullYear(), 11, 31)
        };
      default:
        return DateUtils.getWeekBoundaries(date);
    }
  }

  /**
   * Calculate days between dates
   */
  static daysBetween(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get relative time string
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2629746) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31556952) return `${Math.floor(diffInSeconds / 2629746)} months ago`;
    
    return `${Math.floor(diffInSeconds / 31556952)} years ago`;
  }
}

// ========================================
// Validation Utilities
// ========================================

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate URL format
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number (basic)
   */
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .slice(0, 1000); // Limit length
  }

  /**
   * Validate transformation title
   */
  static isValidTransformationTitle(title: string): boolean {
    return title.trim().length >= 3 && title.trim().length <= 200;
  }

  /**
   * Validate progress percentage
   */
  static isValidProgress(progress: number): boolean {
    return progress >= 0 && progress <= 100 && Number.isFinite(progress);
  }

  /**
   * Validate mood/energy/confidence score
   */
  static isValidScore(score: number): boolean {
    return score >= 1 && score <= 10 && Number.isInteger(score);
  }
}

// ========================================
// Data Processing Utilities
// ========================================

export class DataUtils {
  /**
   * Calculate percentage
   */
  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * Calculate average
   */
  static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Calculate median
   */
  static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate trend
   */
  static calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = DataUtils.calculateAverage(firstHalf);
    const secondAvg = DataUtils.calculateAverage(secondHalf);
    
    const difference = Math.abs(secondAvg - firstAvg);
    const threshold = Math.max(firstAvg, secondAvg) * 0.1; // 10% threshold
    
    if (difference < threshold) return 'stable';
    return secondAvg > firstAvg ? 'increasing' : 'decreasing';
  }

  /**
   * Group array by key
   */
  static groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Remove duplicates from array
   */
  static uniqueBy<T>(array: T[], keyFn: (item: T) => string | number): T[] {
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Sort array by multiple criteria
   */
  static multiSort<T>(array: T[], sortCriteria: Array<{ key: keyof T; direction: 'asc' | 'desc' }>): T[] {
    return [...array].sort((a, b) => {
      for (const criterion of sortCriteria) {
        const aVal = a[criterion.key];
        const bVal = b[criterion.key];
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        if (comparison !== 0) {
          return criterion.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }
}

// ========================================
// Color and UI Utilities
// ========================================

export class ColorUtils {
  /**
   * Get progress color based on percentage
   */
  static getProgressColor(progress: number): string {
    if (progress < 25) return '#EF4444'; // Red
    if (progress < 50) return '#F59E0B'; // Amber
    if (progress < 75) return '#3B82F6'; // Blue
    return '#10B981'; // Green
  }

  /**
   * Get phase color
   */
  static getPhaseColor(phase: PhoenixPhase): string {
    switch (phase) {
      case PhoenixPhase.ASHES:
        return '#6B7280'; // Gray
      case PhoenixPhase.BURNING:
        return '#EF4444'; // Red
      case PhoenixPhase.RISING:
        return '#F59E0B'; // Amber
      case PhoenixPhase.SOARING:
        return '#10B981'; // Emerald
      default:
        return '#6B7280';
    }
  }

  /**
   * Get status color
   */
  static getStatusColor(status: TransformationStatus): string {
    switch (status) {
      case TransformationStatus.PENDING:
        return '#6B7280'; // Gray
      case TransformationStatus.IN_PROGRESS:
        return '#3B82F6'; // Blue
      case TransformationStatus.COMPLETED:
        return '#10B981'; // Green
      case TransformationStatus.FAILED:
        return '#EF4444'; // Red
      case TransformationStatus.CANCELLED:
        return '#F59E0B'; // Amber
      default:
        return '#6B7280';
    }
  }

  /**
   * Generate avatar color based on user ID
   */
  static generateAvatarColor(userId: string): string {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Get contrast color (black or white) for background
   */
  static getContrastColor(backgroundColor: string): string {
    const rgb = ColorUtils.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';
    
    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}

// ========================================
// String Utilities
// ========================================

export class StringUtils {
  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length - 3) + '...';
  }

  /**
   * Capitalize first letter
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert to title case
   */
  static toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Convert to slug (URL-friendly)
   */
  static toSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Extract initials from name
   */
  static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Parse transformation type from string
   */
  static parseTransformationType(str: string): TransformationType | null {
    const normalized = str.toLowerCase().replace(/[^a-z]/g, '_');
    
    const typeMap: Record<string, TransformationType> = {
      'mindset_shift': TransformationType.MINDSET_SHIFT,
      'mindset': TransformationType.MINDSET_SHIFT,
      'skill_development': TransformationType.SKILL_DEVELOPMENT,
      'skill': TransformationType.SKILL_DEVELOPMENT,
      'habit_formation': TransformationType.HABIT_FORMATION,
      'habit': TransformationType.HABIT_FORMATION,
      'goal_achievement': TransformationType.GOAL_ACHIEVEMENT,
      'goal': TransformationType.GOAL_ACHIEVEMENT,
      'relationship_building': TransformationType.RELATIONSHIP_BUILDING,
      'relationship': TransformationType.RELATIONSHIP_BUILDING,
      'career_advancement': TransformationType.CAREER_ADVANCEMENT,
      'career': TransformationType.CAREER_ADVANCEMENT,
      'health_optimization': TransformationType.HEALTH_OPTIMIZATION,
      'health': TransformationType.HEALTH_OPTIMIZATION,
      'financial_growth': TransformationType.FINANCIAL_GROWTH,
      'financial': TransformationType.FINANCIAL_GROWTH
    };

    return typeMap[normalized] || null;
  }
}

// ========================================
// Error Handling Utilities
// ========================================

export class ErrorUtils {
  /**
   * Create error response object
   */
  static createErrorResponse(error: Error, code?: string): {
    success: false;
    error: {
      code: string;
      message: string;
      details?: unknown;
    };
    timestamp: string;
  } {
    return {
      success: false,
      error: {
        code: code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error instanceof Error ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: Error): boolean {
    return error.name === 'ValidationError';
  }

  /**
   * Check if error is a transformation error
   */
  static isTransformationError(error: Error): boolean {
    return error.name === 'TransformationError';
  }

  /**
   * Extract user-friendly error message
   */
  static getUserFriendlyMessage(error: Error): string {
    if (ErrorUtils.isValidationError(error)) {
      return `Please check your input: ${error.message}`;
    }
    
    if (ErrorUtils.isTransformationError(error)) {
      return `Transformation error: ${error.message}`;
    }
    
    // Generic fallback
    return 'An unexpected error occurred. Please try again.';
  }
}

// ========================================
// Performance Utilities
// ========================================

export class PerformanceUtils {
  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T, 
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T, 
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Measure execution time
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T> | T,
    label?: string
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (label) {
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }

  /**
   * Create retry mechanism with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000
  ): Promise<T> {
    let attempt = 1;
    
    while (attempt <= maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
    
    throw new Error('Retry failed'); // This should never be reached
  }
}