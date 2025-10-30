import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContributionsService } from '../contributions/contributions.service';
import { CreateContributionDto } from '../contributions/dto/contribution.dto';
import { PrismaService } from '../database/prisma.service';

interface WebhookEvent {
  objectId: string;
  objectType: string;
  eventType: string;
  properties?: any;
  occurredAt?: string;
  propertyName?: string;
  propertyValue?: any;
}

interface QueueStats {
  lastWebhook: string | null;
  lastWebhookAge: number;
  queueDepth: number;
  dlqDepth: number;
  processedTotal: number;
  failedTotal: number;
}

@Injectable()
export class HubSpotQueueService {
  private readonly logger = new Logger(HubSpotQueueService.name);
  private queue: Map<string, WebhookEvent[]> = new Map();
  private dlq: Array<{ event: WebhookEvent; error: string; timestamp: Date }> = [];
  private stats = {
    lastWebhook: null as Date | null,
    processedTotal: 0,
    failedTotal: 0,
  };
  private coalesceWindow = 120000; // 120 seconds
  private coalesceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly contributionsService: ContributionsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  async queueWebhookEvents(events: WebhookEvent[], timestamp: string): Promise<void> {
    this.stats.lastWebhook = new Date(timestamp || Date.now());
    
    for (const event of events) {
      const key = `${event.objectType}:${event.objectId}`;
      
      // Add to coalesce queue
      if (!this.queue.has(key)) {
        this.queue.set(key, []);
      }
      this.queue.get(key)!.push(event);
      
      // Clear existing timer
      if (this.coalesceTimers.has(key)) {
        clearTimeout(this.coalesceTimers.get(key)!);
      }
      
      // Set new timer to process after coalesce window
      const timer = setTimeout(() => {
        this.processCoalescedEvents(key);
      }, this.coalesceWindow);
      
      this.coalesceTimers.set(key, timer);
    }
  }

  private async processCoalescedEvents(key: string): Promise<void> {
    const events = this.queue.get(key);
    if (!events || events.length === 0) return;
    
    // Clear from queue
    this.queue.delete(key);
    this.coalesceTimers.delete(key);
    
    // Get the most recent event (they're coalesced)
    const latestEvent = events[events.length - 1];
    
    try {
      await this.processWebhookEvent(latestEvent);
      this.stats.processedTotal++;
    } catch (error) {
      this.logger.error(`Failed to process event: ${error.message}`, error.stack);
      this.stats.failedTotal++;
      this.dlq.push({
        event: latestEvent,
        error: error.message,
        timestamp: new Date(),
      });
      
      // Keep DLQ size limited
      if (this.dlq.length > 100) {
        this.dlq.shift();
      }
    }
  }

  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    const { objectType, eventType } = event;
    
    this.logger.log(`Processing ${eventType} for ${objectType} ${event.objectId}`);
    
    switch (objectType.toLowerCase()) {
      case 'contact':
        await this.handleContactEvent(event);
        break;
      case 'deal':
        await this.handleDealEvent(event);
        break;
      case 'company':
        await this.handleCompanyEvent(event);
        break;
      case 'ticket':
        await this.handleTicketEvent(event);
        break;
      default:
        this.logger.warn(`Unknown object type: ${objectType}`);
    }
    
