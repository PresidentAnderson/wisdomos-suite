import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../database/prisma.service';
import { CreateContributionDto, UpdateContributionDto } from './dto/contribution.dto';
import { ContributionCreatedEvent, ContributionUpdatedEvent, ContributionDeletedEvent } from './events/contribution.events';

@Injectable()
export class ContributionsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateContributionDto) {
    const contribution = await this.prisma.contribution.create({
      data: {
        userId,
        category: dto.category,
        title: dto.title,
        description: dto.description,
        contributions: dto.contributions,
        impact: dto.impact,
        commitment: dto.commitment,
        tags: dto.tags || [],
        visibility: dto.visibility || 'private',
      },
    });

    // Emit event for mirroring
    this.eventEmitter.emit(
      'contribution.created',
      new ContributionCreatedEvent(contribution),
    );

    return contribution;
  }

  async findAll(userId: string) {
    return this.prisma.contribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.contribution.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateContributionDto) {
    const contribution = await this.prisma.contribution.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        contributions: dto.contributions,
        impact: dto.impact,
        commitment: dto.commitment,
        tags: dto.tags,
        visibility: dto.visibility,
      },
    });

    // Emit event for updating mirrors
    this.eventEmitter.emit(
      'contribution.updated',
      new ContributionUpdatedEvent(contribution),
    );

    return contribution;
  }

  async remove(id: string, userId: string) {
    const contribution = await this.prisma.contribution.delete({
      where: { id },
    });

    // Emit event for cleanup
    this.eventEmitter.emit(
      'contribution.deleted',
      new ContributionDeletedEvent(contribution),
    );

    return contribution;
  }

  async getUserStatistics(userId: string) {
    const [total, byCategory, recent] = await Promise.all([
      this.prisma.contribution.count({ where: { userId } }),
      this.prisma.contribution.groupBy({
        by: ['category'],
        where: { userId },
        _count: true,
      }),
      this.prisma.contribution.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      total,
      byCategory,
      recent,
    };
  }
}