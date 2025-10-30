import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PrismaModule } from './database/prisma.module';
import { JournalModule } from './journal/journal.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { LifeAreasModule } from './life-areas/life-areas.module';
import { ResetsModule } from './resets/resets.module';
import { BadgesModule } from './badges/badges.module';
import { AutobiographyModule } from './autobiography/autobiography.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContributionModule } from './contribution/contribution.module';
import { ContributionsModule } from './contributions/contributions.module';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { AssessmentModule } from './assessment/assessment.module';
import { HubSpotModule } from './hubspot/hubspot.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    DatabaseModule,
    AuthModule,
    DashboardModule,
    JournalModule,
    LifeAreasModule,
    ResetsModule,
    BadgesModule,
    AutobiographyModule,
    ContactsModule,
    ContributionModule,
    ContributionsModule,
    FulfillmentModule,
    AssessmentModule,
    HubSpotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}