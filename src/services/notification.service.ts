import api from '@/lib/axios';
import type {
  MarkAllReadResponse,
  Notification,
  NotificationListParams,
  NotificationListResponse,
  UnreadNotificationCount,
} from '@/interface/notification';

export function getNotifications(params?: NotificationListParams) {
  return api.get<NotificationListResponse>('/api/v1/notifications', {
    params,
  });
}

export function getUnreadNotificationCount() {
  return api.get<UnreadNotificationCount>('/api/v1/notifications/unread-count');
}

export function markNotificationRead(id: string) {
  return api.patch<Notification>(`/api/v1/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return api.patch<MarkAllReadResponse>('/api/v1/notifications/read-all');
}

