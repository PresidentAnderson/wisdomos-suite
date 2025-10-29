import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  constructor(private database: DatabaseService) {}

  async create(createJournalDto: CreateJournalDto) {
    // Simple upset detection - check for keywords
    const upsetKeywords = ['upset', 'angry', 'frustrated', 'anxious', 'stressed', 'overwhelmed'];
    const content = createJournalDto.content.toLowerCase();
    const upsetDetected = upsetKeywords.some(keyword => content.includes(keyword));

    // TODO: Replace with actual user ID from auth
    const userId = 'demo-user-id';

    const journal = await this.database.createJournal({
      userId,
      lifeAreaId: createJournalDto.lifeAreaId,
      content: createJournalDto.content,
      tags: createJournalDto.tags || [],
      upsetDetected,
    });

    // If upset detected, potentially update life area status
    if (upsetDetected && createJournalDto.lifeAreaId) {
      await this.updateLifeAreaStatus(createJournalDto.lifeAreaId);
    }

    return journal;
  }

  async findAll(lifeAreaId?: string) {
    const userId = 'demo-user-id'; // TODO: Get from auth

    return this.database.findJournals({
      userId,
      ...(lifeAreaId && { lifeAreaId }),
    });
  }

  async findOne(id: string) {
    return this.database.findJournalById(id);
  }

  async update(id: string, updateJournalDto: UpdateJournalDto) {
    return this.database.updateJournal(id, updateJournalDto);
  }

  async remove(id: string) {
    const result = await this.database.deleteJournal(id);
    return { success: result };
  }

  async generateAIReframe(id: string) {
    const journal = await this.database.findJournalById(id);

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    // TODO: Integrate with OpenAI or other AI provider
    // For now, return a mock reframe
    const mockReframe = `Looking at this situation from a phoenix perspective: What seems like ashes now is actually the fertile ground for your transformation. This upset is showing you where your boundaries need strengthening. Consider: What commitment to yourself is being called forward here?`;

    const updated = await this.database.updateJournal(id, {
      aiReframe: mockReframe,
    });

    return updated;
  }

  private async updateLifeAreaStatus(lifeAreaId: string) {
    // Count recent upsets in this life area
    const recentUpsets = await this.database.countRecentUpsets(lifeAreaId, 7);

    // Simple status update logic
    let newStatus: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
    if (recentUpsets >= 3) {
      newStatus = 'RED';
    } else if (recentUpsets >= 1) {
      newStatus = 'YELLOW';
    }

    await this.database.updateLifeArea(lifeAreaId, { status: newStatus });
  }
}