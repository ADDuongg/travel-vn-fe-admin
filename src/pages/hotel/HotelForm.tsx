import {
  Button,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  Upload,
  message,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useEffect } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import { useProvinceDropdown } from '@/queries/province.queries';
import { useAmenities } from '@/queries/amenities.queries';
import { useLanguages } from '@/queries/language.queries';
import { EnumLanguage } from '@/constants/enum';
import type {
  Hotel,
  HotelCreateUpdateBody,
  HotelTranslation,
} from '@/interface/hotel';
import { getProvinceLabel } from '@/lib/dynamic-localized';
import { uploadMedia } from '@/services/media.service';

type Props = {
  initialValues?: Hotel;
  loading?: boolean;
  submitText: string;
  onSubmit: (payload: HotelCreateUpdateBody) => void | Promise<void>;
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
  const { data: provinces = [] } = useProvinceDropdown();
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
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const v = values as {
      slug: string;
      isActive: boolean;
      starRating?: number;
      provinceId: string;
      translations: Record<string, HotelTranslation>;
      contact?: HotelCreateUpdateBody['contact'];
      location?: HotelCreateUpdateBody['location'];
      amenities?: string[];
      thumbnail?: { url: string; publicId?: string; alt?: string };
      gallery?: Array<{
        url: string;
        publicId?: string;
        alt?: string;
        order?: number;
      }>;
    };

    const payload: HotelCreateUpdateBody = {
      slug: v.slug,
      isActive: !!v.isActive,
      starRating: Number(v.starRating ?? 3),
      provinceId: v.provinceId,
      translations: v.translations || {},
      contact: v.contact || {},
      location: v.location || {},
      ...(Array.isArray(v.amenities) && v.amenities.length > 0
        ? { amenities: v.amenities }
        : {}),
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
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        isActive: true,
        starRating: 3,
        translations: {},
        contact: {},
        location: {},
        gallery: [],
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
            label: getProvinceLabel({ name: p.name, code: p.code }),
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
