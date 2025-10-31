/**
 * @fileoverview Phoenix Lifecycle Management - Core transformation logic
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { 
  PhoenixPhase, 
  PhoenixCycle, 
  Transformation, 
  TransformationStatus,
  TransformationType,
  PhoenixError 
} from './types';
import { IPhoenixLifecycleService, ITransformationRepository, IPhoenixCycleRepository } from './interfaces';

/**
 * Phoenix Lifecycle Service - Manages the Phoenix transformation cycles
 * 
 * The Phoenix system operates on four phases:
 * 1. ASHES - Recognition and preparation phase
 * 2. BURNING - Active transformation and learning phase  
 * 3. RISING - Integration and emergence phase
 * 4. SOARING - Mastery and transcendence phase
 */
export class PhoenixLifecycleService implements IPhoenixLifecycleService {
  constructor(
    private cycleRepository: IPhoenixCycleRepository,
    private transformationRepository: ITransformationRepository
  ) {}

  /**
   * Initialize a new Phoenix cycle for a user
   */
  async initializePhoenixCycle(userId: string): Promise<PhoenixCycle> {
    // Check if user already has an active cycle
    const existingCycle = await this.getCurrentCycle(userId);
    if (existingCycle && !existingCycle.actualCompletionDate) {
      throw new PhoenixError(
        'User already has an active Phoenix cycle',
        'ACTIVE_CYCLE_EXISTS',
        userId
      );
    }

    // Determine cycle number
    const allCycles = await this.cycleRepository.findAllByUserId(userId);
    const cycleNumber = allCycles.length + 1;

    // Create new cycle starting in ASHES phase
    const newCycle = await this.cycleRepository.create({
      userId,
      currentPhase: PhoenixPhase.ASHES,
      cycleNumber,
      startDate: new Date(),
      transformations: [],
      phaseHistory: [{
        phase: PhoenixPhase.ASHES,
        enteredAt: new Date(),
        achievements: [],
        challenges: [],
        insights: []
      }]
    });

    return newCycle;
  }

  /**
   * Get the current active Phoenix cycle for a user
   */
  async getCurrentCycle(userId: string): Promise<PhoenixCycle | null> {
    return await this.cycleRepository.findCurrentByUserId(userId);
  }

  /**
   * Advance to the next Phoenix phase
   */
  async advancePhase(
    userId: string, 
    achievements: string[] = [], 
    insights: string[] = []
  ): Promise<PhoenixCycle> {
    const currentCycle = await this.getCurrentCycle(userId);
    if (!currentCycle) {
      throw new PhoenixError(
        'No active Phoenix cycle found',
        'NO_ACTIVE_CYCLE',
        userId
      );
    }

    // Check if user can advance to next phase
    const canAdvance = await this.canAdvancePhase(userId);
    if (!canAdvance) {
      throw new PhoenixError(
        'Requirements not met to advance to next phase',
        'PHASE_REQUIREMENTS_NOT_MET',
        userId
      );
    }

    const nextPhase = this.getNextPhase(currentCycle.currentPhase);
    
    return await this.cycleRepository.advancePhase(
      currentCycle.id,
      nextPhase,
      achievements,
      insights
    );
  }

  /**
   * Check if a user can advance to the next phase
   */
  async canAdvancePhase(userId: string): Promise<boolean> {
    const currentCycle = await this.getCurrentCycle(userId);
    if (!currentCycle) return false;

    const requirements = await this.getPhaseRequirements(currentCycle.currentPhase);
    const progress = await this.calculatePhaseProgress(userId);

    // User needs at least 80% progress to advance phases
    return progress >= 0.8;
  }

  /**
   * Get requirements for the current phase
   */
  async getPhaseRequirements(phase: PhoenixPhase): Promise<string[]> {
    switch (phase) {
      case PhoenixPhase.ASHES:
        return [
          'Complete self-assessment',
          'Identify transformation areas',
          'Set initial goals',
          'Create action plan'
        ];
      
      case PhoenixPhase.BURNING:
        return [
          'Start at least 2 active transformations',
          'Record progress for 7 consecutive days',
          'Complete 50% of current transformations',
          'Overcome at least 1 major challenge'
        ];
      
      case PhoenixPhase.RISING:
        return [
          'Complete at least 80% of active transformations',
          'Demonstrate consistent progress for 14 days',
          'Integrate new habits into daily routine',
          'Share insights or mentor others'
        ];
      
      case PhoenixPhase.SOARING:
        return [
          'Complete full transformation cycle',
          'Maintain new habits for 30+ days',
          'Help others in their transformations',
          'Plan next transformation cycle'
        ];
      
      default:
        return [];
    }
  }

