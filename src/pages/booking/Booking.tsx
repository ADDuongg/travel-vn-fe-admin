import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import {
  useAdminBookings,
  useMarkBookingPaid,
  useCancelBooking,
  useRefundBooking,
} from '@/queries/booking.queries';
import { useNavigate } from 'react-router-dom';
import type {
  AdminBooking,
  BookingPaymentStatus,
  BookingStatus,
  BookingType,
} from '@/services/booking.service';
import PageShell from '@/components/PageShell';
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

function StatusPill({ value, map }: { value: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[value] ?? { bg: 'var(--warm-surface-300)', color: 'var(--text-secondary)' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg,
      color: s.color,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '20px',
    }}>
      {value}
    </span>
  );
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { can } = useRbac();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [q, setQ] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [bookingType, setBookingType] = useState<BookingType>('ROOM');
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<
    BookingPaymentStatus | undefined
  >(undefined);

  const { data, isLoading } = useAdminBookings({
    pageIndex,
    pageSize,
    bookingType,
    status,
    paymentStatus,
    q: search || undefined,
  });

  const markPaidMutation = useMarkBookingPaid();
  const cancelMutation = useCancelBooking();
  const refundMutation = useRefundBooking();

  const tableData = useMemo(() => data?.data ?? [], [data?.data]);

  return (
    <PageShell
      title="Bookings"
      subtitle="Quản lý đặt phòng, thanh toán và hoàn tiền."
    >
      <Card>
        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 16,
          padding: '10px 14px',
          background: 'var(--warm-surface-300)',
          borderRadius: 'var(--radius-md)',
        }}>
          <Input.Search
            placeholder="Tìm kiếm (room / tour / email)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(value) => {
              setPageIndex(0);
              setSearch(value.trim());
            }}
            allowClear
            style={{ width: 280 }}
          />
          <Select
            placeholder="Loại booking"
            style={{ width: 130 }}
            value={bookingType}
            onChange={(v) => { setBookingType(v); setPageIndex(0); }}
            options={[
              { label: 'Room', value: 'ROOM' },
              { label: 'Tour', value: 'TOUR' },
            ]}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 130 }}
            value={status}
            onChange={(v) => { setStatus(v as BookingStatus | undefined); setPageIndex(0); }}
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'Expired', value: 'EXPIRED' },
            ]}
          />
          <Select
            placeholder="Thanh toán"
            allowClear
            style={{ width: 130 }}
            value={paymentStatus}
            onChange={(v) => { setPaymentStatus(v as BookingPaymentStatus | undefined); setPageIndex(0); }}
            options={[
              { label: 'Unpaid', value: 'UNPAID' },
              { label: 'Paid', value: 'PAID' },
              { label: 'Refunded', value: 'REFUNDED' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Expired', value: 'EXPIRED' },
            ]}
          />
        </div>

        <Table
          rowKey="_id"
          loading={isLoading}
          dataSource={tableData}
          size="middle"
          pagination={{
            current: (data?.meta?.pageIndex ?? pageIndex) + 1,
            pageSize: data?.meta?.pageSize ?? pageSize,
            total: data?.meta?.total ?? 0,
            onChange: (page) => setPageIndex(page - 1),
          }}
          columns={[
            {
              title: 'Booking',
              render: (_: unknown, b: AdminBooking) => (
                <div>
                  <a
                    style={{ fontWeight: 500, fontSize: 13 }}
                    onClick={() => navigate(`/dashboard/bookings/${b._id}`)}
                  >
                    #{b._id.slice(-6)}
                  </a>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {b.user?.email || b.user?.name || '---'}
                  </div>
                </div>
              ),
            },
            {
              title: 'Room',
              render: (_: unknown, b: AdminBooking) => (
                <Text style={{ fontSize: 13 }}>
                  {b.rooms?.[0]?.room?.name || b.rooms?.[0]?.room?.slug || '---'}
                </Text>
              ),
            },
            {
              title: 'Amount',
              dataIndex: 'amount',
              width: 140,
              render: (v: number, b: AdminBooking) => (
                <Text style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  {(v ?? 0).toLocaleString()} {b.currency || 'VND'}
                </Text>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (v: string) => <StatusPill value={v} map={STATUS_STYLES} />,
            },
            {
              title: 'Payment',
              dataIndex: 'paymentStatus',
              width: 120,
              render: (v: string) => <StatusPill value={v} map={PAYMENT_STYLES} />,
            },
            {
              title: 'Receipt',
              width: 80,
              render: (_: unknown, b: AdminBooking) =>
                b.bankReceipt?.url ? (
                  <a href={b.bankReceipt.url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                    View
                  </a>
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>---</Text>
                ),
            },
            ...(can(RBAC.booking.update) ||
            can(RBAC.booking.cancel) ||
            can(RBAC.booking.refund)
              ? [
                  {
                    title: 'Actions',
                    width: 200,
                    render: (_: unknown, b: AdminBooking) => (
                      <Space size={4}>
                        {b.paymentStatus === 'UNPAID' && (
                          <>
                            {can(RBAC.booking.update) ? (
                              <Popconfirm
                                title="Mark this booking as PAID?"
                                onConfirm={() => markPaidMutation.mutate(b._id)}
                              >
                                <Button
                                  size="small"
                                  type="primary"
                                  loading={markPaidMutation.isPending}
                                >
                                  Paid
                                </Button>
                              </Popconfirm>
                            ) : null}
                            {can(RBAC.booking.cancel) ? (
                              <Popconfirm
                                title="Cancel this unpaid booking?"
                                onConfirm={() => cancelMutation.mutate(b._id)}
                              >
                                <Button
                                  size="small"
                                  danger
                                  loading={cancelMutation.isPending}
                                >
                                  Cancel
                                </Button>
                              </Popconfirm>
                            ) : null}
                          </>
                        )}
                        {b.paymentStatus === 'PAID' && can(RBAC.booking.refund) ? (
                          <Popconfirm
                            title="Refund this paid booking?"
                            onConfirm={() =>
                              refundMutation.mutate({
                                id: b._id,
                                fullyRefunded: true,
                              })
                            }
                          >
                            <Button
                              size="small"
                              danger
                              loading={refundMutation.isPending}
                            >
                              Refund
                            </Button>
                          </Popconfirm>
                        ) : null}
                      </Space>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </PageShell>
  );
}
