import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MemoryDatabaseService } from './memory-database.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [DatabaseService, MemoryDatabaseService, PrismaService],
  exports: [DatabaseService, MemoryDatabaseService, PrismaService],
})
export class DatabaseModule {}