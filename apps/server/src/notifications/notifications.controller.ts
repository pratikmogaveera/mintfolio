import { Body, Controller, Delete, Param, Post, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSubscription } from './notifications.dto';
import { type Request as ExpressRequest } from 'express';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationService: NotificationsService) {}

  @Post('subscribe')
  async subscribe(@Body() subscription: CreateSubscription, @Request() request: ExpressRequest) {
    return await this.notificationService.subscribe(subscription, request.user?.sub);
  }

  @Delete('unsubscribe/:id')
  async unsubscribe(@Param('id') subscriptionId: string, @Request() request: ExpressRequest) {
    return await this.notificationService.unsubscribe(subscriptionId, request.user?.sub);
  }
}
