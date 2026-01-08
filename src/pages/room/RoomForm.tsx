import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  Switch,
  Tabs,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import RichTextEditor from '@/components/RichTextEditor';
import { useLanguages } from '@/queries/language.queries';
import type { Room } from '@interface/room';
import { useAmenities } from '@/queries/amenities.queries';

type Props = {
  initialValues?: Room;
  loading?: boolean;
  submitText: string;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
};

export default function RoomForm({
  initialValues,
  loading,
  submitText,
  onSubmit,
  onCancel,
}: Props) {
  const [form] = Form.useForm();
  const { data: languages = [] } = useLanguages();
  const { data: amenities = [] } = useAmenities();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  /* ===== init form ===== */
  useEffect(() => {
    if (initialValues) {
      const parsedTranslations =
        typeof initialValues.translations === 'string'
          ? JSON.parse(initialValues.translations)
          : initialValues.translations;

      form.setFieldsValue({
        ...initialValues,
        amenities: initialValues.amenities?.map((a: any) =>
          typeof a === 'string' ? a : a._id,
        ),
        translations: parsedTranslations,
        basePrice: initialValues.pricing?.basePrice,
        totalRooms: initialValues.inventory?.totalRooms,
        sale: initialValues.sale || { isActive: false },
      });

      if (initialValues.gallery?.length) {
        setFileList(
          initialValues.gallery.map((img, index) => ({
            uid: `${index}`,
            name: img.url,
            status: 'done',
            url: img.url,
          })),
        );
      }
    }
  }, [initialValues, form]);

  /* ===== submit ===== */
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const formData = new FormData();

    /* ===== primitive fields ===== */
    formData.append('code', values.code);
    formData.append('slug', values.slug);
    formData.append('isActive', String(values.isActive));

    formData.append('maxGuests', String(values.maxGuests));
    formData.append('adults', String(values.adults));
    formData.append('children', String(values.children || 0));
    formData.append('roomSize', String(values.roomSize || ''));

    formData.append('basePrice', String(values.basePrice));
    formData.append('totalRooms', String(values.totalRooms));

    /* ===== amenities ===== */
    if (Array.isArray(values.amenities)) {
      values.amenities.forEach((id: string) => {
        formData.append('amenities[]', id);
      });
    }

    /* ===== translations ===== */
    formData.append('translations', JSON.stringify(values.translations));

    /* ===== sale ===== */
    formData.append('sale', JSON.stringify(values.sale));

    /* ===== gallery files ===== */
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append('gallery', file.originFileObj);
      }
    });
    console.log('values', values.sale);

    onSubmit(formData);
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
      {/* ===== BASIC ===== */}
      <Form.Item name="code" label="Code" rules={[{ required: true }]}>
        <Input disabled={!!initialValues} />
      </Form.Item>

      <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="isActive" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      {/* ===== CAPACITY ===== */}
      <Form.Item
        name="maxGuests"
        label="Max Guests"
        rules={[{ required: true }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="adults" label="Adults" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="children" label="Children">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="roomSize" label="Room Size (m²)">
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      {/* ===== PRICING ===== */}
      <Form.Item
        name="basePrice"
        label="Base Price"
        rules={[{ required: true }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} step={10000} />
      </Form.Item>

      <Form.Item
        name="totalRooms"
        label="Total Rooms"
        rules={[{ required: true }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Divider orientation="left">Sale / Discount</Divider>

      <Form.Item
        name={['sale', 'isActive']}
        label="Enable Sale"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue(['sale', 'isActive']) ? (
            <>
              <Form.Item
                name={['sale', 'type']}
                label="Sale Type"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="PERCENT">Percent (%)</Radio>
                  <Radio value="FIXED">Fixed amount</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name={['sale', 'value']}
                label="Discount Value"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonAfter={
                    getFieldValue(['sale', 'type']) === 'PERCENT' ? '%' : 'VND'
                  }
                />
              </Form.Item>

              {/* Optional – enable later */}
              {/* 
        <Form.Item name={['sale', 'startDate']} label="Start Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name={['sale', 'endDate']} label="End Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        */}
            </>
          ) : null
        }
      </Form.Item>

      <Form.Item name="amenities" label="Amenities">
        <Checkbox.Group>
          <Space direction="vertical">
            {amenities.map((item) => (
              <Checkbox key={item._id} value={item._id}>
                <Space>
                  {item.icon?.url && (
                    <img
                      src={item.icon.url}
                      alt={item.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                      }}
                    />
                  )}
                  <span>{item.name}</span>
                </Space>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      </Form.Item>
      <Divider orientation="left">Hotel Rules</Divider>

      {/* ===== TRANSLATIONS ===== */}
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
              <Form.List name={['translations', lang.code, 'hotelRule']}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }) => (
                      <Space
                        key={key}
                        style={{ display: 'flex', marginBottom: 8 }}
                        align="start"
                      >
                        <Form.Item
                          name={name}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter hotel rule',
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <Input placeholder="e.g. Smoking not allowed" />
                        </Form.Item>

                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Space>
                    ))}

                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                      style={{ marginBottom: 8 }}
                    >
                      Add rule
                    </Button>
                  </>
                )}
              </Form.List>
              <Form.Item
                name={['translations', lang.code, 'name']}
                label="Name"
                // rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name={['translations', lang.code, 'description']}
                label="Description"
              >
                <RichTextEditor />
              </Form.Item>
            </>
          ),
        }))}
      />

      {/* ===== GALLERY ===== */}
      <Form.Item label="Gallery">
        <Upload
          listType="picture"
          multiple
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList }) => setFileList(fileList)}
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Form.Item>

      {/* ===== ACTIONS ===== */}
      <Space>
        <Button type="primary" loading={loading} onClick={handleSubmit}>
          {submitText}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Space>
    </Form>
  );
}
