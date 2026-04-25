import BlockEditor from '@/components/BlockEditor';
import { EnumLanguage } from '@/constants/enum';
import type {
  BlogPost,
  BlogPostUpsertPayload,
  EditorJsBlock,
} from '@/interface/blog';
import {
  getProvinceLabel,
  pickDynamicLocalized,
  type DynamicLocalized,
} from '@/lib/dynamic-localized';
import { slugify } from '@/lib/slugify';
import { uploadMedia } from '@/services/media.service';
import { useLanguages } from '@/queries/language.queries';
import {
  useBlogCategoryOptions,
  useBlogTagOptions,
} from '@/queries/blog.queries';
import { useHotelOptions } from '@/queries/hotel.queries';
import { useProvinceDropdown } from '@/queries/province.queries';
import { useTourOptions } from '@/queries/tour.queries';
import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Upload,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const emptyBlock: EditorJsBlock = {
  id: 'p0',
  type: 'paragraph',
  data: { text: '' },
};

function toId(
  v: string | { _id: string } | null | undefined,
): string | undefined {
  if (v == null) return undefined;
  return typeof v === 'string' ? v : v._id;
}

function toIdList(v: (string | { _id: string })[] | undefined): string[] {
  if (!v?.length) return [];
  return v.map((x) => toId(x)).filter(Boolean) as string[];
}

type Props = {
  initialValues?: BlogPost;
  submitText: string;
  loading?: boolean;
  onSubmit: (payload: BlogPostUpsertPayload) => void | Promise<void>;
  onCancel: () => void;
};

function buildFormInitials(post: BlogPost | undefined) {
  if (!post) {
    return {
      slug: '',
      isFeatured: false,
      category: undefined as string | undefined,
      tags: [] as string[],
      relatedProvinces: [] as string[],
      relatedTours: [] as string[],
      relatedHotels: [] as string[],
      thumbnail: undefined as
        | { url: string; publicId?: string; alt?: string }
        | undefined,
      gallery: [] as {
        url: string;
        publicId?: string;
        alt?: string;
        order?: number;
      }[],
      translations: {} as Record<
        string,
        {
          title: string;
          excerpt?: string;
          content: EditorJsBlock[];
          seo?: {
            title?: string;
            description?: string;
            keywords?: string[];
            ogImage?: string;
          };
        }
      >,
    };
  }

  const translations: Record<
    string,
    {
      title: string;
      excerpt?: string;
      content: EditorJsBlock[];
      seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
        ogImage?: string;
      };
    }
  > = {};
  for (const [code, t] of Object.entries(post.translations || {})) {
    translations[code] = {
      title: t.title || '',
      excerpt: t.excerpt,
      content: t.content && t.content.length > 0 ? t.content : [emptyBlock],
      seo: t.seo,
    };
  }

  return {
    slug: post.slug,
    isFeatured: !!post.isFeatured,
    category: toId(post.category) ?? undefined,
    tags: toIdList(post.tags as (string | { _id: string })[] | undefined),
    relatedProvinces: toIdList(
      (post as BlogPost & { relatedProvinces?: (string | { _id: string })[] })
        .relatedProvinces,
    ),
    relatedTours: toIdList(
      (post as BlogPost & { relatedTours?: (string | { _id: string })[] })
        .relatedTours,
    ),
    relatedHotels: toIdList(
      (post as BlogPost & { relatedHotels?: (string | { _id: string })[] })
        .relatedHotels,
    ),
    thumbnail: post.thumbnail,
    gallery: post.gallery || [],
    translations,
  };
}

function tourOptionLabel(t: {
  translations?: Record<string, { name?: string }>;
  code?: string;
}): string {
  const name =
    t.translations?.[EnumLanguage.DEFAULT]?.name ||
    t.translations?.en?.name ||
    t.translations?.vi?.name;
  return name || t.code || '—';
}

function hotelOptionLabel(h: {
  translations?: Record<string, { name?: string }>;
  slug?: string;
}): string {
  const name =
    h.translations?.[EnumLanguage.DEFAULT]?.name ||
    h.translations?.en?.name ||
    h.translations?.vi?.name;
  return name || h.slug || '—';
}

