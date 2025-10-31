import { Module } from '@nestjs/common';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { FulfillmentMirrorService } from './fulfillment-mirror.service';

@Module({
  controllers: [ContributionsController],
  providers: [ContributionsService, FulfillmentMirrorService],
  exports: [ContributionsService],
})
export class ContributionsModule {}