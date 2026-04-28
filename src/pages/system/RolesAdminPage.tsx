import { IfCan } from '@/components/IfCan';
import { RBAC } from '@/constants/rbac-keys';
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from '@/queries/role.queries';
import type { Role } from '@/services/role.service';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useState } from 'react';

const { Text } = Typography;

function getErrorDetail(err: unknown): string {
  const e = err as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  };
  return (
    e.response?.data?.message ?? e.message ?? 'Request failed'
  );
}

const RolesAdminPage = () => {
  const { data: roles = [], isLoading } = useRoles();
  const createMut = useCreateRole();
  const updateMut = useUpdateRole();
  const deleteMut = useDeleteRole();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form] = Form.useForm<{
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }>();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const openEdit = (row: Role) => {
    setEditing(row);
    form.setFieldsValue({
      code: row.code,
      name: row.name,
      description: row.description,
      isActive: row.isActive ?? true,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      if (editing) {
        await updateMut.mutateAsync({
          id: editing._id,
          data: {
            name: v.name,
            description: v.description,
            isActive: v.isActive,
          },
        });
        message.success('Role updated');
      } else {
        await createMut.mutateAsync({
          code: v.code.trim(),
          name: v.name.trim(),
          description: v.description?.trim(),
          isActive: v.isActive,
        });
        message.success('Role created');
      }
      closeModal();
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      message.error(getErrorDetail(err));
    }
  };

  const onDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMut.mutateAsync(id);
        message.success('Role deleted');
      } catch (err) {
        message.error(getErrorDetail(err));
      }
    },
    [deleteMut],
  );

  const columns: ColumnsType<Role> = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: 160,
      render: (code: string) => <Text code>{code}</Text>,
    },
    { title: 'Name', dataIndex: 'name', ellipsis: true },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (d: string | undefined) => d ?? '—',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 100,
      render: (v: boolean | undefined) => (
        <Tag color={v === false ? 'default' : 'green'}>
          {v === false ? 'No' : 'Yes'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <IfCan permission={RBAC.rbac.manage}>
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(row)}
              style={{ padding: 0 }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this role?"
              description="Fails if users still reference this role code."
              onConfirm={() => onDelete(row._id)}
              okButtonProps={{ loading: deleteMut.isPending }}
            >
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
                style={{ padding: 0 }}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </IfCan>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 32px' }}>
      <Typography.Title level={4} style={{ letterSpacing: '-0.3px' }}>
        Roles
      </Typography.Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        List uses <Text code>{RBAC.role.view}</Text>. Create, edit, and delete
        require <Text code>{RBAC.rbac.manage}</Text>.
      </Text>

      <div style={{ marginBottom: 16 }}>
        <IfCan permission={RBAC.rbac.manage}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New role
          </Button>
        </IfCan>
      </div>

      <Table<Role>
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={roles}
        pagination={{ pageSize: 15, showSizeChanger: true }}
      />

      <Modal
        title={editing ? `Edit role: ${editing.code}` : 'Create role'}
        open={modalOpen}
        onOk={onSubmit}
        onCancel={closeModal}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="code"
            label="Code"
            rules={[
              { required: true, message: 'Required' },
              {
                pattern: /^[a-z][a-z0-9_]*$/,
                message: 'Lowercase letters, digits, underscore',
              },
            ]}
          >
            <Input
              placeholder="e.g. editor"
              disabled={Boolean(editing)}
              autoComplete="off"
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesAdminPage;
