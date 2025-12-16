// DashboardLayout.tsx
import AppHeader from '@/layout/AppHeader';
import Sidebar from '@/layout/Sidebar';
import { Layout } from 'antd';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

const { Content, Footer } = Layout;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const onToggleCollapsed = () => setCollapsed((v) => !v);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <AppHeader
          collapsed={collapsed}
          onToggleCollapsed={onToggleCollapsed}
        />
        <Content style={{ margin: '0 16px' }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
