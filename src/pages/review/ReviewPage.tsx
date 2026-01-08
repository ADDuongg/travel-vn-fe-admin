import {
  Button,
  Card,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Select,
} from 'antd';
import { useState } from 'react';
import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
} from '@/queries/review.queries';
import type { ReviewEntityType } from '@/services/review.service';

const { Title } = Typography;

export default function AdminReviewPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [entityType, setEntityType] = useState<ReviewEntityType | undefined>(
    undefined,
  );
  const [isApproved, setIsApproved] = useState<boolean | undefined>(false);

  const { data, isLoading } = useAdminReviews({
    page,
    limit,
    entityType,
    isApproved,
  });

  const approveMutation = useApproveReview();
  const deleteMutation = useDeleteReview();

  return (
    <Card>
      <Space
        style={{ width: '100%', justifyContent: 'space-between' }}
        align="center"
      >
        <Title level={5}>Reviews</Title>

        <Space>
          <Select
            placeholder="Entity"
            allowClear
            style={{ width: 140 }}
            value={entityType}
            onChange={setEntityType}
            options={[
              { label: 'Room', value: 'ROOM' },
              { label: 'Hotel', value: 'HOTEL' },
              { label: 'Tour', value: 'TOUR' },
              { label: 'Blog', value: 'BLOG' },
            ]}
          />

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 140 }}
            value={
              isApproved === undefined
                ? undefined
                : isApproved
                ? 'approved'
                : 'pending'
            }
            onChange={(v) =>
              setIsApproved(v === undefined ? undefined : v === 'approved')
            }
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
            ]}
          />
        </Space>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        style={{ marginTop: 16 }}
        dataSource={data?.data}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.pagination.total,
          onChange: setPage,
        }}
        columns={[
          {
            title: 'Entity',
            dataIndex: 'entityType',
            render: (v) => <Tag>{v}</Tag>,
          },
          {
            title: 'Rating',
            dataIndex: 'rating',
            render: (v) => (v ? `⭐ ${v}` : '-'),
          },
          {
            title: 'Comment',
            dataIndex: 'comment',
            ellipsis: true,
          },
          {
            title: 'User',
            render: (_, r) =>
              r.userId?.email || r.userId?.username || 'Anonymous',
          },
          {
            title: 'Status',
            dataIndex: 'isApproved',
            render: (v) =>
              v ? (
                <Tag color="green">Approved</Tag>
              ) : (
                <Tag color="orange">Pending</Tag>
              ),
          },
          {
            title: 'Actions',
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
  );
}
