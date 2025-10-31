/**
 * @fileoverview Jest Setup File for WisdomOS Core Tests
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

// Extend Jest matchers
import 'jest-extended';

// Mock console methods in tests to keep output clean
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    // Mock console.log, console.warn, etc. but keep console.error for debugging
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: originalConsole.error // Keep errors visible
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Set up timezone for consistent date testing
process.env.TZ = 'UTC';

// Mock Date.now for consistent testing
const mockDateNow = jest.fn();
Date.now = mockDateNow;

beforeEach(() => {
  // Reset Date.now to current time before each test
  mockDateNow.mockReturnValue(new Date('2025-01-01T00:00:00.000Z').getTime());
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Custom matchers for WisdomOS testing
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false
      };
    }
  },
  
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false
      };
    }
  },
  
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${min}-${max}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${min}-${max}`,
        pass: false
      };
    }
  },
  
  toBeValidProgress(received: number) {
    const pass = received >= 0 && received <= 100 && Number.isFinite(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid progress value`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid progress value (0-100)`,
        pass: false
      };
    }
  },
  
  toBeValidScore(received: number) {
    const pass = received >= 1 && received <= 10 && Number.isInteger(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid score`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid score (1-10 integer)`,
        pass: false
      };
    }
  },
  
  toHaveValidTimestamp(received: { createdAt?: Date; updatedAt?: Date }) {
    const hasCreatedAt = received.createdAt instanceof Date;
    const hasUpdatedAt = received.updatedAt instanceof Date;
    const pass = hasCreatedAt && hasUpdatedAt;
    
    if (pass) {
      return {
        message: () => `expected object not to have valid timestamps`,
        pass: true
      };
    } else {
      return {
        message: () => `expected object to have valid createdAt and updatedAt timestamps`,
        pass: false
      };
    }
  }
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
      toBeWithinRange(min: number, max: number): R;
      toBeValidProgress(): R;
      toBeValidScore(): R;
      toHaveValidTimestamp(): R;
    }
  }
}

// Helper functions for testing
export const createMockUser = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  displayName: 'Test User',
  timezone: 'UTC',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  ...overrides
});

export const createMockTransformation = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  type: 'mindset_shift' as const,
  status: 'in_progress' as const,
  title: 'Test Transformation',
  description: 'A test transformation',
  startDate: new Date(),
  targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  progress: 50,
  milestones: ['Milestone 1', 'Milestone 2'],
  tags: ['test', 'example'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockPhoenixCycle = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174002',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  currentPhase: 'ashes' as const,
  cycleNumber: 1,
  startDate: new Date(),
  transformations: [],
  phaseHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockProgressEntry = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174003',
  transformationId: '123e4567-e89b-12d3-a456-426614174001',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  timestamp: new Date(),
  progressPercentage: 50,
  metrics: [],
  attachments: [],
  ...overrides
});

export const createMockMetric = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174004',
  name: 'Test Metric',
  currentValue: 100,
  lastUpdated: new Date(),
  ...overrides
});

// Mock implementations for testing
export const createMockRepository = <T>() => ({
  create: jest.fn<Promise<T>, [Partial<T>]>(),
  findById: jest.fn<Promise<T | null>, [string]>(),
  findByUserId: jest.fn<Promise<T[]>, [string, number?, number?]>(),
  update: jest.fn<Promise<T>, [string, Partial<T>]>(),
  delete: jest.fn<Promise<boolean>, [string]>(),
  findAll: jest.fn<Promise<T[]>, []>()
});

export const createMockService = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn()
});

// Error testing helpers
export const expectToThrowError = async (
  fn: () => Promise<any>,
  errorClass: new (...args: any[]) => Error,
  message?: string
) => {
  await expect(fn()).rejects.toThrow(errorClass);
  if (message) {
    await expect(fn()).rejects.toThrow(message);
  }
};

export const expectToThrowValidationError = async (
  fn: () => Promise<any>,
  field?: string
) => {
  await expect(fn()).rejects.toThrow('ValidationError');
  if (field) {
    await expect(fn()).rejects.toHaveProperty('field', field);
  }
};

// Date helpers for testing
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Async testing helpers
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 1000,
  interval = 50
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) return;
    await sleep(interval);
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};