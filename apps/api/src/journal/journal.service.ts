import { Injectable } from '@nestjs/common';
import { prisma } from '@wisdomos/db';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  async create(createJournalDto: CreateJournalDto) {
    // Simple upset detection - check for keywords
    const upsetKeywords = ['upset', 'angry', 'frustrated', 'anxious', 'stressed', 'overwhelmed'];
    const content = createJournalDto.content.toLowerCase();
    const upsetDetected = upsetKeywords.some(keyword => content.includes(keyword));

    // TODO: Replace with actual user ID from auth
    const userId = 'demo-user-id';

    const journal = await prisma.journal.create({
      data: {
        userId,
        lifeAreaId: createJournalDto.lifeAreaId,
        content: createJournalDto.content,
        tags: createJournalDto.tags || [],
        upsetDetected,
      },
      include: {
        lifeArea: true,
      },
    });

    // If upset detected, potentially update life area status
    if (upsetDetected) {
      await this.updateLifeAreaStatus(createJournalDto.lifeAreaId);
    }

    return journal;
  }

  async findAll(lifeAreaId?: string) {
    const userId = 'demo-user-id'; // TODO: Get from auth

    return prisma.journal.findMany({
      where: {
        userId,
        ...(lifeAreaId && { lifeAreaId }),
      },
      include: {
        lifeArea: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return prisma.journal.findUnique({
      where: { id },
      include: {
        lifeArea: true,
      },
    });
  }

  async update(id: string, updateJournalDto: UpdateJournalDto) {
    return prisma.journal.update({
      where: { id },
      data: updateJournalDto,
      include: {
        lifeArea: true,
      },
    });
  }

  async remove(id: string) {
    return prisma.journal.delete({
      where: { id },
    });
  }

  async generateAIReframe(id: string) {
    const journal = await prisma.journal.findUnique({
      where: { id },
    });

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    // TODO: Integrate with OpenAI or other AI provider
    // For now, return a mock reframe
    const mockReframe = `Looking at this situation from a phoenix perspective: What seems like ashes now is actually the fertile ground for your transformation. This upset is showing you where your boundaries need strengthening. Consider: What commitment to yourself is being called forward here?`;

    const updated = await prisma.journal.update({
      where: { id },
      data: {
        aiReframe: mockReframe,
      },
    });

    return updated;
  }

  private async updateLifeAreaStatus(lifeAreaId: string) {
    // Count recent upsets in this life area
    const recentUpsets = await prisma.journal.count({
      where: {
        lifeAreaId,
        upsetDetected: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    // Simple status update logic
    let newStatus: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    if (recentUpsets >= 3) {
      newStatus = 'RED';
    } else if (recentUpsets >= 1) {
      newStatus = 'YELLOW';
    }

    await prisma.lifeArea.update({
      where: { id: lifeAreaId },
      data: { status: newStatus },
    });
  }
}