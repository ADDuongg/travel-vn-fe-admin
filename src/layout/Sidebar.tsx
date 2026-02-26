import LogoPHX from '@/assets/images/logo_phx.png';
import { useThemeMode } from '@/providers/antd-theme/context';
import {
  InfoCircleFilled,
  LogoutOutlined,
  PieChartOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Image,
  Layout,
  Menu,
  theme,
  Typography,
  type MenuProps,
} from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './sidebar.module.css';
import { ROUTE_KEYS, ROUTES } from '@/constants/route.constant';

const { Sider } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return { key, icon, children, label } as MenuItem;
}

const siderStyle: React.CSSProperties = {
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const KEY_TO_PATH: Record<string, string> = {
  [ROUTE_KEYS.DASHBOARD]: ROUTES.DASHBOARD,
  [ROUTE_KEYS.TOUR]: ROUTES.TOUR.INDEX,
  [ROUTE_KEYS.TOUR_INVENTORY]: ROUTES.TOUR.INVENTORY,
  [ROUTE_KEYS.TOUR_BOOKING]: ROUTES.TOUR_BOOKING.INDEX,
  [ROUTE_KEYS.TOUR_REVIEWS]: ROUTES.TOUR.REVIEWS,
  [ROUTE_KEYS.TOUR_GUIDE]: ROUTES.TOUR_GUIDE.INDEX,
  [ROUTE_KEYS.PROVINCE]: ROUTES.PROVINCE.INDEX,
  [ROUTE_KEYS.HOTEL]: ROUTES.HOTEL.INDEX,
  [ROUTE_KEYS.ROOM as string]: '',
  [ROUTE_KEYS.ROOM]: ROUTES.ROOM.INDEX,
  [ROUTE_KEYS.ROOM_AMENITIES]: ROUTES.ROOM.AMENITIES,
  [ROUTE_KEYS.BOOKING]: ROUTES.BOOKING.INDEX,
  [ROUTE_KEYS.ADMIN_REVIEWS]: ROUTES.ADMIN_REVIEWS,
  [ROUTE_KEYS.ACCOUNT]: ROUTES.ACCOUNT,
  [ROUTE_KEYS.SYSTEM]: ROUTES.SYSTEM.INDEX,
};

const items: MenuItem[] = [
  getItem('Dashboard', ROUTE_KEYS.DASHBOARD, <PieChartOutlined />),
  getItem('Tours', ROUTE_KEYS.TOUR, <PieChartOutlined />, [
    getItem('Tour List', ROUTE_KEYS.TOUR, <PieChartOutlined />),
    getItem('Tour Inventory', ROUTE_KEYS.TOUR_INVENTORY, <PieChartOutlined />),
    getItem('Tour Bookings', ROUTE_KEYS.TOUR_BOOKING, <PieChartOutlined />),
    getItem('Tour Reviews', ROUTE_KEYS.TOUR_REVIEWS, <PieChartOutlined />),
    getItem('Tour Guides', ROUTE_KEYS.TOUR_GUIDE, <PieChartOutlined />),
  ]),
  getItem('Provinces', ROUTE_KEYS.PROVINCE, <PieChartOutlined />),
  getItem('Hotels', ROUTE_KEYS.HOTEL, <PieChartOutlined />),
  getItem('Room', ROUTE_KEYS.ROOM, <PieChartOutlined />, [
    getItem('Room List', ROUTE_KEYS.ROOM, <PieChartOutlined />),
    getItem('Amenities', ROUTE_KEYS.ROOM_AMENITIES, <PieChartOutlined />),
  ]),
  getItem('Bookings', ROUTE_KEYS.BOOKING, <PieChartOutlined />),
  getItem('Reviews', ROUTE_KEYS.ADMIN_REVIEWS, <PieChartOutlined />),
  getItem('System', ROUTE_KEYS.SYSTEM, <PieChartOutlined />),
];

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const { resolvedMode } = useThemeMode();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKeys = React.useMemo(() => {
    const found = Object.entries(KEY_TO_PATH).find(
      ([, path]) => location.pathname === path,
    );
    return found ? [found[0]] : [];
  }, [location.pathname]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      onCollapse={(value) => setCollapsed(value)}
      theme={resolvedMode}
      style={siderStyle}
    >
      <div
        style={{
          height: 56,
          position: 'sticky',
          top: 0,
          display: 'flex',
          alignItems: 'center',
          paddingInline: 16,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          gap: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: !collapsed ? 28 : '100%',
            height: 28,
            borderRadius: 6,
            background: token.colorPrimary,
            flex: '0 0 auto',
          }}
        />
        {!collapsed && (
          <Text strong style={{ whiteSpace: 'nowrap' }}>
            My Commerce Admin
          </Text>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          theme={resolvedMode}
          mode="inline"
          items={items}
          selectedKeys={selectedKeys}
          onClick={(info) => {
            const key = String(info.key);
            const path = KEY_TO_PATH[key];
            if (path) navigate(path);
          }}
        />
      </div>

      <div>
        <Divider style={{ margin: 0 }} />

        <Button
          type="text"
          size="large"
          className={styles.toggleButton}
          icon={
            <RightOutlined
              className={
                collapsed ? styles.toggleIconOpen : styles.toggleIconClose
              }
            />
          }
          onClick={() => setCollapsed(!collapsed)}
        />

        <Menu
          theme={resolvedMode}
          selectedKeys={selectedKeys}
          onClick={(info) => {
            if (info.key === 'logout') return;

            const path = KEY_TO_PATH[String(info.key)];
            if (path) navigate(path);
          }}
          items={[
            getItem('Account', ROUTE_KEYS.ACCOUNT, <InfoCircleFilled />),
            getItem('Log out', 'logout', <LogoutOutlined />),
          ]}
        />

        <a
          href="https://www.phx-smartschool.com/"
          target="_blank"
          rel="noreferrer"
        >
          <div
            className={styles.logo}
            style={{
              margin: 0,
              padding: '0.4rem',
              borderTop: `solid 1px ${token.colorPrimaryBorder}`,
            }}
          >
            <Image
              width={(48 / 562) * 1000}
              height={30}
              preview={false}
              src={LogoPHX}
              alt="LogoPHX"
            />
          </div>
        </a>
      </div>
    </Sider>
  );
}
