import { Button, Card, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
} from '@/queries/review.queries';
import { TOUR_KEYS } from '@/queries/tour.queries';

const { Text } = Typography;

type TourReviewSectionProps = {
  tourId: string;
  ratingSummary?: { average: number; total: number };
};

export default function TourReviewSection({
  tourId,
  ratingSummary,
}: TourReviewSectionProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminReviews({
    entityType: 'TOUR',
    entityId: tourId,
    page,
    limit,
  });

  const approveMutation = useApproveReview();
  const deleteMutation = useDeleteReview();

  const invalidateTour = () => {
    queryClient.invalidateQueries({ queryKey: TOUR_KEYS.detail(tourId) });
  };

  const reviews = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <Card title="Reviews & Rating" style={{ marginTop: 24 }}>
      {ratingSummary != null && (
        <Space size="middle" style={{ marginBottom: 16 }}>
          <Space>
            <StarFilled style={{ color: '#faad14' }} />
            <Text strong>{ratingSummary.average.toFixed(1)}</Text>
            <Text type="secondary">/ 5</Text>
          </Space>
          <Text type="secondary">({ratingSummary.total} đánh giá)</Text>
        </Space>
      )}

      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={reviews}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: setPage,
          size: 'small',
        }}
        columns={[
          {
            title: 'Rating',
            dataIndex: 'rating',
            width: 90,
            render: (v: number) => (v != null ? `⭐ ${v}` : '-'),
          },
          {
            title: 'Comment',
            dataIndex: 'comment',
            ellipsis: true,
          },
          {
            title: 'User',
            render: (
              _: unknown,
              r: { userId?: { email?: string; username?: string } },
            ) => r.userId?.email || r.userId?.username || 'Anonymous',
          },
          {
            title: 'Status',
            dataIndex: 'isApproved',
            width: 100,
            render: (v: boolean) =>
              v ? (
                <Tag color="green">Approved</Tag>
              ) : (
                <Tag color="orange">Pending</Tag>
              ),
          },
          {
            title: 'Created',
            dataIndex: 'createdAt',
            width: 160,
            render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
          },
          {
            title: 'Actions',
            width: 160,
            render: (_: unknown, r: { _id: string; isApproved: boolean }) => (
              <Space size="small">
                {!r.isApproved && (
                  <Button
                    size="small"
                    type="link"
                    loading={approveMutation.isPending}
                    onClick={() =>
                      approveMutation.mutate(r._id, {
                        onSuccess: invalidateTour,
                      })
                    }
                  >
                    Approve
                  </Button>
                )}
                <Popconfirm
                  title="Xóa đánh giá này?"
                  onConfirm={() =>
                    deleteMutation.mutate(r._id, {
                      onSuccess: invalidateTour,
                    })
                  }
                >
                  <Button danger size="small" type="link">
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
