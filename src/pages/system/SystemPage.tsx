import { ROUTES } from '@/constants/route.constant';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';
import { Card, Col, Row, Typography, theme } from 'antd';
import {
  GlobalOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
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
        path: ROUTES.SYSTEM.LANGUAGES,
      },
    ],
  },
];

const rolesCard: SystemItem = {
  key: 'roles',
  title: 'Roles',
  description: 'Create and manage role catalog entries',
  icon: <IdcardOutlined />,
  path: ROUTES.SYSTEM.ROLES,
};

const rbacCard: SystemItem = {
  key: 'rbac',
  title: 'Role permissions',
  description: 'Assign RBAC permission keys to roles',
  icon: <SafetyCertificateOutlined />,
  path: ROUTES.SYSTEM.RBAC,
};

const SystemPage = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { can } = useRbac();
  const showRolesCard = can(RBAC.role.view);
  const showRbacMatrixCard =
    can(RBAC.rbac.manage) && can(RBAC.role.view);
  const showAccessSection = showRolesCard || showRbacMatrixCard;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 0' }}>
      {showAccessSection && (
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 16, letterSpacing: '-0.3px' }}>
          Access control
        </Title>
        <Row gutter={[16, 16]}>
          {showRolesCard && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => navigate(rolesCard.path)}
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
                  {rolesCard.icon}
                </div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {rolesCard.title}
                </div>
                <Text type="secondary" style={{ fontSize: 12, fontFamily: 'var(--font-editorial)' }}>
                  {rolesCard.description}
                </Text>
              </Card>
            </Col>
          )}
          {showRbacMatrixCard && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => navigate(rbacCard.path)}
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
                  {rbacCard.icon}
                </div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {rbacCard.title}
                </div>
                <Text type="secondary" style={{ fontSize: 12, fontFamily: 'var(--font-editorial)' }}>
                  {rbacCard.description}
                </Text>
              </Card>
            </Col>
          )}
        </Row>
      </div>
      )}

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
