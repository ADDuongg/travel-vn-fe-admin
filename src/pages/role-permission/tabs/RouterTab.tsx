import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import { useState } from 'react';
import {
  useCreateRouter,
  useDeleteRouter,
  useRouters,
  useUpdateRouter,
} from '@/queries/router.queries';
import type { Router } from '@/services/router.service';

const { Title } = Typography;

export default function RouterTab() {
  const { data = [], isLoading } = useRouters();
  const createMut = useCreateRouter();
  const updateMut = useUpdateRouter();
  const deleteMut = useDeleteRouter();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Router | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (r: Router) => {
    setEditing(r);
    form.setFieldsValue(r);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    if (editing) {
      updateMut.mutate({
        code: editing.code,
        data: values,
      });
    } else {
      createMut.mutate(values);
    }

    setOpen(false);
  };

  return (
    <Card>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={5}>Routers</Title>
        <Button type="primary" onClick={openCreate}>
          Create Router
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
          { title: 'Path', dataIndex: 'path' },
          {
            title: 'Active',
            dataIndex: 'isActive',
            render: (v) => <Switch checked={v} disabled />,
          },
          {
            title: 'Actions',
            render: (_, r) => (
              <Space>
                <Button size="small" onClick={() => openEdit(r)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete router?"
                  onConfirm={() => deleteMut.mutate(r.code)}
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
        title={editing ? 'Edit Router' : 'Create Router'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
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
