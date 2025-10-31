import { Body, Controller, Get, Param, Post, Put, Query, Delete } from '@nestjs/common';
import { AutobiographyService } from './autobiography.service';

@Controller('autobiography')
export class AutobiographyController {
  constructor(private readonly autobiographyService: AutobiographyService) {}

  @Post()
  async createEntry(@Body() data: any) {
    return this.autobiographyService.createEntry(data);
  }

  @Put(':id')
  async updateEntry(
    @Param('id') id: string,
    @Body() updates: any
  ) {
    const { changeNote, ...data } = updates;
    return this.autobiographyService.updateEntry(id, data, changeNote);
  }

  @Put(':id/autosave')
  async autoSaveEntry(
    @Param('id') id: string,
    @Body() updates: any
  ) {
    return this.autobiographyService.autoSave(id, updates);
  }

  @Get(':id')
  async getEntry(@Param('id') id: string) {
    return this.autobiographyService.getEntry(id);
  }

  @Get('user/:userId')
  async getUserEntries(@Param('userId') userId: string) {
    return this.autobiographyService.getAllEntries(userId);
  }

  @Get('user/:userId/year/:year')
  async getEntriesByYear(
    @Param('userId') userId: string,
    @Param('year') year: string
  ) {
    return this.autobiographyService.getEntriesByYear(userId, parseInt(year));
  }

  @Get('user/:userId/range')
  async getEntriesByRange(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.autobiographyService.getEntriesByRange(
      userId,
      parseInt(start),
      parseInt(end)
    );
  }

  @Get(':id/revisions')
  async getRevisionHistory(@Param('id') id: string) {
    return this.autobiographyService.getRevisionHistory(id);
  }

  @Post(':id/revisions/:revisionId/restore')
  async restoreRevision(
    @Param('id') id: string,
    @Param('revisionId') revisionId: string
  ) {
    return this.autobiographyService.restoreRevision(id, revisionId);
  }

  @Get('user/:userId/search')
  async searchEntries(
    @Param('userId') userId: string,
    @Query('q') query: string
  ) {
    return this.autobiographyService.searchEntries(userId, query);
  }

  @Get('user/:userId/patterns')
  async detectPatterns(@Param('userId') userId: string) {
    return this.autobiographyService.detectPatterns(userId);
  }

  @Get('user/:userId/export/markdown')
  async exportToMarkdown(
    @Param('userId') userId: string,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string
  ) {
    const yearRange = startYear && endYear 
      ? { start: parseInt(startYear), end: parseInt(endYear) }
      : undefined;
    
    const markdown = await this.autobiographyService.exportToMarkdown(userId, yearRange);
    return { 
      content: markdown,
      filename: `autobiography-${new Date().toISOString().split('T')[0]}.md`
    };
  }
}