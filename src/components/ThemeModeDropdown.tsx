import { useThemeMode } from '@/providers/antd-theme/context';
import { LaptopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Dropdown, theme } from 'antd';

export default function ThemeModeDropdown() {
  const { preference, setPreference } = useThemeMode();
  const { token } = theme.useToken();

  const items = [
    {
      key: 'light',
      icon: <SunOutlined />,
      label: 'Light',
      onClick: () => setPreference('light'),
    },
    {
      key: 'dark',
      icon: <MoonOutlined />,
      label: 'Dark',
      onClick: () => setPreference('dark'),
    },
    {
      key: 'system',
      icon: <LaptopOutlined />,
      label: 'System',
      onClick: () => setPreference('system'),
    },
  ];

  const icon =
    preference === 'light' ? (
      <SunOutlined />
    ) : preference === 'dark' ? (
      <MoonOutlined />
    ) : (
      <LaptopOutlined />
    );

  return (
    <Dropdown menu={{ items, selectedKeys: [preference] }} trigger={['click']}>
      <Button
        type="text"
        icon={icon}
        style={{ color: token.colorTextSecondary }}
      />
    </Dropdown>
  );
}
