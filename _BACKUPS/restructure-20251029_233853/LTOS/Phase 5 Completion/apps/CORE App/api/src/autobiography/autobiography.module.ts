import { Module } from '@nestjs/common';
import { AutobiographyController } from './autobiography.controller';
import { AutobiographyService } from './autobiography.service';

@Module({
  controllers: [AutobiographyController],
  providers: [AutobiographyService],
  exports: [AutobiographyService],
})
export class AutobiographyModule {}