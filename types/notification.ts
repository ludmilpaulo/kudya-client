export type NotificationSource = 'platform' | 'healthcare' | 'unified';

export type AppNotification = {
  id: string;
  source: NotificationSource;
  module: string;
  notificationType: string;
  title: string;
  message: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
};

export type UnreadNotificationCountResponse = {
  unreadCount: number;
};

export type NotificationListParams = {
  module?: string;
  limit?: number;
};
