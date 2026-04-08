import { Button, Card, Drawer, Empty, Grid, Select, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAdminTourBookings } from '@/queries/tour-booking.queries';
import type { TourBooking, TourBookingStatus } from '@/interface/tour-booking';
import tableStyles from '@/styles/promax-table.module.css';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [status, setStatus] = useState<TourBookingStatus | undefined>(
    undefined,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useAdminTourBookings({ page, limit, status });
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = data?.pagination;

  const filters = (
    <div className={tableStyles.filtersForm}>
      <Select<TourBookingStatus | undefined>
        placeholder="Trạng thái"
        allowClear
        value={status}
        onChange={(v) => {
          setPage(1);
          setStatus(v);
        }}
        options={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'Confirmed', value: 'CONFIRMED' },
          { label: 'Paid', value: 'PAID' },
          { label: 'Cancelled', value: 'CANCELLED' },
          { label: 'Completed', value: 'COMPLETED' },
        ]}
      />
    </div>
  );

  return (
    <div className={tableStyles.page} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card className={tableStyles.mainCard}>
          <div className={tableStyles.header}>
            <div className={tableStyles.titleWrap}>
              <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
                Đơn tour
              </Title>
              <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
                Danh sách đơn đặt tour, theo dõi trạng thái và chi tiết thanh toán.
              </Text>
            </div>

            <div className={tableStyles.toolbar}>
              {!screens.md && (
                <Button icon={<FilterOutlined />} onClick={() => setFiltersOpen(true)}>
                  Bộ lọc
                </Button>
              )}
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
                Làm mới
              </Button>
            </div>
          </div>

          {screens.md ? (
            <div style={{ marginTop: 12 }}>{filters}</div>
          ) : (
            <Drawer
              title="Bộ lọc"
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              placement="right"
              width={360}
            >
              {filters}
            </Drawer>
          )}

          <Table<TourBooking>
            rowKey="_id"
            expandable={{
              childrenColumnName: 'antdChildren',
            }}
            loading={isLoading}
            dataSource={items}
            size={screens.md ? 'middle' : 'small'}
            scroll={{ x: 900 }}
            locale={{
              emptyText: (
                <Empty description="Không có đơn tour phù hợp với điều kiện lọc." />
              ),
            }}
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
                width: 140,
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
                width: 230,
                ellipsis: true,
                responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
                render: (_: unknown, row: TourBooking) => getTourName(row.tourId),
              },
              {
                title: 'Ngày khởi hành',
                dataIndex: 'departureDate',
                width: 140,
                responsive: ['sm', 'md', 'lg', 'xl'],
                render: (d: string) => (d ? String(d).slice(0, 10) : '—'),
              },
              {
                title: 'Khách',
                key: 'guest',
                width: 220,
                ellipsis: true,
                responsive: ['sm', 'md', 'lg', 'xl'],
                render: (_: unknown, row: TourBooking) =>
                  row.guest?.fullName || row.guest?.email || '—',
              },
              {
                title: 'Tổng tiền',
                dataIndex: 'totalAmount',
                width: 140,
                responsive: ['md', 'lg', 'xl'],
                render: (v: number, row: TourBooking) =>
                  `${(v ?? 0).toLocaleString()} ${row.currency || 'VND'}`,
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                width: 120,
                render: (s: string) => (
                  <Tag color={statusColor[s] || 'default'}>{s}</Tag>
                ),
              },
              {
                title: 'Ngày tạo',
                dataIndex: 'createdAt',
                width: 140,
                responsive: ['md', 'lg', 'xl'],
                render: (d: string) => (d ? String(d).slice(0, 10) : '—'),
              },
            ]}
          />
      </Card>
    </div>
  );
}
