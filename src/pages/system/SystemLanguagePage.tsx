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
import { useUploadMedia } from '@/queries/media.queries';
import type { Language } from '@interface/commons';

const { Title } = Typography;

export default function SystemLanguagePage() {
  // ===== queries =====
  const { data = [], isLoading } = useLanguages();
  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();
  const uploadMediaMutation = useUploadMedia();

  // ===== UI state =====
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form] = Form.useForm();

  // ===== handlers =====
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setPreviewUrl(null);
    setOpen(true);
  };

  const openEdit = (item: Language) => {
    setEditing(item);
    form.setFieldsValue(item);
    setPreviewUrl(item.flagUrl || null);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    if (editing) {
      updateMutation.mutate({
        code: editing.code,
        data: values,
      });
    } else {
      createMutation.mutate(values);
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

          {/* ===== Upload flag via /media ===== */}
          <Form.Item label="Flag">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={async (file) => {
                try {
                  const res = await uploadMediaMutation.mutateAsync(file);
                  form.setFieldValue('flagUrl', res.secure_url);
                  setPreviewUrl(res.secure_url);
                  message.success('Upload thành công');
                } catch {
                  message.error('Upload ảnh thất bại');
                }
                return false;
              }}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadMediaMutation.isPending}
              >
                Chọn ảnh
              </Button>
            </Upload>

            {previewUrl && (
              <div style={{ marginTop: 12 }}>
                <Avatar src={previewUrl} size={64} shape="square" />
              </div>
            )}
          </Form.Item>

          {/* hidden submit field */}
          <Form.Item name="flagUrl" hidden>
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
