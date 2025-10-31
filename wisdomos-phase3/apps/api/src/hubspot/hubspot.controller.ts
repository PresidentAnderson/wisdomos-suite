import { 
  Controller, 
  Post, 
  Get,
  Body, 
  Headers,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HubSpotWebhookService } from './hubspot-webhook.service';
import { HubSpotService } from './hubspot.service';

@Controller('api/hubspot')
export class HubSpotController {
  private readonly logger = new Logger(HubSpotController.name);

  constructor(
    private readonly hubspotWebhookService: HubSpotWebhookService,
    private readonly hubspotService: HubSpotService,
  ) {}

  /**
   * Webhook endpoint for HubSpot events
   * Receives events when contacts, deals, or other objects change
   */
  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-hubspot-signature') signature: string,
  ) {
    try {
      // Verify webhook signature for security
      const isValid = await this.hubspotWebhookService.verifyWebhookSignature(
        payload,
        signature,
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature received');
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }

      // Process webhook events
      const results = await this.hubspotWebhookService.processWebhookEvents(payload);

      return {
        success: true,
        processed: results.length,
        results,
      };
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      throw new HttpException(
        error.message || 'Webhook processing failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sync contacts from HubSpot
   */
  @Post('sync/contacts')
  async syncContacts(@Body() body: { userId: string }) {
    try {
      const contacts = await this.hubspotService.syncContacts(body.userId);
      return {
        success: true,
        synced: contacts.length,
        contacts,
      };
    } catch (error) {
      this.logger.error('Contact sync error:', error);
      throw new HttpException(
        'Failed to sync contacts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sync deals from HubSpot
   */
  @Post('sync/deals')
  async syncDeals(@Body() body: { userId: string }) {
    try {
      const deals = await this.hubspotService.syncDeals(body.userId);
      return {
        success: true,
        synced: deals.length,
        deals,
      };
    } catch (error) {
      this.logger.error('Deal sync error:', error);
      throw new HttpException(
        'Failed to sync deals',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get webhook configuration status
   */
  @Get('webhook/status')
  async getWebhookStatus() {
    try {
      const status = await this.hubspotWebhookService.getWebhookStatus();
      return {
        success: true,
        ...status,
      };
    } catch (error) {
      this.logger.error('Status check error:', error);
      throw new HttpException(
        'Failed to get webhook status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Register webhook subscriptions with HubSpot
   */
  @Post('webhook/register')
  async registerWebhooks() {
    try {
      const result = await this.hubspotWebhookService.registerWebhookSubscriptions();
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error('Webhook registration error:', error);
      throw new HttpException(
        'Failed to register webhooks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}