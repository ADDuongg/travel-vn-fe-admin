import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notification.service';
import type {
  MarkAllReadResponse,
  Notification,
  NotificationListParams,
  NotificationListResponse,
  UnreadNotificationCount,
} from '@/interface/notification';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params?: NotificationListParams) =>
    ['notifications', 'list', params] as const,
  infiniteList: (params?: NotificationListParams) =>
    ['notifications', 'infinite', params] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export const useNotificationList = (
  params?: NotificationListParams,
  enabled: boolean = true,
) =>
  useQuery<NotificationListResponse>({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => getNotifications(params),
    enabled,
    keepPreviousData: true,
  });

export const useInfiniteNotificationList = (
  params?: Omit<NotificationListParams, 'page' | 'limit'>,
  limit: number = 5,
  enabled: boolean = true,
) =>
  useInfiniteQuery<NotificationListResponse>({
    queryKey: NOTIFICATION_KEYS.infiniteList({ ...params, limit }),
    queryFn: ({ pageParam }) =>
      getNotifications({
        ...params,
        page: typeof pageParam === 'number' ? pageParam : 1,
        limit,
      }),
    initialPageParam: 1,
    enabled,
    getNextPageParam: (lastPage) => {
      const { page, limit: pageLimit, total } = lastPage;
      const loaded = page * pageLimit;
      if (loaded >= total) return undefined;
      return page + 1;
    },
  });

export const useUnreadNotificationCount = () =>
  useQuery<UnreadNotificationCount>({
    queryKey: NOTIFICATION_KEYS.unreadCount,
    queryFn: () => getUnreadNotificationCount(),
    refetchInterval: 30_000,
    staleTime: 30_000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation<Notification, Error, string>({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount });
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation<MarkAllReadResponse, Error, void>({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount });
      qc.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};

