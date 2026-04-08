import { Card, Grid } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { AdminDashboardOverview } from '@/services/dashboard.service';

const { useBreakpoint } = Grid;

type RevenueTrendChartProps = {
  overview?: AdminDashboardOverview;
};

export default function RevenueTrendChart({ overview }: RevenueTrendChartProps) {
  const screens = useBreakpoint();

  if (!overview) return null;

  const data = [
    { label: 'Hôm nay', value: overview.revenue.today },
    { label: 'Trong khoảng', value: overview.revenue.thisWeek },
  ];

  const chartHeight = screens.md ? 260 : 200;

  return (
    <Card title="Revenue Trend" style={{ borderRadius: 12, height: '100%' }}>
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 16,
              right: screens.sm ? 24 : 8,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: screens.sm ? 14 : 11 }} />
            <YAxis
              tickFormatter={(v) => Number(v).toLocaleString('vi-VN')}
              width={screens.sm ? 80 : 50}
              tick={{ fontSize: screens.sm ? 14 : 11 }}
            />
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString('vi-VN')} ${overview.revenue.currency}`
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1677ff"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
