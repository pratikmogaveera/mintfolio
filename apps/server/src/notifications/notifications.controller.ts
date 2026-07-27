import { Body, Controller, Delete, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CheckNotificationStatus, CreateSubscription, ToggleNotificationStatus } from './notifications.dto';
import { NotificationsService } from './notifications.service';

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

  @Post('/status')
  async getNotificationStatus(@Body() payload: CheckNotificationStatus, @Request() request: ExpressRequest) {
    return await this.notificationService.getNotificationStatus(payload, request.user?.sub);
  }

  @Patch('/status')
  async toggleNotificationStatus(@Body() payload: ToggleNotificationStatus, @Request() request: ExpressRequest) {
    return await this.notificationService.toggleNotificationStatus(payload, request.user?.sub);
  }
}
