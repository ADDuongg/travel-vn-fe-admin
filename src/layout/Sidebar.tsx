import {
  DesktopOutlined,
  FileOutlined,
  InfoCircleFilled,
  LogoutOutlined,
  PieChartOutlined,
  RightOutlined,
  SettingFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Layout,
  Menu,
  theme,
  Typography,
  Image,
  type MenuProps,
} from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '@/providers/antd-theme/context';
import styles from './sidebar.module.css';
import LogoPHX from '@/assets/images/logo_phx.png';

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

// map key -> path (giữ key ngắn gọn, path rõ ràng)
const KEY_TO_PATH: Record<string, string> = {
  dashboard: '/dashboard',
  room: '/dashboard/room',
  option2: '/reports/option-2',
  option3: '/analytics/option-3',
  option4: '/analytics/option-4',
  files: '/files',
  'user:tom': '/users/tom',
  'user:bill': '/users/bill',
  'user:alex': '/users/alex',
  'team:1': '/teams/1',
  'team:2': '/teams/2',
  account: '/dashboard/account',
};

const items: MenuItem[] = [
  getItem('Dashboard', 'dashboard', <PieChartOutlined />),
  getItem('Room List', 'room', <PieChartOutlined />),
  getItem('Option 2', 'option2', <DesktopOutlined />),
  getItem('Option 3', 'option3', <PieChartOutlined />),
  getItem('Option 4', 'option4', <DesktopOutlined />),
  getItem('User', 'sub:user', <UserOutlined />, [
    getItem('Tom', 'user:tom'),
    getItem('Bill', 'user:bill'),
    getItem('Alex', 'user:alex'),
  ]),
  getItem('Team', 'sub:team', <TeamOutlined />, [
    getItem('Team 1', 'team:1'),
    getItem('Team 2', 'team:2'),
  ]),
  getItem('Files', 'files', <FileOutlined />),
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
  console.log('location', location);

  // Tính selectedKeys từ URL hiện tại (đảo chiều PATH->KEY)
  const pathToKey = React.useMemo(() => {
    const entries = Object.entries(KEY_TO_PATH);
    const found = entries.find(([, path]) => location.pathname === path);

    return found ? [found[0]] : [];
  }, [location.pathname]);

  // Mở sẵn submenu nếu key được chọn nằm trong đó
  const defaultOpenKeys = React.useMemo(() => {
    if (pathToKey[0]?.startsWith('user:')) return ['sub:user'];
    if (pathToKey[0]?.startsWith('team:')) return ['sub:team'];
    return [];
  }, [pathToKey]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      onCollapse={(value) => setCollapsed(value)}
      theme={resolvedMode}
      style={siderStyle}
    >
      {/* Header */}
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
            width: 28,
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

      {/* Menu chính */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          theme={resolvedMode}
          mode="inline"
          items={items}
          selectedKeys={pathToKey}
          defaultOpenKeys={defaultOpenKeys}
          onClick={(info) => {
            const key = String(info.key);
            const path = KEY_TO_PATH[key];
            if (path) navigate(path);
          }}
        />
      </div>

      {/* Footer */}
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
          selectedKeys={pathToKey}
          onClick={(info) => {
            if (info.key === 'logout') {
              // TODO: thực hiện logout (để đăng xuất)
              return;
            }

            const key = String(info.key);
            const path = KEY_TO_PATH[key];
            if (path) navigate(path);
          }}
          items={[
            getItem('Tài khoản', 'account', <InfoCircleFilled />),
            {
              key: 'reset-password',
              icon: <SettingFilled />,
              label: 'Đổi mật khẩu',
            },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
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
