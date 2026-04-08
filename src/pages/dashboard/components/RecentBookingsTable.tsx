import { Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAdminBookings } from '@/queries/booking.queries';
import type { AdminBooking } from '@/services/booking.service';

const { Text } = Typography;

export default function RecentBookingsTable() {
  const { data, isLoading } = useAdminBookings({
    pageIndex: 1,
    pageSize: 5,
  });

  const columns: ColumnsType<AdminBooking> = [
    {
      title: 'User',
      dataIndex: ['user', 'email'],
      key: 'user',
      ellipsis: true,
      width: 180,
      render: (_, record) => record.user?.email ?? record.user?._id ?? 'N/A',
    },
    {
      title: 'Loại',
      dataIndex: 'bookingType',
      key: 'bookingType',
      width: 100,
    },
    {
      title: 'Giá',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      render: (value, record) =>
        `${value.toLocaleString('vi-VN')} ${record.currency ?? ''}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: AdminBooking['status']) => {
        const color =
          status === 'CONFIRMED'
            ? 'green'
            : status === 'PENDING'
              ? 'gold'
              : status === 'CANCELLED'
                ? 'red'
                : 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) =>
        new Date(value).toLocaleString('vi-VN', { hour12: false }),
    },
  ];

  return (
    <Card
      style={{ marginTop: 16, borderRadius: 12 }}
      title={
        <Space direction="vertical" size={0}>
          <Text strong>Recent Bookings</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            5 booking mới nhất
          </Text>
        </Space>
      }
    >
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
