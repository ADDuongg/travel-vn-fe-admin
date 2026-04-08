import { Card, Grid } from 'antd';
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

type BookingStatusPieProps = {
  overview?: AdminDashboardOverview;
};

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#52c41a',
  PENDING: '#faad14',
  CANCELLED: '#ff4d4f',
  EXPIRED: '#fa541c',
};

export default function BookingStatusPie({ overview }: BookingStatusPieProps) {
  const screens = useBreakpoint();

  if (!overview) return null;

  const data = Object.entries(overview.bookings.byStatus).map(
    ([status, value]) => ({ name: status, value }),
  );

  const chartHeight = screens.md ? 260 : 220;

  return (
    <Card
      title="Booking Status Distribution"
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
