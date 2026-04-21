import { Tag } from 'antd';
import type { ReviewStatus } from '@/services/review.service';

const STATUS_META: Record<
  ReviewStatus,
  { label: string; color: string }
> = {
  PENDING: { label: 'Pending', color: 'orange' },
  APPROVED: { label: 'Approved', color: 'green' },
  REJECTED: { label: 'Rejected', color: 'red' },
  HIDDEN: { label: 'Hidden', color: 'default' },
};

export function ReviewStatusTag({ status }: { status: ReviewStatus }) {
  const m = STATUS_META[status];
  return <Tag color={m.color}>{m.label}</Tag>;
}
