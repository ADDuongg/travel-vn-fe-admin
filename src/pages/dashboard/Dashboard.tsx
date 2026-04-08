import { Col, Grid, Radio, Row, Typography } from 'antd';
import { useState } from 'react';
import type { DashboardRange } from '@/services/dashboard.service';
import CatalogCards from './components/CatalogCards';
import OverviewCards from './components/OverviewCards';
import RevenueTrendChart from './components/RevenueTrendChart';
import BookingStatusPie from './components/BookingStatusPie';
import RecentBookingsTable from './components/RecentBookingsTable';
import { useAdminDashboardOverview } from '@/queries/dashboard.queries';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const Dashboard = () => {
  const [range, setRange] = useState<DashboardRange>('7d');
  const { data: overview } = useAdminDashboardOverview({ range });
  const screens = useBreakpoint();

  return (
    <div style={{ padding: screens.md ? 24 : 12 }}>
      <Typography>
        <Title level={screens.sm ? 3 : 4} style={{ marginBottom: 4 }}>
          Dashboard tổng quan
        </Title>
        <Paragraph
          type="secondary"
          style={{ marginBottom: screens.md ? 24 : 16, fontSize: screens.sm ? 14 : 12 }}
        >
          Thống kê nhanh bookings, doanh thu, người dùng và catalog trong hệ
          thống.
        </Paragraph>
      </Typography>

      <CatalogCards />

      <div
        style={{
          marginTop: screens.md ? 20 : 14,
          marginBottom: screens.md ? 20 : 14,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: screens.sm ? 12 : 8,
        }}
      >
        <Text type="secondary" style={{ fontSize: screens.sm ? 14 : 12 }}>
          Khoảng thời gian:
        </Text>
        <Radio.Group
          value={range}
          onChange={(e) => setRange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size={screens.sm ? 'middle' : 'small'}
        >
          <Radio.Button value="today">Hôm nay</Radio.Button>
          <Radio.Button value="7d">7 ngày</Radio.Button>
          <Radio.Button value="30d">30 ngày</Radio.Button>
        </Radio.Group>
      </div>

      <OverviewCards range={range} />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <RevenueTrendChart overview={overview} />
        </Col>
        <Col xs={24} lg={10}>
          <BookingStatusPie overview={overview} />
        </Col>
      </Row>

      <RecentBookingsTable />
    </div>
  );
};

export default Dashboard;
