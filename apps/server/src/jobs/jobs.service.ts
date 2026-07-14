import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PortfolioProcessor } from './portfolio.processor';

@Injectable()
export class JobsService {
  private readonly logger = new Logger('JobsService');

  constructor(private pfProcessor: PortfolioProcessor) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'test' })
  async portfolioProcessTest() {
    this.logger.log('Cron triggered: portfolio process');
    await this.pfProcessor.processPortfolios();
  }
}
