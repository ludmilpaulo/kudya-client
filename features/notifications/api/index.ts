import v1Client from '../../../shared/api/v1Client';

export type UnifiedNotification = {
  id: string;
  module: string;
  notification_type: string;
  title: string;
  message: string;
  action_url: string;
  is_read: boolean;
  created_at: string;
};

export async function fetchNotifications(limit = 50): Promise<UnifiedNotification[]> {
  const { data } = await v1Client.get<UnifiedNotification[]>('/notifications/', {
    params: { limit },
  });
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await v1Client.get<{ unread_count: number }>('/notifications/unread-count/');
  return data.unread_count;
}

export async function markAllRead(): Promise<void> {
  await v1Client.patch('/notifications/mark-all-read/', {});
}
