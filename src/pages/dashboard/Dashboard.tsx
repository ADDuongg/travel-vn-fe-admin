import { Button, Col, Grid, Radio, Row, Typography, theme } from 'antd';
import { useState } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import type { DashboardRange } from '@/services/dashboard.service';
import CatalogCards from './components/CatalogCards';
import OverviewCards from './components/OverviewCards';
import RevenueTrendChart from './components/RevenueTrendChart';
import BookingStatusPie from './components/BookingStatusPie';
import RecentBookingsTable from './components/RecentBookingsTable';
import { useAdminDashboardOverview } from '@/queries/dashboard.queries';
import styles from './dashboard.module.css';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const Dashboard = () => {
  const [range, setRange] = useState<DashboardRange>('7d');
  const { token } = theme.useToken();
  const {
    data: overview,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    refetch: refetchOverview,
    isFetching: isOverviewFetching,
  } = useAdminDashboardOverview({ range });
  const screens = useBreakpoint();

  return (
    <div
      style={{
        padding: screens.md ? 24 : 12,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <Title
              level={screens.sm ? 3 : 4}
              className={styles.title}
              style={{ marginBottom: 4 }}
            >
              Dashboard tổng quan
            </Title>
            <Paragraph
              className={styles.subtitle}
              style={{
                marginBottom: 0,
                fontSize: screens.sm ? 14 : 12,
                color: token.colorTextSecondary,
              }}
            >
              Thống kê nhanh bookings, doanh thu, người dùng và catalog trong hệ
              thống.
            </Paragraph>
          </div>

          <div className={styles.actions}>
            <Text
              style={{
                fontSize: screens.sm ? 13 : 12,
                color: token.colorTextTertiary,
              }}
            >
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
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetchOverview()}
              loading={isOverviewFetching}
              size={screens.sm ? 'middle' : 'small'}
            >
              Làm mới
            </Button>
          </div>
        </div>

        <CatalogCards />

        <div className={styles.section}>
          <OverviewCards
            range={range}
            overview={overview}
            isLoading={isOverviewLoading}
            isError={isOverviewError}
          />
        </div>

        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          <Col xs={24} lg={14}>
            <RevenueTrendChart overview={overview} loading={isOverviewLoading} />
          </Col>
          <Col xs={24} lg={10}>
            <BookingStatusPie overview={overview} loading={isOverviewLoading} />
          </Col>
        </Row>

        <RecentBookingsTable />
      </div>
    </div>
  );
};

export default Dashboard;
