import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HubSpotController } from './hubspot.controller';
import { HubSpotWebhookController } from './hubspot-webhook.controller';
import { HubSpotService } from './hubspot.service';
import { HubSpotWebhookService } from './hubspot-webhook.service';
import { HubSpotQueueService } from './hubspot-queue.service';
import { HubSpotSyncService } from './hubspot-sync.service';
import { ContributionsModule } from '../contributions/contributions.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ContributionsModule,
    DatabaseModule,
    HttpModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [HubSpotController, HubSpotWebhookController],
  providers: [
    HubSpotService,
    HubSpotWebhookService,
    HubSpotQueueService,
    HubSpotSyncService,
  ],
  exports: [
    HubSpotService,
    HubSpotWebhookService,
    HubSpotQueueService,
    HubSpotSyncService,
  ],
})
export class HubSpotModule {}