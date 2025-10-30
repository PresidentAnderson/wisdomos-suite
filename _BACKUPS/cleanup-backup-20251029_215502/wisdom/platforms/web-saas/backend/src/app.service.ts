import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'WisdomOS API - Rise into Fulfillment';
  }
}