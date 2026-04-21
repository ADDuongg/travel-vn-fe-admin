import { Button, Input, Modal, Popconfirm, Select, Space, message } from 'antd';
import { useState } from 'react';
import type {
  Review,
  ReviewStatus,
  UpdateReviewStatusPayload,
} from '@/services/review.service';

/** Approved → PATCH /approve; các giá trị khác → PATCH /status */
const STATUS_SELECT_OPTIONS: { label: string; value: ReviewStatus }[] = [
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Hidden', value: 'HIDDEN' },
];

type ModalKind = 'reject' | 'hidden' | null;

type Props = {
  review: Review;
  compact?: boolean;
  approvePending: boolean;
  updateStatusPending: boolean;
  deletePending: boolean;
  onApprove: () => Promise<unknown>;
  onUpdateStatus: (payload: UpdateReviewStatusPayload) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onSuccess?: () => void;
};

export default function ReviewAdminActions({
  review,
  compact = false,
  approvePending,
  updateStatusPending,
  deletePending,
  onApprove,
  onUpdateStatus,
  onDelete,
  onSuccess,
}: Props) {
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [reason, setReason] = useState('');

  const closeModal = () => {
    setModalKind(null);
    setReason('');
  };

  const runSuccess = () => {
    onSuccess?.();
  };

  const handleStatusSelect = (next: ReviewStatus) => {
    if (next === review.status) return;

    if (next === 'APPROVED') {
      if (review.status === 'HIDDEN') {
        message.warning('Không duyệt trực tiếp từ Hidden. Đổi trạng thái khác trước.');
        return;
      }
      void (async () => {
        try {
          await onApprove();
          runSuccess();
        } catch {
          /* axios / global handler */
        }
      })();
      return;
    }

    if (next === 'REJECTED') {
      setReason('');
      setModalKind('reject');
      return;
    }

    if (next === 'HIDDEN') {
      if (review.status !== 'APPROVED') {
        message.warning('Chỉ có thể ẩn review đang ở trạng thái Approved.');
        return;
      }
      setReason('');
      setModalKind('hidden');
      return;
    }

    void (async () => {
      try {
        await onUpdateStatus({ status: next });
        runSuccess();
      } catch {
        /* axios / global handler */
      }
    })();
  };

  const submitReasonModal = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      message.error(
        modalKind === 'reject'
          ? 'Nhập lý do từ chối.'
          : 'Nhập lý do ẩn.',
      );
      return;
    }

    if (modalKind === 'reject') {
      try {
        await onUpdateStatus({
          status: 'REJECTED',
          rejectReason: trimmed,
        });
        closeModal();
        runSuccess();
      } catch {
        /* axios / global handler */
      }
      return;
    }

    if (modalKind === 'hidden') {
      try {
        await onUpdateStatus({
          status: 'HIDDEN',
          hiddenReason: trimmed,
        });
        closeModal();
        runSuccess();
      } catch {
        /* axios / global handler */
      }
    }
  };

  const btnProps = compact
    ? { size: 'small' as const, type: 'link' as const }
    : { size: 'small' as const };

  const actionPending = approvePending || updateStatusPending;

  return (
    <>
      <Space size="small" wrap>
        <Select
          size="small"
          style={{ minWidth: compact ? 160 : 180 }}
          placeholder="Trạng thái"
          value={review.status}
          loading={actionPending}
          disabled={actionPending}
          options={STATUS_SELECT_OPTIONS.map((o) => ({
            ...o,
            disabled:
              (o.value === 'APPROVED' &&
                (review.status === 'APPROVED' ||
                  review.status === 'HIDDEN')) ||
              (o.value === 'HIDDEN' && review.status !== 'APPROVED'),
          }))}
          onSelect={handleStatusSelect}
          allowClear={false}
        />

        <Popconfirm
          title="Xóa mềm review này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() =>
            void (async () => {
              try {
                await onDelete();
                runSuccess();
              } catch {
                /* axios / global handler */
              }
            })()
          }
        >
          <Button {...btnProps} danger loading={deletePending}>
            Xóa mềm
          </Button>
        </Popconfirm>
      </Space>

      <Modal
        title={modalKind === 'reject' ? 'Lý do từ chối' : 'Lý do ẩn'}
        open={modalKind !== null}
        onCancel={closeModal}
        onOk={submitReasonModal}
        confirmLoading={updateStatusPending}
        destroyOnClose
      >
        <Input.TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            modalKind === 'reject'
              ? 'Nhập lý do từ chối...'
              : 'Nhập lý do ẩn khỏi public...'
          }
        />
      </Modal>
    </>
  );
}
