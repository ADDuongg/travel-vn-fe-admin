import {
  Button,
  Card,
  Drawer,
  Empty,
  Grid,
  Space,
  Table,
  Tag,
  Typography,
  Select,
  Switch,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
  useUpdateReviewStatus,
} from '@/queries/review.queries';
import type { ReviewEntityType, ReviewStatus } from '@/services/review.service';
import tableStyles from '@/styles/promax-table.module.css';
import ReviewAdminActions from './ReviewAdminActions';
import { ReviewStatusTag } from './ReviewStatusTag';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ENTITY_OPTIONS: { label: string; value: ReviewEntityType }[] = [
  { label: 'Room', value: 'ROOM' },
  { label: 'Hotel', value: 'HOTEL' },
  { label: 'Tour', value: 'TOUR' },
  { label: 'Blog', value: 'BLOG' },
  { label: 'Guide', value: 'GUIDE' },
];

const STATUS_FILTER_OPTIONS: { label: string; value: ReviewStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Hidden', value: 'HIDDEN' },
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
  const [statusFilter, setStatusFilter] = useState<ReviewStatus[] | undefined>(
    () => ['PENDING'],
  );
  const [includeDeleted, setIncludeDeleted] = useState(false);

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
    status:
      statusFilter && statusFilter.length > 0 ? statusFilter : undefined,
    includeDeleted: includeDeleted ? true : undefined,
  });

  const approveMutation = useApproveReview();
  const updateStatusMutation = useUpdateReviewStatus();
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
        mode="multiple"
        allowClear
        placeholder="Tất cả trạng thái"
        value={statusFilter}
        onChange={(v) => {
          setPage(1);
          setStatusFilter(v?.length ? v : undefined);
        }}
        options={STATUS_FILTER_OPTIONS}
      />
      <Space align="center" style={{ whiteSpace: 'nowrap' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Đã xóa mềm
        </Text>
        <Switch
          checked={includeDeleted}
          onChange={(v) => {
            setPage(1);
            setIncludeDeleted(v);
          }}
        />
      </Space>
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
            scroll={{ x: 1100 }}
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
            width: 280,
          },
          {
            title: 'User',
            width: 160,
            render: (_, r) =>
              r.userId?.email || r.userId?.username || 'Anonymous',
          },
          {
            title: 'Status',
            width: 140,
            render: (_, r) => (
              <Space size={4} wrap>
                <ReviewStatusTag status={r.status} />
                {r.deletedAt != null && r.deletedAt !== '' && (
                  <Tag>Deleted</Tag>
                )}
              </Space>
            ),
          },
          {
            title: 'Lý do',
            width: 140,
            ellipsis: true,
            render: (_, r) => {
              const text = r.rejectReason || r.hiddenReason;
              if (!text) return '—';
              return (
                <Tooltip title={text}>
                  <span>{text}</span>
                </Tooltip>
              );
            },
          },
          {
            title: 'Created',
            dataIndex: 'createdAt',
            width: 150,
            render: (v: string) =>
              v ? new Date(v).toLocaleString() : '-',
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            width: 150,
            render: (v: string | undefined) =>
              v ? new Date(v).toLocaleString() : '—',
          },
          {
            title: 'Actions',
            width: 280,
            fixed: 'right',
            render: (_, r) => (
              <ReviewAdminActions
                review={r}
                approvePending={approveMutation.isPending}
                updateStatusPending={updateStatusMutation.isPending}
                deletePending={deleteMutation.isPending}
                onApprove={() => approveMutation.mutateAsync(r._id)}
                onUpdateStatus={(payload) =>
                  updateStatusMutation.mutateAsync({ id: r._id, payload })
                }
                onDelete={() => deleteMutation.mutateAsync(r._id)}
              />
            ),
          },
            ]}
          />
      </Card>
    </div>
  );
}
