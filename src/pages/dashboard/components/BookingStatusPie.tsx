import { Card, Empty, Grid, Skeleton, Typography } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AdminDashboardOverview } from '@/services/dashboard.service';

const { useBreakpoint } = Grid;
const { Text } = Typography;

type BookingStatusPieProps = {
  overview?: AdminDashboardOverview;
  loading?: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#16A34A',
  PENDING: '#F59E0B',
  CANCELLED: '#DC2626',
  EXPIRED: '#EA580C',
};

export default function BookingStatusPie({ overview, loading }: BookingStatusPieProps) {
  const screens = useBreakpoint();

  const chartHeight = screens.md ? 260 : 220;

  if (loading) {
    return (
      <Card title="Phân bố trạng thái booking" style={{ borderRadius: 12, height: '100%' }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card title="Phân bố trạng thái booking" style={{ borderRadius: 12, height: '100%' }}>
        <Empty
          description={
            <Text type="secondary">Chưa có dữ liệu để hiển thị biểu đồ.</Text>
          }
        />
      </Card>
    );
  }

  const data = Object.entries(overview.bookings.byStatus).map(([status, value]) => ({
    name: status,
    value,
  }));

  return (
    <Card
      title="Phân bố trạng thái booking"
      style={{ borderRadius: 12, height: '100%' }}
    >
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="50%"
              outerRadius="78%"
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] ?? '#1677ff'}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString('vi-VN')} booking`
              }
            />
            <Legend
              wrapperStyle={{ fontSize: screens.sm ? 14 : 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
