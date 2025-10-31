import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { 
      status: 'ok',
      message: '🔥 Phoenix is rising!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getInfo() {
    return {
      name: 'WisdomOS API',
      version: '0.1.0',
      description: 'Phoenix Operating System for Life Transformation',
      endpoints: {
        health: '/api/health',
        dashboard: '/api/dashboard',
        journal: '/api/journal',
        lifeAreas: '/api/life-areas',
        resets: '/api/resets',
        badges: '/api/badges',
      },
    };
  }
}