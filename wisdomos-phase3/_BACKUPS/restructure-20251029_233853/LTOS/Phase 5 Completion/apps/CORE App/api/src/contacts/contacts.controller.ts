import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async createContact(@Body() data: any) {
    return this.contactsService.createContact(data);
  }

  @Get()
  async getAllContacts() {
    return this.contactsService.getAllContacts();
  }

  @Get(':id')
  async getContact(@Param('id') id: string) {
    return this.contactsService.getContact(id);
  }

  @Put(':id')
  async updateContact(@Param('id') id: string, @Body() updates: any) {
    return this.contactsService.updateContact(id, updates);
  }

  @Get(':id/links')
  async getContactLinks(@Param('id') contactId: string) {
    return this.contactsService.getContactLinks(contactId);
  }

  @Post(':id/links')
  async createLink(@Param('id') contactId: string, @Body() data: any) {
    return this.contactsService.createLink({ ...data, contactId });
  }

  @Get(':id/interactions')
  async getContactInteractions(@Param('id') contactId: string) {
    return this.contactsService.getContactInteractions(contactId);
  }

  @Post(':id/interactions')
  async createInteraction(@Param('id') contactId: string, @Body() data: any) {
    return this.contactsService.createInteraction({ ...data, contactId });
  }

  @Get(':id/assessments')
  async getContactAssessments(@Param('id') contactId: string) {
    return this.contactsService.getContactAssessments(contactId);
  }

  @Post(':id/assessments')
  async createAssessment(@Param('id') contactId: string, @Body() data: any) {
    return this.contactsService.createAssessment({ ...data, contactId });
  }

  @Get(':id/health')
  async getRelationshipHealth(@Param('id') contactId: string) {
    return this.contactsService.getRelationshipHealth(contactId);
  }

  @Get('life-area/:lifeAreaId')
  async getLifeAreaContacts(@Param('lifeAreaId') lifeAreaId: string) {
    return this.contactsService.getLifeAreaContacts(parseInt(lifeAreaId));
  }
}