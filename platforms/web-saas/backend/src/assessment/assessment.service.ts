import { Injectable } from '@nestjs/common';

export interface RelationshipAssessment {
  id: string;
  relationshipId: string;
  relationshipName: string;
  date: Date;
  scores: {
    health: number;
    reciprocity: number;
    growth: number;
    communication: number;
    boundaries: number;
    trust: number;
  };
  toxicityIndicators: string[];
  strengthIndicators: string[];
  actionItems: string[];
}

export interface AssessmentSummary {
  period: string;
  overallHealth: number;
  topRelationships: string[];
  concerningRelationships: string[];
  trends: string[];
}

export interface Assessment {
  userId: string;
  assessments: RelationshipAssessment[];
  summaries: AssessmentSummary[];
  insights: string[];
  lastAssessment: Date;
}

@Injectable()
export class AssessmentService {
  private assessments: Map<string, Assessment> = new Map();

  constructor() {
    // Initialize with demo data
    this.assessments.set('demo-user-id', {
      userId: 'demo-user-id',
      assessments: [
        {
          id: '1',
          relationshipId: '1',
          relationshipName: 'John (Manager)',
          date: new Date(),
          scores: {
            health: 80,
            reciprocity: 75,
            growth: 85,
            communication: 90,
            boundaries: 70,
            trust: 85,
          },
          toxicityIndicators: [],
          strengthIndicators: ['Clear communication', 'Mutual respect', 'Growth-oriented'],
          actionItems: ['Schedule monthly career discussions'],
        },
      ],
      summaries: [],
      insights: [
        'Your professional relationships are generally healthy',
        'Consider strengthening boundaries in work relationships',
      ],
      lastAssessment: new Date(),
    });
  }

  async getAssessment(userId: string): Promise<Assessment | null> {
    return this.assessments.get(userId) || null;
  }

  async createOrUpdateAssessment(userId: string, data: Partial<Assessment>): Promise<Assessment> {
    const existing = this.assessments.get(userId);
    const assessment = {
      ...existing,
      ...data,
      userId,
      lastAssessment: new Date(),
    } as Assessment;
    
    this.assessments.set(userId, assessment);
    return assessment;
  }

  async assessRelationship(
    userId: string,
    relationshipId: string,
    assessmentData: Omit<RelationshipAssessment, 'id' | 'date'>
  ): Promise<Assessment> {
    const assessment = this.assessments.get(userId) || this.createDefault(userId);
    
    const newAssessment: RelationshipAssessment = {
      id: Date.now().toString(),
      date: new Date(),
      relationshipId,
      ...assessmentData,
    };
    
    // Check for toxicity indicators based on scores
    newAssessment.toxicityIndicators = this.detectToxicity(newAssessment.scores);
    newAssessment.strengthIndicators = this.detectStrengths(newAssessment.scores);
    newAssessment.actionItems = this.generateActionItems(newAssessment);
    
    assessment.assessments.push(newAssessment);
    assessment.lastAssessment = new Date();
    
    // Generate new insights
    assessment.insights = this.generateInsightsFromAssessments(assessment.assessments);
    
    this.assessments.set(userId, assessment);
    return assessment;
  }

