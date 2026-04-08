import { Card, Col, Grid, Row, Skeleton, Statistic } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  CompassOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAdminDashboardCatalog } from '@/queries/dashboard.queries';

const { useBreakpoint } = Grid;

const CATALOG_ITEMS = [
  {
    key: 'activeHotels' as const,
    title: 'Hotels',
    icon: <HomeOutlined />,
    color: '#1677ff',
  },
  {
    key: 'activeRooms' as const,
    title: 'Rooms',
    icon: <AppstoreOutlined />,
    color: '#722ed1',
  },
  {
    key: 'activeTours' as const,
    title: 'Tours',
    icon: <CompassOutlined />,
    color: '#13c2c2',
  },
  {
    key: 'totalUsers' as const,
    title: 'Users',
    icon: <TeamOutlined />,
    color: '#52c41a',
  },
];

export default function CatalogCards() {
  const { data, isLoading } = useAdminDashboardCatalog();
  const screens = useBreakpoint();

  return (
    <Row gutter={[screens.md ? 16 : 8, screens.md ? 16 : 8]}>
      {CATALOG_ITEMS.map((item) => (
        <Col xs={12} sm={12} md={6} key={item.key}>
          <Card
            size="small"
            style={{ borderRadius: 12 }}
            styles={{
              body: {
                padding: screens.md ? '16px 20px' : '12px 14px',
              },
            }}
          >
            {isLoading ? (
              <Skeleton active paragraph={false} />
            ) : (
              <Statistic
                title={item.title}
                value={data?.[item.key] ?? 0}
                prefix={
                  <span
                    style={{
                      color: item.color,
                      fontSize: screens.md ? 20 : 16,
                    }}
                  >
                    {item.icon}
                  </span>
                }
                valueStyle={{
                  fontSize: screens.md ? 28 : 20,
                  fontWeight: 600,
                }}
              />
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
