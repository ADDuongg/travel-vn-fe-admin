import { useThemeMode } from '@/providers/antd-theme/context';
import {
  BellOutlined,
  LaptopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import CustomBreadCrumb from '@components/CustomBreadCrumb';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Radio,
  Space,
  theme,
  Typography,
} from 'antd';

const { Text } = Typography;

export default function AppHeader({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const { token } = theme.useToken();
  const { preference, setPreference, resolvedMode } = useThemeMode();

  const userMenu = {
    items: [
      { key: 'profile', label: 'Profile' },
      { key: 'settings', label: 'Settings' },
      { type: 'divider' as const },
      { key: 'logout', label: 'Logout' },
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
        <Radio.Group
          size="small"
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="light">
            <Space size={4}>
              <SunOutlined /> Light
            </Space>
          </Radio.Button>
          <Radio.Button value="dark">
            <Space size={4}>
              <MoonOutlined /> Dark
            </Space>
          </Radio.Button>
          <Radio.Button value="system">
            <Space size={4}>
              <LaptopOutlined /> System
            </Space>
          </Radio.Button>
        </Radio.Group>

        <Text type="secondary">
          Mode: <b>{resolvedMode}</b>
        </Text>

        <Badge dot>
          <Button type="text" icon={<BellOutlined />} />
        </Badge>

        <Dropdown menu={userMenu} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text ellipsis style={{ display: 'inline-block', maxWidth: 160 }}>
              duong.nguyen
            </Text>
          </Space>
        </Dropdown>
      </div>
    </div>
  );
}