  async generateSummary(userId: string): Promise<AssessmentSummary> {
    const assessment = this.assessments.get(userId);
    if (!assessment) return this.createDefaultSummary();
    
    const recentAssessments = assessment.assessments.filter(
      a => a.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    const avgHealth = recentAssessments.reduce(
      (sum, a) => sum + a.scores.health, 0
    ) / (recentAssessments.length || 1);
    
    const topRelationships = recentAssessments
      .filter(a => a.scores.health >= 80)
      .map(a => a.relationshipName);
    
    const concerningRelationships = recentAssessments
      .filter(a => a.scores.health < 60 || a.toxicityIndicators.length > 2)
      .map(a => a.relationshipName);
    
    const summary: AssessmentSummary = {
      period: 'Last 30 days',
      overallHealth: Math.round(avgHealth),
      topRelationships,
      concerningRelationships,
      trends: this.detectTrends(assessment.assessments),
    };
    
    assessment.summaries.push(summary);
    this.assessments.set(userId, assessment);
    
    return summary;
  }

  async generateInsights(userId: string): Promise<string[]> {
    const assessment = this.assessments.get(userId);
    if (!assessment) return [];
    
    return this.generateInsightsFromAssessments(assessment.assessments);
  }

  private detectToxicity(scores: RelationshipAssessment['scores']): string[] {
    const indicators: string[] = [];
    
    if (scores.boundaries < 50) indicators.push('Weak boundaries');
    if (scores.reciprocity < 40) indicators.push('Lack of reciprocity');
    if (scores.trust < 50) indicators.push('Trust issues');
    if (scores.communication < 40) indicators.push('Poor communication');
    if (scores.health < 50) indicators.push('Overall unhealthy dynamic');
    
    return indicators;
  }

  private detectStrengths(scores: RelationshipAssessment['scores']): string[] {
    const strengths: string[] = [];
    
    if (scores.boundaries >= 80) strengths.push('Strong boundaries');
    if (scores.reciprocity >= 80) strengths.push('Balanced give-and-take');
    if (scores.trust >= 85) strengths.push('High trust');
    if (scores.communication >= 85) strengths.push('Excellent communication');
    if (scores.growth >= 80) strengths.push('Growth-oriented');
    
    return strengths;
  }

  private generateActionItems(assessment: RelationshipAssessment): string[] {
    const items: string[] = [];
    
    if (assessment.scores.boundaries < 60) {
      items.push('Set clearer boundaries');
    }
    if (assessment.scores.communication < 60) {
      items.push('Improve communication patterns');
    }
    if (assessment.scores.reciprocity < 60) {
      items.push('Address imbalance in give-and-take');
    }
    if (assessment.toxicityIndicators.length > 0) {
      items.push('Consider professional guidance or distance');
    }
    
    return items;
  }

  private detectTrends(assessments: RelationshipAssessment[]): string[] {
    const trends: string[] = [];
    
    if (assessments.length < 2) return ['Not enough data for trends'];
    
    // Sort by date
    const sorted = [...assessments].sort((a, b) => a.date.getTime() - b.date.getTime());
    const recent = sorted.slice(-5);
    
    // Check if health scores are improving or declining
    let healthTrend = 0;
    for (let i = 1; i < recent.length; i++) {
      healthTrend += recent[i].scores.health - recent[i - 1].scores.health;
    }
    
    if (healthTrend > 10) trends.push('Overall relationship health improving');
    if (healthTrend < -10) trends.push('Overall relationship health declining');
    
    return trends;
  }

  private generateInsightsFromAssessments(assessments: RelationshipAssessment[]): string[] {
    const insights: string[] = [];
    
    if (assessments.length === 0) {
      insights.push('Start by assessing your key relationships');
      return insights;
    }
    
    const avgBoundaries = assessments.reduce((sum, a) => sum + a.scores.boundaries, 0) / assessments.length;
    const avgReciprocity = assessments.reduce((sum, a) => sum + a.scores.reciprocity, 0) / assessments.length;
    
    if (avgBoundaries < 60) {
      insights.push('Consider strengthening boundaries across your relationships');
    }
    if (avgReciprocity < 60) {
      insights.push('Many relationships show imbalanced give-and-take patterns');
    }
    
    const toxicCount = assessments.filter(a => a.toxicityIndicators.length > 2).length;
    if (toxicCount > 0) {
      insights.push(`${toxicCount} relationship(s) show concerning patterns`);
    }
    
    return insights;
  }

  private createDefault(userId: string): Assessment {
    return {
      userId,
      assessments: [],
      summaries: [],
      insights: [],
      lastAssessment: new Date(),
    };
  }

  private createDefaultSummary(): AssessmentSummary {
    return {
      period: 'No data',
      overallHealth: 0,
      topRelationships: [],
      concerningRelationships: [],
      trends: ['No assessment data available'],
    };
  }
}