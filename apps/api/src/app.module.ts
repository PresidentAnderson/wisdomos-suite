import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JournalModule } from './journal/journal.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { LifeAreasModule } from './life-areas/life-areas.module';
import { ResetsModule } from './resets/resets.module';
import { BadgesModule } from './badges/badges.module';

@Module({
  imports: [
    AuthModule,
    DashboardModule,
    JournalModule,
    LifeAreasModule,
    ResetsModule,
    BadgesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}