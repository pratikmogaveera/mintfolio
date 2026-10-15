import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { PortfolioProcessor } from './portfolio.processor';

@Injectable()
export class JobsService {
  private readonly logger = new Logger('JobsService');

  constructor(
    private pfProcessor: PortfolioProcessor,
    private redis: RedisService,
  ) {}

  // mfapi.in NAV update schedule (IST): 3:09 AM, 5:05 AM, 10:05 AM, 2:05 PM, 6:05 PM, 9:05 PM.
  // We refresh at 6 AM to pick up the 5:05 AM update — the freshest data available
  // before the 9 AM portfolio process runs.
  @Cron(CronExpression.EVERY_DAY_AT_6AM, { name: 'Daily scheme-list refresh', timeZone: 'Asia/Kolkata' })
  async populateSchemeList() {
    this.logger.log('Cron triggered: scheme-list refresh');
    await this.redis.populateCachedScheme(true);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM, { name: 'Daily portfolio process', timeZone: 'Asia/Kolkata' })
  async portfolioProcess() {
    this.logger.log('Cron triggered: portfolio process');
    await this.pfProcessor.processPortfolios();
  }
}
