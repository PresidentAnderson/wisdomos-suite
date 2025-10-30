import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LifeAreasService {
  constructor(private database: DatabaseService) {}

  async findAll(userId?: string) {
    // TODO: Get userId from auth context
    const currentUserId = userId || 'demo-user-id';
    return this.database.findLifeAreas(currentUserId);
  }

  async findOne(id: string) {
    return this.database.findLifeAreaById(id);
  }

  async update(id: string, data: any) {
    return this.database.updateLifeArea(id, data);
  }

  async getDashboardSummary(userId?: string) {
    const currentUserId = userId || 'demo-user-id';
    const lifeAreas = await this.database.findLifeAreas(currentUserId);
    
    const summary = {
      totalAreas: lifeAreas.length,
      thriving: lifeAreas.filter(la => la.status === 'GREEN').length,
      attention: lifeAreas.filter(la => la.status === 'YELLOW').length,
      breakdown: lifeAreas.filter(la => la.status === 'RED').length,
      averageScore: Math.round(
        lifeAreas.reduce((sum, la) => sum + la.score, 0) / lifeAreas.length
      ),
      lifeAreas,
    };

    return summary;
  }
}