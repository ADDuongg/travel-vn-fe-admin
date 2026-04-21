import {
  Button,
  Card,
  Drawer,
  Empty,
  Grid,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import tableStyles from '@/styles/promax-table.module.css';
import {
  type Favorite,
  type FavoriteEntityType,
} from '@/services/favorite.service';
import { useAdminFavorites } from '@/queries/favorite.queries';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ENTITY_OPTIONS: { label: string; value: FavoriteEntityType }[] = [
  { label: 'Tour', value: 'TOUR' },
  { label: 'Room', value: 'ROOM' },
  { label: 'Hotel', value: 'HOTEL' },
  { label: 'Guide', value: 'GUIDE' },
];

export default function FavoritesPage() {
  const screens = useBreakpoint();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [userId, setUserId] = useState<string>('');
  const [entityType, setEntityType] = useState<FavoriteEntityType | undefined>();
  const [entityId, setEntityId] = useState<string>('');

  const params = useMemo(
    () => ({
      page,
      limit,
      userId: userId.trim() || undefined,
      entityType,
      entityId: entityId.trim() || undefined,
    }),
    [page, limit, userId, entityType, entityId],
  );

  const { data, isLoading, refetch, isFetching } = useAdminFavorites(params);

  const filters = (
    <div className={tableStyles.filtersForm}>
      <Input
        allowClear
        placeholder="User ID"
        value={userId}
        onChange={(e) => {
          setPage(1);
          setUserId(e.target.value);
        }}
      />
      <Select
        placeholder="Entity type"
        allowClear
        value={entityType}
        onChange={(v) => {
          setPage(1);
          setEntityType(v);
        }}
        options={ENTITY_OPTIONS as any}
      />
      <Input
        allowClear
        placeholder="Entity ID"
        value={entityId}
        onChange={(e) => {
          setPage(1);
          setEntityId(e.target.value);
        }}
      />
    </div>
  );

  return (
    <div
      className={tableStyles.page}
      style={{ maxWidth: 1200, margin: '0 auto' }}
    >
      <Card className={tableStyles.mainCard}>
        <div className={tableStyles.header}>
          <div className={tableStyles.titleWrap}>
            <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
              Favorites
            </Title>
            <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
              Danh sách favorites theo user và entity (read-only).
            </Text>
          </div>

          <div className={tableStyles.toolbar}>
            {!screens.md && (
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen(true)}
              >
                Bộ lọc
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {screens.md ? (
          <div style={{ marginTop: 12 }}>{filters}</div>
        ) : (
          <Drawer
            title="Bộ lọc"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            placement="right"
            width={360}
          >
            {filters}
          </Drawer>
        )}

        <Table<Favorite>
          rowKey="_id"
          loading={isLoading}
          style={{ marginTop: 12 }}
          dataSource={data?.data}
          locale={{
            emptyText: (
              <Empty description="Không có favorites phù hợp với điều kiện lọc." />
            ),
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.pagination.total,
            onChange: setPage,
          }}
          scroll={{ x: 1000 }}
          size={screens.md ? 'middle' : 'small'}
          columns={[
            {
              title: 'Entity',
              dataIndex: 'entityType',
              width: 120,
              render: (v: FavoriteEntityType) => <Tag>{v}</Tag>,
            },
            {
              title: 'Entity ID',
              dataIndex: 'entityId',
              width: 260,
              render: (v: string) => (
                <Text code copyable={{ text: v }}>
                  {v}
                </Text>
              ),
            },
            {
              title: 'User ID',
              dataIndex: 'userId',
              width: 260,
              render: (v: string) => (
                <Text code copyable={{ text: v }}>
                  {v}
                </Text>
              ),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              width: 170,
              render: (v: string) => (v ? new Date(v).toLocaleString() : '—'),
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              width: 170,
              render: (v: string) => (v ? new Date(v).toLocaleString() : '—'),
            },
            {
              title: 'Raw',
              width: 110,
              fixed: 'right',
              render: (_, r) => (
                <Space size={6}>
                  <Text copyable={{ text: r._id }} style={{ fontSize: 12 }}>
                    Copy _id
                  </Text>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

