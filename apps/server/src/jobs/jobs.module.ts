import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { RedisModule } from '../redis/redis.module';
import { JobsService } from './jobs.service';
import { PortfolioProcessor } from './portfolio.processor';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [JobsService, PortfolioProcessor],
})
export class JobsModule {}
