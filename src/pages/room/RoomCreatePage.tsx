import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Space,
  Switch,
  Tabs,
  Typography,
  Avatar,
  Spin,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useLanguages } from '@/queries/language.queries';

const { Title } = Typography;

export default function RoomEditPage() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { data: languages = [], isLoading } = useLanguages();

  const activeLanguages = useMemo(
    () => languages.filter((l) => l.isActive),
    [languages],
  );

  useEffect(() => {
    form.setFieldsValue({
      code: 'ROOM_001',
      price: 500000,
      capacity: 4,
      isActive: true,
      translations: {
        vi: { name: 'Phòng VIP', description: 'Mô tả tiếng Việt' },
        en: { name: 'VIP Room', description: 'English description' },
      },
    });
  }, [form]);

  const onSubmit = async () => {
    const values = await form.validateFields();
    console.log('UPDATE ROOM:', id, values);
    navigate('/dashboard/room');
  };

  if (isLoading) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Title level={4}>Edit Room</Title>

        <Form form={form} layout="vertical">
          {/* ===== Base Info ===== */}
          <Card title="Base Info" size="small">
            <Form.Item name="code" label="Code">
              <Input disabled />
            </Form.Item>

            <Form.Item name="price" label="Price">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="capacity" label="Capacity">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Card>

          {/* ===== Translations ===== */}
          <Card title="Translations" size="small">
            <Tabs
              items={activeLanguages.map((lang) => {
                const code = lang.code.toLowerCase();

                return {
                  key: code,
                  label: (
                    <Space>
                      {lang.flagUrl && (
                        <Avatar src={lang.flagUrl} size={18} shape="square" />
                      )}
                      <span>{lang.code}</span>
                    </Space>
                  ),
                  children: (
                    <>
                      <Form.Item
                        name={['translations', code, 'name']}
                        label="Name"
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name={['translations', code, 'description']}
                        label="Description"
                      >
                        <Input.TextArea rows={3} />
                      </Form.Item>
                    </>
                  ),
                };
              })}
            />
          </Card>

          <Space>
            <Button type="primary" onClick={onSubmit}>
              Save
            </Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </Space>
        </Form>
      </Space>
    </Card>
  );
}
