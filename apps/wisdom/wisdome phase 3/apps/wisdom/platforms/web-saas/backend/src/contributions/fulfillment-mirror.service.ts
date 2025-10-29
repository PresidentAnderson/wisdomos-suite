import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { 
  ContributionCreatedEvent, 
  ContributionUpdatedEvent, 
  ContributionDeletedEvent 
} from './events/contribution.events';

@Injectable()
export class FulfillmentMirrorService implements OnModuleInit {
  private lifeAreaMap: Map<string, string> = new Map();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Cache life area IDs on startup
    await this.loadLifeAreas();
  }

  private async loadLifeAreas() {
    const areas = await this.prisma.lifeAreaCanonical.findMany();
    areas.forEach(area => {
      this.lifeAreaMap.set(area.slug, area.id);
    });
  }

  @OnEvent('contribution.created')
  async handleContributionCreated(event: ContributionCreatedEvent) {
    const { contribution } = event;
    
    // Mirror to Work & Purpose
    await this.createMirror(
      contribution,
      'work-purpose',
      4, // Higher priority
    );

    // Mirror to Creativity & Expression
    await this.createMirror(
      contribution,
      'creativity-expression',
      3,
    );

    // Conditionally mirror to Community & Contribution
    if (
      contribution.category === 'Doing' || 
      (contribution.tags && contribution.tags.includes('community'))
    ) {
      await this.createMirror(
        contribution,
        'community-contribution',
        3,
      );
    }

    // Log the event
    await this.logAudit(
      contribution.userId,
      'contribution_mirrored',
      'contribution',
      contribution.id,
      {
        title: contribution.title,
        mirrored_to: this.getMirroredAreas(contribution),
        timestamp: new Date(),
      },
    );
  }

  @OnEvent('contribution.updated')
  async handleContributionUpdated(event: ContributionUpdatedEvent) {
    const { contribution } = event;
    
    const fullDescription = this.buildDescription(contribution);
    const meta = this.buildMetadata(contribution);

    // Update all mirrored entries
    await this.prisma.fulfillmentEntry.updateMany({
      where: {
        sourceType: 'contribution',
        sourceId: contribution.id,
        userId: contribution.userId,
      },
      data: {
        title: contribution.title,
        description: fullDescription,
        meta,
        updatedAt: new Date(),
      },
    });

    // Log the update
    await this.logAudit(
      contribution.userId,
      'contribution_updated',
      'contribution',
      contribution.id,
      {
        title: contribution.title,
        timestamp: new Date(),
      },
    );
  }

  @OnEvent('contribution.deleted')
  async handleContributionDeleted(event: ContributionDeletedEvent) {
    const { contribution } = event;

    // Delete all mirrored entries
    await this.prisma.fulfillmentEntry.deleteMany({
      where: {
        sourceType: 'contribution',
        sourceId: contribution.id,
        userId: contribution.userId,
      },
    });

    // Log the deletion
    await this.logAudit(
      contribution.userId,
      'contribution_deleted',
      'contribution',
      contribution.id,
      {
        title: contribution.title,
        deleted_at: new Date(),
      },
    );
  }

  private async createMirror(
    contribution: any,
    lifeAreaSlug: string,
    priority: number,
  ) {
    const lifeAreaId = this.lifeAreaMap.get(lifeAreaSlug);
    if (!lifeAreaId) {
      console.warn(`Life area not found: ${lifeAreaSlug}`);
      return;
    }

    const fullDescription = this.buildDescription(contribution);
    const meta = this.buildMetadata(contribution);

    await this.prisma.fulfillmentEntry.upsert({
      where: {
        userId_lifeAreaId_sourceType_sourceId: {
          userId: contribution.userId,
          lifeAreaId,
          sourceType: 'contribution',
          sourceId: contribution.id,
        },
      },
      update: {
        title: contribution.title,
        description: fullDescription,
        meta,
        updatedAt: new Date(),
      },
      create: {
        userId: contribution.userId,
        lifeAreaId,
        sourceType: 'contribution',
        sourceId: contribution.id,
        title: contribution.title,
        description: fullDescription,
        meta,
        priority,
      },
    });
  }

  private buildDescription(contribution: any): string {
    let description = contribution.description || '';
    
    if (contribution.impact) {
      description += `\n\n🎯 Impact: ${contribution.impact}`;
    }
    
    if (contribution.commitment) {
      description += `\n\n✅ Commitment: ${contribution.commitment}`;
    }
    
    return description.trim();
  }

  private buildMetadata(contribution: any): any {
    return {
      category: contribution.category,
      bullets: contribution.contributions,
      commitment: contribution.commitment,
      impact: contribution.impact,
      tags: contribution.tags || [],
      mirrored_at: new Date(),
      source: 'contribution_mirror',
    };
  }

  private getMirroredAreas(contribution: any): string[] {
    const areas = ['work-purpose', 'creativity-expression'];
    
    if (
      contribution.category === 'Doing' || 
      (contribution.tags && contribution.tags.includes('community'))
    ) {
      areas.push('community-contribution');
    }
    
    return areas;
  }

  private async logAudit(
    userId: string,
    eventType: string,
    entityType: string,
    entityId: string,
    payload: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        eventType,
        entityType,
        entityId,
        payload,
      },
    });
  }

  // Backfill existing contributions
  async backfillContributions(userId?: string) {
    const where = userId ? { userId } : {};
    const contributions = await this.prisma.contribution.findMany({ where });
    
    for (const contribution of contributions) {
      await this.handleContributionCreated(
        new ContributionCreatedEvent(contribution),
      );
    }
    
    return { processed: contributions.length };
  }
}