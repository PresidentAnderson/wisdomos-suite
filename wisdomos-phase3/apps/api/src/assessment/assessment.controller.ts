import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAssessment(@Request() req): Promise<any> {
    return this.assessmentService.getAssessment(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAssessment(@Request() req, @Body() data: any): Promise<any> {
    return this.assessmentService.createOrUpdateAssessment(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('relationship/:relationshipId')
  async assessRelationship(
    @Request() req,
    @Param('relationshipId') relationshipId: string,
    @Body() data: any
  ): Promise<any> {
    return this.assessmentService.assessRelationship(req.user.sub, relationshipId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getSummary(@Request() req): Promise<any> {
    return this.assessmentService.generateSummary(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  async getInsights(@Request() req): Promise<any> {
    return this.assessmentService.generateInsights(req.user.sub);
  }
}