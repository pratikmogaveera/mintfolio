import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import dayjs from 'dayjs';
import { and, eq } from 'drizzle-orm';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../db/database.service';
import { holdings, portfolioLogs } from '../db/schema';
import { RedisService } from '../redis/redis.service';
import { CreateHoldingDto, UpdateHoldingDto } from './portfolio.dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger('PortfolioService');

  constructor(
    private dbService: DatabaseService,
    private redis: RedisService,
  ) {}

  async getHoldings(userId: string | undefined) {
    if (!userId) throw new BadRequestException('User ID is missing from request.');
    try {
      const results = await this.dbService.db
        .select({
          id: holdings.id,
          scheme_code: holdings.scheme_code,
          scheme_name: holdings.scheme_name,
          units: holdings.units,
          amount_invested: holdings.amount_invested,
          current_value: holdings.current_value,
        })
        .from(holdings)
        .where(eq(holdings.user_id, userId));
      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Something went wrong while fetching user's holdings.`;
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async createHolding(payload: CreateHoldingDto, userId: string | undefined) {
    if (!userId) throw new BadRequestException('User ID is missing from request.');
    try {
      let nav: number;
      const cacheCheck = await this.redis.get(payload.scheme_code);
      if (cacheCheck?.length) {
        nav = Number(cacheCheck);
      } else {
        try {
          const response = await axios.get<MFLatestNav>(`https://api.mfapi.in/mf/${payload.scheme_code}/latest`);
          nav = Number(response.data.data[0].nav);
        } catch {
          throw new BadRequestException('Could not fetch NAV for the selected scheme. Please try again.');
        }
      }

      const currentValue = payload.units * nav;

      const result = await this.dbService.db
        .insert(holdings)
        .values({
          user_id: userId,
          scheme_code: payload.scheme_code,
          scheme_name: payload.scheme_name,
          units: payload.units.toString(),
          amount_invested: payload.amount_invested.toString(),
          current_value: currentValue.toFixed(2),
        })
        .returning({
          id: holdings.id,
          scheme_code: holdings.scheme_code,
          scheme_name: holdings.scheme_name,
          units: holdings.units,
          amount_invested: holdings.amount_invested,
          current_value: holdings.current_value,
        });

      this.logger.log(`Holding created: ${payload.scheme_name} for user ${userId.split('-')[0]}`);
      return result[0];
    } catch (error) {
      if (error instanceof Error && error.cause instanceof DatabaseError && error.cause.code === '23505') {
        this.logger.warn('Holding for this scheme already exists.');
        throw new ConflictException('Holding for this scheme already exists.');
      }
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while creating holding.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async updateHolding(holdingId: string | undefined, payload: UpdateHoldingDto, userId: string | undefined) {
    if (!holdingId || !userId) throw new BadRequestException('User ID is missing from request.');

    if (payload.amount_invested === undefined && payload.units === undefined)
      throw new BadRequestException('Provide at least one field to update (units or invested amount).');

    const values = {
      ...(payload.units !== undefined && { units: payload.units.toString() }),
      ...(payload.amount_invested !== undefined && { amount_invested: payload.amount_invested.toString() }),
    };

    try {
      const result = await this.dbService.db
        .update(holdings)
        .set(values)
        .where(and(eq(holdings.id, holdingId), eq(holdings.user_id, userId)))
        .returning({ id: holdings.id });
      if (result.length) {
        this.logger.log(`Holding updated: ${holdingId} for user ${userId.split('-')[0]}`);
        return result;
      } else throw new NotFoundException('Holding not found.');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while updating holding.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async getNavHistory(schemeCode: string) {
    if (!schemeCode) throw new BadRequestException('scheme_code is required.');
    const endDate = dayjs();
    const startDate = endDate.subtract(13, 'day');

    try {
      const response = await axios.get<{ data: { date: string; nav: string }[] }>(
        `https://api.mfapi.in/mf/${schemeCode}?startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`,
      );

      // API returns newest first — reverse to chronological, take last 7
      return response.data.data
        .reverse()
        .slice(-7)
        .map((entry) => Number(entry.nav));
    } catch {
      throw new BadRequestException('Could not fetch NAV history for this scheme.');
    }
  }

  async deleteHolding(holdingId: string | undefined, userId: string | undefined) {
    if (!holdingId || !userId) throw new BadRequestException('User ID is missing from request.');

    try {
      const result = await this.dbService.db
        .delete(holdings)
        .where(and(eq(holdings.id, holdingId), eq(holdings.user_id, userId)))
        .returning({ id: holdings.id });
      if (result.length) {
        this.logger.log(`Holding deleted: ${holdingId} for user ${userId.split('-')[0]}`);
        return undefined;
      } else throw new NotFoundException('Holding not found.');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while deleting holding.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async getPortfolioLogs(userId: string | undefined) {
    if (!userId) throw new BadRequestException('User ID is missing from request.');
    try {
      const results = await this.dbService.db
        .select({
          id: portfolioLogs.id,
          date: portfolioLogs.date,
          total_invested: portfolioLogs.total_invested,
          current_value: portfolioLogs.current_value,
        })
        .from(portfolioLogs)
        .where(eq(portfolioLogs.user_id, userId))
        .orderBy(portfolioLogs.date);
      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Something went wrong while fetching user's portfolio logs.`;
      this.logger.warn(errorMessage);
      throw error;
    }
  }
}
