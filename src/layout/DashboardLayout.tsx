import AppHeader from '@/layout/AppHeader';
import Sidebar from '@/layout/Sidebar';
import { Layout, Typography, theme } from 'antd';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

const { Content, Footer } = Layout;
const { Text } = Typography;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
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
            padding: '16px',
            background: token.colorBgLayout,
          }}
        >
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            padding: '12px 16px',
            background: 'transparent',
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: token.colorTextQuaternary,
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
