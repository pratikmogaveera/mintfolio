import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PortfolioProcessor } from './portfolio.processor';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger('JobsService');

  constructor(
    private pfProcessor: PortfolioProcessor,
    private redis: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_5AM, { name: 'Daily scheme-list refresh', timeZone: 'Asia/Kolkata' })
  async populateSchemeList() {
    this.logger.log('Cron triggered: scheme-list refresh');
    await this.redis.populateCachedScheme(true);
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { name: 'Daily portfolio process', timeZone: 'Asia/Kolkata' })
  async portfolioProcessTest() {
    this.logger.log('Cron triggered: portfolio process');
    await this.pfProcessor.processPortfolios();
  }
}
