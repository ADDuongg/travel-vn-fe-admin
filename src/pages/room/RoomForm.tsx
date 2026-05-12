import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Space,
  Switch,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import { useLanguages } from '@/queries/language.queries';
import type {
  Room,
  RoomPayload,
  RoomPayloadCapacity,
  RoomPayloadSale,
  RoomPayloadTranslation,
} from '@interface/room';
import { useAmenities } from '@/queries/amenities.queries';
import { EnumLanguage } from '@/constants/enum';
import { useHotelOptions } from '@/queries/hotel.queries';
import { uploadMedia } from '@/services/media.service';

const capacityValidator = ({ getFieldValue }: { getFieldValue: (n: string) => unknown }) => ({
  validator() {
    const capacity = getFieldValue('capacity') as RoomPayloadCapacity | undefined;

    if (!capacity) return Promise.resolve();

    const { baseAdults, baseChildren, maxAdults, maxChildren } = capacity;

    if (
      typeof baseAdults === 'number' &&
      typeof maxAdults === 'number' &&
      baseAdults > maxAdults
    ) {
      return Promise.reject(new Error('Base adults cannot exceed max adults'));
    }

    if (
      typeof baseChildren === 'number' &&
      typeof maxChildren === 'number' &&
      baseChildren > maxChildren
    ) {
      return Promise.reject(
        new Error('Base children cannot exceed max children'),
      );
    }

    return Promise.resolve();
  },
});

function toHotelId(room: Room): string {
  const h = room.hotelId;
  if (typeof h === 'string') return h;
  if (h && typeof h === 'object' && '_id' in h) return (h as { _id: string })._id;
  return '';
}

function roomToFormCapacity(room: Room): RoomPayloadCapacity {
  if (room.capacity) return room.capacity;
  const adults = room.adults ?? 2;
  const children = room.children ?? 0;
  const maxGuests = room.maxGuests ?? adults;
  return {
    baseAdults: adults,
    baseChildren: children,
    maxAdults: maxGuests,
    maxChildren: children,
    roomSize: room.roomSize ?? 0,
  };
}

function parseTranslations(
  raw: Room['translations'] | string,
): Record<string, RoomPayloadTranslation> {
  const parsed =
    typeof raw === 'string' ? (JSON.parse(raw) as Record<string, RoomPayloadTranslation>) : raw;
  const out: Record<string, RoomPayloadTranslation> = {};
  for (const [code, t] of Object.entries(parsed || {})) {
    out[code] = {
      name: t?.name ?? '',
      description: t?.description ?? '',
      shortDescription: t?.shortDescription,
      hotelRule: Array.isArray(t?.hotelRule) ? t.hotelRule : undefined,
      faq: Array.isArray(t?.faq) ? t.faq : [],
    };
  }
  return out;
}

function buildSalePayload(
  sale: Partial<RoomPayloadSale> & { isActive?: boolean } | undefined,
  options?: { serverHadActiveSale?: boolean },
): RoomPayloadSale | undefined {
  if (!sale) return undefined;
  if (!sale.isActive) {
    if (options?.serverHadActiveSale) {
      return {
        isActive: false,
        type: sale.type ?? 'PERCENT',
        value: sale.value ?? 0,
      };
    }
    return undefined;
  }
  if (sale.type == null || sale.value == null) return undefined;
  return {
    isActive: true,
    type: sale.type,
    value: Number(sale.value),
    ...(typeof sale.startDate === 'string' ? { startDate: sale.startDate } : {}),
    ...(typeof sale.endDate === 'string' ? { endDate: sale.endDate } : {}),
  };
}

