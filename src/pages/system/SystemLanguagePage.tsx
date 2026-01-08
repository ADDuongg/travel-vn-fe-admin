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
  Avatar,
  Upload,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

import {
  useLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
} from '@/queries/language.queries';
import type { Language } from '@interface/commons';

const { Title } = Typography;

export default function SystemLanguagePage() {
  const { data = [], isLoading } = useLanguages();
  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    setFile(null);
    setPreviewUrl(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (item: Language) => {
    setEditing(item);
    setFile(null);
    setPreviewUrl(item.flagUrl || null);
    form.setFieldsValue(item);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('isActive', values.isActive ?? true);

    if (!editing) {
      formData.append('code', values.code);
    }

    if (file) {
      formData.append('flag', file);
    }

    if (editing) {
      updateMutation.mutate({
        code: editing.code,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }

    setOpen(false);
  };

  const onDelete = (code: string) => {
    deleteMutation.mutate(code);
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={5}>Ngôn ngữ</Title>
        <Button type="primary" onClick={openCreate}>
          Thêm ngôn ngữ
        </Button>
      </Space>

      <Table<Language>
        rowKey="code"
        loading={isLoading}
        style={{ marginTop: 16 }}
        dataSource={data}
        columns={[
          {
            title: 'Flag',
            dataIndex: 'flagUrl',
            render: (v) => (v ? <Avatar src={v} shape="square" /> : '-'),
          },
          { title: 'Code', dataIndex: 'code' },
          { title: 'Name', dataIndex: 'name' },
          {
            title: 'Active',
            dataIndex: 'isActive',
            render: (v) => <Switch checked={v} disabled />,
          },
          {
            title: 'Actions',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this language?"
                  onConfirm={() => onDelete(record.code)}
                >
                  <Button danger size="small">
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? 'Edit Language' : 'Create Language'}
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

          {/* ===== Upload flag (local only) ===== */}
          <Form.Item label="Flag">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(f) => {
                setFile(f);
                setPreviewUrl(URL.createObjectURL(f));
                return false; // ❗ không upload ngay
              }}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>

            {previewUrl && (
              <div style={{ marginTop: 12 }}>
                <Avatar src={previewUrl} size={64} shape="square" />
              </div>
            )}
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
