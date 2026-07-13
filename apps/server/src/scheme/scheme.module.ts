import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { SchemeController } from './scheme.controller';
import { SchemeService } from './scheme.service';

@Module({
  imports: [RedisModule],
  providers: [SchemeService],
  controllers: [SchemeController],
})
export class SchemeModule {}
