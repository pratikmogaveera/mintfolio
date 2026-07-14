import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../db/database.service';
import { holdings, portfolioLogs } from '../db/schema';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 5 * 60; // 5 Mins for dev.

interface UserDetails {
  amount_invested: number;
  current_value: number;
}

@Injectable()
export class PortfolioProcessor {
  private readonly logger = new Logger('PortfolioProcessor');

  constructor(
    private dbService: DatabaseService,
    private redis: RedisService,
  ) {}

  async fetchAndCacheNav(code: string) {
    try {
      const cached = await this.redis.get(code);
      if (cached) return;
      const response = await axios.get<MFLatestNav>(`https://api.mfapi.in/mf/${code}/latest`);
      await this.redis.setex(code, CACHE_TTL, response.data.data[0].nav);
      this.logger.debug(`NAV fetched and cached for ${code}`);
    } catch (error) {
      this.logger.warn(`Failed to fetch NAV for ${code}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processPortfolios() {
    try {
      this.logger.log('Portfolio Process Running.');
      const result = await this.dbService.db.select().from(holdings);
      this.logger.debug('Holdings fetched.');

      const userDetails: Record<string, UserDetails> = {};

      const uniqueSchemeCodes: string[] = [...new Set(result.map((h) => h.scheme_code))];
      await Promise.all(uniqueSchemeCodes.map((code) => this.fetchAndCacheNav(code)));

      for (const holding of result) {
        const { user_id, amount_invested, scheme_code, units } = holding;

        const cacheCheck = await this.redis.get(scheme_code);
        if (cacheCheck?.length) {
          const nav = Number(cacheCheck);

          if (user_id in userDetails) {
            userDetails[user_id].amount_invested += Number(amount_invested);
            userDetails[user_id].current_value += Number(units) * nav;
          } else {
            userDetails[user_id] = {
              amount_invested: Number(amount_invested),
              current_value: Number(units) * nav,
            };
          }
        } else {
          this.logger.warn(`Missing cached nav for ${scheme_code}`);
        }
      }

      this.logger.log(`Processed ${uniqueSchemeCodes.length} schemes for ${Object.keys(userDetails).length} user(s).`);

      for (const [userId, details] of Object.entries(userDetails)) {
        await this.dbService.db
          .insert(portfolioLogs)
          .values({
            user_id: userId,
            total_invested: details.amount_invested.toFixed(2),
            current_value: details.current_value.toFixed(2),
          })
          .onConflictDoUpdate({
            target: [portfolioLogs.user_id, portfolioLogs.date],
            set: {
              total_invested: details.amount_invested.toFixed(2),
              current_value: details.current_value.toFixed(2),
            },
          });

        this.logger.log(
          `[${userId.split('-')[0]}] Invested: ${details.amount_invested.toFixed(2)} Current: ${details.current_value.toFixed(2)}`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.logger.error('Portfolio processing failed', error instanceof Error ? error.stack : error);
    }
  }
}
