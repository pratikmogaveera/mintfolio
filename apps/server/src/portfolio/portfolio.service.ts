import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../db/database.service';
import { holdings } from '../db/schema';
import { CreateHoldingDto } from './portfolio.dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger('Portfolio');

  constructor(private dbService: DatabaseService) {}

  async getHoldings(userId: string | undefined) {
    if (!userId) throw new BadRequestException();
    try {
      const results = await this.dbService.db
        .select({
          id: holdings.id,
          scheme_code: holdings.scheme_code,
          scheme_name: holdings.scheme_name,
          units: holdings.units,
          amount_invested: holdings.amount_invested,
        })
        .from(holdings)
        .where(eq(holdings.user_id, userId));
      return { success: true, data: results };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Something went wrong while fetching user's holdings.`;
      this.logger.warn(errorMessage);
      return { success: false, message: "Something went wrong while fetching user's holdings." };
    }
  }

  async createHolding(payload: CreateHoldingDto, userId: string | undefined) {
    if (!userId) throw new BadRequestException();
    try {
      await this.dbService.db
        .insert(holdings)
        .values({
          user_id: userId,
          scheme_code: payload.scheme_code,
          scheme_name: payload.scheme_name,
          units: payload.units,
          amount_invested: payload.amount_invested,
        })
        .returning({ id: holdings.id });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while creating holding.';
      this.logger.warn(errorMessage);
      return { success: false, message: 'Something went wrong while creating holding.' };
    }
  }

  async deleteHolding(holdingId: string | undefined, userId: string | undefined) {
    if (!holdingId || !userId) throw new BadRequestException();

    try {
      const result = await this.dbService.db
        .delete(holdings)
        .where(and(eq(holdings.id, holdingId), eq(holdings.user_id, userId)))
        .returning({ id: holdings.id });
      if (result.length) return { success: true };
      else throw new NotFoundException();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while deleting holding.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }
}
