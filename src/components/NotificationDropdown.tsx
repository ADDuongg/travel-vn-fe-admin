import { useState, useCallback, useMemo } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  Empty,
  List,
  Space,
  Spin,
  Typography,
  theme,
} from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useInfiniteNotificationList,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from '@/queries/notification.queries';
import type { Notification } from '@/interface/notification';
import { formatTourNotification } from '@/constants/notification-tour';

const { Text } = Typography;

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { token } = theme.useToken();

  const { data: unreadData, isLoading: isUnreadLoading } =
    useUnreadNotificationCount();
  const unreadCount = unreadData?.count ?? 0;

  const {
    data,
    isLoading: isListLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteNotificationList(undefined, 5, open);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const handleItemClick = useCallback(
    (item: Notification) => {
      if (!item.isRead && !markReadMutation.isPending) {
        markReadMutation.mutate(item._id);
      }
      if (item.link) {
        navigate(item.link);
      }
    },
    [markReadMutation, navigate],
  );

  const handleMarkAllRead = useCallback(() => {
    if (unreadCount && !markAllMutation.isPending) {
      markAllMutation.mutate();
    }
  }, [markAllMutation, unreadCount]);

  const loading =
    isUnreadLoading ||
    (open && (isListLoading || markReadMutation.isPending || isFetchingNextPage));

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const threshold = 40;
      if (
        target.scrollHeight - target.scrollTop - target.clientHeight <
          threshold &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  return (
    <Dropdown
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => (
        <div
          style={{
            width: 360,
            maxHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            background: token.colorBgElevated,
            boxShadow: token.boxShadowSecondary,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <Text strong>Thông báo</Text>
            <Button
              type="link"
              size="small"
              disabled={!unreadCount || markAllMutation.isPending}
              onClick={handleMarkAllRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 8,
            }}
            onScroll={handleScroll}
          >
            {open && loading && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: 24,
                }}
              >
                <Spin />
              </div>
            )}

            {!loading && items.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có thông báo"
                style={{ margin: '24px 0' }}
              />
            )}

            {!loading && items.length > 0 && (
              <List
                dataSource={items}
                renderItem={(item) => {
                  const titleText = formatTourNotification(
                    item.title,
                    item.metadata,
                    item.title,
                  );
                  const messageText = formatTourNotification(
                    item.message,
                    item.metadata,
                    item.message,
                  );

                  return (
                    <List.Item
                      key={item._id}
                      style={{
                        cursor: 'pointer',
                        borderRadius: 6,
                        marginBottom: 4,
                        paddingInline: 8,
                        backgroundColor: item.isRead
                          ? 'transparent'
                          : token.colorPrimaryBg,
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <List.Item.Meta
                        title={
                          <Space
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text strong ellipsis style={{ maxWidth: 220 }}>
                              {titleText}
                            </Text>
                            {!item.isRead && (
                              <Badge
                                color="blue"
                                style={{ marginLeft: 8 }}
                                status="processing"
                              />
                            )}
                          </Space>
                        }
                        description={
                          <Space
                            direction="vertical"
                            size={4}
                            style={{ width: '100%' }}
                          >
                            <Text
                              type="secondary"
                              ellipsis={{ tooltip: messageText }}
                              style={{ fontSize: 12 }}
                            >
                              {messageText}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {formatDateTime(item.createdAt)}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </div>
        </div>
      )}
    >
      <Badge
        count={unreadCount}
        size="small"
        overflowCount={99}
        offset={[-2, 2]}
      >
        <Button
          type="text"
          icon={<BellOutlined />}
          loading={loading || markAllMutation.isPending}
        />
      </Badge>
    </Dropdown>
  );
}