type Props = {
  initialValues?: Room;
  loading?: boolean;
  submitText: string;
  onSubmit: (payload: RoomPayload) => void | Promise<void>;
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

  const formSeedFromServer = useRef<string | null>(null);

  const [tabLang, setTabLang] = useState<string>('vi');

  useEffect(() => {
    const first = languages[0]?.code;
    if (first) setTabLang((t) => (languages.some((l) => l.code === t) ? t : first));
  }, [languages]);

  /** Create mode: ensure every language has a translation object for Form.List / fields. */
  useEffect(() => {
    if (initialValues) return;
    if (!languages.length) return;
    const t = { ...(form.getFieldValue('translations') as Record<string, RoomPayloadTranslation> | undefined) ?? {} };
    let changed = false;
    for (const l of languages) {
      if (!t[l.code]) {
        t[l.code] = { name: '', description: '', faq: [] };
        changed = true;
      }
    }
    if (changed) form.setFieldValue('translations', t);
  }, [languages, form, initialValues]);

  useEffect(() => {
    const seedKey = initialValues?._id ?? '__new__';
    if (formSeedFromServer.current === seedKey) return;
    formSeedFromServer.current = seedKey;

    if (initialValues) {
      const translations = parseTranslations(initialValues.translations);

      form.setFieldsValue({
        code: initialValues.code,
        slug: initialValues.slug,
        roomType: initialValues.roomType,
        isActive: initialValues.isActive,
        hotelId: toHotelId(initialValues),
        amenities: initialValues.amenities
          ?.map((a) => {
            if (typeof a === 'string') return a;
            const id = (a as unknown as { _id?: string })._id;
            return id ?? '';
          })
          .filter(Boolean),
        bookingConfig: initialValues.bookingConfig || {
          minNights: 1,
          allowInstantBooking: true,
        },
        translations,
        basePrice: initialValues.pricing?.basePrice,
        totalRooms: initialValues.inventory?.totalRooms,
        capacity: roomToFormCapacity(initialValues),
        sale: initialValues.sale || { isActive: false },
        thumbnail: initialValues.thumbnail?.url
          ? {
              url: initialValues.thumbnail.url,
              publicId: initialValues.thumbnail.publicId,
              alt: initialValues.thumbnail.alt,
            }
          : undefined,
        gallery: (initialValues.gallery ?? []).map((img, i) => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.alt,
          order: img.order ?? i,
        })),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        gallery: [],
        bookingConfig: { minNights: 1, allowInstantBooking: true },
        sale: { isActive: false },
      });
    }
  }, [initialValues, form]);

  /** Edit mode: add empty shells for languages missing from API translations. */
  useEffect(() => {
    if (!initialValues?._id || !languages.length) return;
    const t = form.getFieldValue('translations') as
      | Record<string, RoomPayloadTranslation>
      | undefined;
    if (!t) return;
    const next = { ...t };
    let changed = false;
    for (const l of languages) {
      if (!next[l.code]) {
        next[l.code] = { name: '', description: '', faq: [] };
        changed = true;
      }
    }
    if (changed) form.setFieldValue('translations', next);
  }, [languages, initialValues?._id, form, initialValues]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const v = values as {
      code: string;
      slug: string;
      roomType: string;
      isActive: boolean;
      hotelId: string;
      capacity: RoomPayloadCapacity;
      basePrice: number;
      totalRooms: number;
      translations: Record<string, RoomPayloadTranslation>;
      bookingConfig: RoomPayload['bookingConfig'];
      amenities?: string[];
      sale?: Partial<RoomPayloadSale> & { isActive?: boolean };
      thumbnail?: { url: string; publicId?: string; alt?: string };
      gallery?: Array<{
        url: string;
        publicId?: string;
        alt?: string;
        order?: number;
      }>;
    };

    const salePayload = buildSalePayload(v.sale, {
      serverHadActiveSale: !!initialValues?.sale?.isActive,
    });

    const payload: RoomPayload = {
      code: v.code,
      slug: v.slug,
      roomType: v.roomType,
      isActive: v.isActive,
      hotelId: v.hotelId,
      capacity: v.capacity,
      basePrice: Number(v.basePrice),
      totalRooms: Number(v.totalRooms),
      translations: v.translations,
      bookingConfig: v.bookingConfig,
      ...(Array.isArray(v.amenities) && v.amenities.length > 0
        ? { amenities: v.amenities }
        : {}),
      ...(salePayload ? { sale: salePayload } : {}),
      ...(v.thumbnail?.url ? { thumbnail: v.thumbnail } : {}),
      ...(Array.isArray(v.gallery)
        ? {
            gallery: v.gallery.map((g, i) => ({
              ...g,
              order: g.order ?? i,
            })),
          }
        : {}),
    };

    await onSubmit(payload);
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
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Translations</div>
        <Space wrap>
          {languages.map((l) => (
            <Button
              key={l.code}
              type={tabLang === l.code ? 'primary' : 'default'}
              size="small"
              onClick={() => setTabLang(l.code)}
            >
              {l.name} ({l.code})
            </Button>
          ))}
        </Space>
      </div>

      {languages.some((l) => l.code === tabLang) && (
        <>
          <Collapse
            defaultActiveKey={[]}
            items={[
              {
                key: 'rules',
                label: 'Hotel Rules',
                children: (
                  <Form.List name={['translations', tabLang, 'hotelRule']}>
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
                  <Form.List name={['translations', tabLang, 'faq']}>
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
                              <Input.TextArea rows={3} placeholder="Answer" />
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

          <Form.Item name={['translations', tabLang, 'name']} label="Name">
            <Input />
          </Form.Item>

          <Form.Item
            name={['translations', tabLang, 'description']}
            label="Description"
          >
            <RichTextEditor key={`${initialValues?._id ?? 'new'}-${tabLang}`} />
          </Form.Item>
        </>
      )}

      <Divider orientation="left">Media</Divider>
      <p style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)', marginBottom: 8 }}>
        Ảnh tải lên qua Media API; chỉ gửi reference (url, publicId). Bỏ trống thumbnail để BE
        dùng ảnh đầu gallery làm thumbnail.
      </p>
      <Form.Item name="thumbnail" label="Thumbnail" valuePropName="value">
        <ThumbnailFormControl />
      </Form.Item>
      <Form.Item name="gallery" label="Gallery" valuePropName="value">
        <GalleryFormControl />
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

function ThumbnailFormControl({
  value,
  onChange,
}: {
  value?: { url: string; publicId?: string; alt?: string };
  onChange?: (v: { url: string; publicId?: string; alt?: string } | undefined) => void;
}) {
  return (
    <Upload
      listType="picture-card"
      maxCount={1}
      fileList={
        value?.url
          ? [
              {
                uid: 'thumb',
                name: 'thumb',
                status: 'done' as const,
                url: value.url,
              },
            ]
          : []
      }
      beforeUpload={async (file) => {
        try {
          const r = await uploadMedia(file);
          onChange?.({ url: r.url, publicId: r.publicId });
        } catch (e: unknown) {
          const msg = (e as { message?: string })?.message;
          void message.error(msg || 'Upload thất bại');
        }
        return false;
      }}
      onRemove={() => {
        onChange?.(undefined);
        return true;
      }}
    >
      <div>
        <UploadOutlined />
        <div style={{ marginTop: 4 }}>Upload</div>
      </div>
    </Upload>
  );
}

function GalleryFormControl({
  value,
  onChange,
}: {
  value?: { url: string; publicId?: string; alt?: string; order?: number }[];
  onChange?: (
    v: { url: string; publicId?: string; alt?: string; order?: number }[],
  ) => void;
}) {
  const list = value || [];
  const fileList = list.map((g, i) => ({
    uid: `${g.publicId ?? g.url}-${i}`,
    name: g.url.split('/').pop() || `img-${i}`,
    status: 'done' as const,
    url: g.url,
  }));

  return (
    <Upload
      listType="picture-card"
      multiple
      fileList={fileList as never}
      beforeUpload={async (file) => {
        try {
          const r = await uploadMedia(file);
          const next = [
            ...list,
            {
              url: r.url,
              publicId: r.publicId,
              order: list.length,
            },
          ];
          onChange?.(next);
        } catch (e: unknown) {
          const msg = (e as { message?: string })?.message;
          void message.error(msg || 'Upload thất bại');
        }
        return false;
      }}
      onRemove={(file) => {
        const u = file.url;
        onChange?.(list.filter((g) => g.url !== u));
        return true;
      }}
    >
      <div>
        <UploadOutlined />
        <div style={{ marginTop: 4 }}>Thêm</div>
      </div>
    </Upload>
  );
}
