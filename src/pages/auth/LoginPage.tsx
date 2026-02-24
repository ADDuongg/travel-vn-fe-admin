import { useLogin } from '@/queries/auth.queries';
import type { LoginFormValues } from '@/interface/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, Layout, Typography } from 'antd';
import { Controller, useForm } from 'react-hook-form';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, isPending } = useLogin();
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        styles={{ body: { padding: 40 } }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          Travel VN Admin
        </Title>
        <Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
        >
          Đăng nhập để tiếp tục
        </Text>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: 16 }}>
            <Controller
              name="username"
              control={control}
              rules={{ required: 'Vui lòng nhập username hoặc email' }}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="Username hoặc email"
                />
              )}
            />
            {errors.username && (
              <Text type="danger" style={{ fontSize: 12 }}>
                {errors.username.message}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Vui lòng nhập mật khẩu' }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                />
              )}
            />
            {errors.password && (
              <Text type="danger" style={{ fontSize: 12 }}>
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
          >
            Đăng nhập
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            Chưa có tài khoản? Liên hệ quản trị viên.
          </Text>
        </div>
      </Card>
    </Layout>
  );
}
