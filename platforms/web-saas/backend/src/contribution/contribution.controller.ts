import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/contribution')
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getContribution(@Request() req): Promise<any> {
    return this.contributionService.getContribution(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createContribution(@Request() req, @Body() data: any): Promise<any> {
    return this.contributionService.createOrUpdateContribution(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateContribution(@Request() req, @Body() data: any): Promise<any> {
    return this.contributionService.createOrUpdateContribution(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('strength')
  async addStrength(@Request() req, @Body() data: any): Promise<any> {
    return this.contributionService.addStrength(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('strength/:id')
  async removeStrength(@Request() req, @Param('id') id: string): Promise<any> {
    return this.contributionService.removeStrength(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('contribution')
  async addNaturalContribution(@Request() req, @Body() data: any): Promise<any> {
    return this.contributionService.addNaturalContribution(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('contribution/:id')
  async removeNaturalContribution(@Request() req, @Param('id') id: string): Promise<any> {
    return this.contributionService.removeNaturalContribution(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('acknowledgment')
  async addAcknowledgment(@Request() req, @Body() data: any): Promise<any> {
    return this.contributionService.addAcknowledgment(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('acknowledgment/:id')
  async removeAcknowledgment(@Request() req, @Param('id') id: string): Promise<any> {
    return this.contributionService.removeAcknowledgment(req.user.sub, id);
  }

  // ========================================================================
  // Prisma-based Contribution Endpoints (for mirroring feature)
  // ========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('entries')
  async getPrismaContributions(@Request() req): Promise<any> {
    return this.contributionService.getPrismaContributions(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('entries')
  async createPrismaContribution(@Request() req, @Body() data: any): Promise<any> {
    return this.contributionService.createPrismaContribution({
      userId: req.user.sub,
      ...data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('entries/:id')
  async getPrismaContributionById(@Request() req, @Param('id') id: string): Promise<any> {
    return this.contributionService.getPrismaContributionById(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('entries/:id')
  async updatePrismaContribution(
    @Request() req,
    @Param('id') id: string,
    @Body() data: any
  ): Promise<any> {
    return this.contributionService.updatePrismaContribution(id, req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('entries/:id')
  async deletePrismaContribution(@Request() req, @Param('id') id: string): Promise<any> {
    const success = await this.contributionService.deletePrismaContribution(id, req.user.sub);
    return { success };
  }
}