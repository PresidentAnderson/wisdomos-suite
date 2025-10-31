/**
 * @fileoverview WisdomOS API Main Entry Point
 * @author Jonathan Anderson <contact@axaiinnovations.com>
 * @license PROPRIETARY - All rights reserved. Unauthorized copying or distribution is prohibited.
 * @copyright © 2025 AXAI Innovations. Phoenix Operating System.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  
  try {
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Get configuration service
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 4000);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [\"'self'\"],
          styleSrc: [\"'self'\", \"'unsafe-inline'\"],
          scriptSrc: [\"'self'\"],
          imgSrc: [\"'self'\", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // Compression middleware
    app.use(compression());

    // Cookie parser middleware
    app.use(cookieParser());

    // CORS configuration
    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    });

    // Global prefix for API routes
    app.setGlobalPrefix('api', {
      exclude: ['health', 'metrics'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: nodeEnv === 'production',
      }),
    );

    // Global filters
    app.useGlobalFilters(
      new HttpExceptionFilter(),
      new PrismaExceptionFilter(),
    );

    // Global interceptors
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );

    // Swagger/OpenAPI documentation (only in non-production)
    if (nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('WisdomOS API')
        .setDescription('Phoenix Transformation System - Backend API')
        .setVersion('1.0.0')
        .setContact(
          'Jonathan Anderson',
          'https://github.com/presidentanderson/wisdomos-api',
          'contact@axaiinnovations.com',
        )
        .setLicense('PROPRIETARY', 'All rights reserved')
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('transformations', 'Transformation management')
        .addTag('phoenix', 'Phoenix lifecycle')
        .addTag('progress', 'Progress tracking')
        .addTag('analytics', 'Analytics and insights')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'jwt',
        )
        .addCookieAuth('access-token')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'WisdomOS API Documentation',
        customfavIcon: '/favicon.ico',
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
        },
      });

      logger.log(`📚 API Documentation available at http://localhost:${port}/docs`);
    }

    // Graceful shutdown handlers
    const shutdown = async (signal: string): Promise<void> => {
      logger.log(`🛑 Received ${signal}, shutting down gracefully...`);
      
      // Close the application
      await app.close();
      
      logger.log('✅ Application closed successfully');
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));

    // Start the server
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 WisdomOS API is running on http://localhost:${port}`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
    logger.log(`🔥 Phoenix transformation system is ready!`);

    // Health check endpoint info
    logger.log(`❤️  Health check available at http://localhost:${port}/health`);
    
  } catch (error) {
    logger.error('❌ Failed to start the application', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Bootstrap the application
void bootstrap();