import { IfCan } from '@/components/IfCan';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';
import {
  useCreateUser,
  useDeleteUser,
  useResetUserPassword,
  useUpdateUser,
  useUserDetail,
  useUsers,
} from '@/queries/user.queries';
import { useRoles } from '@/queries/role.queries';
import type { User } from '@/services/user.service';
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

const { Text } = Typography;

type UserFormValues = {
  username: string;
  email: string;
  roles?: string[];
  fullName?: string;
  phone?: string;
  isActive?: boolean;
};

function getErrorDetail(err: unknown): string {
  const e = err as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  };
  return e.response?.data?.message ?? e.message ?? 'Request failed';
}

export default function UsersAdminPage() {
  const { can } = useRbac();
  const [modal, contextHolder] = Modal.useModal();
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const deleteMut = useDeleteUser();
  const resetPasswordMut = useResetUserPassword();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const { data: detail, isFetching: isDetailLoading } = useUserDetail(
    editingId ?? undefined,
  );

  useEffect(() => {
    if (!editingId || !detail) return;
    form.setFieldsValue({
      username: detail.username ?? '',
      email: detail.email ?? '',
      roles: detail.roles ?? [],
      fullName: detail.fullName ?? '',
      phone: detail.phone ?? '',
      isActive: detail.isActive ?? true,
    });
  }, [detail, editingId, form]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, roles: [] });
    setModalOpen(true);
  };

  const openEdit = (row: User) => {
    setEditingId(row._id);
    form.resetFields();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          payload: {
            username: v.username.trim(),
            email: v.email.trim(),
            roles: v.roles ?? [],
            fullName: v.fullName?.trim(),
            phone: v.phone?.trim(),
            isActive: v.isActive,
          },
        });
        message.success('User updated');
      } else {
        await createMut.mutateAsync({
          username: v.username.trim(),
          email: v.email.trim(),
          roles: v.roles ?? [],
          fullName: v.fullName?.trim(),
          phone: v.phone?.trim(),
          isActive: v.isActive,
        });
        message.success('User created');
      }
      closeModal();
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      message.error(getErrorDetail(err));
    }
  };

  const onDelete = async (id: string) => {
    try {
      const deleted = await deleteMut.mutateAsync(id);
      if (!deleted) {
        message.warning('User not found or already deleted');
        return;
      }
      message.success('User deleted');
    } catch (err) {
      message.error(getErrorDetail(err));
    }
  };

  const onResetPassword = async (id: string) => {
    try {
      const updated = await resetPasswordMut.mutateAsync(id);
      if (!updated) {
        message.warning('User not found');
        return;
      }
      message.success('Password reset to default: 123123123');
    } catch (err) {
      message.error(getErrorDetail(err));
    }
  };

  const confirmDelete = (id: string) => {
    modal.confirm({
      title: 'Delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true, loading: deleteMut.isPending },
      onOk: () => onDelete(id),
    });
  };

  const confirmResetPassword = (id: string) => {
    modal.confirm({
      title: 'Reset password for this user?',
      content: 'New default password will be 123123123.',
      okText: 'Reset',
      okButtonProps: { loading: resetPasswordMut.isPending },
      onOk: () => onResetPassword(id),
    });
  };

  const roleOptions = useMemo(
    () => roles.map((r) => ({ label: `${r.name} (${r.code})`, value: r.code })),
    [roles],
  );

  const columns: ColumnsType<User> = [
    { title: 'Username', dataIndex: 'username', width: 180 },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email: string | undefined) => email ?? '—',
      ellipsis: true,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      width: 240,
      render: (values: string[] | undefined) =>
        values?.length ? (
          <Space size={[4, 4]} wrap>
            {values.map((role) => (
              <Tag key={role}>{role}</Tag>
            ))}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, row) => {
        const items: MenuProps['items'] = [];
        if (can(RBAC.user.update)) {
          items.push(
            { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
            {
              key: 'resetPassword',
              icon: <KeyOutlined />,
              label: 'Reset password',
            },
          );
        }
        if (can(RBAC.user.delete)) {
          items.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            danger: true,
          });
        }
        if (!items.length) return null;

        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === 'edit') openEdit(row);
                if (key === 'resetPassword') confirmResetPassword(row._id);
                if (key === 'delete') confirmDelete(row._id);
              },
            }}
          >
            <Button size="small">Actions</Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 0 32px' }}>
      {contextHolder}
      <Typography.Title level={4} style={{ letterSpacing: '-0.3px' }}>
        Users
      </Typography.Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        List requires <Text code>{RBAC.user.view}</Text>. Create, edit, delete
        use <Text code> user.create</Text>, <Text code> user.update</Text>,{' '}
        <Text code>user.delete</Text>.
      </Text>

      <div style={{ marginBottom: 16 }}>
        <IfCan permission={RBAC.user.create}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New user
          </Button>
        </IfCan>
      </div>

      <Table<User>
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 15, showSizeChanger: true }}
      />

      <Modal
        title={editingId ? 'Edit user' : 'Create user'}
        open={modalOpen}
        onOk={onSubmit}
        onCancel={closeModal}
        confirmLoading={
          createMut.isPending || updateMut.isPending || isDetailLoading
        }
        width={640}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 8 }}
          initialValues={{ roles: [], isActive: true }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item name="fullName" label="Full name">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="roles" label="Roles">
            <Select
              mode="multiple"
              allowClear
              options={roleOptions}
              placeholder="Select roles"
            />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
