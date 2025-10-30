import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { LifeAreasService } from './life-areas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('life-areas')
export class LifeAreasController {
  constructor(private readonly lifeAreasService: LifeAreasService) {}

  @Get()
  async findAll() {
    return this.lifeAreasService.findAll();
  }

  @Get('dashboard')
  async getDashboard() {
    return this.lifeAreasService.getDashboardSummary();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lifeAreasService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.lifeAreasService.update(id, updateDto);
  }
}