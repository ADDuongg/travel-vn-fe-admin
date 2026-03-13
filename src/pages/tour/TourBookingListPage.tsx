import { Button, Card, Select, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTourBookings } from '@/queries/tour-booking.queries';
import type { TourBooking, TourBookingStatus } from '@/interface/tour-booking';

const { Title } = Typography;

function getTourName(tourId: TourBooking['tourId']): string {
  if (!tourId || typeof tourId === 'string') return '—';
  const t = (tourId as { translations?: Record<string, { name?: string }> })
    .translations;
  return (
    t?.vi?.name || t?.en?.name || (tourId as { code?: string }).code || '—'
  );
}

const statusColor: Record<string, string> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  PAID: 'green',
  CANCELLED: 'red',
  COMPLETED: 'default',
};

export default function TourBookingListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState<TourBookingStatus | undefined>(
    undefined,
  );

  const { data, isLoading } = useAdminTourBookings({ page, limit, status });
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = data?.pagination;
  console.log('items', items);

  return (
    <Card>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Đơn tour
        </Title>
        <Select<TourBookingStatus | undefined>
          placeholder="Trạng thái"
          allowClear
          style={{ width: 160 }}
          value={status}
          onChange={setStatus}
          options={[
            { label: 'Pending', value: 'PENDING' },
            { label: 'Confirmed', value: 'CONFIRMED' },
            { label: 'Paid', value: 'PAID' },
            { label: 'Cancelled', value: 'CANCELLED' },
            { label: 'Completed', value: 'COMPLETED' },
          ]}
        />
      </Space>

      <Table<TourBooking>
        rowKey="_id"
        expandable={{
          childrenColumnName: 'antdChildren',
        }}
        loading={isLoading}
        dataSource={items}
        pagination={{
          current: pagination?.page ?? page,
          pageSize: pagination?.limit ?? limit,
          total: pagination?.total ?? 0,
          onChange: (p) => setPage(p),
        }}
        columns={[
          {
            title: 'Mã đặt',
            dataIndex: 'bookingCode',
            render: (code: string, row: TourBooking) => (
              <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                onClick={() => navigate(`/dashboard/tour-bookings/${row._id}`)}
              >
                {code}
              </Button>
            ),
          },
          {
            title: 'Tour',
            key: 'tour',
            render: (_: unknown, row: TourBooking) => getTourName(row.tourId),
          },
          {
            title: 'Ngày khởi hành',
            dataIndex: 'departureDate',
            render: (d: string) => (d ? String(d).slice(0, 10) : '—'),
          },
          {
            title: 'Khách',
            key: 'guest',
            render: (_: unknown, row: TourBooking) =>
              row.guest?.fullName || row.guest?.email || '—',
          },
          {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            render: (v: number, row: TourBooking) =>
              `${(v ?? 0).toLocaleString()} ${row.currency || 'VND'}`,
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={statusColor[s] || 'default'}>{s}</Tag>
            ),
          },
          {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            render: (d: string) => (d ? String(d).slice(0, 10) : '—'),
          },
        ]}
      />
    </Card>
  );
}
