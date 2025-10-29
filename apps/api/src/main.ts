import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
  });
  
  // Raw body for webhook signature verification
  app.use('/api/integrations/hubspot/webhook', bodyParser.raw({ type: 'application/json' }));
  
  // JSON body for all other routes
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Enable CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  }));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🔥 WisdomOS API running on http://localhost:${port}`);
  console.log(`🌟 Phoenix has risen!`);
  console.log(`📮 HubSpot webhook endpoint: http://localhost:${port}/api/integrations/hubspot/webhook`);
}

bootstrap();