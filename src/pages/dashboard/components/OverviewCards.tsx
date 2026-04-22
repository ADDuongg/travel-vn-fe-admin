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
  theme,
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

const CARDS_CONFIG = [
  {
    key: 'bookings' as const,
    title: 'Bookings',
    icon: <ShoppingCartOutlined />,
    color: '#f54e00',
    bg: 'rgba(245, 78, 0, 0.08)',
  },
  {
    key: 'revenue' as const,
    title: 'Doanh thu',
    icon: <DollarOutlined />,
    color: '#1f8a65',
    bg: 'rgba(31, 138, 101, 0.08)',
  },
  {
    key: 'users' as const,
    title: 'Users',
    icon: <UserAddOutlined />,
    color: '#c08532',
    bg: 'rgba(192, 133, 50, 0.08)',
  },
];

export default function OverviewCards({
  range,
  overview,
  isLoading,
  isError,
}: OverviewCardsProps) {
  const screens = useBreakpoint();
  const { token } = theme.useToken();

  const iconSize = screens.md ? 40 : 34;
  const iconFontSize = screens.md ? 20 : 16;
  const titleFontSize = screens.md ? 15 : 13;

  if (isLoading) {
    return (
      <Row gutter={[screens.md ? 16 : 8, screens.md ? 16 : 8]}>
        {[1, 2, 3].map((i) => (
          <Col xs={24} sm={24} md={8} key={i}>
            <Card>
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
      <Col xs={24} sm={24} md={8}>
        <Card style={{ height: '100%' }}>
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
                borderRadius: 8,
                background: CARDS_CONFIG[0].bg,
                color: CARDS_CONFIG[0].color,
                fontSize: iconFontSize,
              }}
            >
              {CARDS_CONFIG[0].icon}
            </span>
            <Text strong style={{ fontSize: titleFontSize }}>
              {CARDS_CONFIG[0].title}
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

          <Divider style={{ margin: '12px 0', borderColor: token.colorBorderSecondary }} />

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

      <Col xs={24} sm={12} md={8}>
        <Card style={{ height: '100%' }}>
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
                borderRadius: 8,
                background: CARDS_CONFIG[1].bg,
                color: CARDS_CONFIG[1].color,
                fontSize: iconFontSize,
              }}
            >
              {CARDS_CONFIG[1].icon}
            </span>
            <Text strong style={{ fontSize: titleFontSize }}>
              {CARDS_CONFIG[1].title}
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

      <Col xs={24} sm={12} md={8}>
        <Card style={{ height: '100%' }}>
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
                borderRadius: 8,
                background: CARDS_CONFIG[2].bg,
                color: CARDS_CONFIG[2].color,
                fontSize: iconFontSize,
              }}
            >
              {CARDS_CONFIG[2].icon}
            </span>
            <Text strong style={{ fontSize: titleFontSize }}>
              {CARDS_CONFIG[2].title}
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
                  color: (users?.newThisWeek ?? 0) > 0 ? '#1f8a65' : undefined,
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
      return 'orange';
  }
}
