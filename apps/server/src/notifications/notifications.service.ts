import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { sendNotification, setVapidDetails } from 'web-push';
import { DatabaseService } from '../db/database.service';
import { pushSubscriptions } from '../db/schema';
import { CheckNotificationStatus, CreateSubscription, ToggleNotificationStatus } from './notifications.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger('NotificationsService');

  constructor(
    private dbService: DatabaseService,
    private config: ConfigService,
  ) {}

  onModuleInit() {
    setVapidDetails(
      this.config.getOrThrow('VAPID_SUBJECT'),
      this.config.getOrThrow('VAPID_PUBLIC_KEY'),
      this.config.getOrThrow('VAPID_PRIVATE_KEY'),
    );
  }

  async subscribe(subscription: CreateSubscription, userId: string | undefined) {
    if (!userId) throw new BadRequestException('User ID is missing from request.');
    try {
      await this.dbService.db
        .insert(pushSubscriptions)
        .values({
          user_id: userId,
          endpoint: subscription.endpoint,
          keys_auth: subscription.auth,
          keys_p256dh: subscription.p256dh,
          is_active: true,
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: {
            keys_auth: subscription.auth,
            keys_p256dh: subscription.p256dh,
            is_active: true,
          },
        })
        .returning({
          id: pushSubscriptions.id,
        });

      this.logger.log(`Subscribed: User ${userId.split('-')[0]}`);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong while subscribing to notifications.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async unsubscribe(subscriptionid: string, userId: string | undefined) {
    if (!userId) throw new BadRequestException('User ID is missing from request.');
    try {
      const result = await this.dbService.db
        .delete(pushSubscriptions)
        .where(and(eq(pushSubscriptions.user_id, userId), eq(pushSubscriptions.id, subscriptionid)))
        .returning({ id: pushSubscriptions.id });

      if (!result.length) throw new NotFoundException('Subscription does not exist.');

      this.logger.log(`Unsubscribed: User ${userId.split('-')[0]}`);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong while unsubscribing to notifications.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async sendNotification(payload: NotificationMessage) {
    try {
      const subscriptions = await this.dbService.db
        .select()
        .from(pushSubscriptions)
        .where(and(eq(pushSubscriptions.user_id, payload.user_id), eq(pushSubscriptions.is_active, true)));

      if (!subscriptions.length) {
        this.logger.warn(`User: ${payload.user_id.split('-')[0]} has no subscriptions.`);
        return;
      }

      await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            await sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
              JSON.stringify(payload.message || {}),
            );
          } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error?.statusCode === 410 || error?.statusCode === 404) {
              await this.dbService.db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
              this.logger.warn(`Removed expired subscription for user ${payload.user_id.split('-')[0]}`);
            } else {
              this.logger.warn(
                `Failed to send notification to ${sub.endpoint}: ${error instanceof Error ? error?.message : 'Unknown error'}`,
              );
            }
          }
        }),
      );

      this.logger.log(`Notification sent successfully for user: ${payload.user_id.split('-')[0]}`);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while pushing notifications.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async getNotificationStatus(payload: CheckNotificationStatus, userId: string | undefined) {
    if (!userId) throw new BadRequestException('User ID is missing from request.');

    try {
      const result = await this.dbService.db
        .select({ id: pushSubscriptions.id, is_active: pushSubscriptions.is_active })
        .from(pushSubscriptions)
        .where(and(eq(pushSubscriptions.user_id, userId), eq(pushSubscriptions.endpoint, payload.endpoint)));

      if (!result.length) throw new NotFoundException('Subscription does not exist.');

      return result[0];
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong while checking notification's status.";
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async toggleNotificationStatus(payload: ToggleNotificationStatus, userId: string | undefined) {
    if (!userId) throw new BadRequestException('User ID is missing from request.');

    try {
      const notificationResult = await this.dbService.db
        .select()
        .from(pushSubscriptions)
        .where(and(eq(pushSubscriptions.user_id, userId), eq(pushSubscriptions.endpoint, payload.endpoint)));
      if (!notificationResult.length) throw new NotFoundException('Subscription does not exist.');

      const result = await this.dbService.db
        .update(pushSubscriptions)
        .set({ is_active: !notificationResult[0].is_active })
        .where(and(eq(pushSubscriptions.user_id, userId), eq(pushSubscriptions.endpoint, payload.endpoint)))
        .returning({
          id: pushSubscriptions.id,
          is_active: pushSubscriptions.is_active,
        });

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong while toggling notification's status.";
      this.logger.warn(errorMessage);
      throw error;
    }
  }
}
