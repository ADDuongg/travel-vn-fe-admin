// components/ThemeModeDropdown.tsx
import { useThemeMode } from '@/providers/antd-theme/context';
import { LaptopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Typography } from 'antd';

const { Text } = Typography;

export default function ThemeModeDropdown() {
  const { preference, setPreference } = useThemeMode();

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

  const currentLabel = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }[preference];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button size="small">
        <Space>
          {preference === 'light' && <SunOutlined />}
          {preference === 'dark' && <MoonOutlined />}
          {preference === 'system' && <LaptopOutlined />}
          <Text>{currentLabel}</Text>
        </Space>
      </Button>
    </Dropdown>
  );
}
