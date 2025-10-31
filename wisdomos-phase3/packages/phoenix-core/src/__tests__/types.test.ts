/**
 * @fileoverview Tests for WisdomOS Core Types
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import {
  PhoenixUserSchema,
  TransformationSchema,
  PhoenixCycleSchema,
  MetricSchema,
  ProgressEntrySchema,
  TransformationType,
  TransformationStatus,
  PhoenixPhase,
  PhoenixError,
  ValidationError,
  TransformationError
} from '../types';

describe('PhoenixUser Schema Validation', () => {
  test('should validate a complete PhoenixUser', () => {
    const validUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      displayName: 'Test User',
      phoneNumber: '+1234567890',
      avatarUrl: 'https://example.com/avatar.jpg',
      timezone: 'America/New_York',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
      isActive: true,
      metadata: { plan: 'premium' }
    };

    expect(() => PhoenixUserSchema.parse(validUser)).not.toThrow();
  });

  test('should validate minimal PhoenixUser', () => {
    const minimalUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      displayName: 'Test User',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    expect(() => PhoenixUserSchema.parse(minimalUser)).not.toThrow();
  });

  test('should reject invalid email', () => {
    const invalidUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'invalid-email',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => PhoenixUserSchema.parse(invalidUser)).toThrow();
  });

  test('should reject invalid UUID', () => {
    const invalidUser = {
      id: 'invalid-uuid',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => PhoenixUserSchema.parse(invalidUser)).toThrow();
  });

  test('should reject empty display name', () => {
    const invalidUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      displayName: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => PhoenixUserSchema.parse(invalidUser)).toThrow();
  });
});

describe('Transformation Schema Validation', () => {
  test('should validate a complete Transformation', () => {
    const validTransformation = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      type: TransformationType.MINDSET_SHIFT,
      status: TransformationStatus.IN_PROGRESS,
      title: 'Develop Growth Mindset',
      description: 'Transform from fixed to growth mindset',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      actualCompletionDate: undefined,
      progress: 50,
      milestones: ['Identify limiting beliefs', 'Practice positive self-talk'],
      tags: ['mindset', 'growth'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => TransformationSchema.parse(validTransformation)).not.toThrow();
  });

  test('should validate minimal Transformation', () => {
    const minimalTransformation = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      type: TransformationType.GOAL_ACHIEVEMENT,
      status: TransformationStatus.PENDING,
      title: 'Complete Marathon',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      progress: 0,
      milestones: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => TransformationSchema.parse(minimalTransformation)).not.toThrow();
  });

  test('should reject invalid progress values', () => {
    const invalidTransformation = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      type: TransformationType.HABIT_FORMATION,
      status: TransformationStatus.IN_PROGRESS,
      title: 'Daily Exercise',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 150, // Invalid: > 100
      milestones: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => TransformationSchema.parse(invalidTransformation)).toThrow();
  });

  test('should reject negative progress', () => {
    const invalidTransformation = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      type: TransformationType.SKILL_DEVELOPMENT,
      status: TransformationStatus.IN_PROGRESS,
      title: 'Learn TypeScript',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      progress: -10, // Invalid: < 0
      milestones: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => TransformationSchema.parse(invalidTransformation)).toThrow();
  });

  test('should reject empty title', () => {
    const invalidTransformation = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      type: TransformationType.HEALTH_OPTIMIZATION,
      status: TransformationStatus.PENDING,
      title: '',
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 0,
      milestones: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => TransformationSchema.parse(invalidTransformation)).toThrow();
  });
});

describe('PhoenixCycle Schema Validation', () => {
  test('should validate a complete PhoenixCycle', () => {
    const validCycle = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      currentPhase: PhoenixPhase.BURNING,
      cycleNumber: 1,
      startDate: new Date(),
      expectedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      actualCompletionDate: undefined,
      transformations: ['123e4567-e89b-12d3-a456-426614174002'],
      phaseHistory: [
        {
          phase: PhoenixPhase.ASHES,
          enteredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          exitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          achievements: ['Completed self-assessment'],
          challenges: ['Overcoming resistance to change'],
          insights: ['Need to focus on one area at a time']
        },
        {
          phase: PhoenixPhase.BURNING,
          enteredAt: new Date(),
          achievements: [],
          challenges: [],
          insights: []
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => PhoenixCycleSchema.parse(validCycle)).not.toThrow();
  });

  test('should validate minimal PhoenixCycle', () => {
    const minimalCycle = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      currentPhase: PhoenixPhase.ASHES,
      cycleNumber: 1,
      startDate: new Date(),
      transformations: [],
      phaseHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => PhoenixCycleSchema.parse(minimalCycle)).not.toThrow();
  });

  test('should reject negative cycle number', () => {
    const invalidCycle = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      currentPhase: PhoenixPhase.ASHES,
      cycleNumber: -1, // Invalid: must be positive
      startDate: new Date(),
      transformations: [],
      phaseHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => PhoenixCycleSchema.parse(invalidCycle)).toThrow();
  });

  test('should reject zero cycle number', () => {
    const invalidCycle = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      currentPhase: PhoenixPhase.ASHES,
      cycleNumber: 0, // Invalid: must be positive
      startDate: new Date(),
      transformations: [],
      phaseHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(() => PhoenixCycleSchema.parse(invalidCycle)).toThrow();
  });
});

describe('Metric Schema Validation', () => {
  test('should validate a complete Metric', () => {
    const validMetric = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Weight',
      description: 'Body weight in pounds',
      unit: 'lbs',
      targetValue: 180,
      currentValue: 190,
      previousValue: 195,
      lastUpdated: new Date(),
      trend: 'decreasing' as const
    };

    expect(() => MetricSchema.parse(validMetric)).not.toThrow();
  });

  test('should validate minimal Metric', () => {
    const minimalMetric = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Steps',
      currentValue: 8500,
      lastUpdated: new Date()
    };

    expect(() => MetricSchema.parse(minimalMetric)).not.toThrow();
  });

  test('should reject empty metric name', () => {
    const invalidMetric = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: '',
      currentValue: 100,
      lastUpdated: new Date()
    };

    expect(() => MetricSchema.parse(invalidMetric)).toThrow();
  });
});

describe('ProgressEntry Schema Validation', () => {
  test('should validate a complete ProgressEntry', () => {
    const validEntry = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      transformationId: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      timestamp: new Date(),
      progressPercentage: 75,
      metrics: [
        {
          id: '123e4567-e89b-12d3-a456-426614174003',
          name: 'Confidence',
          currentValue: 8,
          lastUpdated: new Date()
        }
      ],
      notes: 'Made great progress today!',
      mood: 8,
      energy: 7,
      confidence: 9,
      attachments: ['photo1.jpg', 'report.pdf']
    };

    expect(() => ProgressEntrySchema.parse(validEntry)).not.toThrow();
  });

  test('should validate minimal ProgressEntry', () => {
    const minimalEntry = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      transformationId: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      timestamp: new Date(),
      progressPercentage: 50,
      metrics: [],
      attachments: []
    };

    expect(() => ProgressEntrySchema.parse(minimalEntry)).not.toThrow();
  });

  test('should reject invalid progress percentage', () => {
    const invalidEntry = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      transformationId: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      timestamp: new Date(),
      progressPercentage: 150, // Invalid: > 100
      metrics: [],
      attachments: []
    };

    expect(() => ProgressEntrySchema.parse(invalidEntry)).toThrow();
  });

  test('should reject invalid mood score', () => {
    const invalidEntry = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      transformationId: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      timestamp: new Date(),
      progressPercentage: 50,
      mood: 11, // Invalid: > 10
      metrics: [],
      attachments: []
    };

    expect(() => ProgressEntrySchema.parse(invalidEntry)).toThrow();
  });

  test('should reject invalid energy score', () => {
    const invalidEntry = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      transformationId: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      timestamp: new Date(),
      progressPercentage: 50,
      energy: 0, // Invalid: < 1
      metrics: [],
      attachments: []
    };

    expect(() => ProgressEntrySchema.parse(invalidEntry)).toThrow();
  });

  test('should reject invalid confidence score', () => {
    const invalidEntry = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      transformationId: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      timestamp: new Date(),
      progressPercentage: 50,
      confidence: 15, // Invalid: > 10
      metrics: [],
      attachments: []
    };

    expect(() => ProgressEntrySchema.parse(invalidEntry)).toThrow();
  });
});

describe('Error Types', () => {
  test('should create PhoenixError with all parameters', () => {
    const error = new PhoenixError(
      'Test error message',
      'TEST_ERROR',
      'user-123',
      'transformation-456'
    );

    expect(error.message).toBe('Test error message');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.userId).toBe('user-123');
    expect(error.transformationId).toBe('transformation-456');
    expect(error.name).toBe('PhoenixError');
  });

  test('should create ValidationError', () => {
    const error = new ValidationError(
      'Invalid field value',
      'email',
      'user-123'
    );

    expect(error.message).toBe('Invalid field value');
    expect(error.field).toBe('email');
    expect(error.userId).toBe('user-123');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });

  test('should create TransformationError', () => {
    const error = new TransformationError(
      'Cannot complete transformation',
      'transformation-456',
      'user-123'
    );

    expect(error.message).toBe('Cannot complete transformation');
    expect(error.transformationId).toBe('transformation-456');
    expect(error.userId).toBe('user-123');
    expect(error.code).toBe('TRANSFORMATION_ERROR');
    expect(error.name).toBe('TransformationError');
  });
});

describe('Enums', () => {
  test('TransformationType enum should contain all expected values', () => {
    const expectedTypes = [
      'mindset_shift',
      'skill_development',
      'habit_formation',
      'goal_achievement',
      'relationship_building',
      'career_advancement',
      'health_optimization',
      'financial_growth'
    ];

    expectedTypes.forEach(type => {
      expect(Object.values(TransformationType)).toContain(type);
    });
  });

  test('TransformationStatus enum should contain all expected values', () => {
    const expectedStatuses = [
      'pending',
      'in_progress',
      'completed',
      'failed',
      'cancelled'
    ];

    expectedStatuses.forEach(status => {
      expect(Object.values(TransformationStatus)).toContain(status);
    });
  });

  test('PhoenixPhase enum should contain all expected values', () => {
    const expectedPhases = [
      'ashes',
      'burning',
      'rising',
      'soaring'
    ];

    expectedPhases.forEach(phase => {
      expect(Object.values(PhoenixPhase)).toContain(phase);
    });
  });
});

describe('Type Exports', () => {
  test('should export all schemas in schemas object', () => {
    const { schemas } = require('../types');
    
    expect(schemas.PhoenixUser).toBe(PhoenixUserSchema);
    expect(schemas.Transformation).toBe(TransformationSchema);
    expect(schemas.PhoenixCycle).toBe(PhoenixCycleSchema);
    expect(schemas.Metric).toBe(MetricSchema);
    expect(schemas.ProgressEntry).toBe(ProgressEntrySchema);
  });
});