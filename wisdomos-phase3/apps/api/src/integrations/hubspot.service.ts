import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface HubSpotContact {
  id?: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    notes?: string;
    hs_object_id?: string;
  };
}

interface HubSpotEngagement {
  engagement: {
    active: boolean;
    type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
    timestamp: number;
  };
  associations: {
    contactIds: string[];
  };
  metadata: {
    subject?: string;
    body?: string;
    duration?: number;
    toNumber?: string;
    fromNumber?: string;
    status?: string;
  };
}

@Injectable()
export class HubSpotService {
  private readonly logger = new Logger(HubSpotService.name);
  private client: AxiosInstance;
  private isConfigured: boolean;

  constructor() {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    this.isConfigured = !!token;

    if (this.isConfigured) {
      this.client = axios.create({
        baseURL: 'https://api.hubapi.com',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('HubSpot integration configured');
    } else {
      this.logger.warn('HubSpot integration not configured - missing HUBSPOT_ACCESS_TOKEN');
    }
  }

  async upsertContact(data: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    notes?: string;
    hubspot_id?: string;
  }): Promise<{ hubspot_id: string | null; success: boolean }> {
    if (!this.isConfigured) {
      return { hubspot_id: null, success: false };
    }

    try {
      // If we have a hubspot_id, update existing
      if (data.hubspot_id) {
        await this.updateContact(data.hubspot_id, data);
        return { hubspot_id: data.hubspot_id, success: true };
      }

      // If we have an email, search for existing contact
      if (data.email) {
        const existingId = await this.findContactByEmail(data.email);
        if (existingId) {
          await this.updateContact(existingId, data);
          return { hubspot_id: existingId, success: true };
        }
      }

      // Create new contact
      const newId = await this.createContact(data);
      return { hubspot_id: newId, success: true };
    } catch (error) {
      this.logger.error('Error upserting HubSpot contact', error);
      return { hubspot_id: null, success: false };
    }
  }

  private async findContactByEmail(email: string): Promise<string | null> {
    try {
      const response = await this.client.post('/crm/v3/objects/contacts/search', {
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
        properties: ['email', 'firstname', 'lastname'],
        limit: 1,
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].id;
      }
      return null;
    } catch (error) {
      this.logger.error('Error searching HubSpot contact', error);
      return null;
    }
  }

  private async createContact(data: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    notes?: string;
  }): Promise<string | null> {
    try {
      const response = await this.client.post('/crm/v3/objects/contacts', {
        properties: {
          firstname: data.first_name,
          lastname: data.last_name,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
        },
      });
      return response.data.id;
    } catch (error) {
      this.logger.error('Error creating HubSpot contact', error);
      return null;
    }
  }

  private async updateContact(
    hubspotId: string,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      notes?: string;
    },
  ): Promise<void> {
    try {
      const properties: any = {};
      if (data.first_name) properties.firstname = data.first_name;
      if (data.last_name) properties.lastname = data.last_name;
      if (data.email) properties.email = data.email;
      if (data.phone) properties.phone = data.phone;
      if (data.notes) properties.notes = data.notes;

      await this.client.patch(`/crm/v3/objects/contacts/${hubspotId}`, {
        properties,
      });
    } catch (error) {
      this.logger.error('Error updating HubSpot contact', error);
    }
  }

  async createEngagement(data: {
    contact_hubspot_id: string;
    type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING';
    subject?: string;
    body?: string;
    occurred_at?: Date;
    duration_minutes?: number;
  }): Promise<{ engagement_id: string | null; success: boolean }> {
    if (!this.isConfigured) {
      return { engagement_id: null, success: false };
    }

    try {
      const engagement: HubSpotEngagement = {
        engagement: {
          active: true,
          type: data.type,
          timestamp: data.occurred_at?.getTime() || Date.now(),
        },
        associations: {
          contactIds: [data.contact_hubspot_id],
        },
        metadata: {
          subject: data.subject,
          body: data.body,
        },
      };

      if (data.type === 'CALL' && data.duration_minutes) {
        engagement.metadata.duration = data.duration_minutes * 60000; // Convert to milliseconds
      }

      const response = await this.client.post('/engagements/v1/engagements', engagement);
      return { engagement_id: response.data.engagement.id, success: true };
    } catch (error) {
      this.logger.error('Error creating HubSpot engagement', error);
      return { engagement_id: null, success: false };
    }
  }

  async syncInteraction(interaction: {
    contact_hubspot_id?: string;
    channel: string;
    direction?: string;
    subject?: string;
    body_text?: string;
    occurred_at?: Date;
  }): Promise<boolean> {
    if (!this.isConfigured || !interaction.contact_hubspot_id) {
      return false;
    }

    // Map interaction channel to HubSpot engagement type
    let engagementType: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' = 'NOTE';
    switch (interaction.channel) {
      case 'call':
        engagementType = 'CALL';
        break;
      case 'email':
        engagementType = 'EMAIL';
        break;
      case 'meeting':
        engagementType = 'MEETING';
        break;
      default:
        engagementType = 'NOTE';
    }

    const result = await this.createEngagement({
      contact_hubspot_id: interaction.contact_hubspot_id,
      type: engagementType,
      subject: interaction.subject || `${interaction.channel} interaction`,
      body: interaction.body_text || '',
      occurred_at: interaction.occurred_at,
    });

    return result.success;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const response = await this.client.get('/integrations/v1/me');
      this.logger.log(`HubSpot connected: Portal ID ${response.data.portalId}`);
      return true;
    } catch (error) {
      this.logger.error('HubSpot connection test failed', error);
      return false;
    }
  }
}