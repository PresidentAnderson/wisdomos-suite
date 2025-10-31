import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private database: DatabaseService) {}

  async getDashboard() {
    // TODO: Get from auth context
    const userId = 'demo-user-id';

    // Get all life areas
    const lifeAreas = await this.database.findLifeAreas(userId);
    
    // Get all journals
    const journals = await this.database.findJournals({ userId });

    // Calculate dashboard data for each area
    const dashboardAreas = lifeAreas.map(area => {
      // Filter journals for this area
      const areaJournals = journals.filter(j => j.lifeAreaId === area.id);
      
      // Count upsets
      const upsets = areaJournals.filter(j => j.upsetDetected).length;
      
      return {
        id: area.id,
        name: area.name,
        phoenixName: area.phoenixName || this.getPhoenixName(area.name),
        status: area.status,
        score: area.score,
        upsets,
        journalCount: areaJournals.length,
        lastActivity: areaJournals[0]?.createdAt || area.createdAt,
      };
    });

    // Calculate overall phoenix stage
    const totalScore = dashboardAreas.reduce((acc, area) => acc + area.score, 0);
    const avgScore = Math.round(totalScore / dashboardAreas.length);
    const phoenixStage = this.calculatePhoenixStage(avgScore);

    // Count statuses
    const statusCounts = {
      thriving: dashboardAreas.filter(a => a.status === 'GREEN').length,
      attention: dashboardAreas.filter(a => a.status === 'YELLOW').length,
      breakdown: dashboardAreas.filter(a => a.status === 'RED').length,
    };

    return {
      lifeAreas: dashboardAreas,
      phoenixStage,
      totalScore,
      averageScore: avgScore,
      statusCounts,
      totalJournals: journals.length,
      recentActivity: journals.slice(0, 5).map(j => ({
        id: j.id,
        content: j.content.substring(0, 100) + '...',
        lifeArea: j.lifeArea?.name,
        createdAt: j.createdAt,
        upsetDetected: j.upsetDetected,
      })),
    };
  }

  async refreshDashboard() {
    // This could recalculate scores, update statuses, etc.
    return this.getDashboard();
  }

  private getPhoenixName(areaName: string): string {
    const phoenixNames: Record<string, string> = {
      'Sacred Relationship': 'Your Heart\'s Ember',
      'Physical Temple': 'Your Inner Flame',
      'Soul Purpose Work': 'Your Sacred Fire',
      'Creative Expression': 'Your Creative Flame',
      'Mind & Learning': 'Your Rising Wisdom',
      'Family Constellation': 'Your Ancestral Fire',
      'Tribe & Community': 'Your Circle of Fire',
      'Financial Flow': 'Your Golden Wings',
      'Home Sanctuary': 'Your Nest of Renewal',
      'Life Adventure': 'Your Wild Phoenix',
      'Spiritual Path': 'Your Divine Spark',
      'Service & Contribution': 'Your Legacy Flame',
      'Joy & Celebration': 'Your Dancing Fire',
    };
    return phoenixNames[areaName] || 'Your Phoenix Power';
  }

  private calculatePhoenixStage(averageScore: number): 'ashes' | 'fire' | 'rebirth' | 'flight' {
    if (averageScore <= 25) return 'ashes';
    if (averageScore <= 50) return 'fire';
    if (averageScore <= 75) return 'rebirth';
    return 'flight';
  }
}