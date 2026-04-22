import AppHeader from '@/layout/AppHeader';
import Sidebar from '@/layout/Sidebar';
import { Grid, Layout, Typography, theme } from 'antd';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

const { Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const onToggleCollapsed = () => setCollapsed((v) => !v);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <AppHeader
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
        />
        <Content
          style={{
            margin: 0,
            padding: screens.md ? '24px' : '16px',
            background: token.colorBgLayout,
            minHeight: 0,
          }}
        >
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            padding: '16px',
            background: 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: '0.2px',
            }}
          >
            Travel VN Admin &copy; {new Date().getFullYear()} &middot; Powered
            by PHX
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
