import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  Collapse,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import { useProvinces } from '@/queries/province.queries';
import { useAmenities } from '@/queries/amenities.queries';
import { useLanguages } from '@/queries/language.queries';
import { EnumLanguage } from '@/constants/enum';
import type { Hotel } from '@/interface/hotel';

function getProvinceName(prov: { name?: { vi?: string; en?: string } }) {
  return prov?.name?.vi || prov?.name?.en || '-';
}

type Props = {
  initialValues?: Hotel;
  loading?: boolean;
  submitText: string;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
};

export default function HotelForm({
  initialValues,
  loading,
  submitText,
  onSubmit,
  onCancel,
}: Props) {
  const [form] = Form.useForm();
  const { data: provinces = [] } = useProvinces();
  const { data: amenities = [] } = useAmenities();
  const { data: languages = [] } = useLanguages();

  useEffect(() => {
    if (initialValues) {
      const provinceId =
        typeof initialValues.provinceId === 'string'
          ? initialValues.provinceId
          : initialValues.provinceId?._id;
      form.setFieldsValue({
        slug: initialValues.slug,
        isActive: initialValues.isActive,
        starRating: initialValues.starRating ?? 3,
        provinceId,
        contact: initialValues.contact || {},
        location: initialValues.location || {},
        translations: initialValues.translations || {},
        amenities: initialValues.amenities?.map((a: { _id: string }) => a._id) || [],
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const formData = new FormData();
    formData.append('slug', values.slug);
    formData.append('isActive', String(values.isActive));
    formData.append('starRating', String(values.starRating ?? 3));
    formData.append('provinceId', values.provinceId);
    formData.append('translations', JSON.stringify(values.translations || {}));
    formData.append('contact', JSON.stringify(values.contact || {}));
    formData.append('location', JSON.stringify(values.location || {}));
    if (Array.isArray(values.amenities)) {
      values.amenities.forEach((id: string) => formData.append('amenities[]', id));
    }
    onSubmit(formData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        isActive: true,
        starRating: 3,
        translations: {},
        contact: {},
        location: {},
      }}
    >
      <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
        <Input placeholder="hotel-abc" />
      </Form.Item>

      <Form.Item name="isActive" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item
        name="starRating"
        label="Star Rating"
        rules={[{ required: true }]}
      >
        <Select
          options={[1, 2, 3, 4, 5].map((n) => ({ label: `${n} star(s)`, value: n }))}
          placeholder="Select star rating"
        />
      </Form.Item>

      <Form.Item
        name="provinceId"
        label="Province / City"
        rules={[{ required: true, message: 'Select province' }]}
      >
        <Select
          placeholder="Select province"
          options={provinces.map((p) => ({
            label: getProvinceName(p),
            value: p._id,
          }))}
        />
      </Form.Item>

      <Form.Item label="Contact">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name={['contact', 'phone']} label="Phone">
            <Input placeholder="+84..." />
          </Form.Item>
          <Form.Item name={['contact', 'email']} label="Email">
            <Input type="email" placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name={['contact', 'website']} label="Website">
            <Input placeholder="https://..." />
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item label="Coordinates">
        <Space>
          <Form.Item name={['location', 'lat']} label="Lat">
            <InputNumber placeholder="21.0" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name={['location', 'lng']} label="Lng">
            <InputNumber placeholder="105.8" style={{ width: 120 }} />
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item name="amenities" label="Amenities">
        <Select
          mode="multiple"
          placeholder="Select amenities"
          options={amenities.map((a) => ({
            label: a.translations?.[EnumLanguage.DEFAULT]?.name || a._id,
            value: a._id,
          }))}
        />
      </Form.Item>

      <Form.Item label="Translations">
        <Tabs
          items={languages.map((lang) => ({
            key: lang.code,
            label: lang.code.toUpperCase(),
            children: (
              <>
                <Form.Item
                  name={['translations', lang.code, 'name']}
                  label="Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Hotel name" />
                </Form.Item>
                <Form.Item
                  name={['translations', lang.code, 'shortDescription']}
                  label="Short description"
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item
                  name={['translations', lang.code, 'description']}
                  label="Description"
                >
                  <RichTextEditor />
                </Form.Item>
                <Form.Item
                  name={['translations', lang.code, 'address']}
                  label="Address"
                >
                  <Input />
                </Form.Item>
                <Form.List name={['translations', lang.code, 'policies']}>
                  {(fields, { add, remove }) => (
                    <>
                      <div style={{ marginBottom: 8 }}>Policies</div>
                      {fields.map(({ key, name }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item name={name} rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input placeholder="e.g. No smoking" />
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add policy
                      </Button>
                    </>
                  )}
                </Form.List>
                <Collapse
                  items={[
                    {
                      key: 'seo',
                      label: 'SEO',
                      children: (
                        <>
                          <Form.Item
                            name={['translations', lang.code, 'seo', 'title']}
                            label="Title"
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name={['translations', lang.code, 'seo', 'description']}
                            label="Description"
                          >
                            <Input.TextArea rows={2} />
                          </Form.Item>
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ),
          }))}
        />
      </Form.Item>

      <Space>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          {submitText}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </Form>
  );
}
