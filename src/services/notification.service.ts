import api from '@/lib/axios';
import type {
  MarkAllReadResponse,
  Notification,
  NotificationListParams,
  NotificationListResponse,
  UnreadNotificationCount,
} from '@/interface/notification';

/** JWT user surface — docs/MODULES-1-4-FE-API.md §4.1 (/api/v1/client/...). */

export function getNotifications(params?: NotificationListParams) {
  return api.get<NotificationListResponse>('/api/v1/client/notifications', {
    params,
  });
}

export function getUnreadNotificationCount() {
  return api.get<UnreadNotificationCount>(
    '/api/v1/client/notifications/unread-count',
  );
}

export function markNotificationRead(id: string) {
  return api.patch<Notification>(
    `/api/v1/client/notifications/${id}/read`,
  );
}

export function markAllNotificationsRead() {
  return api.patch<MarkAllReadResponse>(
    '/api/v1/client/notifications/read-all',
  );
}
