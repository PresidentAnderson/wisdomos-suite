/**
 * @fileoverview WisdomOS API Root Application Module
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { redisStore } from 'cache-manager-redis-store';

// Core modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransformationsModule } from './transformations/transformations.module';
import { PhoenixModule } from './phoenix/phoenix.module';
import { ProgressModule } from './progress/progress.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { TrpcModule } from './trpc/trpc.module';

// Guards
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// Configuration
import { databaseConfig } from './config/database.config';
import { authConfig } from './config/auth.config';
import { redisConfig } from './config/redis.config';
import { appConfig } from './config/app.config';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration module - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 10, // 10 requests per second
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: 50, // 50 requests per 10 seconds
        },
        {
          name: 'long',
          ttl: 60000, // 1 minute
          limit: configService.get<number>('throttle.ttl', 100), // 100 requests per minute
        },
      ],
    }),

    // Caching with Redis
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url');
        
        if (redisUrl) {
          return {
            store: redisStore as any,
            url: redisUrl,
            ttl: 300, // 5 minutes default
            max: 1000, // Maximum number of items in cache
          };
        }
        
        // Fallback to memory cache if Redis is not available
        return {
          ttl: 300,
          max: 100,
        };
      },
      isGlobal: true,
    }),

    // Scheduling for background tasks
    ScheduleModule.forRoot(),

    // Event system for loose coupling
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Core application modules
    DatabaseModule,
    AuthModule,
    UsersModule,
    TransformationsModule,
    PhoenixModule,
    ProgressModule,
    AnalyticsModule,
    NotificationsModule,
    HealthModule,
    TrpcModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    
    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],

  exports: [AppService],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {
    // Log configuration on startup (without sensitive data)
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const port = this.configService.get<number>('PORT', 4000);
    const databaseUrl = this.configService.get<string>('database.url');
    
    console.log('🔧 Application Configuration:');
    console.log(`   Environment: ${nodeEnv}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${databaseUrl ? '✅ Connected' : '❌ Not configured'}`);
    
    // Validate required environment variables
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
    ];
    
    const missing = requiredVars.filter(key => !this.configService.get(key));
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing.join(', '));
      if (nodeEnv === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    }
  }
}