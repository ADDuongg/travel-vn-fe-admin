import LogoPHX from '@/assets/images/logo_phx.png';
import { useThemeMode } from '@/providers/antd-theme/context';
import {
  AuditOutlined,
  BankOutlined,
  CalendarOutlined,
  CompassOutlined,
  CreditCardOutlined,
  HeartOutlined,
  HomeOutlined,
  InfoCircleFilled,
  LogoutOutlined,
  PieChartOutlined,
  RightOutlined,
  SettingOutlined,
  StarOutlined,
  TeamOutlined,
  UnorderedListOutlined,
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

const KEY_TO_PATH: Record<string, string> = {
  [ROUTE_KEYS.DASHBOARD]: ROUTES.DASHBOARD,
  [ROUTE_KEYS.FAVORITES]: ROUTES.FAVORITES,
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
  [ROUTE_KEYS.AUDIT_LOGS]: ROUTES.SYSTEM.AUDIT_LOGS,
};

const items: MenuItem[] = [
  getItem('Dashboard', ROUTE_KEYS.DASHBOARD, <PieChartOutlined />),
  getItem('Favorites', ROUTE_KEYS.FAVORITES, <HeartOutlined />),
  getItem('Tours', ROUTE_KEYS.TOUR, <CompassOutlined />, [
    getItem('Tour List', ROUTE_KEYS.TOUR, <UnorderedListOutlined />),
    getItem('Tour Inventory', ROUTE_KEYS.TOUR_INVENTORY, <CalendarOutlined />),
    getItem('Tour Bookings', ROUTE_KEYS.TOUR_BOOKING, <CreditCardOutlined />),
    getItem('Tour Reviews', ROUTE_KEYS.TOUR_REVIEWS, <StarOutlined />),
    getItem('Tour Guides', ROUTE_KEYS.TOUR_GUIDE, <TeamOutlined />),
  ]),
  getItem('Provinces', ROUTE_KEYS.PROVINCE, <HomeOutlined />),
  getItem('Hotels', ROUTE_KEYS.HOTEL, <BankOutlined />),
  getItem('Room', ROUTE_KEYS.ROOM, <HomeOutlined />, [
    getItem('Room List', ROUTE_KEYS.ROOM, <UnorderedListOutlined />),
    getItem('Amenities', ROUTE_KEYS.ROOM_AMENITIES, <StarOutlined />),
  ]),
  getItem('Bookings', ROUTE_KEYS.BOOKING, <CreditCardOutlined />),
  getItem('Reviews', ROUTE_KEYS.ADMIN_REVIEWS, <StarOutlined />),
  getItem('System', 'SYSTEM_GROUP', <SettingOutlined />, [
    getItem('System', ROUTE_KEYS.SYSTEM, <SettingOutlined />),
    getItem('Audit Logs', ROUTE_KEYS.AUDIT_LOGS, <AuditOutlined />),
  ]),
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
      className={styles.sider}
      style={{
        height: '100vh',
        position: 'sticky',
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        className={styles.logoArea}
        style={{
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: token.colorPrimary,
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CompassOutlined style={{ color: '#fff', fontSize: 14 }} />
        </div>
        {!collapsed && (
          <Text
            strong
            style={{
              whiteSpace: 'nowrap',
              fontSize: 14,
              letterSpacing: '-0.3px',
            }}
          >
            Travel VN Admin
          </Text>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
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
          style={{ border: 'none' }}
        />
      </div>

      <div>
        <Divider style={{ margin: 0, borderColor: token.colorBorderSecondary }} />

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
          style={{ border: 'none', padding: '0 8px' }}
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
              borderTop: `1px solid ${token.colorBorderSecondary}`,
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
