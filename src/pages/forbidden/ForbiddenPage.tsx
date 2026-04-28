import { Button, Card, Result, theme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route.constant';

/**
 * Screen for authenticated users lacking RBAC on a destination route.
 * Layout follows admin shell tokens (contrast, spacing) per UI/UX guidance.
 */
export default function ForbiddenPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <Card
        style={{
          maxWidth: 480,
          width: '100%',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
          borderColor: token.colorBorderSecondary,
        }}
      >
        <Result
          status="403"
          title={
            <span style={{ color: token.colorText, fontWeight: 600 }}>
              Insufficient permissions
            </span>
          }
          subTitle={
            <span
              style={{
                color: token.colorTextSecondary,
                fontSize: 14,
                lineHeight: 1.6,
                display: 'block',
                maxWidth: 420,
                marginInline: 'auto',
              }}
            >
              You do not have access to this page. Contact an administrator if you need another
              role or permission set.
            </span>
          }
          extra={
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => navigate(ROUTES.DASHBOARD)}
              style={{
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              Back to Dashboard
            </Button>
          }
        />
      </Card>
    </div>
  );
}
