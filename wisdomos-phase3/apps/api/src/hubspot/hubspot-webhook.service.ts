import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ContributionsService } from '../contributions/contributions.service';

interface WebhookEvent {
  eventType: string;
  objectType: string;
  objectId: string;
  propertyName?: string;
  propertyValue?: any;
  changeSource: string;
  occurredAt: number;
  subscriptionId: number;
  portalId: number;
}

@Injectable()
export class HubSpotWebhookService {
  private readonly logger = new Logger(HubSpotWebhookService.name);
  private readonly hubspotKey = process.env.HUBSPOT_PRIVATE_APP_KEY;
  private readonly webhookUrl = process.env.WEBHOOK_URL || 'https://wisdomos-phoenix-frontend.vercel.app/api/hubspot/webhook';

  constructor(
    private readonly contributionsService: ContributionsService,
  ) {}

  /**
   * Verify webhook signature from HubSpot
   */
  async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    if (!signature || !this.hubspotKey) {
      return false;
    }

    const hash = crypto
      .createHash('sha256')
      .update(this.hubspotKey + JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  /**
   * Process incoming webhook events
   */
  async processWebhookEvents(payload: WebhookEvent[]): Promise<any[]> {
    const results = [];

    for (const event of payload) {
      try {
        const result = await this.processEvent(event);
        results.push({
          eventType: event.eventType,
          objectType: event.objectType,
          objectId: event.objectId,
          success: true,
          result,
        });
      } catch (error) {
        this.logger.error(`Failed to process event ${event.eventType}:`, error);
        results.push({
          eventType: event.eventType,
          objectType: event.objectType,
          objectId: event.objectId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Process individual webhook event
   */
  private async processEvent(event: WebhookEvent): Promise<any> {
    this.logger.log(`Processing ${event.eventType} for ${event.objectType} ${event.objectId}`);

    switch (event.objectType) {
      case 'CONTACT':
        return this.processContactEvent(event);
      case 'DEAL':
        return this.processDealEvent(event);
      case 'COMPANY':
        return this.processCompanyEvent(event);
      case 'TICKET':
        return this.processTicketEvent(event);
      default:
        this.logger.warn(`Unhandled object type: ${event.objectType}`);
        return { processed: false, reason: 'Unhandled object type' };
    }
  }

  /**
   * Process contact-related events
   */
  private async processContactEvent(event: WebhookEvent): Promise<any> {
    switch (event.eventType) {
      case 'contact.creation':
        return this.handleContactCreation(event);
      case 'contact.propertyChange':
        return this.handleContactPropertyChange(event);
      case 'contact.deletion':
        return this.handleContactDeletion(event);
      default:
        return { processed: false, reason: 'Unhandled contact event' };
    }
  }

  /**
   * Process deal-related events
   */
  private async processDealEvent(event: WebhookEvent): Promise<any> {
    switch (event.eventType) {
      case 'deal.creation':
        return this.handleDealCreation(event);
      case 'deal.propertyChange':
        if (event.propertyName === 'dealstage') {
          return this.handleDealStageChange(event);
        }
        return this.handleDealPropertyChange(event);
      case 'deal.deletion':
        return this.handleDealDeletion(event);
      default:
        return { processed: false, reason: 'Unhandled deal event' };
    }
  }

  /**
   * Process company-related events
   */
  private async processCompanyEvent(event: WebhookEvent): Promise<any> {
    // Create contribution for new company relationships
    if (event.eventType === 'company.creation') {
      const contribution = {
        category: 'Doing' as 'Being' | 'Doing' | 'Having',
        title: 'New Business Partnership',
        description: `Established relationship with company ${event.objectId}`,
        contributions: ['Building business network', 'Expanding partnerships'],
        impact: 'Growing professional network',
        commitment: 'Maintain and nurture business relationships',
        tags: ['business', 'networking', 'partnership'],
        visibility: 'private' as 'private' | 'shared' | 'public',
      };

      // Note: In production, you'd need to get the actual userId from HubSpot association
      this.logger.log('Company event - contribution would be created');
      return { processed: true, contribution: 'pending' };
    }

    return { processed: false, reason: 'Unhandled company event' };
  }

  /**
   * Process ticket-related events
   */
  private async processTicketEvent(event: WebhookEvent): Promise<any> {
    if (event.eventType === 'ticket.creation') {
      this.logger.log(`New support ticket created: ${event.objectId}`);
      return { processed: true, type: 'support_ticket' };
    }
    return { processed: false, reason: 'Unhandled ticket event' };
  }

  /**
   * Handle contact creation
   */
  private async handleContactCreation(event: WebhookEvent): Promise<any> {
    this.logger.log(`New contact created: ${event.objectId}`);
    
    // Create a contribution for relationship building
    const contribution = {
      category: 'Being' as 'Being' | 'Doing' | 'Having',
      title: 'New Professional Connection',
      description: `Connected with contact ${event.objectId}`,
      contributions: ['Expanding network', 'Building relationships'],
      impact: 'Growing professional connections',
      commitment: 'Nurture new relationships',
      tags: ['networking', 'relationships', 'professional'],
      visibility: 'private' as 'private' | 'shared' | 'public',
    };

    return { processed: true, type: 'contact_creation', contribution: 'pending' };
  }

  /**
   * Handle contact property changes
   */
  private async handleContactPropertyChange(event: WebhookEvent): Promise<any> {
    this.logger.log(`Contact ${event.objectId} property changed: ${event.propertyName} = ${event.propertyValue}`);
    
    // Track significant property changes
    const significantProperties = ['lifecyclestage', 'lead_status', 'hs_lead_status'];
    
    if (significantProperties.includes(event.propertyName || '')) {
      return { 
        processed: true, 
        type: 'significant_change',
        property: event.propertyName,
        value: event.propertyValue,
      };
    }

    return { processed: true, type: 'property_change' };
  }

  /**
   * Handle contact deletion
   */
  private async handleContactDeletion(event: WebhookEvent): Promise<any> {
    this.logger.log(`Contact deleted: ${event.objectId}`);
    return { processed: true, type: 'contact_deletion' };
  }

  /**
   * Handle deal creation
   */
  private async handleDealCreation(event: WebhookEvent): Promise<any> {
    this.logger.log(`New deal created: ${event.objectId}`);
    
    // Create a contribution for business achievement
    const contribution = {
      category: 'Having' as 'Being' | 'Doing' | 'Having',
      title: 'New Business Opportunity',
      description: `Created new deal opportunity ${event.objectId}`,
      contributions: ['Generating revenue', 'Creating business value'],
      impact: 'Financial growth and stability',
      commitment: 'Close deals successfully',
      tags: ['business', 'revenue', 'sales'],
      visibility: 'private' as 'private' | 'shared' | 'public',
    };

    return { processed: true, type: 'deal_creation', contribution: 'pending' };
  }

  /**
   * Handle deal stage changes
   */
  private async handleDealStageChange(event: WebhookEvent): Promise<any> {
    this.logger.log(`Deal ${event.objectId} stage changed to: ${event.propertyValue}`);
    
    // Track deal progression
    if (event.propertyValue === 'closedwon') {
      // Create achievement contribution
      const contribution = {
        category: 'Having' as 'Being' | 'Doing' | 'Having',
        title: 'Deal Closed Successfully',
        description: `Successfully closed deal ${event.objectId}`,
        contributions: ['Achieving sales goals', 'Growing revenue'],
        impact: 'Business growth and success',
        commitment: 'Continue delivering value',
        tags: ['achievement', 'sales', 'success'],
        visibility: 'shared' as 'private' | 'shared' | 'public',
      };

      return { processed: true, type: 'deal_won', contribution: 'pending' };
    }

    return { processed: true, type: 'stage_change', stage: event.propertyValue };
  }

  /**
   * Handle deal property changes
   */
  private async handleDealPropertyChange(event: WebhookEvent): Promise<any> {
    this.logger.log(`Deal ${event.objectId} property changed: ${event.propertyName} = ${event.propertyValue}`);
    return { processed: true, type: 'deal_property_change' };
  }

  /**
   * Handle deal deletion
   */
  private async handleDealDeletion(event: WebhookEvent): Promise<any> {
    this.logger.log(`Deal deleted: ${event.objectId}`);
    return { processed: true, type: 'deal_deletion' };
  }

  /**
   * Get webhook subscription status
   */
  async getWebhookStatus(): Promise<any> {
    return {
      configured: !!this.hubspotKey,
      webhookUrl: this.webhookUrl,
      subscriptions: [
        'contact.creation',
        'contact.propertyChange',
        'contact.deletion',
        'deal.creation',
        'deal.propertyChange',
        'deal.deletion',
        'company.creation',
        'ticket.creation',
      ],
    };
  }

  /**
   * Register webhook subscriptions with HubSpot
   */
  async registerWebhookSubscriptions(): Promise<any> {
    if (!this.hubspotKey) {
      throw new Error('HubSpot private app key not configured');
    }

    // In production, you would make API calls to HubSpot to register webhooks
    // This is a placeholder showing the subscription structure
    const subscriptions = [
      {
        eventType: 'contact.creation',
        propertyName: null,
        active: true,
      },
      {
        eventType: 'contact.propertyChange',
        propertyName: 'lifecyclestage',
        active: true,
      },
      {
        eventType: 'deal.creation',
        propertyName: null,
        active: true,
      },
      {
        eventType: 'deal.propertyChange',
        propertyName: 'dealstage',
        active: true,
      },
      {
        eventType: 'company.creation',
        propertyName: null,
        active: true,
      },
      {
        eventType: 'ticket.creation',
        propertyName: null,
        active: true,
      },
    ];

    this.logger.log('Webhook subscriptions registered (mock)');

    return {
      registered: true,
      subscriptions,
      webhookUrl: this.webhookUrl,
    };
  }
}