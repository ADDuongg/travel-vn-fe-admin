import { Card, Space, Table, Typography } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
  useUpdateReviewStatus,
} from '@/queries/review.queries';
import type { Review } from '@/services/review.service';
import { TOUR_KEYS } from '@/queries/tour.queries';
import ReviewAdminActions from '@/pages/review/ReviewAdminActions';
import { ReviewStatusTag } from '@/pages/review/ReviewStatusTag';

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
  const updateStatusMutation = useUpdateReviewStatus();
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

      <Table<Review>
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
        scroll={{ x: 900 }}
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
            render: (_: unknown, r) =>
              r.userId?.email || r.userId?.username || 'Anonymous',
          },
          {
            title: 'Status',
            width: 120,
            render: (_: unknown, r) => (
              <Space size={4} wrap>
                <ReviewStatusTag status={r.status} />
                {r.deletedAt != null && r.deletedAt !== '' && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    (deleted)
                  </Text>
                )}
              </Space>
            ),
          },
          {
            title: 'Created',
            dataIndex: 'createdAt',
            width: 160,
            render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            width: 160,
            render: (v: string | undefined) =>
              v ? new Date(v).toLocaleString() : '—',
          },
          {
            title: 'Actions',
            width: 260,
            fixed: 'right',
            render: (_: unknown, r) => (
              <ReviewAdminActions
                review={r}
                compact
                approvePending={approveMutation.isPending}
                updateStatusPending={updateStatusMutation.isPending}
                deletePending={deleteMutation.isPending}
                onApprove={async () => {
                  await approveMutation.mutateAsync(r._id);
                  invalidateTour();
                }}
                onUpdateStatus={async (payload) => {
                  await updateStatusMutation.mutateAsync({
                    id: r._id,
                    payload,
                  });
                  invalidateTour();
                }}
                onDelete={async () => {
                  await deleteMutation.mutateAsync(r._id);
                  invalidateTour();
                }}
              />
            ),
          },
        ]}
      />
    </Card>
  );
}
