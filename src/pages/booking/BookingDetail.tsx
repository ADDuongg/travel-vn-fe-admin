import { Button, Card, Descriptions, Popconfirm, Space, Typography } from 'antd';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAdminBooking,
  useCancelBooking,
  useMarkBookingPaid,
  useRefundBooking,
} from '@/queries/booking.queries';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';

const { Text } = Typography;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: 'rgba(192, 133, 50, 0.1)', color: '#c08532' },
  CONFIRMED: { bg: 'rgba(31, 138, 101, 0.1)', color: '#1f8a65' },
  CANCELLED: { bg: 'rgba(207, 45, 86, 0.1)', color: '#cf2d56' },
  EXPIRED: { bg: 'rgba(223, 168, 143, 0.15)', color: '#b07a5e' },
};

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
  UNPAID: { bg: 'rgba(192, 133, 50, 0.1)', color: '#c08532' },
  PAID: { bg: 'rgba(31, 138, 101, 0.1)', color: '#1f8a65' },
  REFUNDED: { bg: 'rgba(159, 187, 224, 0.15)', color: '#5a8bb5' },
  FAILED: { bg: 'rgba(207, 45, 86, 0.1)', color: '#cf2d56' },
  EXPIRED: { bg: 'rgba(223, 168, 143, 0.15)', color: '#b07a5e' },
};

function LargePill({ value, map }: { value: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[value] ?? { bg: 'var(--warm-surface-300)', color: 'var(--text-secondary)' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg,
      color: s.color,
      fontSize: 13,
      fontWeight: 500,
    }}>
      {value}
    </span>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useRbac();

  const { data: booking, isLoading } = useAdminBooking(id);
  const markPaidMutation = useMarkBookingPaid();
  const cancelMutation = useCancelBooking();
  const refundMutation = useRefundBooking();

  const roomName = useMemo(
    () => booking?.rooms?.[0]?.room?.name || booking?.rooms?.[0]?.room?.slug || '---',
    [booking],
  );

  const quantity = booking?.rooms?.length ?? 0;
  const checkIn = booking?.rooms?.[0]?.checkIn;
  const checkOut = booking?.rooms?.[0]?.checkOut;
  const guests = booking?.rooms?.[0]?.guests;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card loading={isLoading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px' }}>
              Booking #{id?.slice(-6)}
            </h4>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {booking?.user?.email || booking?.user?.name || '---'}
            </Text>
          </div>
          <Space>
            <Button onClick={() => navigate('/dashboard/bookings')}>Back</Button>
            {booking?.paymentStatus === 'UNPAID' && can(RBAC.booking.update) && (
              <Popconfirm title="Mark as PAID?" onConfirm={() => id && markPaidMutation.mutate(id)}>
                <Button type="primary" loading={markPaidMutation.isPending}>Mark as paid</Button>
              </Popconfirm>
            )}
            {booking?.paymentStatus === 'UNPAID' && can(RBAC.booking.cancel) && (
              <Popconfirm title="Cancel booking?" onConfirm={() => id && cancelMutation.mutate(id)}>
                <Button danger loading={cancelMutation.isPending}>Cancel</Button>
              </Popconfirm>
            )}
            {booking?.paymentStatus === 'PAID' && can(RBAC.booking.refund) && (
              <Popconfirm title="Refund booking?" onConfirm={() => id && refundMutation.mutate({ id, fullyRefunded: true })}>
                <Button danger loading={refundMutation.isPending}>Refund</Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Room">{roomName}</Descriptions.Item>
          <Descriptions.Item label="Quantity">{quantity}</Descriptions.Item>
          <Descriptions.Item label="Amount">
            <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {(booking?.amount ?? 0).toLocaleString()} {booking?.currency || 'VND'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <LargePill value={String(booking?.status ?? '')} map={STATUS_STYLES} />
          </Descriptions.Item>
          <Descriptions.Item label="Payment">
            <LargePill value={String(booking?.paymentStatus ?? '')} map={PAYMENT_STYLES} />
          </Descriptions.Item>
          <Descriptions.Item label="Stay">
            {checkIn ? String(checkIn).slice(0, 10) : '---'} → {checkOut ? String(checkOut).slice(0, 10) : '---'}
          </Descriptions.Item>
          <Descriptions.Item label="Guests">
            {guests ? `${guests.adults} adult, ${guests.children} child` : '---'}
          </Descriptions.Item>
          <Descriptions.Item label="Receipt">
            {booking?.bankReceipt?.url ? (
              <a href={booking.bankReceipt.url} target="_blank" rel="noreferrer">View receipt</a>
            ) : '---'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