  /**
   * Calculate progress within the current phase
   */
  async calculatePhaseProgress(userId: string): Promise<number> {
    const currentCycle = await this.getCurrentCycle(userId);
    if (!currentCycle) return 0;

    const activeTransformations = await this.transformationRepository.findActive(userId);
    const requirements = await this.getPhaseRequirements(currentCycle.currentPhase);

    let completedRequirements = 0;
    const totalRequirements = requirements.length;

    // Custom logic per phase to check requirement completion
    switch (currentCycle.currentPhase) {
      case PhoenixPhase.ASHES:
        completedRequirements = await this.checkAshesRequirements(userId, activeTransformations);
        break;
      
      case PhoenixPhase.BURNING:
        completedRequirements = await this.checkBurningRequirements(userId, activeTransformations);
        break;
      
      case PhoenixPhase.RISING:
        completedRequirements = await this.checkRisingRequirements(userId, activeTransformations);
        break;
      
      case PhoenixPhase.SOARING:
        completedRequirements = await this.checkSoaringRequirements(userId, activeTransformations);
        break;
    }

    return Math.min(completedRequirements / totalRequirements, 1);
  }

  /**
   * Get the next phase in the Phoenix cycle
   */
  private getNextPhase(currentPhase: PhoenixPhase): PhoenixPhase {
    switch (currentPhase) {
      case PhoenixPhase.ASHES:
        return PhoenixPhase.BURNING;
      case PhoenixPhase.BURNING:
        return PhoenixPhase.RISING;
      case PhoenixPhase.RISING:
        return PhoenixPhase.SOARING;
      case PhoenixPhase.SOARING:
        return PhoenixPhase.ASHES; // Start new cycle
      default:
        throw new PhoenixError(
          `Invalid Phoenix phase: ${currentPhase}`,
          'INVALID_PHASE'
        );
    }
  }

  /**
   * Check completion of ASHES phase requirements
   */
  private async checkAshesRequirements(userId: string, transformations: Transformation[]): Promise<number> {
    let completed = 0;
    
    // Has transformations (action plan created)
    if (transformations.length > 0) completed++;
    
    // Has diverse transformation types (identified multiple areas)
    const transformationTypes = new Set(transformations.map(t => t.type));
    if (transformationTypes.size >= 2) completed++;
    
    // Has future-focused goals (target dates set)
    if (transformations.some(t => t.targetCompletionDate > new Date())) completed++;
    
    // Has detailed planning (descriptions and milestones)
    if (transformations.some(t => t.description && t.milestones.length > 0)) completed++;
    
    return completed;
  }

  /**
   * Check completion of BURNING phase requirements
   */
  private async checkBurningRequirements(userId: string, transformations: Transformation[]): Promise<number> {
    let completed = 0;
    
    // Has at least 2 active transformations
    if (transformations.filter(t => t.status === TransformationStatus.IN_PROGRESS).length >= 2) {
      completed++;
    }
    
    // TODO: Check for 7 consecutive days of progress (would need progress tracking)
    // For now, assume met if transformations exist
    if (transformations.length > 0) completed++;
    
    // Has completed at least 50% of transformations on average
    const averageProgress = transformations.reduce((sum, t) => sum + t.progress, 0) / transformations.length;
    if (averageProgress >= 50) completed++;
    
    // Has overcome challenges (transformations that were stuck but progressed)
    // TODO: Implement challenge tracking
    completed++; // Placeholder
    
    return completed;
  }

  /**
   * Check completion of RISING phase requirements
   */
  private async checkRisingRequirements(userId: string, transformations: Transformation[]): Promise<number> {
    let completed = 0;
    
    // At least 80% of transformations completed or highly progressed
    const highProgressTransformations = transformations.filter(t => t.progress >= 80);
    if (highProgressTransformations.length / transformations.length >= 0.8) completed++;
    
    // TODO: Check for 14 days consistent progress
    // Placeholder for now
    completed++;
    
    // Has integrated habits (completed transformations of HABIT_FORMATION type)
    if (transformations.some(t => t.type === TransformationType.HABIT_FORMATION && t.status === TransformationStatus.COMPLETED)) {
      completed++;
    }
    
    // TODO: Check for mentoring/sharing activities
    // Placeholder for now
    completed++;
    
    return completed;
  }

