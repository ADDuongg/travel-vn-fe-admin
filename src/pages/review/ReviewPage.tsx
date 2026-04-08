import {
  Button,
  Card,
  Drawer,
  Empty,
  Grid,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Select,
} from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
} from '@/queries/review.queries';
import type { ReviewEntityType } from '@/services/review.service';
import tableStyles from '@/styles/promax-table.module.css';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ENTITY_OPTIONS: { label: string; value: ReviewEntityType }[] = [
  { label: 'Room', value: 'ROOM' },
  { label: 'Hotel', value: 'HOTEL' },
  { label: 'Tour', value: 'TOUR' },
  { label: 'Blog', value: 'BLOG' },
  { label: 'Guide', value: 'GUIDE' },
];

export default function AdminReviewPage() {
  const screens = useBreakpoint();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [entityType, setEntityType] = useState<ReviewEntityType | undefined>(
    () =>
      (searchParams.get('entityType') as ReviewEntityType) || undefined,
  );
  const [isApproved, setIsApproved] = useState<boolean | undefined>(false);

  useEffect(() => {
    const q = searchParams.get('entityType') as ReviewEntityType | null;
    if (q && ['ROOM', 'HOTEL', 'TOUR', 'BLOG', 'GUIDE'].includes(q)) {
      setEntityType(q);
    }
  }, [searchParams]);

  const { data, isLoading, refetch, isFetching } = useAdminReviews({
    page,
    limit,
    entityType,
    isApproved,
  });

  const approveMutation = useApproveReview();
  const deleteMutation = useDeleteReview();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = (
    <div className={tableStyles.filtersForm}>
      <Select
        placeholder="Entity"
        allowClear
        value={entityType}
        onChange={(v) => {
          setPage(1);
          setEntityType(v);
        }}
        options={ENTITY_OPTIONS as any}
      />
      <Select
        placeholder="Status"
        allowClear
        value={
          isApproved === undefined ? undefined : isApproved ? 'approved' : 'pending'
        }
        onChange={(v) => {
          setPage(1);
          setIsApproved(v === undefined ? undefined : v === 'approved');
        }}
        options={[
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
        ]}
      />
    </div>
  );

  return (
    <div className={tableStyles.page} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card className={tableStyles.mainCard}>
          <div className={tableStyles.header}>
            <div className={tableStyles.titleWrap}>
              <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
                Reviews
              </Title>
              <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
                Duyệt / quản lý review cho Tour và các entity khác.
              </Text>
            </div>

            <div className={tableStyles.toolbar}>
              {!screens.md && (
                <Button icon={<FilterOutlined />} onClick={() => setFiltersOpen(true)}>
                  Bộ lọc
                </Button>
              )}
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
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

          <Table
            rowKey="_id"
            loading={isLoading}
            style={{ marginTop: 12 }}
            dataSource={data?.data}
            locale={{
              emptyText: <Empty description="Không có review phù hợp với điều kiện lọc." />,
            }}
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.pagination.total,
              onChange: setPage,
            }}
            scroll={{ x: 900 }}
            size={screens.md ? 'middle' : 'small'}
            columns={[
          {
            title: 'Entity',
            dataIndex: 'entityType',
            width: 120,
            render: (v) => <Tag>{v}</Tag>,
          },
          {
            title: 'Rating',
            dataIndex: 'rating',
            width: 100,
            render: (v) => (v ? `⭐ ${v}` : '-'),
          },
          {
            title: 'Comment',
            dataIndex: 'comment',
            ellipsis: true,
            width: 320,
          },
          {
            title: 'User',
            width: 180,
            render: (_, r) =>
              r.userId?.email || r.userId?.username || 'Anonymous',
          },
          {
            title: 'Status',
            dataIndex: 'isApproved',
            width: 120,
            render: (v) =>
              v ? (
                <Tag color="green">Approved</Tag>
              ) : (
                <Tag color="orange">Pending</Tag>
              ),
          },
          {
            title: 'Created',
            dataIndex: 'createdAt',
            width: 180,
            render: (v: string) =>
              v ? new Date(v).toLocaleString() : '-',
          },
          {
            title: 'Actions',
            width: 180,
            render: (_, r) => (
              <Space>
                {!r.isApproved && (
                  <Button
                    size="small"
                    loading={approveMutation.isPending}
                    onClick={() => approveMutation.mutate(r._id)}
                  >
                    Approve
                  </Button>
                )}

                <Popconfirm
                  title="Delete this review?"
                  onConfirm={() => deleteMutation.mutate(r._id)}
                >
                  <Button danger size="small">
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
            ]}
          />
      </Card>
    </div>
  );
}
