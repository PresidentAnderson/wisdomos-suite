import { Injectable } from '@nestjs/common';
import { prisma } from '@wisdomos/db';

@Injectable()
export class DashboardService {
  async getDashboard() {
    // TODO: Get from auth context
    const userId = 'demo-user-id';

    // Get all life areas with recent events
    const lifeAreas = await prisma.lifeArea.findMany({
      where: { userId },
      include: {
        events: {
          orderBy: { occurredAt: 'desc' },
          take: 5,
        },
        journals: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    // Calculate dashboard data for each area
    const dashboardAreas = lifeAreas.map(area => {
      const recentEvents = area.events || [];
      const recentJournals = area.journals || [];
      
      // Count upsets and broken commitments
      const upsets = recentJournals.filter(j => j.upsetDetected).length;
      const brokenCommitments = recentEvents.filter(e => e.type === 'COMMITMENT_BROKEN').length;
      
      // Calculate score based on events
      const score = recentEvents.reduce((acc, event) => acc + event.impact, 0);

      return {
        id: area.id,
        name: area.name,
        phoenixName: area.phoenixName || this.getPhoenixName(area.name),
        status: area.status,
        score,
        upsets,
        brokenCommitments,
        recentEvents: recentEvents.slice(0, 3).map(e => ({
          title: e.title,
          type: e.type,
          date: e.occurredAt.toISOString(),
        })),
      };
    });

    // Calculate overall phoenix stage
    const totalScore = dashboardAreas.reduce((acc, area) => acc + area.score, 0);
    const phoenixStage = this.calculatePhoenixStage(totalScore);

    // Get user badges
    const badges = await prisma.badge.findMany({
      where: { userId },
    });

    return {
      lifeAreas: dashboardAreas,
      phoenixStage,
      totalScore,
      badges: badges.map(b => ({
        id: b.id,
        name: b.name,
        unlocked: b.unlocked,
        progress: b.progress,
        maxProgress: b.maxProgress,
      })),
    };
  }

  async refreshDashboard() {
    // TODO: Implement dashboard refresh logic
    // This could recalculate scores, update statuses, etc.
    return this.getDashboard();
  }

  private getPhoenixName(areaName: string): string {
    const phoenixNames: Record<string, string> = {
      'Work & Purpose': 'Your Sacred Fire',
      'Health & Recovery': 'Your Inner Flame',
      'Finance': 'Your Golden Wings',
      'Intimacy & Love': 'Your Heart\'s Ember',
      'Time & Energy': 'Your Life Force',
      'Spiritual Alignment': 'Your Divine Spark',
      'Creativity & Expression': 'Your Creative Flame',
      'Friendship & Community': 'Your Circle of Fire',
      'Learning & Growth': 'Your Rising Wisdom',
      'Home & Environment': 'Your Nest of Renewal',
      'Sexuality': 'Your Passionate Fire',
      'Emotional Regulation': 'Your Inner Phoenix',
      'Legacy & Archives': 'Your Eternal Flame',
    };
    return phoenixNames[areaName] || 'Your Phoenix Power';
  }

  private calculatePhoenixStage(totalScore: number): 'ashes' | 'fire' | 'rebirth' | 'flight' {
    if (totalScore <= -10) return 'ashes';
    if (totalScore <= 0) return 'fire';
    if (totalScore <= 10) return 'rebirth';
    return 'flight';
  }
}