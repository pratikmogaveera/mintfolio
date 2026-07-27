export interface PushNotification {
  endpoint: string;
  p256dh: string;
  auth: string;
  is_active: boolean;
}

export type NotificationStatus = 'loading' | 'unsupported' | 'denied' | 'unsubscribed' | 'enabled' | 'disabled';
