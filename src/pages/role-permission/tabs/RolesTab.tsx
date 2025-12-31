import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
} from 'antd';
import { useState } from 'react';
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from '@/queries/role.queries';
import type { Role } from '@/services/role.service';

const { Title } = Typography;

export default function RolesTab() {
  const { data = [], isLoading } = useRoles();

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    form.setFieldsValue(role);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    if (editing) {
      updateMutation.mutate({
        code: editing.code,
        name: values.name,
      });
    } else {
      createMutation.mutate(values);
    }

    setOpen(false);
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={5}>Roles</Title>
        <Button type="primary" onClick={openCreate}>
          Create role
        </Button>
      </Space>

      <Table<Role>
        rowKey="_id"
        loading={isLoading}
        dataSource={data}
        style={{ marginTop: 16 }}
        columns={[
          {
            title: 'Code',
            dataIndex: 'code',
          },
          {
            title: 'Name',
            dataIndex: 'name',
          },
          {
            title: 'Actions',
            render: (_, role) => (
              <Space>
                <Button size="small" onClick={() => openEdit(role)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this role?"
                  onConfirm={() => deleteMutation.mutate(role.code)}
                >
                  <Button size="small" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      {/* Create / Edit modal */}
      <Modal
        title={editing ? 'Edit role' : 'Create role'}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
