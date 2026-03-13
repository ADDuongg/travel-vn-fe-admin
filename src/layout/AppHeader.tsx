import { ROUTES } from '@/constants/route.constant';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import CustomBreadCrumb from '@components/CustomBreadCrumb';
import ThemeModeDropdown from '@components/ThemeModeDropdown';
import NotificationDropdown from '@components/NotificationDropdown';
import { Avatar, Button, Dropdown, Space, theme, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.authUser);
  const { logout, isPending: isLoggingOut } = useLogout();

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
      },
      {
        key: 'role-permission',
        label: 'Role & Permissions',
        onClick: () => navigate(ROUTES.ROLE_PERMISSION),
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
      }}
    >
      <Button
        type="text"
        onClick={onToggleCollapsed}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      />
      <CustomBreadCrumb />
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <ThemeModeDropdown />

        <NotificationDropdown />

        <Dropdown menu={userMenu} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text ellipsis style={{ display: 'inline-block', maxWidth: 160 }}>
              {authUser?.username ?? '—'}
            </Text>
          </Space>
        </Dropdown>
      </div>
    </div>
  );
}
