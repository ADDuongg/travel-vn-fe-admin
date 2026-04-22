import { Button, Card, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAdminBookings } from '@/queries/booking.queries';
import type { AdminBooking } from '@/services/booking.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route.constant';

const { Text } = Typography;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  CONFIRMED: { bg: 'rgba(31, 138, 101, 0.1)', color: '#1f8a65' },
  PENDING: { bg: 'rgba(192, 133, 50, 0.1)', color: '#c08532' },
  CANCELLED: { bg: 'rgba(207, 45, 86, 0.1)', color: '#cf2d56' },
  EXPIRED: { bg: 'rgba(223, 168, 143, 0.15)', color: '#b07a5e' },
};

function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { bg: 'var(--warm-surface-300)', color: 'var(--text-secondary)' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--radius-pill)',
        background: style.bg,
        color: style.color,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
      }}
    >
      {status}
    </span>
  );
}

export default function RecentBookingsTable() {
  const { data, isLoading } = useAdminBookings({
    pageIndex: 1,
    pageSize: 5,
  });
  const navigate = useNavigate();

  const columns: ColumnsType<AdminBooking> = [
    {
      title: 'User',
      dataIndex: ['user', 'email'],
      key: 'user',
      ellipsis: true,
      width: 180,
      render: (_, record) => (
        <Text style={{ fontSize: 13 }}>
          {record.user?.email ?? record.user?._id ?? 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'bookingType',
      key: 'bookingType',
      width: 100,
      render: (val) => <Text style={{ fontSize: 13 }}>{val}</Text>,
    },
    {
      title: 'Giá',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (value, record) => (
        <Text style={{ fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '-0.3px' }}>
          {value.toLocaleString('vi-VN')} {record.currency ?? ''}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: AdminBooking['status']) => <StatusPill status={status} />,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(value).toLocaleString('vi-VN', { hour12: false })}
        </Text>
      ),
    },
  ];

  const cardTitle = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <span className="premium-card-title">Recent Bookings</span>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          5 booking mới nhất
        </div>
      </div>
      <Button
        type="link"
        size="small"
        onClick={() => navigate(ROUTES.BOOKING.INDEX)}
        style={{ fontSize: 13, fontWeight: 450 }}
      >
        Xem tất cả
      </Button>
    </div>
  );

  return (
    <Card title={cardTitle}>
      <Table<AdminBooking>
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.data ?? []}
        pagination={false}
        size="small"
        scroll={{ x: 690 }}
      />
    </Card>
  );
}
