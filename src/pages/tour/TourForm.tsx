import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Collapse, Form, Input, InputNumber, Select, Space, Switch, Tabs } from 'antd';
import { useEffect } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import { EnumLanguage } from '@/constants/enum';
import { useAmenities } from '@/queries/amenities.queries';
import { useLanguages } from '@/queries/language.queries';
import { useProvinces } from '@/queries/province.queries';
import type { Tour, TourUpsertPayload } from '@/interface/tour';

type Props = {
  initialValues?: Tour;
  loading?: boolean;
  submitText: string;
  onSubmit: (payload: TourUpsertPayload) => void;
  onCancel: () => void;
};

function getProvinceLabel(p: { name?: { vi?: string; en?: string }; code?: string }) {
  return p?.name?.vi || p?.name?.en || p?.code || '-';
}

export default function TourForm({
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
    if (!initialValues) return;

    const departureProvinceId =
      typeof initialValues.departureProvinceId === 'string'
        ? initialValues.departureProvinceId
        : initialValues.departureProvinceId?._id;

    form.setFieldsValue({
      slug: initialValues.slug,
      code: initialValues.code,
      isActive: initialValues.isActive,
      tourType: initialValues.tourType,
      duration: initialValues.duration,
      departureProvinceId,
      destinations: (initialValues.destinations || []).map((d) => ({
        provinceId: typeof d.provinceId === 'string' ? d.provinceId : d.provinceId?._id,
        isMainDestination: !!d.isMainDestination,
      })),
      translations: initialValues.translations || {},
      itinerary: initialValues.itinerary || [],
      capacity: initialValues.capacity || {},
      pricing: initialValues.pricing || {},
      contact: initialValues.contact || {},
      thumbnail: initialValues.thumbnail || {},
      gallery: initialValues.gallery || [],
      amenities: Array.isArray(initialValues.amenities)
        ? (initialValues.amenities as any[]).map((a) => (typeof a === 'string' ? a : a?._id))
        : [],
      transportTypes: initialValues.transportTypes || [],
      bookingConfig: initialValues.bookingConfig || {},
      sale: initialValues.sale || {},
      difficulty: initialValues.difficulty,
    });
  }, [initialValues, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const payload: TourUpsertPayload = {
      slug: values.slug,
      code: values.code,
      isActive: !!values.isActive,
      tourType: values.tourType,
      duration: {
        days: Number(values.duration?.days || 0),
        nights: Number(values.duration?.nights || 0),
      },
      destinations: (values.destinations || []).map((d: any) => ({
        provinceId: d.provinceId,
        isMainDestination: !!d.isMainDestination,
      })),
      departureProvinceId: values.departureProvinceId,
      translations: values.translations || {},
      itinerary: (values.itinerary || []).map((day: any) => ({
        dayNumber: Number(day.dayNumber || 0),
        translations: day.translations || {},
      })),
      capacity: {
        minGuests: Number(values.capacity?.minGuests || 0),
        maxGuests: Number(values.capacity?.maxGuests || 0),
        privateAvailable: !!values.capacity?.privateAvailable,
      },
      pricing: {
        basePrice: Number(values.pricing?.basePrice || 0),
        currency: values.pricing?.currency || 'VND',
        childPrice: values.pricing?.childPrice,
        infantPrice: values.pricing?.infantPrice,
        singleSupplement: values.pricing?.singleSupplement,
      },
      contact: values.contact || {},
      thumbnail: values.thumbnail?.url ? values.thumbnail : undefined,
      gallery: Array.isArray(values.gallery) ? values.gallery.filter((g: any) => g?.url) : [],
      amenities: Array.isArray(values.amenities) ? values.amenities : [],
      transportTypes: Array.isArray(values.transportTypes) ? values.transportTypes : [],
      bookingConfig: {
        advanceBookingDays: Number(values.bookingConfig?.advanceBookingDays || 0),
        allowInstantBooking: !!values.bookingConfig?.allowInstantBooking,
        requireDeposit: !!values.bookingConfig?.requireDeposit,
        depositPercent: Number(values.bookingConfig?.depositPercent || 0),
      },
      sale: values.sale?.isActive
        ? {
            isActive: true,
            type: values.sale?.type,
            value: Number(values.sale?.value || 0),
            startDate: values.sale?.startDate,
            endDate: values.sale?.endDate,
          }
        : undefined,
      schedule: values.schedule || {},
      ratingSummary: values.ratingSummary,
      difficulty: values.difficulty,
    };

    onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        isActive: true,
        tourType: 'DOMESTIC',
        duration: { days: 1, nights: 0 },
        destinations: [],
        translations: {},
        itinerary: [],
        capacity: { minGuests: 1, maxGuests: 40, privateAvailable: false },
        pricing: { basePrice: 0, currency: 'VND' },
        bookingConfig: {
          advanceBookingDays: 2,
          allowInstantBooking: true,
          requireDeposit: true,
          depositPercent: 30,
        },
        transportTypes: [],
        amenities: [],
        contact: {},
        thumbnail: {},
        gallery: [],
        sale: { isActive: false, type: 'PERCENT', value: 10 },
      }}
    >
      <Space style={{ width: '100%' }} size={16} wrap align="start">
        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
          <Input placeholder="sapa-3-ngay-2-dem" style={{ width: 320 }} />
        </Form.Item>
        <Form.Item name="code" label="Code" rules={[{ required: true }]}>
          <Input placeholder="TOUR-SAPA-001" style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Space>

      <Space style={{ width: '100%' }} size={16} wrap align="start">
        <Form.Item name="tourType" label="Tour Type" rules={[{ required: true }]}>
          <Select
            style={{ width: 220 }}
            options={[
              { label: 'Domestic', value: 'DOMESTIC' },
              { label: 'International', value: 'INTERNATIONAL' },
              { label: 'Daily', value: 'DAILY' },
            ]}
          />
        </Form.Item>

        <Form.Item name={['duration', 'days']} label="Days" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name={['duration', 'nights']} label="Nights" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: 120 }} />
        </Form.Item>

        <Form.Item name="difficulty" label="Difficulty">
          <Select
            allowClear
            style={{ width: 220 }}
            options={[
              { label: 'Easy', value: 'EASY' },
              { label: 'Moderate', value: 'MODERATE' },
              { label: 'Challenging', value: 'CHALLENGING' },
              { label: 'Difficult', value: 'DIFFICULT' },
            ]}
          />
        </Form.Item>
      </Space>

      <Form.Item
        name="departureProvinceId"
        label="Departure Province"
        rules={[{ required: true, message: 'Select departure province' }]}
      >
        <Select
          placeholder="Select departure province"
          options={provinces.map((p) => ({ label: getProvinceLabel(p), value: p._id }))}
        />
      </Form.Item>

      <Form.List name="destinations">
        {(fields, { add, remove }) => (
          <>
            <div style={{ marginBottom: 8 }}>Destinations</div>
            {fields.map(({ key, name }) => (
              <Space
                key={key}
                style={{ display: 'flex', marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  name={[name, 'provinceId']}
                  rules={[{ required: true, message: 'Select province' }]}
                  style={{ width: 320 }}
                >
                  <Select
                    placeholder="Province"
                    options={provinces.map((p) => ({
                      label: getProvinceLabel(p),
                      value: p._id,
                    }))}
                  />
                </Form.Item>
                <Form.Item name={[name, 'isMainDestination']} valuePropName="checked">
                  <Switch checkedChildren="Main" unCheckedChildren="Extra" />
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
              Add destination
            </Button>
          </>
        )}
      </Form.List>

      <Space style={{ width: '100%' }} size={16} wrap align="start">
        <Form.Item
          name={['capacity', 'minGuests']}
          label="Min Guests"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} style={{ width: 140 }} />
        </Form.Item>
        <Form.Item
          name={['capacity', 'maxGuests']}
          label="Max Guests"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name={['capacity', 'privateAvailable']} label="Private" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Space>

      <Space style={{ width: '100%' }} size={16} wrap align="start">
        <Form.Item
          name={['pricing', 'basePrice']}
          label="Base Price (VND)"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name={['pricing', 'childPrice']} label="Child Price (VND)">
          <InputNumber min={0} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name={['pricing', 'infantPrice']} label="Infant Price (VND)">
          <InputNumber min={0} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name={['pricing', 'singleSupplement']} label="Single Supplement (VND)">
          <InputNumber min={0} style={{ width: 220 }} />
        </Form.Item>
      </Space>

      <Form.Item name="transportTypes" label="Transport Types">
        <Select
          mode="tags"
          placeholder="e.g. BUS, BOAT"
          options={[
            { label: 'BUS', value: 'BUS' },
            { label: 'BOAT', value: 'BOAT' },
            { label: 'PLANE', value: 'PLANE' },
            { label: 'TRAIN', value: 'TRAIN' },
            { label: 'CAR', value: 'CAR' },
          ]}
        />
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

      <Form.Item label="Booking Config">
        <Space style={{ width: '100%' }} size={16} wrap align="start">
          <Form.Item
            name={['bookingConfig', 'advanceBookingDays']}
            label="Advance booking days"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: 220 }} />
          </Form.Item>
          <Form.Item
            name={['bookingConfig', 'depositPercent']}
            label="Deposit %"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} style={{ width: 160 }} />
          </Form.Item>
          <Form.Item
            name={['bookingConfig', 'allowInstantBooking']}
            label="Instant booking"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name={['bookingConfig', 'requireDeposit']}
            label="Require deposit"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item label="Contact">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name={['contact', 'phone']} label="Phone">
            <Input placeholder="0987..." />
          </Form.Item>
          <Form.Item name={['contact', 'email']} label="Email">
            <Input type="email" placeholder="tours@example.com" />
          </Form.Item>
          <Form.Item name={['contact', 'hotline']} label="Hotline">
            <Input placeholder="1900..." />
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item label="Media">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name={['thumbnail', 'url']} label="Thumbnail URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.List name="gallery">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 8 }}>Gallery</div>
                {fields.map(({ key, name }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item name={[name, 'url']} rules={[{ required: true }]} style={{ flex: 1 }}>
                      <Input placeholder="https://..." />
                    </Form.Item>
                    <Form.Item name={[name, 'alt']} style={{ width: 220 }}>
                      <Input placeholder="alt text" />
                    </Form.Item>
                    <Form.Item name={[name, 'order']} style={{ width: 120 }}>
                      <InputNumber min={1} placeholder="order" style={{ width: '100%' }} />
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
                  Add image
                </Button>
              </>
            )}
          </Form.List>
        </Space>
      </Form.Item>

      <Form.List name="itinerary">
        {(fields, { add, remove }) => (
          <>
            <div style={{ marginBottom: 8 }}>Itinerary</div>
            {fields.map(({ key, name }) => (
              <div
                key={key}
                style={{ border: '1px solid rgba(0,0,0,0.06)', padding: 12, marginBottom: 12 }}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Form.Item
                      name={[name, 'dayNumber']}
                      label="Day"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1} />
                    </Form.Item>
                  </Space>
                  <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)}>
                    Remove day
                  </Button>
                </Space>

                <Tabs
                  items={languages.map((lang) => ({
                    key: lang.code,
                    label: lang.code.toUpperCase(),
                    children: (
                      <>
                        <Form.Item
                          name={[name, 'translations', lang.code, 'title']}
                          label="Title"
                          rules={[{ required: true }]}
                        >
                          <Input placeholder="Day title" />
                        </Form.Item>
                        <Form.Item
                          name={[name, 'translations', lang.code, 'description']}
                          label="Description"
                          rules={[{ required: true }]}
                        >
                          <RichTextEditor />
                        </Form.Item>
                        <Form.Item name={[name, 'translations', lang.code, 'accommodation']} label="Accommodation">
                          <Input placeholder="Hotel/Resort..." />
                        </Form.Item>
                        <Form.Item name={[name, 'translations', lang.code, 'meals']} label="Meals">
                          <Select mode="tags" placeholder="e.g. Trưa, Tối" />
                        </Form.Item>
                      </>
                    ),
                  }))}
                />
              </div>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              Add itinerary day
            </Button>
          </>
        )}
      </Form.List>

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
                  rules={[{ required: lang.code === EnumLanguage.DEFAULT }]}
                >
                  <Input placeholder="Tour name" />
                </Form.Item>

                <Form.Item name={['translations', lang.code, 'shortDescription']} label="Short description">
                  <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name={['translations', lang.code, 'description']} label="Description">
                  <RichTextEditor />
                </Form.Item>

                <Form.Item name={['translations', lang.code, 'highlights']} label="Highlights">
                  <Select mode="tags" placeholder="Add highlights" />
                </Form.Item>
                <Form.Item name={['translations', lang.code, 'inclusions']} label="Inclusions">
                  <Select mode="tags" placeholder="Add inclusions" />
                </Form.Item>
                <Form.Item name={['translations', lang.code, 'exclusions']} label="Exclusions">
                  <Select mode="tags" placeholder="Add exclusions" />
                </Form.Item>
                <Form.Item name={['translations', lang.code, 'notes']} label="Notes">
                  <Select mode="tags" placeholder="Add notes" />
                </Form.Item>

                <Form.Item name={['translations', lang.code, 'cancellationPolicy']} label="Cancellation policy">
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Collapse
                  items={[
                    {
                      key: 'seo',
                      label: 'SEO',
                      children: (
                        <>
                          <Form.Item name={['translations', lang.code, 'seo', 'title']} label="Title">
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name={['translations', lang.code, 'seo', 'description']}
                            label="Description"
                          >
                            <Input.TextArea rows={2} />
                          </Form.Item>
                          <Form.Item name={['translations', lang.code, 'seo', 'keywords']} label="Keywords">
                            <Select mode="tags" placeholder="keyword1, keyword2" />
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

      <Form.Item label="Sale">
        <Space style={{ width: '100%' }} size={16} wrap align="start">
          <Form.Item name={['sale', 'isActive']} label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name={['sale', 'type']} label="Type">
            <Select
              style={{ width: 160 }}
              options={[
                { label: 'Percent', value: 'PERCENT' },
                { label: 'Fixed', value: 'FIXED' },
              ]}
            />
          </Form.Item>
          <Form.Item name={['sale', 'value']} label="Value">
            <InputNumber min={0} style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name={['sale', 'startDate']} label="Start date (ISO)">
            <Input placeholder="2025-02-01T00:00:00.000Z" style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name={['sale', 'endDate']} label="End date (ISO)">
            <Input placeholder="2025-02-28T23:59:59.000Z" style={{ width: 260 }} />
          </Form.Item>
        </Space>
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
