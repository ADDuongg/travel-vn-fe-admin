import {
  Alert,
  Card,
  Col,
  Grid,
  Row,
  Skeleton,
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
    title: 'Người dùng',
    icon: <UserAddOutlined />,
    color: '#c08532',
    bg: 'rgba(192, 133, 50, 0.08)',
  },
];

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          color: 'var(--text-muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.5px',
          lineHeight: 1.15,
          color: 'var(--text-primary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        background: `${color}12`,
        fontSize: 12,
        fontWeight: 500,
        color,
      }}
    >
      {label}: {count.toLocaleString('vi-VN')}
    </span>
  );
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#1f8a65',
  PENDING: '#c08532',
  CANCELLED: '#cf2d56',
  EXPIRED: '#dfa88f',
};

export default function OverviewCards({
  range,
  overview,
  isLoading,
  isError,
}: OverviewCardsProps) {
  const screens = useBreakpoint();

  if (isLoading) {
    return (
      <Row gutter={[screens.md ? 16 : 10, screens.md ? 16 : 10]}>
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
        style={{ borderRadius: 'var(--radius-md)' }}
      />
    );
  }

  const fmt = (v: number | undefined) => (v ?? 0).toLocaleString('vi-VN');
  const { bookings, revenue, users } = overview;
  const rangeLabel = RANGE_LABEL[range];

  return (
    <Row gutter={[screens.md ? 16 : 10, screens.md ? 16 : 10]}>
      {/* Bookings */}
      <Col xs={24} sm={24} md={8}>
        <Card style={{ height: '100%' }} styles={{ body: { padding: '20px' } }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span className="premium-icon-badge" style={{ background: CARDS_CONFIG[0].bg, color: CARDS_CONFIG[0].color }}>
              {CARDS_CONFIG[0].icon}
            </span>
            <Text style={{ fontSize: 14, fontWeight: 500 }}>{CARDS_CONFIG[0].title}</Text>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <StatBlock label="Hôm nay" value={fmt(bookings?.today)} />
            <StatBlock label={rangeLabel} value={fmt(bookings?.thisWeek)} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8 }}>
              Theo trạng thái
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(bookings?.byStatus ?? {}).map(([status, count]) => (
                <StatusPill
                  key={status}
                  label={status}
                  count={count}
                  color={STATUS_COLORS[status] ?? '#9fbbe0'}
                />
              ))}
            </div>
          </div>
        </Card>
      </Col>

      {/* Revenue */}
      <Col xs={24} sm={12} md={8}>
        <Card style={{ height: '100%' }} styles={{ body: { padding: '20px' } }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span className="premium-icon-badge" style={{ background: CARDS_CONFIG[1].bg, color: CARDS_CONFIG[1].color }}>
              {CARDS_CONFIG[1].icon}
            </span>
            <Text style={{ fontSize: 14, fontWeight: 500 }}>{CARDS_CONFIG[1].title}</Text>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <StatBlock
              label="Hôm nay"
              value={fmt(revenue?.today)}
            />
            <StatBlock
              label={rangeLabel}
              value={fmt(revenue?.thisWeek)}
            />
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 11, marginTop: 8, display: 'block' }}
          >
            {revenue?.currency ?? 'VND'}
          </Text>
        </Card>
      </Col>

      {/* Users */}
      <Col xs={24} sm={12} md={8}>
        <Card style={{ height: '100%' }} styles={{ body: { padding: '20px' } }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span className="premium-icon-badge" style={{ background: CARDS_CONFIG[2].bg, color: CARDS_CONFIG[2].color }}>
              {CARDS_CONFIG[2].icon}
            </span>
            <Text style={{ fontSize: 14, fontWeight: 500 }}>{CARDS_CONFIG[2].title}</Text>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <StatBlock label="Tổng user" value={fmt(users?.total)} />
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                }}
              >
                Mới ({rangeLabel})
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.15,
                  color: (users?.newThisWeek ?? 0) > 0 ? '#1f8a65' : 'var(--text-primary)',
                }}
              >
                {fmt(users?.newThisWeek)}
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
