import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FulfillmentService } from './fulfillment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/fulfillment')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFulfillment(@Request() req): Promise<any> {
    return this.fulfillmentService.getFulfillment(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createFulfillment(@Request() req, @Body() data: any): Promise<any> {
    return this.fulfillmentService.createOrUpdateFulfillment(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateFulfillment(@Request() req, @Body() data: any): Promise<any> {
    return this.fulfillmentService.createOrUpdateFulfillment(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('area')
  async addLifeArea(@Request() req, @Body() data: any): Promise<any> {
    return this.fulfillmentService.addLifeArea(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('area/:id')
  async updateLifeArea(@Request() req, @Param('id') id: string, @Body() data: any): Promise<any> {
    return this.fulfillmentService.updateLifeArea(req.user.sub, id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('area/:id')
  async removeLifeArea(@Request() req, @Param('id') id: string): Promise<any> {
    return this.fulfillmentService.removeLifeArea(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('relationship')
  async addRelationship(@Request() req, @Body() data: any): Promise<any> {
    return this.fulfillmentService.addRelationship(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('relationship/:id')
  async updateRelationship(@Request() req, @Param('id') id: string, @Body() data: any): Promise<any> {
    return this.fulfillmentService.updateRelationship(req.user.sub, id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('relationship/:id')
  async removeRelationship(@Request() req, @Param('id') id: string): Promise<any> {
    return this.fulfillmentService.removeRelationship(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('audit')
  async performMonthlyAudit(@Request() req, @Body() data: any): Promise<any> {
    return this.fulfillmentService.performMonthlyAudit(req.user.sub, data);
  }

  // ========================================================================
  // Prisma-based Fulfillment Endpoints (for mirroring feature)
  // ========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('entries')
  async getFulfillmentEntries(
    @Request() req,
    @Query('lifeArea') lifeAreaSlug?: string
  ): Promise<any> {
    return this.fulfillmentService.getFulfillmentEntries(req.user.sub, lifeAreaSlug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('life-areas')
  async getCanonicalLifeAreas(): Promise<any> {
    return this.fulfillmentService.getCanonicalLifeAreas();
  }

  @UseGuards(JwtAuthGuard)
  @Post('entries')
  async createFulfillmentEntry(@Request() req, @Body() data: any): Promise<any> {
    return this.fulfillmentService.createFulfillmentEntry({
      userId: req.user.sub,
      ...data,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('entries/:id')
  async updateFulfillmentEntry(
    @Request() req,
    @Param('id') id: string,
    @Body() data: any
  ): Promise<any> {
    return this.fulfillmentService.updateFulfillmentEntry(id, req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('entries/:id')
  async deleteFulfillmentEntry(@Request() req, @Param('id') id: string): Promise<any> {
    const success = await this.fulfillmentService.deleteFulfillmentEntry(id, req.user.sub);
    return { success };
  }

  @UseGuards(JwtAuthGuard)
  @Get('with-contributions')
  async getFulfillmentWithContributions(
    @Request() req,
    @Query('lifeArea') lifeAreaSlug?: string
  ): Promise<any> {
    return this.fulfillmentService.getFulfillmentWithContributions(req.user.sub, lifeAreaSlug);
  }
}