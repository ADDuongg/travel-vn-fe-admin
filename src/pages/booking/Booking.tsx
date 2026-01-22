import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
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

export default function BookingPage() {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0); // 0-based for API
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
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <Title level={5}>Bookings</Title>

        <Space>
          <Input.Search
            placeholder="Search (room / tour / user email)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(value) => {
              setPageIndex(0);
              setSearch(value.trim());
            }}
            allowClear
            style={{ width: 320 }}
          />

          <Select
            placeholder="Booking type"
            style={{ width: 140 }}
            value={bookingType}
            onChange={(v) => {
              setBookingType(v);
              setPageIndex(0);
            }}
            options={[
              { label: 'Room', value: 'ROOM' },
              { label: 'Tour', value: 'TOUR' },
            ]}
          />

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 140 }}
            value={status}
            onChange={(v) => {
              setStatus(v as BookingStatus | undefined);
              setPageIndex(0);
            }}
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'Expired', value: 'EXPIRED' },
            ]}
          />

          <Select
            placeholder="Payment"
            allowClear
            style={{ width: 140 }}
            value={paymentStatus}
            onChange={(v) => {
              setPaymentStatus(v as BookingPaymentStatus | undefined);
              setPageIndex(0);
            }}
            options={[
              { label: 'Unpaid', value: 'UNPAID' },
              { label: 'Paid', value: 'PAID' },
              { label: 'Refunded', value: 'REFUNDED' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Expired', value: 'EXPIRED' },
            ]}
          />
        </Space>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        style={{ marginTop: 16 }}
        dataSource={tableData}
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
                  style={{ fontWeight: 600 }}
                  onClick={() => navigate(`/dashboard/bookings/${b._id}`)}
                >
                  #{b._id.slice(-6)}
                </a>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {b.user?.email || b.user?.name || '—'}
                </div>
              </div>
            ),
          },
          {
            title: 'Room',
            render: (_: unknown, b: AdminBooking) =>
              b.rooms?.[0]?.room?.name || b.rooms?.[0]?.room?.slug || '—',
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
            render: (v: number, b: AdminBooking) =>
              `${(v ?? 0).toLocaleString()} ${b.currency || 'VND'}`,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (v: string) => <Tag color={statusColor[v] || 'default'}>{v}</Tag>,
          },
          {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            render: (v: string) => <Tag color={paymentColor[v] || 'default'}>{v}</Tag>,
          },
          {
            title: 'Receipt',
            render: (_: unknown, b: AdminBooking) =>
              b.bankReceipt?.url ? (
                <a href={b.bankReceipt.url} target="_blank" rel="noreferrer">
                  View
                </a>
              ) : (
                '—'
              ),
          },
          {
            title: 'Actions',
            render: (_: unknown, b: AdminBooking) => (
              <Space>
                {b.paymentStatus === 'UNPAID' && (
                  <>
                    <Popconfirm
                      title="Mark this booking as PAID?"
                      okText="Mark as paid"
                      cancelText="Cancel"
                      onConfirm={() => markPaidMutation.mutate(b._id)}
                    >
                      <Button
                        size="small"
                        type="primary"
                        loading={markPaidMutation.isPending}
                      >
                        Mark as paid
                      </Button>
                    </Popconfirm>

                    <Popconfirm
                      title="Cancel this unpaid booking? Inventory will be released if before check-in."
                      okText="Cancel booking"
                      cancelText="No"
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
                  </>
                )}

                {b.paymentStatus === 'PAID' && (
                  <Popconfirm
                    title="Refund this paid booking? Inventory will be released if before check-in."
                    okText="Refund"
                    cancelText="No"
                    onConfirm={() =>
                      refundMutation.mutate({ id: b._id, fullyRefunded: true })
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
                )}
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}

