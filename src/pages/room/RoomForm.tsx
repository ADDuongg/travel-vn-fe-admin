import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
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
import { EnumLanguage } from '@/constants/enum';
import { useHotelOptions } from '@/queries/hotel.queries';

const capacityValidator = ({ getFieldValue }: any) => ({
  validator() {
    const capacity = getFieldValue('capacity');

    if (!capacity) return Promise.resolve();

    const { baseAdults, baseChildren, maxAdults, maxChildren } = capacity;

    if (baseAdults > maxAdults) {
      return Promise.reject(new Error('Base adults cannot exceed max adults'));
    }

    if (baseChildren > maxChildren) {
      return Promise.reject(
        new Error('Base children cannot exceed max children'),
      );
    }

    return Promise.resolve();
  },
});

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
  const { data: hotels = [], isLoading: hotelLoading } = useHotelOptions(undefined);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (initialValues) {
      const parsedTranslations =
        typeof initialValues.translations === 'string'
          ? JSON.parse(initialValues.translations)
          : initialValues.translations;

      form.setFieldsValue({
        ...initialValues,
        roomType: initialValues.roomType,
        amenities: initialValues.amenities?.map((a: any) =>
          typeof a === 'string' ? a : a._id,
        ),
        bookingConfig: initialValues.bookingConfig || {
          minNights: 1,
          allowInstantBooking: true,
        },
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
    console.log('values', values);

    /* ===== primitive fields ===== */
    formData.append('code', values.code);
    formData.append('slug', values.slug);
    formData.append('roomType', values.roomType);
    formData.append('isActive', String(values.isActive));

    // formData.append('maxGuests', String(values.maxGuests));
    // formData.append('adults', String(values.adults));
    // formData.append('children', String(values.children || 0));
    // formData.append('roomSize', String(values.roomSize || ''));

    formData.append('basePrice', String(values.basePrice));
    formData.append('totalRooms', String(values.totalRooms));

    formData.append('hotelId', values.hotelId);

    /* ===== amenities ===== */
    if (Array.isArray(values.amenities)) {
      values.amenities.forEach((id: string) => {
        formData.append('amenities[]', id);
      });
    }

    formData.append('bookingConfig', JSON.stringify(values.bookingConfig));

    /* ===== translations ===== */
    formData.append('translations', JSON.stringify(values.translations));

    /* ===== capacity ===== */
    formData.append('capacity', JSON.stringify(values.capacity));

    /* ===== sale ===== */
    formData.append('sale', JSON.stringify(values.sale));

    /* ===== gallery files ===== */
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append('gallery', file.originFileObj);
      }
    });

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

      <Form.Item
        name="roomType"
        label="Room Type"
        rules={[{ required: true, message: 'Please enter room type' }]}
      >
        <Input placeholder="e.g., Master, Deluxe, Standard" />
      </Form.Item>

      <Form.Item name="isActive" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item
        name="hotelId"
        label="Hotel"
        rules={[{ required: true, message: 'Please select a hotel' }]}
      >
        <Select
          placeholder="Select hotel"
          loading={hotelLoading}
          options={hotels.map((h) => ({
            label: (h as { translations?: Record<string, { name?: string }> }).translations?.vi?.name
              || (h as { translations?: Record<string, { name?: string }> }).translations?.en?.name
              || (h as { slug?: string }).slug
              || h._id,
            value: h._id,
          }))}
        />
      </Form.Item>
      <Divider orientation="left">Booking Configuration</Divider>

      <Form.Item
        name={['bookingConfig', 'allowInstantBooking']}
        label="Allow Instant Booking"
        valuePropName="checked"
        initialValue={true}
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name={['bookingConfig', 'minNights']}
        label="Minimum Nights"
        rules={[{ required: true }]}
        initialValue={1}
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name={['bookingConfig', 'maxNights']} label="Maximum Nights">
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      {/* ===== CAPACITY ===== */}
      <Form.Item label="Room Capacity" rules={[capacityValidator]}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name={['capacity', 'baseAdults']}
            label="Base Adults (included)"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber className="w-full" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name={['capacity', 'baseChildren']}
            label="Base Children (included)"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber className="w-full" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name={['capacity', 'maxAdults']}
            label="Max Adults"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber className="w-full" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name={['capacity', 'maxChildren']}
            label="Max Children"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber className="w-full" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name={['capacity', 'roomSize']}
            label="Room Size"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber className="w-full" style={{ width: '100%' }} />
          </Form.Item>
        </div>
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
                      alt={item.translations[EnumLanguage.DEFAULT].name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                      }}
                    />
                  )}
                  <span>{item.translations[EnumLanguage.DEFAULT].name}</span>
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
              <Collapse
                defaultActiveKey={[]}
                items={[
                  {
                    key: 'rules',
                    label: 'Hotel Rules',
                    children: (
                      <Form.List
                        name={['translations', lang.code, 'hotelRule']}
                      >
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
                            >
                              Add rule
                            </Button>
                          </>
                        )}
                      </Form.List>
                    ),
                  },
                ]}
              />

              <Divider orientation="left">FAQ</Divider>
              <Collapse
                className="mt-4"
                defaultActiveKey={[]}
                items={[
                  {
                    key: 'faq',
                    label: 'FAQ',
                    children: (
                      <Form.List name={['translations', lang.code, 'faq']}>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name }) => (
                              <Space
                                key={key}
                                direction="vertical"
                                style={{
                                  display: 'flex',
                                  marginBottom: 16,
                                  padding: 12,
                                  border: '1px solid #eee',
                                  borderRadius: 8,
                                }}
                              >
                                <Form.Item
                                  name={[name, 'question']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please enter question',
                                    },
                                  ]}
                                >
                                  <Input placeholder="Question" />
                                </Form.Item>

                                <Form.Item
                                  name={[name, 'answer']}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please enter answer',
                                    },
                                  ]}
                                >
                                  <Input.TextArea
                                    rows={3}
                                    placeholder="Answer"
                                  />
                                </Form.Item>

                                <Button
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(name)}
                                >
                                  Remove FAQ
                                </Button>
                              </Space>
                            ))}

                            <Button
                              type="dashed"
                              block
                              icon={<PlusOutlined />}
                              onClick={() => add()}
                            >
                              Add FAQ
                            </Button>
                          </>
                        )}
                      </Form.List>
                    ),
                  },
                ]}
              />

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
