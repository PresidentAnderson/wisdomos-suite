/**
 * @fileoverview Transformation Engine - Core transformation management logic
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { 
  Transformation, 
  TransformationStatus, 
  TransformationType,
  TransformationError,
  ValidationError
} from './types';
import { ITransformationService, ITransformationRepository, IProgressRepository } from './interfaces';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter, isBefore, differenceInDays } from 'date-fns';

/**
 * Transformation Service - Manages individual user transformations
 */
export class TransformationService implements ITransformationService {
  constructor(
    private transformationRepository: ITransformationRepository,
    private progressRepository: IProgressRepository
  ) {}

  /**
   * Create a new transformation for a user
   */
  async createTransformation(
    userId: string, 
    data: {
      type: TransformationType;
      title: string;
      description?: string;
      targetCompletionDate: Date;
      milestones?: string[];
      tags?: string[];
    }
  ): Promise<Transformation> {
    // Validate input
    this.validateTransformationData(data);

    // Check if user has too many active transformations
    const activeTransformations = await this.getActiveTransformations(userId);
    if (activeTransformations.length >= 5) {
      throw new TransformationError(
        'Maximum of 5 active transformations allowed per user',
        'MAX_TRANSFORMATIONS_EXCEEDED',
        userId
      );
    }

    // Check for duplicate transformation titles
    const existingTransformation = activeTransformations.find(
      t => t.title.toLowerCase() === data.title.toLowerCase()
    );
    if (existingTransformation) {
      throw new TransformationError(
        'A transformation with this title already exists',
        'DUPLICATE_TRANSFORMATION_TITLE',
        userId,
        existingTransformation.id
      );
    }

    // Create the transformation
    const transformation = await this.transformationRepository.create({
      userId,
      type: data.type,
      status: TransformationStatus.PENDING,
      title: data.title,
      description: data.description,
      startDate: new Date(),
      targetCompletionDate: data.targetCompletionDate,
      progress: 0,
      milestones: data.milestones || [],
      tags: data.tags || []
    });

    // Start the transformation immediately
    return await this.startTransformation(transformation.id);
  }

  /**
   * Update progress of a transformation
   */
  async updateProgress(
    transformationId: string, 
    progress: number, 
    notes?: string
  ): Promise<Transformation> {
    // Validate progress value
    if (progress < 0 || progress > 100) {
      throw new ValidationError('Progress must be between 0 and 100', 'progress');
    }

    const transformation = await this.transformationRepository.findById(transformationId);
    if (!transformation) {
      throw new TransformationError(
        'Transformation not found',
        'TRANSFORMATION_NOT_FOUND',
        undefined,
        transformationId
      );
    }

    // Cannot update progress on completed/cancelled transformations
    if ([TransformationStatus.COMPLETED, TransformationStatus.CANCELLED].includes(transformation.status)) {
      throw new TransformationError(
        'Cannot update progress on completed or cancelled transformation',
        'INVALID_STATUS_UPDATE',
        transformation.userId,
        transformationId
      );
    }

    // Update transformation status based on progress
    let newStatus = transformation.status;
    if (progress > 0 && transformation.status === TransformationStatus.PENDING) {
      newStatus = TransformationStatus.IN_PROGRESS;
    }

    // Record progress entry
    await this.progressRepository.create({
      transformationId,
      userId: transformation.userId,
      timestamp: new Date(),
      progressPercentage: progress,
      notes,
      metrics: [],
      attachments: []
    });

    // Update transformation
    const updatedTransformation = await this.transformationRepository.update(transformationId, {
      progress,
      status: newStatus,
      updatedAt: new Date()
    });

    // Auto-complete if progress reaches 100%
    if (progress === 100 && newStatus !== TransformationStatus.COMPLETED) {
      return await this.completeTransformation(transformationId, notes);
    }

    return updatedTransformation;
  }

