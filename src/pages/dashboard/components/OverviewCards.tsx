import {
  Alert,
  Card,
  Col,
  Divider,
  Grid,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type {
  AdminDashboardOverview,
  DashboardRange,
} from '@/services/dashboard.service';

const { Text } = Typography;
const { useBreakpoint } = Grid;

type OverviewCardsProps = {
  range: DashboardRange;
  overview?: AdminDashboardOverview;
  isLoading?: boolean;
  isError?: boolean;
};

const RANGE_LABEL: Record<DashboardRange, string> = {
  today: 'Hôm nay',
  '7d': '7 ngày',
  '30d': '30 ngày',
  custom: 'Tùy chọn',
};

export default function OverviewCards({
  range,
  overview,
  isLoading,
  isError,
}: OverviewCardsProps): JSX.Element {
  const screens = useBreakpoint();

  const cardPadding = screens.md ? '20px 24px' : '14px 16px';
  const iconSize = screens.md ? 40 : 34;
  const iconFontSize = screens.md ? 20 : 16;
  const titleFontSize = screens.md ? 16 : 14;

  if (isLoading) {
    return (
      <Row gutter={[screens.md ? 16 : 8, screens.md ? 16 : 8]}>
        {[1, 2, 3].map((i) => (
          <Col xs={24} sm={24} md={8} key={i}>
            <Card style={{ borderRadius: 12 }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (isError || !overview) {
    return (
      <Alert
        type="error"
        message="Không thể tải dữ liệu tổng quan dashboard."
      />
    );
  }

  const fmt = (v: number | undefined) => (v ?? 0).toLocaleString('vi-VN');

  const { bookings, revenue, users } = overview;
  const rangeLabel = RANGE_LABEL[range];

  return (
    <Row gutter={[screens.md ? 16 : 8, screens.md ? 16 : 8]}>
      {/* Bookings Card */}
      <Col xs={24} sm={24} md={8}>
        <Card
          style={{ borderRadius: 12, height: '100%' }}
          styles={{ body: { padding: cardPadding } }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: screens.md ? 16 : 12,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: iconSize,
                height: iconSize,
                borderRadius: 10,
                background: 'rgba(22,119,255,0.1)',
                color: '#1677ff',
                fontSize: iconFontSize,
              }}
            >
              <ShoppingCartOutlined />
            </span>
            <Text strong style={{ fontSize: titleFontSize }}>
              Bookings
            </Text>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="Hôm nay" value={fmt(bookings?.today)} />
            </Col>
            <Col span={12}>
              <Statistic title={rangeLabel} value={fmt(bookings?.thisWeek)} />
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          <Text type="secondary" style={{ fontSize: 12 }}>
            Theo trạng thái
          </Text>
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {Object.entries(bookings?.byStatus ?? {}).map(
              ([status, count]) => (
                <Tag key={status} color={getStatusColor(status)}>
                  {status}: {fmt(count)}
                </Tag>
              ),
            )}
          </div>
        </Card>
      </Col>

      {/* Revenue Card */}
      <Col xs={24} sm={12} md={8}>
        <Card
          style={{ borderRadius: 12, height: '100%' }}
          styles={{ body: { padding: cardPadding } }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: screens.md ? 16 : 12,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: iconSize,
                height: iconSize,
                borderRadius: 10,
                background: 'rgba(82,196,26,0.1)',
                color: '#52c41a',
                fontSize: iconFontSize,
              }}
            >
              <DollarOutlined />
            </span>
            <Text strong style={{ fontSize: titleFontSize }}>
              Doanh thu
            </Text>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Hôm nay"
                value={fmt(revenue?.today)}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {revenue?.currency ?? 'VND'}
                  </Text>
                }
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={rangeLabel}
                value={fmt(revenue?.thisWeek)}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {revenue?.currency ?? 'VND'}
                  </Text>
                }
              />
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Users Card */}
      <Col xs={24} sm={12} md={8}>
        <Card
          style={{ borderRadius: 12, height: '100%' }}
          styles={{ body: { padding: cardPadding } }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: screens.md ? 16 : 12,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: iconSize,
                height: iconSize,
                borderRadius: 10,
                background: 'rgba(114,46,209,0.1)',
                color: '#722ed1',
                fontSize: iconFontSize,
              }}
            >
              <UserAddOutlined />
            </span>
            <Text strong style={{ fontSize: titleFontSize }}>
              Users
            </Text>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="Tổng user" value={fmt(users?.total)} />
            </Col>
            <Col span={12}>
              <Statistic
                title={`Mới (${rangeLabel})`}
                value={fmt(users?.newThisWeek)}
                valueStyle={{
                  color: (users?.newThisWeek ?? 0) > 0 ? '#52c41a' : undefined,
                }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'green';
    case 'PENDING':
      return 'gold';
    case 'CANCELLED':
      return 'red';
    case 'EXPIRED':
      return 'volcano';
    default:
      return 'blue';
  }
}
