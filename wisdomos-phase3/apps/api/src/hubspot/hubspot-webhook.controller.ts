import { Controller, Post, Get, Body, Headers, HttpCode, HttpStatus, BadRequestException, UnauthorizedException, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { HubSpotQueueService } from './hubspot-queue.service';
import { HubSpotSyncService } from './hubspot-sync.service';

@Controller('integrations/hubspot')
export class HubSpotWebhookController {
  constructor(
    private readonly queueService: HubSpotQueueService,
    private readonly syncService: HubSpotSyncService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hubspot-signature-v3') signature: string,
    @Headers('x-hubspot-request-timestamp') timestamp: string,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing signature');
    }

    // Get raw body for signature verification
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body required');
    }

    // Verify signature
    const isValid = this.verifyWebhookSignature(
      req.method,
      req.originalUrl || req.url,
      rawBody.toString('utf8'),
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Parse the body
    const events = JSON.parse(rawBody.toString('utf8'));

    // Fast acknowledge - queue for processing
    await this.queueService.queueWebhookEvents(events, timestamp);

    return { status: 'queued', count: events.length };
  }

  @Get('health')
  async checkHealth() {
    try {
      const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_PRIVATE_APP_TOKEN;
      const webhookSecret = process.env.HUBSPOT_APP_SECRET;
      
      // Check configuration
      const configured = !!(hubspotToken && webhookSecret);
      
      // Get queue stats
      const queueStats = await this.queueService.getQueueStats();
      
      // Check HubSpot API connectivity
      let apiConnected = false;
      if (hubspotToken) {
        try {
          apiConnected = await this.syncService.testConnection();
        } catch (error) {
          console.error('HubSpot API test failed:', error);
        }
      }

      // Determine overall health
      const healthy = configured && 
                     apiConnected && 
                     queueStats.queueDepth < 50 && 
                     queueStats.dlqDepth < 5 &&
                     queueStats.lastWebhookAge < 300000; // 5 minutes

      return {
        connected: healthy,
        configured,
        apiConnected,
        webhookStatus: healthy ? 'connected' : configured ? 'disconnected' : 'error',
        lastWebhook: queueStats.lastWebhook,
        lastWebhookAge: queueStats.lastWebhookAge,
        queueDepth: queueStats.queueDepth,
        dlqDepth: queueStats.dlqDepth,
        processedTotal: queueStats.processedTotal,
        failedTotal: queueStats.failedTotal,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        connected: false,
        configured: false,
        webhookStatus: 'error',
        error: error.message,
      };
    }
  }

  @Post('sync/contacts')
  @HttpCode(HttpStatus.OK)
  async syncContacts(@Body() body: { userId?: string }) {
    const result = await this.syncService.syncContacts(body.userId);
    return {
      success: true,
      type: 'contacts',
      synced: result.synced,
      timestamp: new Date().toISOString(),
      userId: body.userId,
    };
  }

  @Post('sync/deals')
  @HttpCode(HttpStatus.OK)
  async syncDeals(@Body() body: { userId?: string }) {
    const result = await this.syncService.syncDeals(body.userId);
    return {
      success: true,
      type: 'deals',
      synced: result.synced,
      timestamp: new Date().toISOString(),
      userId: body.userId,
    };
  }

  @Post('sync/companies')
  @HttpCode(HttpStatus.OK)
  async syncCompanies(@Body() body: { userId?: string }) {
    const result = await this.syncService.syncCompanies(body.userId);
    return {
      success: true,
      type: 'companies',
      synced: result.synced,
      timestamp: new Date().toISOString(),
      userId: body.userId,
    };
  }

  @Post('sync/tickets')
  @HttpCode(HttpStatus.OK)
  async syncTickets(@Body() body: { userId?: string }) {
    const result = await this.syncService.syncTickets(body.userId);
    return {
      success: true,
      type: 'tickets',
      synced: result.synced,
      timestamp: new Date().toISOString(),
      userId: body.userId,
    };
  }

  @Post('sync/all')
  @HttpCode(HttpStatus.OK)
  async syncAll(@Body() body: { userId?: string }) {
    const [contacts, deals, companies, tickets] = await Promise.all([
      this.syncService.syncContacts(body.userId),
      this.syncService.syncDeals(body.userId),
      this.syncService.syncCompanies(body.userId),
      this.syncService.syncTickets(body.userId),
    ]);

    const total = contacts.synced + deals.synced + companies.synced + tickets.synced;

    return {
      success: true,
      type: 'all',
      synced: total,
      details: {
        contacts: contacts.synced,
        deals: deals.synced,
        companies: companies.synced,
        tickets: tickets.synced,
      },
      timestamp: new Date().toISOString(),
      userId: body.userId,
    };
  }

  private verifyWebhookSignature(
    method: string,
    url: string,
    body: string,
    signature: string,
  ): boolean {
    const secret = process.env.HUBSPOT_APP_SECRET;
    if (!secret) {
      console.error('HUBSPOT_APP_SECRET not configured');
      return false;
    }

    // Construct the full URL
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://localhost:3000';
    const fullUrl = url.startsWith('http') ? url : `${publicBaseUrl}${url}`;
    
    // Compute signature: METHOD + URL + BODY
    const sourceString = method.toUpperCase() + fullUrl + body;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(sourceString, 'utf8')
      .digest('base64');

    // Timing-safe comparison
    try {
      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(signature),
      );
    } catch (error) {
      console.error('Signature comparison failed:', error);
      return false;
    }
  }
}