  /**
   * Check completion of SOARING phase requirements
   */
  private async checkSoaringRequirements(userId: string, transformations: Transformation[]): Promise<number> {
    let completed = 0;
    
    // All transformations completed
    const completedCount = transformations.filter(t => t.status === TransformationStatus.COMPLETED).length;
    if (completedCount === transformations.length && transformations.length > 0) completed++;
    
    // TODO: Check for 30+ days habit maintenance
    // Placeholder for now
    completed++;
    
    // TODO: Check for helping others
    // Placeholder for now  
    completed++;
    
    // Has planned next cycle (new transformations created)
    // TODO: Check for future transformations
    completed++;
    
    return completed;
  }
}

/**
 * Phoenix Phase Utility Functions
 */
export class PhoenixPhaseUtils {
  /**
   * Get phase description
   */
  static getPhaseDescription(phase: PhoenixPhase): string {
    switch (phase) {
      case PhoenixPhase.ASHES:
        return 'The recognition phase - acknowledging what needs to change and preparing for transformation';
      case PhoenixPhase.BURNING:
        return 'The active transformation phase - breaking down old patterns and building new ones';
      case PhoenixPhase.RISING:
        return 'The emergence phase - integrating new behaviors and rising from the ashes';
      case PhoenixPhase.SOARING:
        return 'The mastery phase - transcending previous limitations and inspiring others';
      default:
        return 'Unknown phase';
    }
  }

  /**
   * Get phase color theme
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
   * Get phase icon
   */
  static getPhaseIcon(phase: PhoenixPhase): string {
    switch (phase) {
      case PhoenixPhase.ASHES:
        return '🔥';
      case PhoenixPhase.BURNING:
        return '💫';
      case PhoenixPhase.RISING:
        return '🌅';
      case PhoenixPhase.SOARING:
        return '🦅';
      default:
        return '❓';
    }
  }

  /**
   * Get recommended transformation types for phase
   */
  static getRecommendedTransformationTypes(phase: PhoenixPhase): TransformationType[] {
    switch (phase) {
      case PhoenixPhase.ASHES:
        return [
          TransformationType.MINDSET_SHIFT,
          TransformationType.GOAL_ACHIEVEMENT
        ];
      case PhoenixPhase.BURNING:
        return [
          TransformationType.SKILL_DEVELOPMENT,
          TransformationType.HABIT_FORMATION
        ];
      case PhoenixPhase.RISING:
        return [
          TransformationType.RELATIONSHIP_BUILDING,
          TransformationType.CAREER_ADVANCEMENT
        ];
      case PhoenixPhase.SOARING:
        return [
          TransformationType.HEALTH_OPTIMIZATION,
          TransformationType.FINANCIAL_GROWTH
        ];
      default:
        return [];
    }
  }

  /**
   * Calculate days in phase
   */
  static calculateDaysInPhase(phaseHistory: PhoenixCycle['phaseHistory'], phase: PhoenixPhase): number {
    const phaseEntry = phaseHistory
      .slice()
      .reverse()
      .find(entry => entry.phase === phase);
    
    if (!phaseEntry) return 0;
    
    const endDate = phaseEntry.exitedAt || new Date();
    const startDate = phaseEntry.enteredAt;
    
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate phase transition
   */
  static validatePhaseTransition(fromPhase: PhoenixPhase, toPhase: PhoenixPhase): boolean {
    const validTransitions: Record<PhoenixPhase, PhoenixPhase[]> = {
      [PhoenixPhase.ASHES]: [PhoenixPhase.BURNING],
      [PhoenixPhase.BURNING]: [PhoenixPhase.RISING],
      [PhoenixPhase.RISING]: [PhoenixPhase.SOARING],
      [PhoenixPhase.SOARING]: [PhoenixPhase.ASHES] // New cycle
    };

    return validTransitions[fromPhase]?.includes(toPhase) || false;
  }
}