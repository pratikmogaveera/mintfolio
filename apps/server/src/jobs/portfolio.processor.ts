import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { formatINR, NAV_CACHE_TTL } from '../../lib/utils';
import { DatabaseService } from '../db/database.service';
import { holdings, portfolioLogs } from '../db/schema';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';

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
    private notificationService: NotificationsService,
  ) {}

  async fetchAndCacheNav(code: string) {
    try {
      const cached = await this.redis.get(code);
      if (cached) return;
      const response = await axios.get<MFLatestNav>(`https://api.mfapi.in/mf/${code}/latest`);
      await this.redis.setex(code, NAV_CACHE_TTL, response.data.data[0].nav);
      this.logger.debug(`NAV fetched and cached for ${code}`);
    } catch (error) {
      this.logger.warn(`Failed to fetch NAV for ${code}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processPortfolios(singleUser?: string) {
    try {
      const notificationTitle: string = dayjs().format('DD MMM YYYY');
      this.logger.log('Portfolio Process Running.');
      const result = await this.dbService.db
        .select()
        .from(holdings)
        .where(singleUser ? eq(holdings.user_id, singleUser) : undefined);
      this.logger.debug('Holdings fetched.');

      const userDetails: Record<string, UserDetails> = {};
      const holdingUpdates: Promise<unknown>[] = [];

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

          holdingUpdates.push(
            this.dbService.db
              .update(holdings)
              .set({ current_value: (Number(units) * nav).toFixed(2) })
              .where(eq(holdings.id, holding.id)),
          );
        } else {
          this.logger.warn(`Missing cached nav for ${scheme_code}`);
        }
      }

      await Promise.all(holdingUpdates);

      this.logger.log(`Processed ${uniqueSchemeCodes.length} schemes for ${Object.keys(userDetails).length} user(s).`);

      for (const [userId, details] of Object.entries(userDetails)) {
        const { amount_invested, current_value } = details;
        await this.dbService.db
          .insert(portfolioLogs)
          .values({
            user_id: userId,
            total_invested: amount_invested.toFixed(2),
            current_value: current_value.toFixed(2),
          })
          .onConflictDoUpdate({
            target: [portfolioLogs.user_id, portfolioLogs.date],
            set: {
              total_invested: amount_invested.toFixed(2),
              current_value: current_value.toFixed(2),
            },
          });

        this.logger.log(
          `[${userId.split('-')[0]}] Invested: ${amount_invested.toFixed(2)} Current: ${current_value.toFixed(2)}`,
        );

        const pnlValue = current_value - amount_invested;
        const pnlPercentage = (pnlValue / amount_invested) * 100;

        // Skip notifications if processing portfolio for single users
        if (!singleUser)
          await this.notificationService.sendNotification({
            user_id: userId,
            message: {
              title: notificationTitle,
              body: `${pnlValue >= 0 ? '▲' : '▼'} ${formatINR(current_value)} (${formatINR(pnlValue)} / ${pnlPercentage.toFixed(2)}%)`,
            },
          });
      }
    } catch (error) {
      this.logger.error('Portfolio processing failed', error instanceof Error ? error.stack : error);
    }
  }
}
