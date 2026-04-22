import { Card, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import PageShell from '@/components/PageShell';

const { Text } = Typography;

const Account = () => {
  return (
    <PageShell title="Account" subtitle="Quản lý thông tin tài khoản cá nhân.">
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'rgba(245, 78, 0, 0.08)',
              color: '#f54e00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            <UserOutlined />
          </div>
          <Text
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              fontSize: 14,
            }}
          >
            Account settings will be available soon.
          </Text>
        </div>
      </Card>
    </PageShell>
  );
};

export default Account;
