import type { AdminDashboardOverview } from '@/services/dashboard.service';
import { Card, Empty, Grid, Skeleton, Typography } from 'antd';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const { useBreakpoint } = Grid;
const { Text } = Typography;

type RevenueTrendChartProps = {
  overview?: AdminDashboardOverview;
  loading?: boolean;
};

export default function RevenueTrendChart({
  overview,
  loading,
}: RevenueTrendChartProps) {
  const screens = useBreakpoint();
  const chartHeight = screens.md ? 280 : 200;

  const cardTitle = (
    <span className="premium-card-title">Xu hướng doanh thu</span>
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
            <Text
              type="secondary"
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              Chưa có dữ liệu để hiển thị biểu đồ.
            </Text>
          }
        />
      </Card>
    );
  }

  const data = [
    { label: 'Hôm nay', value: overview.revenue.today },
    { label: 'Trong khoảng', value: overview.revenue.thisWeek },
  ];

  return (
    <Card title={cardTitle} style={{ height: '100%' }}>
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: screens.sm ? 16 : 8,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f54e00" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#f54e00" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="none"
              stroke="var(--border-primary)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => Number(v).toLocaleString('vi-VN')}
              width={screens.sm ? 80 : 50}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString('vi-VN')} ${overview.revenue.currency}`
              }
              contentStyle={{
                background: 'var(--warm-surface-100)',
                border: '1px solid var(--border-primary)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-sm)',
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f54e00"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#fff',
                stroke: '#f54e00',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
