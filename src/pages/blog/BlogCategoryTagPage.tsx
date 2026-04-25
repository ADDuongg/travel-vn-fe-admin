import PageShell from '@/components/PageShell';
import { pickDynamicLocalized, type DynamicLocalized } from '@/lib/dynamic-localized';
import { slugify } from '@/lib/slugify';
import { uploadMedia } from '@/services/media.service';
import {
  useBlogCategories,
  useBlogTags,
  useCreateBlogCategory,
  useCreateBlogTag,
  useDeleteBlogCategory,
  useDeleteBlogTag,
  useUpdateBlogCategory,
  useUpdateBlogTag,
} from '@/queries/blog.queries';
import { useLanguages } from '@/queries/language.queries';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BlogCategory, BlogTag } from '@/interface/blog';
import { UploadOutlined } from '@ant-design/icons';
import { Upload } from 'antd';

const pageSize = 20;

function CategoryModal({
  open,
  onClose,
  onOk,
  loading,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onOk: (v: Record<string, unknown>) => void;
  loading?: boolean;
  initial?: BlogCategory | null;
}) {
  const { data: languages = [] } = useLanguages();
  const active = useMemo(
    () => languages.filter((l) => l.isActive),
    [languages],
  );
  const [form] = Form.useForm();
  const [tab, setTab] = useState(active[0]?.code || 'vi');
  const [slugTouched, setSlugTouched] = useState(false);

  const resetAndFill = useCallback(() => {
    if (initial) {
      form.setFieldsValue({
        slug: initial.slug,
        order: initial.order ?? 0,
        isActive: initial.isActive !== false,
        name: initial.name,
        description: initial.description,
        thumbnail: initial.thumbnail,
        translations: initial.translations,
      });
    } else {
      form.resetFields();
      const names: Record<string, string> = {};
      const desc: Record<string, string> = {};
      const tr: Record<string, { seo?: unknown }> = {};
      for (const l of active) {
        names[l.code] = '';
        desc[l.code] = '';
        tr[l.code] = { seo: {} };
      }
      form.setFieldsValue({
        name: names,
        description: desc,
        order: 0,
        isActive: true,
        translations: tr,
      });
    }
    setSlugTouched(false);
  }, [form, initial, active]);

  useEffect(() => {
    if (open) {
      resetAndFill();
    }
  }, [open, initial?._id, resetAndFill]);

  const defaultLang = useMemo(
    () =>
      active.find((l) => l.code === 'vi')?.code ||
      active.find((l) => l.code === 'en')?.code ||
      active[0]?.code ||
      'vi',
    [active],
  );

  return (
    <Modal
      title={initial ? 'Sửa category' : 'Thêm category'}
      open={open}
      onCancel={onClose}
      width={720}
      okText="Lưu"
      confirmLoading={loading}
      onOk={async () => {
        const v = await form.validateFields();
        await onOk(v);
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="slug" label="Slug">
          <Input
            placeholder="auto từ tên"
            onChange={() => setSlugTouched(true)}
          />
        </Form.Item>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Tên & mô tả theo ngôn ngữ</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {active.map((l) => (
            <Button
              key={l.code}
              type={tab === l.code ? 'primary' : 'default'}
              size="small"
              onClick={() => setTab(l.code)}
            >
              {l.name}
            </Button>
          ))}
        </div>
        {active.map((l) => (
          <div
            key={l.code}
            style={{ display: tab === l.code ? 'block' : 'none' }}
          >
            <Form.Item
              name={['name', l.code]}
              label={`Tên (${l.code})`}
              rules={[
                { required: l.code === defaultLang, message: 'Nhập tên' },
              ]}
            >
              <Input
                onBlur={() => {
                  if (slugTouched) return;
                  const t = form.getFieldValue(['name', l.code]) as string;
                  if (t && !form.getFieldValue('slug')) {
                    form.setFieldValue('slug', slugify(t));
                  }
                }}
              />
            </Form.Item>
            <Form.Item name={['description', l.code]} label="Mô tả">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item
              name={['translations', l.code, 'seo', 'title']}
              label="SEO title"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={['translations', l.code, 'seo', 'description']}
              label="SEO description"
            >
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item
              name={['translations', l.code, 'seo', 'keywords']}
              label="Từ khoá"
            >
              <Select mode="tags" open={false} />
            </Form.Item>
          </div>
        ))}
        <Form.Item name="order" label="Thứ tự">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          name="thumbnail"
          label="Thumbnail"
          valuePropName="value"
          getValueFromEvent={(v) => v}
        >
          <CategoryThumbField />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function CategoryThumbField({
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
                uid: 'c',
                name: 'c',
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
          void message.error(
            (e as { message?: string })?.message || 'Upload lỗi',
          );
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
        <div>Upload</div>
      </div>
    </Upload>
  );
}

function TagModal({
  open,
  onClose,
  onOk,
  loading,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onOk: (v: Record<string, unknown>) => void;
  loading?: boolean;
  initial?: BlogTag | null;
}) {
  const { data: languages = [] } = useLanguages();
  const active = useMemo(
    () => languages.filter((l) => l.isActive),
    [languages],
  );
  const [form] = Form.useForm();
  const [tab, setTab] = useState(active[0]?.code || 'vi');
  const [slugTouched, setSlugTouched] = useState(false);
  const defaultLang = useMemo(
    () =>
      active.find((l) => l.code === 'vi')?.code ||
      active.find((l) => l.code === 'en')?.code ||
      active[0]?.code ||
      'vi',
    [active],
  );

  const fill = useCallback(() => {
    if (initial) {
      form.setFieldsValue({
        slug: initial.slug,
        isActive: initial.isActive !== false,
        name: initial.name,
      });
    } else {
      const names: Record<string, string> = {};
      for (const l of active) {
        names[l.code] = '';
      }
      form.setFieldsValue({ name: names, isActive: true, slug: '' });
    }
    setSlugTouched(false);
  }, [form, initial, active]);

  useEffect(() => {
    if (open) {
      fill();
    }
  }, [open, initial?._id, fill]);

  return (
    <Modal
      title={initial ? 'Sửa tag' : 'Thêm tag'}
      open={open}
      onCancel={onClose}
      width={520}
      okText="Lưu"
      confirmLoading={loading}
      onOk={async () => {
        const v = await form.validateFields();
        await onOk(v);
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="slug" label="Slug">
          <Input onChange={() => setSlugTouched(true)} />
        </Form.Item>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {active.map((l) => (
            <Button
              key={l.code}
              type={tab === l.code ? 'primary' : 'default'}
              size="small"
              onClick={() => setTab(l.code)}
            >
              {l.name}
            </Button>
          ))}
        </div>
        {active.map((l) => (
          <div
            key={l.code}
            style={{ display: tab === l.code ? 'block' : 'none' }}
          >
            <Form.Item
              name={['name', l.code]}
              label={`Tên (${l.code})`}
              rules={[
                { required: l.code === defaultLang, message: 'Nhập tên' },
              ]}
            >
              <Input
                onBlur={() => {
                  if (slugTouched) return;
                  const t = form.getFieldValue(['name', l.code]) as string;
                  if (t && !form.getFieldValue('slug')) {
                    form.setFieldValue('slug', slugify(t));
                  }
                }}
              />
            </Form.Item>
          </div>
        ))}
        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function BlogCategoryTagPage() {
  const [catPage, setCatPage] = useState(1);
  const [catSearch, setCatSearch] = useState('');
  const [catSearchDeb, setCatSearchDeb] = useState('');
  const { data: catData, isLoading: catLoad, refetch: refetchCat } = useBlogCategories({
    page: catPage,
    limit: pageSize,
    search: catSearchDeb || undefined,
  });
  const catItems: BlogCategory[] = useMemo(
    () => (Array.isArray(catData?.items) ? catData.items : []),
    [catData],
  );
  const catTotal = catData?.pagination?.total ?? 0;

  const [tagPage, setTagPage] = useState(1);
  const [tagSearch, setTagSearch] = useState('');
  const [tagSearchDeb, setTagSearchDeb] = useState('');
  const { data: tagData, isLoading: tagLoad, refetch: refetchTag } = useBlogTags({
    page: tagPage,
    limit: pageSize,
    search: tagSearchDeb || undefined,
  });
  const tagItems: BlogTag[] = useMemo(
    () => (Array.isArray(tagData?.items) ? tagData.items : []),
    [tagData],
  );
  const tagTotal = tagData?.pagination?.total ?? 0;

  const [catModal, setCatModal] = useState(false);
  const [catEdit, setCatEdit] = useState<BlogCategory | null>(null);
  const createCat = useCreateBlogCategory();
  const updateCat = useUpdateBlogCategory();
  const deleteCat = useDeleteBlogCategory();

  const [tagModal, setTagModal] = useState(false);
  const [tagEdit, setTagEdit] = useState<BlogTag | null>(null);
  const createTag = useCreateBlogTag();
  const updateTag = useUpdateBlogTag();
  const deleteTag = useDeleteBlogTag();

  const catColumns: TableColumnsType<BlogCategory> = useMemo(
    () => [
      {
        title: 'Ảnh',
        width: 72,
        render: (_, r) =>
          r.thumbnail?.url ? (
            <Image width={40} height={40} style={{ objectFit: 'cover' }} src={r.thumbnail.url} />
          ) : (
            '—'
          ),
      },
      {
        title: 'Tên (vi)',
        render: (_, r) => pickDynamicLocalized(r.name, 'vi'),
      },
      { title: 'Slug', dataIndex: 'slug' },
      { title: 'Thứ tự', dataIndex: 'order', width: 80 },
      { title: 'Bài (publish)', dataIndex: 'postCount', width: 100 },
      {
        title: 'Active',
        width: 80,
        render: (_, r) => (r.isActive ? 'Yes' : 'No'),
      },
      {
        title: '',
        key: 'a',
        width: 120,
        render: (_, r) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setCatEdit(r);
                setCatModal(true);
              }}
            />
            <Popconfirm
              title="Xoá category?"
              onConfirm={() =>
                void deleteCat
                  .mutateAsync(r._id)
                  .then(() => message.success('Đã xoá'))
              }
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteCat],
  );

  const tagColumns: TableColumnsType<BlogTag> = useMemo(
    () => [
      { title: 'Tên (vi)', render: (_, r) => pickDynamicLocalized(r.name, 'vi') },
      { title: 'Slug', dataIndex: 'slug' },
      { title: 'Bài (publish)', dataIndex: 'postCount' },
      {
        title: 'Active',
        width: 80,
        render: (_, r) => (r.isActive ? 'Yes' : 'No'),
      },
      {
        title: '',
        key: 'a',
        width: 120,
        render: (_, r) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setTagEdit(r);
                setTagModal(true);
              }}
            />
            <Popconfirm
              title="Xoá tag?"
              onConfirm={() =>
                void deleteTag
                  .mutateAsync(r._id)
                  .then(() => message.success('Đã xoá'))
              }
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteTag],
  );

  const onSaveCategory = async (v: Record<string, unknown>) => {
    const name = v.name as DynamicLocalized;
    const description = (v.description || {}) as DynamicLocalized;
    const payload = {
      name,
      description,
      slug: (v.slug as string) || undefined,
      order: (v.order as number) ?? 0,
      isActive: v.isActive as boolean,
      thumbnail: v.thumbnail as BlogCategory['thumbnail'],
      translations: v.translations as BlogCategory['translations'],
    };
    try {
      if (catEdit) {
        await updateCat.mutateAsync({ id: catEdit._id, data: payload });
        message.success('Đã cập nhật');
      } else {
        await createCat.mutateAsync(payload);
        message.success('Đã tạo');
      }
      setCatModal(false);
      setCatEdit(null);
      void refetchCat();
    } catch (e: unknown) {
      const msg =
        (e as { message?: string })?.message ||
        (e instanceof Error ? e.message : 'Không lưu được');
      void message.error(String(msg));
      throw e;
    }
  };

  const onSaveTag = async (v: Record<string, unknown>) => {
    const payload = {
      name: v.name as DynamicLocalized,
      slug: (v.slug as string) || undefined,
      isActive: v.isActive as boolean,
    };
    try {
      if (tagEdit) {
        await updateTag.mutateAsync({ id: tagEdit._id, data: payload });
        message.success('Đã cập nhật');
      } else {
        await createTag.mutateAsync(payload);
        message.success('Đã tạo');
      }
      setTagModal(false);
      setTagEdit(null);
      void refetchTag();
    } catch (e: unknown) {
      const msg =
        (e as { message?: string })?.message ||
        (e instanceof Error ? e.message : 'Không lưu được');
      void message.error(String(msg));
      throw e;
    }
  };

  return (
    <PageShell
      title="Blog — Danh mục & Tag"
      subtitle="Quản lý blog categories và tags"
    >
      <Tabs
        defaultActiveKey="cat"
        items={[
          {
            key: 'cat',
            label: 'Categories',
            children: (
              <>
                <Space style={{ marginBottom: 12 }}>
                  <Input.Search
                    style={{ width: 260 }}
                    placeholder="Tìm…"
                    onSearch={(q) => {
                      setCatPage(1);
                      setCatSearchDeb(q.trim());
                    }}
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    enterButton
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setCatEdit(null);
                      setCatModal(true);
                    }}
                  >
                    Thêm category
                  </Button>
                </Space>
                <Table<BlogCategory>
                  rowKey="_id"
                  loading={catLoad}
                  dataSource={catItems}
                  columns={catColumns}
                  pagination={{
                    current: catPage,
                    pageSize: pageSize,
                    total: catTotal,
                    onChange: (p) => setCatPage(p),
                  }}
                />
              </>
            ),
          },
          {
            key: 'tag',
            label: 'Tags',
            children: (
              <>
                <Space style={{ marginBottom: 12 }}>
                  <Input.Search
                    style={{ width: 260 }}
                    placeholder="Tìm…"
                    onSearch={(q) => {
                      setTagPage(1);
                      setTagSearchDeb(q.trim());
                    }}
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    enterButton
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setTagEdit(null);
                      setTagModal(true);
                    }}
                  >
                    Thêm tag
                  </Button>
                </Space>
                <Table<BlogTag>
                  rowKey="_id"
                  loading={tagLoad}
                  dataSource={tagItems}
                  columns={tagColumns}
                  pagination={{
                    current: tagPage,
                    pageSize: pageSize,
                    total: tagTotal,
                    onChange: (p) => setTagPage(p),
                  }}
                />
              </>
            ),
          },
        ]}
      />

      <CategoryModal
        open={catModal}
        onClose={() => {
          setCatModal(false);
          setCatEdit(null);
        }}
        onOk={onSaveCategory}
        loading={createCat.isPending || updateCat.isPending}
        initial={catEdit}
      />
      <TagModal
        open={tagModal}
        onClose={() => {
          setTagModal(false);
          setTagEdit(null);
        }}
        onOk={onSaveTag}
        loading={createTag.isPending || updateTag.isPending}
        initial={tagEdit}
      />
    </PageShell>
  );
}
