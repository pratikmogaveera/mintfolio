import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CreateHoldingDto, UpdateHoldingDto } from './portfolio.dto';
import { PortfolioService } from './portfolio.service';

@UseGuards(AuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get('holdings')
  async getHoldings(@Request() request: ExpressRequest) {
    return await this.portfolioService.getHoldings(request.user?.sub);
  }

  @Post('holdings')
  async createHolding(@Body() payload: CreateHoldingDto, @Request() request: ExpressRequest) {
    return await this.portfolioService.createHolding(payload, request.user?.sub);
  }

  @Patch('holdings/:holdingId')
  async updateHolding(
    @Param('holdingId') holdingId: string,
    @Body() payload: UpdateHoldingDto,
    @Request() request: ExpressRequest,
  ) {
    return await this.portfolioService.updateHolding(holdingId, payload, request.user?.sub);
  }

  @Delete('holdings/:holdingId')
  async deleteHolding(@Param('holdingId') holdingId: string, @Request() request: ExpressRequest) {
    return await this.portfolioService.deleteHolding(holdingId, request.user?.sub);
  }

  @Get('nav-history')
  async getNavHistory(@Query('scheme_code') schemeCode: string) {
    return await this.portfolioService.getNavHistory(schemeCode);
  }

  @Get('logs')
  async getPortfolioLogs(@Request() request: ExpressRequest) {
    return await this.portfolioService.getPortfolioLogs(request.user?.sub);
  }
}
