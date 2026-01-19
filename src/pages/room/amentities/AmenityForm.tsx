// pages/amenities/AmenityForm.tsx
import type { Amenity } from '@interface/commons';
import { Form, Input, Modal, Space, Switch, Tabs, Upload } from 'antd';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Amenity | null;
  loading?: boolean;
}

import { useLanguages } from '@/queries/language.queries';

export function AmenityForm({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: Props) {
  const [form] = Form.useForm();
  const { data: languages = [] } = useLanguages();

  return (
    <Modal
      open={open}
      title={initialValues ? 'Update Amenity' : 'Create Amenity'}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { isActive: true }}
        onFinish={onSubmit}
      >
        <Form.Item label="Icon" name="icon">
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
            onChange={(info) => {
              form.setFieldValue('icon', info.file);
            }}
          >
            Upload
          </Upload>
        </Form.Item>

        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Tabs
          items={languages.map((lang) => ({
            key: lang.code,
            label: (
              <Space>
                {lang.flagUrl && <img src={lang.flagUrl} width={18} />}
                {lang.code}
              </Space>
            ),
            children: (
              <>
                <Form.Item
                  name={['translations', lang.code, 'name']}
                  label="Amenity Name"
                >
                  <Input placeholder="Wifi / Hồ bơi / Swimming Pool" />
                </Form.Item>

                <Form.Item
                  name={['translations', lang.code, 'description']}
                  label="Description"
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              </>
            ),
          }))}
        />
      </Form>
    </Modal>
  );
}
