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
import { CreateSubscription } from './notifications.dto';

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
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: {
            keys_auth: subscription.auth,
            keys_p256dh: subscription.p256dh,
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
        .where(eq(pushSubscriptions.user_id, payload.user_id));

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
}
