import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ContributionsService } from '../contributions/contributions.service';
import { HubSpotQueueService } from './hubspot-queue.service';
import { PrismaService } from '../database/prisma.service';

interface SyncResult {
  synced: number;
  cursor?: string;
}

interface HubSpotObject {
  id: string;
  properties: any;
  createdAt: string;
  updatedAt: string;
}

interface HubSpotListResponse {
  results: HubSpotObject[];
  total?: number;
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

@Injectable()
export class HubSpotSyncService {
  private readonly logger = new Logger(HubSpotSyncService.name);
  private readonly hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_PRIVATE_APP_TOKEN || process.env.HUBSPOT_PRIVATE_APP_KEY;
  private readonly apiUrl = 'https://api.hubapi.com';
  private axiosInstance: AxiosInstance;

  constructor(
    private readonly contributionsService: ContributionsService,
    private readonly queueService: HubSpotQueueService,
    private readonly prisma: PrismaService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: this.getHeaders(),
      timeout: 30000,
    });

    // Add retry logic for rate limiting
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 10;
          this.logger.warn(`Rate limited, retrying after ${retryAfter} seconds`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.axiosInstance.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.hubspotToken}`,
      'Content-Type': 'application/json',
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/crm/v3/owners', {
        params: { limit: 1 }
      });
      return response.status === 200;
    } catch (error) {
      this.logger.error('HubSpot connection test failed:', error.message);
      return false;
    }
  }

  async syncContacts(userId?: string): Promise<SyncResult> {
    return this.syncObjects('contacts', userId);
  }

  async syncDeals(userId?: string): Promise<SyncResult> {
    return this.syncObjects('deals', userId);
  }

  async syncCompanies(userId?: string): Promise<SyncResult> {
    return this.syncObjects('companies', userId);
  }

  async syncTickets(userId?: string): Promise<SyncResult> {
    return this.syncObjects('tickets', userId);
  }

  private async syncObjects(objectType: string, userId?: string): Promise<SyncResult> {
    let synced = 0;
    let after: string | undefined;
    const limit = 100;
    const maxPages = 50; // Safety limit

    // Get last cursor from database
    const lastCursor = await this.getLastCursor(objectType);
    if (lastCursor) {
      after = lastCursor;
      this.logger.log(`Resuming ${objectType} sync from cursor: ${after}`);
    }

    let pageCount = 0;
    do {
      try {
        const url = `/crm/v3/objects/${objectType}`;
        const params: any = {
          limit,
          properties: this.getPropertiesForObjectType(objectType),
        };
        
        if (after) {
          params.after = after;
        }

        // Add modified date filter for incremental sync
        const lastSyncTime = await this.getLastSyncTime(objectType);
        if (lastSyncTime && !after) {
          // Only use time filter if not resuming from cursor
          params.filterGroups = [{
            filters: [{
              propertyName: 'hs_lastmodifieddate',
              operator: 'GT',
              value: lastSyncTime.getTime()
            }]
          }];
        }

        const response = await this.axiosInstance.get<HubSpotListResponse>(url, { params });
        const { results, paging } = response.data;

        // Process each object
        for (const obj of results) {
          await this.processHubSpotObject(objectType, obj, userId);
          synced++;
        }

        // Update cursor and sync time
        after = paging?.next?.after;
        if (after) {
          await this.saveLastCursor(objectType, after);
        } else {
          // Clear cursor and update sync time when complete
          await this.clearCursor(objectType);
          await this.updateLastSyncTime(objectType);
        }

        pageCount++;
        this.logger.log(`Synced page ${pageCount} of ${objectType}: ${results.length} items`);

      } catch (error) {
        this.logger.error(`Failed to sync ${objectType}:`, error.message);
        // Save progress even on error
        if (after) {
          await this.saveLastCursor(objectType, after);
        }
        break;
      }
    } while (after && pageCount < maxPages);

    this.logger.log(`Completed ${objectType} sync: ${synced} items`);
    return { synced, cursor: after };
  }

  private getPropertiesForObjectType(objectType: string): string {
    switch (objectType) {
      case 'contacts':
        return 'firstname,lastname,email,phone,lifecyclestage,hs_lead_status,company,hs_lastmodifieddate';
      case 'deals':
        return 'dealname,amount,closedate,dealstage,pipeline,hs_forecast_probability,hs_lastmodifieddate';
      case 'companies':
        return 'name,domain,industry,numberofemployees,annualrevenue,city,state,hs_lastmodifieddate';
      case 'tickets':
        return 'subject,hs_ticket_priority,hs_pipeline_stage,hs_ticket_category,content,hs_lastmodifieddate';
      default:
        return 'hs_lastmodifieddate';
    }
  }

  private async processHubSpotObject(objectType: string, obj: HubSpotObject, userId?: string): Promise<void> {
    const event = {
      objectId: obj.id,
      objectType,
      eventType: `${objectType}.sync`,
      properties: obj.properties,
      occurredAt: obj.updatedAt || new Date().toISOString(),
    };

    // Use the queue service to handle the object
    try {
      switch (objectType) {
        case 'contacts':
          await this.queueService.handleContactEvent(event);
          break;
        case 'deals':
          await this.queueService.handleDealEvent(event);
          break;
        case 'companies':
          await this.queueService.handleCompanyEvent(event);
          break;
        case 'tickets':
          await this.queueService.handleTicketEvent(event);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to process ${objectType} ${obj.id}:`, error.message);
    }
  }

  // Cursor management methods
  private async getLastCursor(objectType: string): Promise<string | null> {
    try {
      // In production, implement with Prisma:
      // const cursor = await this.prisma.integrationCursor.findUnique({
      //   where: { objectType }
      // });
      // return cursor?.lastAfter || null;
      
      // For now, return null
      return null;
    } catch (error) {
      this.logger.error(`Failed to get cursor for ${objectType}:`, error);
      return null;
    }
  }

  private async saveLastCursor(objectType: string, cursor: string): Promise<void> {
    try {
      // In production, implement with Prisma:
      // await this.prisma.integrationCursor.upsert({
      //   where: { objectType },
      //   update: { lastAfter: cursor, updatedAt: new Date() },
      //   create: { objectType, lastAfter: cursor }
      // });
      
      this.logger.debug(`Saved cursor for ${objectType}: ${cursor}`);
    } catch (error) {
      this.logger.error(`Failed to save cursor for ${objectType}:`, error);
    }
  }

  private async clearCursor(objectType: string): Promise<void> {
    try {
      // In production, implement with Prisma:
      // await this.prisma.integrationCursor.update({
      //   where: { objectType },
      //   data: { lastAfter: null }
      // });
      
      this.logger.debug(`Cleared cursor for ${objectType}`);
    } catch (error) {
      this.logger.error(`Failed to clear cursor for ${objectType}:`, error);
    }
  }

  private async getLastSyncTime(objectType: string): Promise<Date | null> {
    try {
      // In production, implement with Prisma:
      // const cursor = await this.prisma.integrationCursor.findUnique({
      //   where: { objectType }
      // });
      // return cursor?.lastSyncedAt || null;
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to get last sync time for ${objectType}:`, error);
      return null;
    }
  }

  private async updateLastSyncTime(objectType: string): Promise<void> {
    try {
      // In production, implement with Prisma:
      // await this.prisma.integrationCursor.upsert({
      //   where: { objectType },
      //   update: { lastSyncedAt: new Date() },
      //   create: { objectType, lastSyncedAt: new Date() }
      // });
      
      this.logger.debug(`Updated last sync time for ${objectType}`);
    } catch (error) {
      this.logger.error(`Failed to update last sync time for ${objectType}:`, error);
    }
  }

  // Get statistics for the UI
  async getStats(): Promise<any> {
    try {
      const [contacts, deals, companies, tickets] = await Promise.all([
        this.axiosInstance.get('/crm/v3/objects/contacts', { params: { limit: 1 } }),
        this.axiosInstance.get('/crm/v3/objects/deals', { params: { limit: 1 } }),
        this.axiosInstance.get('/crm/v3/objects/companies', { params: { limit: 1 } }),
        this.axiosInstance.get('/crm/v3/objects/tickets', { params: { limit: 1 } }),
      ]);

      return {
        totalContacts: contacts.data.total || 0,
        totalDeals: deals.data.total || 0,
        totalCompanies: companies.data.total || 0,
        totalTickets: tickets.data.total || 0,
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get stats:', error.message);
      return {
        totalContacts: 0,
        totalDeals: 0,
        totalCompanies: 0,
        totalTickets: 0,
        error: error.message,
      };
    }
  }
}