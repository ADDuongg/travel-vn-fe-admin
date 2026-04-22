import { Card, Empty, Grid, Skeleton, Typography } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import type { AdminDashboardOverview } from '@/services/dashboard.service';

const { useBreakpoint } = Grid;
const { Text } = Typography;

type BookingStatusPieProps = {
  overview?: AdminDashboardOverview;
  loading?: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#1f8a65',
  PENDING: '#c08532',
  CANCELLED: '#cf2d56',
  EXPIRED: '#dfa88f',
};

function CustomLegend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginTop: 12,
      }}
    >
      {data.map((entry) => (
        <span
          key={entry.name}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--warm-surface-300)',
            fontSize: 12,
            fontWeight: 450,
            color: 'var(--text-primary)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: STATUS_COLORS[entry.name] ?? '#9fbbe0',
              flexShrink: 0,
            }}
          />
          {entry.name}
          <span style={{ color: 'var(--text-muted)' }}>
            {entry.value.toLocaleString('vi-VN')}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function BookingStatusPie({ overview, loading }: BookingStatusPieProps) {
  const screens = useBreakpoint();
  const chartHeight = screens.md ? 240 : 200;

  const cardTitle = (
    <span className="premium-card-title">Trạng thái booking</span>
  );

  if (loading) {
    return (
      <Card title={cardTitle} style={{ height: '100%' }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card title={cardTitle} style={{ height: '100%' }}>
        <Empty
          description={
            <Text type="secondary" style={{ fontFamily: 'var(--font-editorial)' }}>
              Chưa có dữ liệu để hiển thị biểu đồ.
            </Text>
          }
        />
      </Card>
    );
  }

  const data = Object.entries(overview.bookings.byStatus).map(([status, value]) => ({
    name: status,
    value,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card title={cardTitle} style={{ height: '100%' }}>
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="52%"
              outerRadius="80%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] ?? '#9fbbe0'}
                />
              ))}
              <Label
                position="center"
                content={() => (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    <tspan
                      x="50%"
                      dy="-6"
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        fill: 'var(--text-primary)',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {total.toLocaleString('vi-VN')}
                    </tspan>
                    <tspan
                      x="50%"
                      dy="18"
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        fill: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      TOTAL
                    </tspan>
                  </text>
                )}
              />
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString('vi-VN')} booking`
              }
              contentStyle={{
                background: 'var(--warm-surface-100)',
                border: '1px solid var(--border-primary)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-sm)',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend data={data} />
    </Card>
  );
}
