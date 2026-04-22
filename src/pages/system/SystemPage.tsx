import { Card, Col, Row, Typography, theme } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

type SystemItem = {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
};

const systemSections: {
  title: string;
  items: SystemItem[];
}[] = [
  {
    title: 'General management',
    items: [
      {
        key: 'language',
        title: 'Languages',
        description: 'Manage supported languages and translations',
        icon: <GlobalOutlined />,
        path: '/dashboard/system/languages',
      },
    ],
  },
];

const SystemPage = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 0' }}>
      {systemSections.map((section) => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16, letterSpacing: '-0.3px' }}>
            {section.title}
          </Title>

          <Row gutter={[16, 16]}>
            {section.items.map((item) => (
              <Col key={item.key} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => navigate(item.path)}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'box-shadow 200ms ease, border-color 200ms ease',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: `${token.colorPrimary}12`,
                      color: token.colorPrimary,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      marginBottom: 12,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, fontFamily: 'var(--font-editorial)' }}
                  >
                    {item.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default SystemPage;
