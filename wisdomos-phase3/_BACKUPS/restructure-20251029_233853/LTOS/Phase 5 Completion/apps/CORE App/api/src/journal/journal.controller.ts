import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  async create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalService.create(createJournalDto);
  }

  @Get()
  async findAll(@Query('lifeAreaId') lifeAreaId?: string) {
    return this.journalService.findAll(lifeAreaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.journalService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateJournalDto: UpdateJournalDto) {
    return this.journalService.update(id, updateJournalDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.journalService.remove(id);
  }

  @Post(':id/reframe')
  async reframe(@Param('id') id: string) {
    return this.journalService.generateAIReframe(id);
  }
}