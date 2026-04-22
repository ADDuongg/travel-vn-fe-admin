import LogoPHX from '@/assets/images/logo_phx.png';
import { ROUTE_KEYS, ROUTES } from '@/constants/route.constant';
import { useLogout } from '@/queries/auth.queries';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  AuditOutlined,
  BankOutlined,
  CalendarOutlined,
  CompassOutlined,
  CreditCardOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  PieChartOutlined,
  RightOutlined,
  SettingOutlined,
  StarOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Image,
  Layout,
  Menu,
  theme,
  Tooltip,
  Typography,
  type MenuProps,
} from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './sidebar.module.css';

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

const mainItems: MenuItem[] = [
  {
    type: 'group',
    label: 'Overview',
    children: [
      getItem('Dashboard', ROUTE_KEYS.DASHBOARD, <PieChartOutlined />),
      getItem('Favorites', ROUTE_KEYS.FAVORITES, <HeartOutlined />),
    ],
  },
  {
    type: 'group',
    label: 'Management',
    children: [
      getItem('Tours', ROUTE_KEYS.TOUR, <CompassOutlined />, [
        getItem('Tour List', ROUTE_KEYS.TOUR, <UnorderedListOutlined />),
        getItem('Inventory', ROUTE_KEYS.TOUR_INVENTORY, <CalendarOutlined />),
        getItem(
          'Tour Bookings',
          ROUTE_KEYS.TOUR_BOOKING,
          <CreditCardOutlined />,
        ),
        getItem('Reviews', ROUTE_KEYS.TOUR_REVIEWS, <StarOutlined />),
        getItem('Guides', ROUTE_KEYS.TOUR_GUIDE, <TeamOutlined />),
      ]),
      getItem('Hotels', ROUTE_KEYS.HOTEL, <BankOutlined />),
      getItem('Rooms', ROUTE_KEYS.ROOM, <HomeOutlined />, [
        getItem('Room List', ROUTE_KEYS.ROOM, <UnorderedListOutlined />),
        getItem('Amenities', ROUTE_KEYS.ROOM_AMENITIES, <StarOutlined />),
      ]),
      getItem('Provinces', ROUTE_KEYS.PROVINCE, <HomeOutlined />),
      getItem('Bookings', ROUTE_KEYS.BOOKING, <CreditCardOutlined />),
      getItem('Reviews', ROUTE_KEYS.ADMIN_REVIEWS, <StarOutlined />),
    ],
  },
  {
    type: 'group',
    label: 'System',
    children: [
      getItem('Settings', ROUTE_KEYS.SYSTEM, <SettingOutlined />),
      getItem('Audit Logs', ROUTE_KEYS.AUDIT_LOGS, <AuditOutlined />),
    ],
  },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  // const { resolvedMode } = useThemeMode();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAuthStore((s) => s.authUser);
  const { logout, isPending: isLoggingOut } = useLogout();

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
      className={styles.sider}
      width={240}
      collapsedWidth={64}
      style={{
        height: '100vh',
        position: 'sticky',
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        transition: 'width 200ms ease',
      }}
    >
      {/* Logo */}
      <div
        className={styles.logoArea}
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div className={styles.logoIcon}>
          <CompassOutlined style={{ color: '#fff', fontSize: 15 }} />
        </div>
        {!collapsed && (
          <Text
            strong
            style={{
              whiteSpace: 'nowrap',
              fontSize: 15,
              letterSpacing: '-0.3px',
              fontWeight: 600,
            }}
          >
            Travel VN
          </Text>
        )}
      </div>

      {/* Main nav */}
      <div className={styles.navArea}>
        <Menu
          mode="inline"
          items={mainItems}
          selectedKeys={selectedKeys}
          onClick={(info) => {
            const key = String(info.key);
            const path = KEY_TO_PATH[key];
            if (path) navigate(path);
          }}
          style={{ border: 'none' }}
        />
      </div>

      {/* Bottom section */}
      <div className={styles.bottomSection}>
        <div
          className={styles.collapseRow}
          style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
        >
          <Button
            type="text"
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
        </div>

        {/* Account row */}
        <div
          className={styles.accountRow}
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            cursor: 'pointer',
          }}
          onClick={() => navigate(ROUTES.ACCOUNT)}
        >
          <Avatar
            size={28}
            icon={<UserOutlined />}
            style={{
              backgroundColor: token.colorPrimary,
              color: '#fff',
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <Text
              ellipsis
              style={{
                fontSize: 13,
                fontWeight: 500,
                flex: 1,
                minWidth: 0,
              }}
            >
              {authUser?.username ?? '---'}
            </Text>
          )}
          {!collapsed && (
            <Tooltip title="Log out">
              <Button
                type="text"
                size="small"
                icon={<LogoutOutlined />}
                loading={isLoggingOut}
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                style={{ color: token.colorTextSecondary, flexShrink: 0 }}
              />
            </Tooltip>
          )}
        </div>

        {/* PHX branding */}
        <a
          href="https://www.phx-smartschool.com/"
          target="_blank"
          rel="noreferrer"
        >
          <div
            className={styles.logo}
            style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
          >
            <Image
              width={collapsed ? 32 : (48 / 562) * 1000}
              height={collapsed ? 18 : 28}
              preview={false}
              src={LogoPHX}
              alt="LogoPHX"
              style={{ opacity: 0.6, transition: 'opacity 150ms ease' }}
            />
          </div>
        </a>
      </div>
    </Sider>
  );
}
