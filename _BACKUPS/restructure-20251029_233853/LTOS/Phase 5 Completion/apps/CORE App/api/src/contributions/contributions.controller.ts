import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto, UpdateContributionDto } from './dto/contribution.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/contributions')
@UseGuards(AuthGuard)
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateContributionDto) {
    return this.contributionsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.contributionsService.findAll(req.user.id);
  }

  @Get('statistics')
  getStatistics(@Req() req: any) {
    return this.contributionsService.getUserStatistics(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.contributionsService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateContributionDto,
  ) {
    return this.contributionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.contributionsService.remove(id, req.user.id);
  }
}