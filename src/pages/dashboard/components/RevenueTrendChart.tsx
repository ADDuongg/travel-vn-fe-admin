import { Card, Empty, Grid, Skeleton, Typography } from 'antd';
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

  const chartHeight = screens.md ? 260 : 200;

  if (loading) {
    return (
      <Card title="Xu hướng doanh thu" style={{ borderRadius: 12, height: '100%' }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card title="Xu hướng doanh thu" style={{ borderRadius: 12, height: '100%' }}>
        <Empty
          description={
            <Text type="secondary">Chưa có dữ liệu để hiển thị biểu đồ.</Text>
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
    <Card title="Xu hướng doanh thu" style={{ borderRadius: 12, height: '100%' }}>
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
              stroke="#1E40AF"
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
