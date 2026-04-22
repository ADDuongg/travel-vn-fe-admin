import { Button, Radio, Tooltip } from 'antd';
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

const Dashboard = () => {
  const [range, setRange] = useState<DashboardRange>('7d');
  const {
    data: overview,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    refetch: refetchOverview,
    isFetching: isOverviewFetching,
  } = useAdminDashboardOverview({ range });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3>Dashboard</h3>
          <p className={styles.subtitle}>
            Thống kê bookings, doanh thu, người dùng và catalog trong hệ thống.
          </p>
        </div>

        <div className={styles.actions}>
          <Radio.Group
            value={range}
            onChange={(e) => setRange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
            className={styles.rangeGroup}
          >
            <Radio.Button value="today">Hôm nay</Radio.Button>
            <Radio.Button value="7d">7 ngày</Radio.Button>
            <Radio.Button value="30d">30 ngày</Radio.Button>
          </Radio.Group>
          <Tooltip title="Làm mới">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => refetchOverview()}
              loading={isOverviewFetching}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
              }}
            />
          </Tooltip>
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

      <div className={styles.chartsRow}>
        <RevenueTrendChart overview={overview} loading={isOverviewLoading} />
        <BookingStatusPie overview={overview} loading={isOverviewLoading} />
      </div>

      <RecentBookingsTable />
    </div>
  );
};

export default Dashboard;