    // Emit event for other services
    this.eventEmitter.emit('hubspot.webhook.processed', event);
  }

  async handleContactEvent(event: WebhookEvent): Promise<void> {
    const contribution = await this.upsertContribution({
      title: `Contact: ${event.properties?.firstname || ''} ${event.properties?.lastname || ''}`.trim() || 'New Contact',
      description: this.formatContactDescription(event.properties),
      category: 'Being',
      contributions: ['Expanding professional network', 'Building relationships'],
      impact: 'Growing connections and opportunities',
      commitment: 'Nurture professional relationships',
      tags: ['hubspot', 'contact', 'relationship'],
      visibility: 'private',
    });
  }

  async handleDealEvent(event: WebhookEvent): Promise<void> {
    const stage = event.properties?.dealstage || event.propertyValue || 'Unknown';
    const contribution = await this.upsertContribution({
      title: `Deal: ${event.properties?.dealname || 'Unnamed'} → ${stage}`,
      description: this.formatDealDescription(event.properties),
      category: 'Doing',
      contributions: ['Advancing sales opportunity', 'Building business relationships'],
      impact: 'Driving revenue growth and business development',
      commitment: 'Close deals and deliver value',
      tags: ['hubspot', 'deal', 'sales', 'progress'],
      visibility: 'private',
    });
  }

  async handleCompanyEvent(event: WebhookEvent): Promise<void> {
    const contribution = await this.upsertContribution({
      title: `Company: ${event.properties?.name || 'Unnamed'}`,
      description: this.formatCompanyDescription(event.properties),
      category: 'Having',
      contributions: ['Building company portfolio', 'Establishing organizational relationships'],
      impact: 'Expanding business network and opportunities',
      commitment: 'Foster strategic partnerships',
      tags: ['hubspot', 'company', 'portfolio', 'org'],
      visibility: 'private',
    });
  }

  async handleTicketEvent(event: WebhookEvent): Promise<void> {
    const contribution = await this.upsertContribution({
      title: `Ticket #${event.objectId}: ${event.properties?.subject || 'No Subject'}`,
      description: this.formatTicketDescription(event.properties),
      category: 'Doing',
      contributions: ['Providing customer support', 'Resolving issues'],
      impact: 'Improving customer satisfaction and retention',
      commitment: 'Deliver excellent support experiences',
      tags: ['hubspot', 'ticket', 'support'],
      visibility: 'private',
    });
  }

  private formatContactDescription(properties: any): string {
    const parts = [];
    if (properties?.email) parts.push(`Email: ${properties.email}`);
    if (properties?.phone) parts.push(`Phone: ${properties.phone}`);
    if (properties?.lifecyclestage) parts.push(`Lifecycle: ${properties.lifecyclestage}`);
    if (properties?.hs_lead_status) parts.push(`Status: ${properties.hs_lead_status}`);
    if (properties?.company) parts.push(`Company: ${properties.company}`);
    return parts.join('\n') || 'No details available';
  }

  private formatDealDescription(properties: any): string {
    const parts = [];
    if (properties?.amount) parts.push(`Amount: $${properties.amount}`);
    if (properties?.closedate) parts.push(`Close Date: ${properties.closedate}`);
    if (properties?.pipeline) parts.push(`Pipeline: ${properties.pipeline}`);
    if (properties?.dealstage) parts.push(`Stage: ${properties.dealstage}`);
    if (properties?.hs_forecast_probability) parts.push(`Probability: ${properties.hs_forecast_probability}%`);
    return parts.join('\n') || 'No details available';
  }

  private formatCompanyDescription(properties: any): string {
    const parts = [];
    if (properties?.domain) parts.push(`Domain: ${properties.domain}`);
    if (properties?.industry) parts.push(`Industry: ${properties.industry}`);
    if (properties?.numberofemployees) parts.push(`Employees: ${properties.numberofemployees}`);
    if (properties?.annualrevenue) parts.push(`Revenue: $${properties.annualrevenue}`);
    if (properties?.city && properties?.state) parts.push(`Location: ${properties.city}, ${properties.state}`);
    return parts.join('\n') || 'No details available';
  }

  private formatTicketDescription(properties: any): string {
    const parts = [];
    if (properties?.hs_ticket_priority) parts.push(`Priority: ${properties.hs_ticket_priority}`);
    if (properties?.hs_pipeline_stage) parts.push(`Status: ${properties.hs_pipeline_stage}`);
    if (properties?.hs_ticket_category) parts.push(`Category: ${properties.hs_ticket_category}`);
    if (properties?.content) parts.push(`Content: ${properties.content.substring(0, 200)}...`);
    return parts.join('\n') || 'No details available';
  }

  private async upsertContribution(dto: CreateContributionDto): Promise<any> {
    try {
      // For now, just create - in production, implement proper upsert by hubspotId
      // Note: The create method expects userId as first param
      const userId = 'system'; // System user for webhook-created contributions
      return await this.contributionsService.create(userId, dto);
    } catch (error) {
      this.logger.error('Failed to upsert contribution:', error);
      throw error;
    }
  }

  async getQueueStats(): Promise<QueueStats> {
    const now = Date.now();
    const lastWebhookAge = this.stats.lastWebhook 
      ? now - this.stats.lastWebhook.getTime()
      : Infinity;
    
    // Calculate queue depth
    let queueDepth = 0;
    for (const events of this.queue.values()) {
      queueDepth += events.length;
    }
    
    return {
      lastWebhook: this.stats.lastWebhook?.toISOString() || null,
      lastWebhookAge,
      queueDepth,
      dlqDepth: this.dlq.length,
      processedTotal: this.stats.processedTotal,
      failedTotal: this.stats.failedTotal,
    };
  }

  // Get DLQ contents for debugging
  getDeadLetterQueue(): Array<{ event: WebhookEvent; error: string; timestamp: Date }> {
    return [...this.dlq];
  }

  // Clear DLQ
  clearDeadLetterQueue(): void {
    this.dlq = [];
  }

  // Reprocess DLQ items
  async reprocessDeadLetterQueue(): Promise<void> {
    const items = [...this.dlq];
    this.dlq = [];
    
    for (const item of items) {
      try {
        await this.processWebhookEvent(item.event);
        this.stats.processedTotal++;
      } catch (error) {
        this.stats.failedTotal++;
        this.dlq.push({
          event: item.event,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }
  }
}