// pages/amenities/AmenityForm.tsx
import type { Amenity } from '@interface/commons';
import { Form, Input, Modal, Switch, Upload } from 'antd';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Amenity | null;
  loading?: boolean;
}

export function AmenityForm({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}: Props) {
  const [form] = Form.useForm();

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
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Wifi, Pool, AC..." />
        </Form.Item>

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

        {initialValues && (
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
