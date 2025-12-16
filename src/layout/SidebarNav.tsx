import { useMemo } from 'react';
import { theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import SidebarNavItem from './SidebarNavItem';

export default function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const { token } = theme.useToken();

  const items = useMemo(
    () => [
      { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'catalog',
        icon: <AppstoreOutlined />,
        label: 'Catalog',
        children: [
          { key: 'products', label: 'Products' },
          { key: 'categories', label: 'Categories' },
          { key: 'inventory', label: 'Inventory' },
        ],
      },
      { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
      { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics' },
      { type: 'divider' as const },
      { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    ],
    [],
  );

  return (
    <nav style={{ padding: 8 }}>
      {items.map((it) =>
        it.type === 'divider' ? (
          <div
            key="divider"
            style={{
              height: 1,
              background: token.colorSplit,
              margin: '8px 8px',
            }}
          />
        ) : (
          <SidebarNavItem
            key={it.key}
            icon={it.icon}
            label={it.label}
            collapsed={collapsed}
            // Bạn có thể truyền active/selected logic vào đây từ router
            active={it.key === 'dashboard'}
          >
            {'children' in it && Array.isArray(it.children)
              ? it.children.map((c) => (
                  <SidebarNavItem
                    key={c.key}
                    icon={null}
                    label={c.label}
                    collapsed={collapsed}
                    level={2}
                  />
                ))
              : null}
          </SidebarNavItem>
        ),
      )}
    </nav>
  );
}