  /**
   * Complete a transformation
   */
  async completeTransformation(transformationId: string, notes?: string): Promise<Transformation> {
    const transformation = await this.transformationRepository.findById(transformationId);
    if (!transformation) {
      throw new TransformationError(
        'Transformation not found',
        'TRANSFORMATION_NOT_FOUND',
        undefined,
        transformationId
      );
    }

    if (transformation.status === TransformationStatus.COMPLETED) {
      return transformation; // Already completed
    }

    // Ensure minimum progress before completion
    if (transformation.progress < 80) {
      throw new TransformationError(
        'Transformation must be at least 80% complete before marking as completed',
        'INSUFFICIENT_PROGRESS',
        transformation.userId,
        transformationId
      );
    }

    // Record final progress entry
    if (transformation.progress < 100) {
      await this.progressRepository.create({
        transformationId,
        userId: transformation.userId,
        timestamp: new Date(),
        progressPercentage: 100,
        notes: notes || 'Transformation completed',
        metrics: [],
        attachments: []
      });
    }

    return await this.transformationRepository.update(transformationId, {
      status: TransformationStatus.COMPLETED,
      progress: 100,
      actualCompletionDate: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * Cancel a transformation
   */
  async cancelTransformation(transformationId: string, reason?: string): Promise<Transformation> {
    const transformation = await this.transformationRepository.findById(transformationId);
    if (!transformation) {
      throw new TransformationError(
        'Transformation not found',
        'TRANSFORMATION_NOT_FOUND',
        undefined,
        transformationId
      );
    }

    if (transformation.status === TransformationStatus.COMPLETED) {
      throw new TransformationError(
        'Cannot cancel a completed transformation',
        'CANNOT_CANCEL_COMPLETED',
        transformation.userId,
        transformationId
      );
    }

    // Record cancellation progress entry
    await this.progressRepository.create({
      transformationId,
      userId: transformation.userId,
      timestamp: new Date(),
      progressPercentage: transformation.progress,
      notes: reason || 'Transformation cancelled',
      metrics: [],
      attachments: []
    });

    return await this.transformationRepository.update(transformationId, {
      status: TransformationStatus.CANCELLED,
      updatedAt: new Date()
    });
  }

  /**
   * Get active transformations for a user
   */
  async getActiveTransformations(userId: string): Promise<Transformation[]> {
    return await this.transformationRepository.findByUserId(userId).then(transformations => 
      transformations.filter(t => 
        [TransformationStatus.PENDING, TransformationStatus.IN_PROGRESS].includes(t.status)
      )
    );
  }

  /**
   * Get transformation history for a user
   */
  async getTransformationHistory(
    userId: string, 
    limit = 50, 
    offset = 0
  ): Promise<Transformation[]> {
    return await this.transformationRepository.findByUserId(userId, limit, offset);
  }

  /**
   * Start a transformation (move from PENDING to IN_PROGRESS)
   */
  private async startTransformation(transformationId: string): Promise<Transformation> {
    return await this.transformationRepository.update(transformationId, {
      status: TransformationStatus.IN_PROGRESS,
      updatedAt: new Date()
    });
  }

  /**
   * Validate transformation data
   */
  private validateTransformationData(data: {
    type: TransformationType;
    title: string;
    description?: string;
    targetCompletionDate: Date;
    milestones?: string[];
    tags?: string[];
  }): void {
    // Title validation
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Title is required', 'title');
    }
    if (data.title.length > 200) {
      throw new ValidationError('Title must be less than 200 characters', 'title');
    }

    // Description validation
    if (data.description && data.description.length > 2000) {
      throw new ValidationError('Description must be less than 2000 characters', 'description');
    }

    // Date validation
    if (!data.targetCompletionDate) {
      throw new ValidationError('Target completion date is required', 'targetCompletionDate');
    }
    if (isBefore(data.targetCompletionDate, new Date())) {
      throw new ValidationError('Target completion date must be in the future', 'targetCompletionDate');
    }

    // Reasonable timeframe (not more than 1 year)
    const oneYearFromNow = addDays(new Date(), 365);
    if (isAfter(data.targetCompletionDate, oneYearFromNow)) {
      throw new ValidationError('Target completion date cannot be more than 1 year from now', 'targetCompletionDate');
    }

    // Milestones validation
    if (data.milestones && data.milestones.length > 20) {
      throw new ValidationError('Maximum of 20 milestones allowed', 'milestones');
    }

    // Tags validation
    if (data.tags && data.tags.length > 10) {
      throw new ValidationError('Maximum of 10 tags allowed', 'tags');
    }
  }
}

/**
 * Transformation Utility Functions
 */
export class TransformationUtils {
  /**
   * Calculate estimated completion date based on current progress
   */
  static calculateEstimatedCompletion(transformation: Transformation): Date | null {
    if (transformation.progress === 0) return null;
    if (transformation.status === TransformationStatus.COMPLETED) {
      return transformation.actualCompletionDate || null;
    }

    const daysElapsed = differenceInDays(new Date(), transformation.startDate);
    if (daysElapsed === 0) return null;

    const progressRate = transformation.progress / daysElapsed;
    const remainingProgress = 100 - transformation.progress;
    const estimatedDaysToComplete = remainingProgress / progressRate;

    return addDays(new Date(), estimatedDaysToComplete);
  }

  /**
   * Calculate if transformation is on track
   */
  static isOnTrack(transformation: Transformation): boolean {
    const totalDays = differenceInDays(transformation.targetCompletionDate, transformation.startDate);
    const daysElapsed = differenceInDays(new Date(), transformation.startDate);
    
    if (totalDays === 0) return true;
    
    const expectedProgress = (daysElapsed / totalDays) * 100;
    return transformation.progress >= expectedProgress * 0.8; // Allow 20% buffer
  }

  /**
   * Get transformation status color
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
   * Get transformation type description
   */
  static getTypeDescription(type: TransformationType): string {
    switch (type) {
      case TransformationType.MINDSET_SHIFT:
        return 'Transform limiting beliefs and develop empowering thought patterns';
      case TransformationType.SKILL_DEVELOPMENT:
        return 'Acquire new abilities and enhance existing competencies';
      case TransformationType.HABIT_FORMATION:
        return 'Build positive routines and break negative patterns';
      case TransformationType.GOAL_ACHIEVEMENT:
        return 'Set and accomplish meaningful objectives';
      case TransformationType.RELATIONSHIP_BUILDING:
        return 'Strengthen connections and build new relationships';
      case TransformationType.CAREER_ADVANCEMENT:
        return 'Progress professionally and achieve career goals';
      case TransformationType.HEALTH_OPTIMIZATION:
        return 'Improve physical and mental well-being';
      case TransformationType.FINANCIAL_GROWTH:
        return 'Build wealth and achieve financial independence';
      default:
        return 'Personal transformation and growth';
    }
  }

  /**
   * Get suggested milestones for transformation type
   */
  static getSuggestedMilestones(type: TransformationType): string[] {
    switch (type) {
      case TransformationType.MINDSET_SHIFT:
        return [
          'Identify limiting beliefs',
          'Challenge negative thoughts',
          'Practice positive affirmations',
          'Integrate new mindset into daily life'
        ];
      case TransformationType.SKILL_DEVELOPMENT:
        return [
          'Define learning objectives',
          'Complete foundational training',
          'Practice with real projects',
          'Demonstrate proficiency'
        ];
      case TransformationType.HABIT_FORMATION:
        return [
          'Define specific habit behavior',
          'Establish daily routine',
          'Track consistency for 21 days',
          'Maintain for 66 days'
        ];
      case TransformationType.GOAL_ACHIEVEMENT:
        return [
          'Set SMART goals',
          'Create action plan',
          'Achieve 50% milestone',
          'Complete final objective'
        ];
      case TransformationType.RELATIONSHIP_BUILDING:
        return [
          'Identify relationship goals',
          'Improve communication skills',
          'Strengthen existing connections',
          'Build new relationships'
        ];
      case TransformationType.CAREER_ADVANCEMENT:
        return [
          'Assess current position',
          'Develop required skills',
          'Network with industry contacts',
          'Achieve promotion/new role'
        ];
      case TransformationType.HEALTH_OPTIMIZATION:
        return [
          'Establish baseline metrics',
          'Create exercise routine',
          'Improve nutrition',
          'Achieve health targets'
        ];
      case TransformationType.FINANCIAL_GROWTH:
        return [
          'Assess current finances',
          'Create budget and savings plan',
          'Increase income streams',
          'Reach financial targets'
        ];
      default:
        return [
          'Define transformation goals',
          'Create action plan',
          'Implement changes',
          'Achieve desired outcome'
        ];
    }
  }

  /**
   * Calculate transformation difficulty score
   */
  static calculateDifficultyScore(transformation: Transformation): number {
    let score = 0;

    // Base difficulty by type
    const typeDifficulty: Record<TransformationType, number> = {
      [TransformationType.HABIT_FORMATION]: 8,
      [TransformationType.MINDSET_SHIFT]: 9,
      [TransformationType.RELATIONSHIP_BUILDING]: 7,
      [TransformationType.CAREER_ADVANCEMENT]: 6,
      [TransformationType.SKILL_DEVELOPMENT]: 5,
      [TransformationType.HEALTH_OPTIMIZATION]: 6,
      [TransformationType.FINANCIAL_GROWTH]: 7,
      [TransformationType.GOAL_ACHIEVEMENT]: 4
    };

    score += typeDifficulty[transformation.type] || 5;

    // Duration factor
    const durationDays = differenceInDays(transformation.targetCompletionDate, transformation.startDate);
    if (durationDays < 30) score += 2; // Short deadlines are harder
    if (durationDays > 365) score += 1; // Very long goals are harder to maintain

    // Milestone complexity
    score += Math.min(transformation.milestones.length * 0.5, 3);

    return Math.min(Math.max(score, 1), 10); // Clamp between 1-10
  }

  /**
   * Generate transformation insights based on progress
   */
  static generateInsights(transformation: Transformation): string[] {
    const insights: string[] = [];
    const daysElapsed = differenceInDays(new Date(), transformation.startDate);
    const isOnTrack = TransformationUtils.isOnTrack(transformation);

    if (!isOnTrack) {
      insights.push('Consider breaking down your goals into smaller, more manageable tasks');
      insights.push('Review and adjust your daily routine to allocate more time for this transformation');
    }

    if (transformation.progress > 0 && transformation.progress < 25) {
      insights.push('Great start! Consistency is key to building momentum');
    } else if (transformation.progress >= 25 && transformation.progress < 50) {
      insights.push('You\'re making solid progress. Keep up the momentum!');
    } else if (transformation.progress >= 50 && transformation.progress < 75) {
      insights.push('Excellent progress! You\'re over halfway to your goal');
    } else if (transformation.progress >= 75 && transformation.progress < 100) {
      insights.push('Almost there! Push through to complete your transformation');
    }

    if (daysElapsed > 7 && transformation.progress === 0) {
      insights.push('Consider if this transformation is still relevant to your current goals');
      insights.push('Break down the first milestone into even smaller actionable steps');
    }

    return insights;
  }
}