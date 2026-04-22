import { useLogin } from '@/queries/auth.queries';
import type { LoginFormValues } from '@/interface/auth';
import { LockOutlined, UserOutlined, CompassOutlined } from '@ant-design/icons';
import { Button, Card, Input, Layout, Typography, theme } from 'antd';
import { Controller, useForm } from 'react-hook-form';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, isPending } = useLogin();
  const { token } = theme.useToken();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: token.colorBgLayout,
      }}
    >
      <div style={{ width: 400, maxWidth: '90vw' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: token.colorPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <CompassOutlined style={{ color: '#fff', fontSize: 24 }} />
          </div>
          <Title
            level={3}
            style={{
              textAlign: 'center',
              marginBottom: 4,
              letterSpacing: '-0.5px',
              fontWeight: 600,
            }}
          >
            Welcome back
          </Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: 14,
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
            }}
          >
            Sign in to Travel VN Admin
          </Text>
        </div>

        <Card
          style={{
            boxShadow: 'var(--shadow-md)',
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
          styles={{ body: { padding: 32 } }}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: 20 }}>
              <Text
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: token.colorTextSecondary,
                }}
              >
                Username hoặc Email
              </Text>
              <Controller
                name="username"
                control={control}
                rules={{ required: 'Vui lòng nhập username hoặc email' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={
                      <UserOutlined
                        style={{ color: token.colorTextQuaternary }}
                      />
                    }
                    placeholder="username@example.com"
                    status={errors.username ? 'error' : undefined}
                  />
                )}
              />
              {errors.username && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                  {errors.username.message}
                </Text>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <Text
                style={{
                  display: 'block',
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: token.colorTextSecondary,
                }}
              >
                Mật khẩu
              </Text>
              <Controller
                name="password"
                control={control}
                rules={{ required: 'Vui lòng nhập mật khẩu' }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    size="large"
                    prefix={
                      <LockOutlined
                        style={{ color: token.colorTextQuaternary }}
                      />
                    }
                    placeholder="Nhập mật khẩu"
                    status={errors.password ? 'error' : undefined}
                  />
                )}
              />
              {errors.password && (
                <Text type="danger" style={{ fontSize: 12, marginTop: 4 }}>
                  {errors.password.message}
                </Text>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              block
              size="large"
              style={{ fontWeight: 500 }}
            >
              Đăng nhập
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text style={{ color: token.colorTextTertiary, fontSize: 13 }}>
              Chưa có tài khoản? Liên hệ quản trị viên.
            </Text>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.2px' }}>
            Powered by PHX
          </Text>
        </div>
      </div>
    </Layout>
  );
}
