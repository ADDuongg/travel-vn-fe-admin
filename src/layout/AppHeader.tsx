import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons';
import CustomBreadCrumb from '@components/CustomBreadCrumb';
import ThemeModeDropdown from '@components/ThemeModeDropdown';
import NotificationDropdown from '@components/NotificationDropdown';
import { Avatar, Button, Dropdown, Space, theme, Typography } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLogout } from '@/queries/auth.queries';

const { Text } = Typography;

export default function AppHeader({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const { token } = theme.useToken();
  const authUser = useAuthStore((s) => s.authUser);
  const { logout, isPending: isLoggingOut } = useLogout();

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: 'Logout',
        onClick: () => logout(),
        disabled: isLoggingOut,
      },
    ],
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 56,
        paddingInline: 16,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Button
        type="text"
        onClick={onToggleCollapsed}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        style={{
          color: token.colorTextSecondary,
          width: 32,
          height: 32,
          borderRadius: 6,
        }}
      />

      <CustomBreadCrumb />

      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <ThemeModeDropdown />
        <NotificationDropdown />

        <Dropdown menu={userMenu} trigger={['click']}>
          <Space
            style={{
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 6,
              transition: 'background 150ms ease',
              marginLeft: 4,
            }}
            className="header-user-trigger"
          >
            <Avatar
              size={28}
              icon={<UserOutlined />}
              style={{
                backgroundColor: token.colorPrimary,
                color: '#fff',
              }}
            />
            <Text
              ellipsis
              style={{
                display: 'inline-block',
                maxWidth: 140,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {authUser?.username ?? '---'}
            </Text>
            <DownOutlined
              style={{
                fontSize: 10,
                color: token.colorTextTertiary,
              }}
            />
          </Space>
        </Dropdown>
      </div>
    </div>
  );
}
