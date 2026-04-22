import { Button, Card, Descriptions, Popconfirm, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAdminBooking,
  useCancelBooking,
  useMarkBookingPaid,
  useRefundBooking,
} from '@/queries/booking.queries';

const { Title } = Typography;

const statusColor: Record<string, string> = {
  PENDING: 'orange',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  EXPIRED: 'default',
};

const paymentColor: Record<string, string> = {
  UNPAID: 'orange',
  PAID: 'green',
  REFUNDED: 'blue',
  FAILED: 'red',
  EXPIRED: 'default',
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: booking, isLoading } = useAdminBooking(id);
  const markPaidMutation = useMarkBookingPaid();
  const cancelMutation = useCancelBooking();
  const refundMutation = useRefundBooking();

  const roomName = useMemo(
    () => booking?.rooms?.[0]?.room?.name || booking?.rooms?.[0]?.room?.slug || '—',
    [booking],
  );

  const quantity = booking?.rooms?.length ?? 0;
  const checkIn = booking?.rooms?.[0]?.checkIn;
  const checkOut = booking?.rooms?.[0]?.checkOut;
  const guests = booking?.rooms?.[0]?.guests;

  return (
    <Card loading={isLoading}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <div>
          <Title level={5} style={{ marginBottom: 0 }}>
            Booking #{id?.slice(-6)}
          </Title>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {booking?.user?.email || booking?.user?.name || '—'}
          </div>
        </div>

        <Space>
          <Button onClick={() => navigate('/dashboard/bookings')}>Back</Button>

          {booking?.paymentStatus === 'UNPAID' && (
            <Popconfirm
              title="Mark this booking as PAID?"
              okText="Mark as paid"
              cancelText="Cancel"
              onConfirm={() => id && markPaidMutation.mutate(id)}
            >
              <Button type="primary" loading={markPaidMutation.isPending}>
                Mark as paid
              </Button>
            </Popconfirm>
          )}

          {booking?.paymentStatus === 'UNPAID' && (
            <Popconfirm
              title="Cancel this unpaid booking? Inventory will be released if before check-in."
              okText="Cancel booking"
              cancelText="No"
              onConfirm={() => id && cancelMutation.mutate(id)}
            >
              <Button danger loading={cancelMutation.isPending}>
                Cancel
              </Button>
            </Popconfirm>
          )}

          {booking?.paymentStatus === 'PAID' && (
            <Popconfirm
              title="Refund this paid booking? Inventory will be released if before check-in."
              okText="Refund"
              cancelText="No"
              onConfirm={() => id && refundMutation.mutate({ id, fullyRefunded: true })}
            >
              <Button danger loading={refundMutation.isPending}>
                Refund
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Space>

      <Descriptions bordered size="small" style={{ marginTop: 16 }}>
        <Descriptions.Item label="Room">{roomName}</Descriptions.Item>
        <Descriptions.Item label="Quantity">{quantity}</Descriptions.Item>
        <Descriptions.Item label="Amount">
          {(booking?.amount ?? 0).toLocaleString()} {booking?.currency || 'VND'}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusColor[String(booking?.status)] || 'default'}>
            {booking?.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Payment">
          <Tag color={paymentColor[String(booking?.paymentStatus)] || 'default'}>
            {booking?.paymentStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Stay">
          {checkIn ? String(checkIn).slice(0, 10) : '—'} →{' '}
          {checkOut ? String(checkOut).slice(0, 10) : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Guests">
          {guests ? `${guests.adults} adult, ${guests.children} child` : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Receipt">
          {booking?.bankReceipt?.url ? (
            <a href={booking.bankReceipt.url} target="_blank" rel="noreferrer">
              View receipt
            </a>
          ) : (
            '—'
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

