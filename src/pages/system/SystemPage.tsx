import { Card, Col, Row, Typography, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

type SystemItem = {
  key: string;
  title: string;
  icon: string;
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
        icon: 'N',
        path: '/dashboard/system/languages',
      },
    ],
  },
];

const SystemPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      {systemSections.map((section) => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            {section.title}
          </Title>

          <Row gutter={[16, 16]}>
            {section.items.map((item) => (
              <Col key={item.key} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => navigate(item.path)}
                  style={{ textAlign: 'center' }}
                >
                  <Avatar
                    size={64}
                    style={{
                      backgroundColor: '#fa541c',
                      marginBottom: 12,
                      fontSize: 24,
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <div>{item.title}</div>
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
