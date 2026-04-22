import { Card, Col, Grid, Row, Skeleton } from 'antd';
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
    color: '#f54e00',
    bg: 'rgba(245, 78, 0, 0.08)',
  },
  {
    key: 'activeRooms' as const,
    title: 'Rooms',
    icon: <AppstoreOutlined />,
    color: '#c08532',
    bg: 'rgba(192, 133, 50, 0.08)',
  },
  {
    key: 'activeTours' as const,
    title: 'Tours',
    icon: <CompassOutlined />,
    color: '#1f8a65',
    bg: 'rgba(31, 138, 101, 0.08)',
  },
  {
    key: 'totalUsers' as const,
    title: 'Users',
    icon: <TeamOutlined />,
    color: '#9fbbe0',
    bg: 'rgba(159, 187, 224, 0.12)',
  },
];

export default function CatalogCards() {
  const { data, isLoading } = useAdminDashboardCatalog();
  const screens = useBreakpoint();

  return (
    <Row gutter={[screens.md ? 16 : 10, screens.md ? 16 : 10]}>
      {CATALOG_ITEMS.map((item) => (
        <Col xs={12} sm={12} md={6} key={item.key}>
          <Card
            size="small"
            styles={{
              body: {
                padding: screens.md ? '18px 20px' : '14px 16px',
              },
            }}
          >
            {isLoading ? (
              <Skeleton active paragraph={false} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <span
                  className="premium-icon-badge"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      color: 'var(--text-muted)',
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: screens.md ? 26 : 22,
                      fontWeight: 600,
                      letterSpacing: '-0.5px',
                      lineHeight: 1.1,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {(data?.[item.key] ?? 0).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
