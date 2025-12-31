import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import { useState } from 'react';
import {
  useApiPermissions,
  useCreateApiPermission,
  useDeleteApiPermission,
  useUpdateApiPermission,
} from '@/queries/api-permission.queries';
import type { ApiPermission } from '@/services/api-permission.service';

const { Title } = Typography;

export default function ApiTab() {
  const { data = [], isLoading } = useApiPermissions();
  const createMut = useCreateApiPermission();
  const updateMut = useUpdateApiPermission();
  const deleteMut = useDeleteApiPermission();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPermission | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (a: ApiPermission) => {
    setEditing(a);
    form.setFieldsValue(a);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    if (editing) {
      updateMut.mutate({ code: editing.code, data: values });
    } else {
      createMut.mutate(values);
    }

    setOpen(false);
  };

  return (
    <Card>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={5}>API Permissions</Title>
        <Button type="primary" onClick={openCreate}>
          Create API
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={data}
        style={{ marginTop: 16 }}
        columns={[
          { title: 'Code', dataIndex: 'code' },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Method', dataIndex: 'method' },
          { title: 'Path', dataIndex: 'path' },
          {
            title: 'Active',
            dataIndex: 'isActive',
            render: (v) => <Switch checked={v} disabled />,
          },
          {
            title: 'Actions',
            render: (_, a) => (
              <Space>
                <Button size="small" onClick={() => openEdit(a)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete API?"
                  onConfirm={() => deleteMut.mutate(a.code)}
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

      <Modal
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
        title={editing ? 'Edit API' : 'Create API'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true }]}>
            <Select
              options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({
                label: m,
                value: m,
              }))}
            />
          </Form.Item>
          <Form.Item name="path" label="Path">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