export default function BlogPostForm({
  initialValues,
  submitText,
  loading,
  onSubmit,
  onCancel,
}: Props) {
  const { data: languages = [] } = useLanguages();
  const activeLangs = useMemo(
    () => languages.filter((l) => l.isActive),
    [languages],
  );
  const defaultLang =
    activeLangs.find((l) => l.code === 'vi' || l.code === EnumLanguage.VN)
      ?.code ||
    activeLangs.find((l) => l.code === 'en')?.code ||
    activeLangs[0]?.code ||
    'vi';

  const [form] = Form.useForm();
  const [tabLang, setTabLang] = useState<string>(defaultLang);
  const [slugTouched, setSlugTouched] = useState(false);
  /**
   * Chỉ sync form từ server khi mở bài khác / tạo mới — không gọi mỗi lần React Query refetch
   * (cùng _id) vì sẽ ghi đè nội dung đang sửa và khiến BlockEditor nhấp nháy / mất chữ.
   */
  const formSeedFromServer = useRef<string | null>(null);

  const { data: categoryData } = useBlogCategoryOptions();
  const { data: tagData } = useBlogTagOptions();
  const { data: provinceOptions = [] } = useProvinceDropdown();
  const { data: tourOptions = [] } = useTourOptions();
  const { data: hotelOptions = [] } = useHotelOptions();
  const [formSeeded, setFormSeeded] = useState(false);
  const categoryItems = useMemo(
    () => (Array.isArray(categoryData?.items) ? categoryData.items : []),
    [categoryData],
  );
  const tagItems = useMemo(
    () => (Array.isArray(tagData?.items) ? tagData.items : []),
    [tagData],
  );

  const formInitials = useMemo(
    () => buildFormInitials(initialValues),
    [initialValues],
  );

  useEffect(() => {
    if (initialValues?._id) {
      if (formSeedFromServer.current === initialValues._id) {
        return;
      }
      formSeedFromServer.current = initialValues._id;
    } else {
      if (formSeedFromServer.current === '__new__') {
        return;
      }
      formSeedFromServer.current = '__new__';
    }
    form.setFieldsValue(formInitials);
    setFormSeeded(true);
  }, [form, formInitials, initialValues?._id]);

  useEffect(() => {
    if (initialValues) {
      return;
    }
    if (!activeLangs.length) {
      return;
    }
    const t: NonNullable<ReturnType<typeof buildFormInitials>['translations']> =
      {
        ...form.getFieldValue('translations'),
      };
    for (const l of activeLangs) {
      if (!t[l.code]) {
        t[l.code] = { title: '', content: [emptyBlock], excerpt: '' };
      }
    }
    form.setFieldValue('translations', t);
  }, [activeLangs, form, initialValues]);

  const postId = initialValues?._id ?? 'new';
  const readOnlyStatus = initialValues?.status;

  /** Khi API ngôn ngữ load xong: giữ tab nếu còn hợp lệ, không thì chuyển về `defaultLang` (tránh mọi panel `display: none` + Editor.js không gắn được). */
  useEffect(() => {
    if (activeLangs.length === 0) {
      return;
    }
    const codes = new Set(activeLangs.map((l) => l.code));
    setTabLang((tl) => (tl && codes.has(tl) ? tl : defaultLang));
  }, [activeLangs, defaultLang]);

  const handleTitleBlur = useCallback(
    (lang: string) => {
      if (slugTouched) {
        return;
      }
      const t = form.getFieldValue(['translations', lang, 'title']) as
        | string
        | undefined;
      if (t && !form.getFieldValue('slug')) {
        form.setFieldValue('slug', slugify(t));
      }
    },
    [form, slugTouched],
  );

  const handleFinish = async (values: Record<string, unknown>) => {
    const v = values as {
      slug: string;
      isFeatured: boolean;
      category?: string;
      tags?: string[];
      relatedProvinces?: string[];
      relatedTours?: string[];
      relatedHotels?: string[];
      thumbnail?: { url: string; publicId?: string; alt?: string };
      gallery?: {
        url: string;
        publicId?: string;
        alt?: string;
        order?: number;
      }[];
      translations: Record<
        string,
        {
          title: string;
          excerpt?: string;
          content: EditorJsBlock[];
          seo?: {
            title?: string;
            description?: string;
            keywords?: string[];
            ogImage?: string;
          };
        }
      >;
    };

    const tDef = v.translations?.[defaultLang];
    if (!tDef?.title?.trim()) {
      void message.error(`Nhập tiêu đề (ngôn ngữ: ${defaultLang})`);
      return;
    }
    if (!tDef?.content || tDef.content.length === 0) {
      void message.error(`Nhập nội dung (ngôn ngữ: ${defaultLang})`);
      return;
    }

    const payload: BlogPostUpsertPayload = {
      slug: v.slug,
      isFeatured: v.isFeatured,
      category: v.category ?? null,
      tags: v.tags,
      relatedProvinces: v.relatedProvinces,
      relatedTours: v.relatedTours,
      relatedHotels: v.relatedHotels,
      thumbnail: v.thumbnail,
      gallery: v.gallery,
      translations: v.translations as BlogPostUpsertPayload['translations'],
    };

    await onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={formInitials}
    >
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[
              { required: true, message: 'Nhập slug' },
              {
                pattern: /^[a-z0-9-]+$/,
                message: 'Chỉ chữ thường, số, dấu gạch',
              },
            ]}
          >
            <Input
              placeholder="tieu-de-bai-viet"
              onChange={() => setSlugTouched(true)}
            />
          </Form.Item>

          {activeLangs.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Bản dịch</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {activeLangs.map((l) => (
                  <Button
                    key={l.code}
                    type={tabLang === l.code ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setTabLang(l.code)}
                  >
                    {l.name} ({l.code})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {activeLangs.length > 0 && (
            <div>
              <Form.Item
                name={['translations', tabLang, 'title']}
                label={`Tiêu đề (${tabLang})`}
              >
                <Input
                  placeholder="Tiêu đề"
                  onBlur={() => handleTitleBlur(tabLang)}
                />
              </Form.Item>
              <Form.Item
                name={['translations', tabLang, 'excerpt']}
                label="Mô tả ngắn"
              >
                <Input.TextArea rows={3} placeholder="Excerpt" />
              </Form.Item>
              {activeLangs.length > 0 && formSeeded && (
                <Form.Item
                  name={['translations', tabLang, 'content']}
                  label="Nội dung (block)"
                  getValueFromEvent={(b) => b}
                  validateTrigger="onChange"
                >
                  <BlockEditor
                    key={`${postId}-${tabLang}`}
                    editorKey={`${postId}-${tabLang}`}
                  />
                </Form.Item>
              )}
              <Collapse
                size="small"
                items={[
                  {
                    key: 'seo',
                    label: 'SEO (tuỳ chọn)',
                    children: (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item
                          name={['translations', tabLang, 'seo', 'title']}
                          label="SEO title"
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={['translations', tabLang, 'seo', 'description']}
                          label="SEO description"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item
                          name={['translations', tabLang, 'seo', 'keywords']}
                          label="Từ khoá"
                        >
                          <Select
                            mode="tags"
                            placeholder="keyword"
                            open={false}
                          />
                        </Form.Item>
                        <Form.Item
                          name={['translations', tabLang, 'seo', 'ogImage']}
                          label="OG image URL"
                        >
                          <Input />
                        </Form.Item>
                      </Space>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card size="small" title="Xuất bản" style={{ marginBottom: 16 }}>
            {readOnlyStatus && (
              <div style={{ marginBottom: 8 }}>
                Trạng thái:{' '}
                <Tag
                  color={readOnlyStatus === 'published' ? 'green' : 'orange'}
                >
                  {readOnlyStatus}
                </Tag>
              </div>
            )}
            <Form.Item
              name="isFeatured"
              label="Bài nổi bật"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Chọn danh mục' }]}
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                placeholder="Chọn category"
                options={categoryItems.map((c) => ({
                  value: c._id,
                  label: `${pickDynamicLocalized(c.name, defaultLang)} (${c.slug})`,
                }))}
              />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select
                mode="multiple"
                showSearch
                optionFilterProp="label"
                placeholder="Tags"
                options={tagItems.map((t) => ({
                  value: t._id,
                  label: `${pickDynamicLocalized(t.name, defaultLang)} (${t.slug})`,
                }))}
              />
            </Form.Item>
          </Card>

          <Card size="small" title="Media" style={{ marginBottom: 16 }}>
            <Form.Item name="thumbnail" label="Thumbnail" valuePropName="value">
              <ThumbnailFormControl />
            </Form.Item>
            <p
              style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}
            >
              Ảnh đại diện (1 ảnh, tải lên server)
            </p>
            <Form.Item name="gallery" label="Gallery" valuePropName="value">
              <GalleryFormControl />
            </Form.Item>
          </Card>

          <Card size="small" title="Liên kết" style={{ marginBottom: 16 }}>
            <Form.Item
              name="relatedProvinces"
              label="Tỉnh / điểm đến liên quan"
            >
              <Select
                mode="multiple"
                showSearch
                optionFilterProp="label"
                placeholder="Tỉnh"
                options={provinceOptions.map((p) => ({
                  value: p._id,
                  label: getProvinceLabel({
                    name: p.name as DynamicLocalized,
                    code: p.code,
                  }),
                }))}
              />
            </Form.Item>
            <Form.Item name="relatedTours" label="Tour liên quan">
              <Select
                mode="multiple"
                showSearch
                optionFilterProp="label"
                placeholder="Tour"
                options={tourOptions.map((t) => ({
                  value: t._id,
                  label: tourOptionLabel(t as never),
                }))}
              />
            </Form.Item>
            <Form.Item name="relatedHotels" label="Khách sạn liên quan">
              <Select
                mode="multiple"
                showSearch
                optionFilterProp="label"
                placeholder="Khách sạn"
                options={hotelOptions.map((h) => ({
                  value: h._id,
                  label: hotelOptionLabel(h as never),
                }))}
              />
            </Form.Item>
          </Card>

          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {submitText}
            </Button>
            <Button onClick={onCancel}>Hủy</Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
}

function ThumbnailFormControl({
  value,
  onChange,
}: {
  value?: { url: string; publicId?: string; alt?: string };
  onChange?: (
    v: { url: string; publicId?: string; alt?: string } | undefined,
  ) => void;
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
    uid: `${g.url}-${i}`,
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
        <div>Thêm</div>
      </div>
    </Upload>
  );
}
