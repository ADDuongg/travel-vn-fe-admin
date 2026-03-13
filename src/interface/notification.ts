export type NotificationType =
  | 'GUIDE_REGISTRATION_PENDING'
  | 'GUIDE_VERIFIED'
  | 'GUIDE_REJECTED';

export interface Notification {
  _id: string;
  recipientId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}

export interface UnreadNotificationCount {
  count: number;
}

export interface MarkAllReadResponse {
  modifiedCount: number;
}
