import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HubSpotService {
  private readonly logger = new Logger(HubSpotService.name);
  private readonly hubspotKey = process.env.HUBSPOT_PRIVATE_APP_KEY;
  private readonly apiUrl = 'https://api.hubapi.com';

  /**
   * Get HubSpot API headers
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.hubspotKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Sync contacts from HubSpot
   */
  async syncContacts(userId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/crm/v3/objects/contacts`,
        {
          headers: this.getHeaders(),
          params: {
            limit: 100,
            properties: 'firstname,lastname,email,phone,lifecyclestage',
          },
        },
      );

      const contacts = response.data.results;
      this.logger.log(`Synced ${contacts.length} contacts for user ${userId}`);

      // Transform HubSpot contacts to WisdomOS format
      return contacts.map(contact => ({
        id: contact.id,
        email: contact.properties.email,
        firstName: contact.properties.firstname,
        lastName: contact.properties.lastname,
        phone: contact.properties.phone,
        lifecycleStage: contact.properties.lifecyclestage,
        syncedAt: new Date(),
      }));
    } catch (error) {
      this.logger.error('Failed to sync contacts:', error);
      throw error;
    }
  }

  /**
   * Sync deals from HubSpot
   */
  async syncDeals(userId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/crm/v3/objects/deals`,
        {
          headers: this.getHeaders(),
          params: {
            limit: 100,
            properties: 'dealname,amount,dealstage,closedate,pipeline',
          },
        },
      );

      const deals = response.data.results;
      this.logger.log(`Synced ${deals.length} deals for user ${userId}`);

      // Transform HubSpot deals to WisdomOS format
      return deals.map(deal => ({
        id: deal.id,
        name: deal.properties.dealname,
        amount: deal.properties.amount,
        stage: deal.properties.dealstage,
        closeDate: deal.properties.closedate,
        pipeline: deal.properties.pipeline,
        syncedAt: new Date(),
      }));
    } catch (error) {
      this.logger.error('Failed to sync deals:', error);
      throw error;
    }
  }

  /**
   * Create a contact in HubSpot
   */
  async createContact(contactData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/crm/v3/objects/contacts`,
        {
          properties: contactData,
        },
        {
          headers: this.getHeaders(),
        },
      );

      this.logger.log(`Created contact with ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create contact:', error);
      throw error;
    }
  }

  /**
   * Update a contact in HubSpot
   */
  async updateContact(contactId: string, updates: any): Promise<any> {
    try {
      const response = await axios.patch(
        `${this.apiUrl}/crm/v3/objects/contacts/${contactId}`,
        {
          properties: updates,
        },
        {
          headers: this.getHeaders(),
        },
      );

      this.logger.log(`Updated contact ${contactId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update contact ${contactId}:`, error);
      throw error;
    }
  }

  /**
   * Create a deal in HubSpot
   */
  async createDeal(dealData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/crm/v3/objects/deals`,
        {
          properties: dealData,
        },
        {
          headers: this.getHeaders(),
        },
      );

      this.logger.log(`Created deal with ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create deal:', error);
      throw error;
    }
  }

  /**
   * Get engagement statistics
   */
  async getEngagementStats(): Promise<any> {
    try {
      // Get contacts count
      const contactsResponse = await axios.get(
        `${this.apiUrl}/crm/v3/objects/contacts`,
        {
          headers: this.getHeaders(),
          params: { limit: 1 },
        },
      );

      // Get deals count
      const dealsResponse = await axios.get(
        `${this.apiUrl}/crm/v3/objects/deals`,
        {
          headers: this.getHeaders(),
          params: { limit: 1 },
        },
      );

      return {
        totalContacts: contactsResponse.data.total || 0,
        totalDeals: dealsResponse.data.total || 0,
        lastSync: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get engagement stats:', error);
      throw error;
    }
  }

  /**
   * Search for contacts by email
   */
  async searchContactsByEmail(email: string): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
        },
        {
          headers: this.getHeaders(),
        },
      );

      return response.data.results || [];
    } catch (error) {
      this.logger.error(`Failed to search contacts by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Associate contact with deal
   */
  async associateContactToDeal(contactId: string, dealId: string): Promise<any> {
    try {
      const response = await axios.put(
        `${this.apiUrl}/crm/v3/objects/contacts/${contactId}/associations/deals/${dealId}/3`,
        {},
        {
          headers: this.getHeaders(),
        },
      );

      this.logger.log(`Associated contact ${contactId} with deal ${dealId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to associate contact ${contactId} with deal ${dealId}:`, error);
      throw error;
    }
  }
}