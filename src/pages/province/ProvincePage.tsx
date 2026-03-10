import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useProvinces,
  useProvince,
  useSoftDeleteProvince,
  useToggleProvincePopular,
  useUpdateProvinceMetadata,
  useRestoreProvince,
} from '@/queries/province.queries';
import type {
  Province,
  ProvinceQueryParams,
  ProvinceRegion,
  ProvinceTranslation,
  ProvinceGalleryItem,
  ProvinceWard,
} from '@/interface/province';

const { Title, Text } = Typography;

type ProvinceRow = Province;

type ProvinceFormValues = {
  translations?: Record<string, ProvinceTranslation>;
  isPopular?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  region?: ProvinceRegion;
  gallery?: ProvinceGalleryItem[];
  thumbnailFile?: File | null;
  galleryFiles?: File[];
};

export default function ProvincePage() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string | undefined>();
  const [isPopular, setIsPopular] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<string | undefined>();

  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [wardSearch, setWardSearch] = useState('');

  const [form] = Form.useForm<ProvinceFormValues>();
  const [modal, contextHolder] = Modal.useModal();

  const params: ProvinceQueryParams = useMemo(
    () => ({
      search: search || undefined,
      region: region as ProvinceRegion | undefined,
      isPopular:
        isPopular === undefined
          ? undefined
          : isPopular === 'true'
            ? true
            : false,
      isActive:
        isActive === undefined ? undefined : isActive === 'true' ? true : false,
      sort: 'displayOrder',
    }),
    [search, region, isPopular, isActive],
  );

  const { data: provinces, isLoading } = useProvinces(params);

  const { data: provinceDetail, isLoading: isDetailLoading } = useProvince(
    editSlug || undefined,
  );

  const updateMetadataMutation = useUpdateProvinceMetadata();
  const togglePopularMutation = useToggleProvincePopular();
  const softDeleteMutation = useSoftDeleteProvince();
  const restoreMutation = useRestoreProvince();

  useEffect(() => {
    if (!provinceDetail) return;

    form.setFieldsValue({
      translations: provinceDetail.translations || {},
      isPopular: provinceDetail.isPopular ?? false,
      isActive: provinceDetail.isActive ?? true,
      displayOrder: provinceDetail.displayOrder ?? 0,
      region: provinceDetail.region,
    });
  }, [provinceDetail, form]);

  const handleOpenEdit = (row: ProvinceRow) => {
    setEditSlug(row.slug);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditSlug(null);
    form.resetFields();
    setWardSearch('');
  };

  const handleSubmitEdit = async () => {
    if (!provinceDetail) return;
    try {
      const values = await form.validateFields();

      const translations: Record<string, ProvinceTranslation> = {};
      Object.entries(values.translations || {}).forEach(([lang, raw]) => {
        if (!raw || typeof raw !== 'object') return;
        const t = raw as ProvinceTranslation;
        const hasContent =
          t.description ||
          t.shortDescription ||
          t.seo?.title ||
          t.seo?.description ||
          (t.seo?.keywords && t.seo.keywords.length > 0);
        if (hasContent) {
          translations[lang] = {
            ...(t.description && { description: t.description }),
            ...(t.shortDescription && { shortDescription: t.shortDescription }),
            ...(t.seo && {
              seo: {
                ...(t.seo.title && { title: t.seo.title }),
                ...(t.seo.description && { description: t.seo.description }),
                ...(t.seo.keywords?.length && {
                  keywords: t.seo.keywords.filter(Boolean),
                }),
              },
            }),
          };
        }
      });

      const formData = new FormData();
      formData.append('translations', JSON.stringify(translations ?? {}));
      if (values.isPopular != null) {
        formData.append('isPopular', String(values.isPopular));
      }
      if (values.isActive != null) {
        formData.append('isActive', String(values.isActive));
      }
      if (values.displayOrder != null) {
        formData.append('displayOrder', String(values.displayOrder));
      }
      if (values.region) {
        formData.append('region', values.region);
      }
      if (values.gallery && values.gallery.length > 0) {
        formData.append('gallery', JSON.stringify(values.gallery));
      }
      if (values.thumbnailFile) {
        formData.append('thumbnail', values.thumbnailFile);
      }
      if (values.galleryFiles && values.galleryFiles.length > 0) {
        values.galleryFiles.forEach((file) => {
          formData.append('gallery', file);
        });
      }

      await updateMetadataMutation.mutateAsync({
        id: provinceDetail._id,
        payload: formData,
      });
      message.success('Đã cập nhật thông tin tỉnh/thành');
      handleCloseEdit();
    } catch {
      // validation error
    }
  };

  const handleTogglePopular = async (row: ProvinceRow) => {
    await togglePopularMutation.mutateAsync(row._id);
    message.success('Đã cập nhật trạng thái nổi bật');
  };

  const handleSoftDelete = (row: ProvinceRow) => {
    modal.confirm({
      title: 'Ẩn tỉnh/thành này?',
      content:
        'Tỉnh sẽ bị ẩn (soft delete) khỏi hệ thống nhưng vẫn có thể khôi phục lại.',
      okText: 'Ẩn',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: async () => {
        await softDeleteMutation.mutateAsync(row._id);
        message.success('Đã ẩn tỉnh/thành (soft delete)');
      },
    });
  };

  const handleRestore = (row: ProvinceRow) => {
    modal.confirm({
      title: 'Khôi phục tỉnh/thành này?',
      content: 'Tỉnh sẽ được khôi phục lại trạng thái hoạt động.',
      okText: 'Khôi phục',
      cancelText: 'Huỷ',
      onOk: async () => {
        await restoreMutation.mutateAsync(row._id);
        message.success('Đã khôi phục tỉnh/thành');
      },
    });
  };

  const columns: ColumnsType<ProvinceRow> = [
    {
      title: 'Tên',
      key: 'name',
      render: (_, row) => (
        <div>
          <div>{row.name?.vi || row.name?.en || '-'}</div>
          {(row.name?.en || row.fullName?.vi || row.fullName?.en) && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.name?.en || row.fullName?.vi || row.fullName?.en}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
    },
    {
      title: 'Region',
      dataIndex: 'region',
      render: (v: ProvinceRegion | undefined) =>
        v ? <Tag color="blue">{v}</Tag> : '—',
    },
    {
      title: 'Nổi bật',
      dataIndex: 'isPopular',
      render: (v: boolean | undefined) => (
        <Tag color={v ? 'gold' : 'default'}>{v ? 'Popular' : 'Normal'}</Tag>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (v: boolean | undefined) => (
        <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Order',
      dataIndex: 'displayOrder',
      render: (v: number | undefined) => (v != null ? v : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => handleOpenEdit(row)}>
            Edit
          </Button>
          <Button
            size="small"
            loading={togglePopularMutation.isPending}
            onClick={() => handleTogglePopular(row)}
          >
            {row.isPopular ? 'Unmark popular' : 'Mark popular'}
          </Button>
          {row.isActive ? (
            <Button
              size="small"
              danger
              loading={softDeleteMutation.isPending}
              onClick={() => handleSoftDelete(row)}
            >
              Ẩn
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              ghost
              loading={restoreMutation.isPending}
              onClick={() => handleRestore(row)}
            >
              Khôi phục
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const wards: ProvinceWard[] = useMemo(
    () => provinceDetail?.wards || [],
    [provinceDetail],
  );

  const filteredWards = useMemo(() => {
    if (!wardSearch) return wards;
    const q = wardSearch.toLowerCase();
    return wards.filter((w) => {
      const nameVi = w.name?.vi?.toLowerCase() || '';
      const nameEn = w.name?.en?.toLowerCase() || '';
      const fullVi = w.fullName?.vi?.toLowerCase() || '';
      const fullEn = w.fullName?.en?.toLowerCase() || '';
      return (
        w.code.toLowerCase().includes(q) ||
        nameVi.includes(q) ||
        nameEn.includes(q) ||
        fullVi.includes(q) ||
        fullEn.includes(q)
      );
    });
  }, [wards, wardSearch]);

  const wardColumns: ColumnsType<ProvinceWard> = [
    { title: 'Code', dataIndex: 'code', width: 100 },
    {
      title: 'Name (VI)',
      key: 'nameVi',
      render: (_, w) => w.name?.vi || '—',
    },
    {
      title: 'Name (EN)',
      key: 'nameEn',
      render: (_, w) => w.name?.en || '—',
    },
    {
      title: 'Full name (VI)',
      key: 'fullNameVi',
      render: (_, w) => w.fullName?.vi || '—',
    },
    {
      title: 'Full name (EN)',
      key: 'fullNameEn',
      render: (_, w) => w.fullName?.en || '—',
    },
  ];

  return (
    <Card>
      {contextHolder}
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
        wrap
      >
        <Space wrap>
          <Title level={5} style={{ margin: 0 }}>
            Provinces
          </Title>
          <Input
            allowClear
            placeholder="Tìm theo tên / code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Select
            allowClear
            placeholder="Region"
            style={{ width: 160 }}
            value={region}
            onChange={setRegion}
            options={[
              { label: 'North', value: 'NORTH' },
              { label: 'Central', value: 'CENTRAL' },
              { label: 'South', value: 'SOUTH' },
            ]}
          />
          <Select
            allowClear
            placeholder="Popular?"
            style={{ width: 140 }}
            value={isPopular}
            onChange={setIsPopular}
            options={[
              { label: 'Popular', value: 'true' },
              { label: 'Normal', value: 'false' },
            ]}
          />
          <Select
            allowClear
            placeholder="Active?"
            style={{ width: 140 }}
            value={isActive}
            onChange={setIsActive}
            options={[
              { label: 'Đang hoạt động', value: 'true' },
              { label: 'Đã ẩn (soft delete)', value: 'false' },
            ]}
          />
        </Space>
      </Space>

      <Table<ProvinceRow>
        rowKey="_id"
        loading={isLoading}
        dataSource={provinces?.items ?? []}
        columns={columns}
      />

      <Modal
        title={
          provinceDetail
            ? `Chỉnh sửa tỉnh/thành: ${provinceDetail.name?.vi || provinceDetail.code}`
            : 'Chỉnh sửa tỉnh/thành'
        }
        open={editModalOpen}
        onCancel={handleCloseEdit}
        onOk={handleSubmitEdit}
        confirmLoading={updateMetadataMutation.isPending}
        width={900}
      >
        <Space
          direction="vertical"
          style={{ width: '100%', marginBottom: 16 }}
          size={12}
        >
          <Text type="secondary">
            Không thể sửa code/slug/tên chuẩn của tỉnh. Chỉ chỉnh sửa metadata
            du lịch, SEO và trạng thái.
          </Text>
          {provinceDetail && (
            <Space split="•" wrap>
              <Text>
                <strong>Code:</strong> {provinceDetail.code}
              </Text>
              <Text>
                <strong>Slug:</strong> {provinceDetail.slug}
              </Text>
              <Text>
                <strong>Region:</strong> {provinceDetail.region || '—'}
              </Text>
            </Space>
          )}
        </Space>

        <Form<ProvinceFormValues>
          form={form}
          layout="vertical"
          initialValues={{
            isPopular: false,
            isActive: true,
          }}
        >
          <Space style={{ width: '100%' }} wrap>
            <Form.Item name="isPopular" label="Nổi bật" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              name="isActive"
              label="Đang hoạt động"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="displayOrder"
              label="Thứ tự hiển thị"
              style={{ minWidth: 160 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="region" label="Miền" style={{ minWidth: 160 }}>
              <Select
                allowClear
                options={[
                  { label: 'North', value: 'NORTH' },
                  { label: 'Central', value: 'CENTRAL' },
                  { label: 'South', value: 'SOUTH' },
                ]}
              />
            </Form.Item>
          </Space>

          <Form.Item
            label="Nội dung & SEO theo ngôn ngữ"
            style={{ marginBottom: 0 }}
          >
            <Tabs
              items={['vi', 'en'].map((code) => ({
                key: code,
                label: code.toUpperCase(),
                children: (
                  <>
                    <Form.Item
                      name={['translations', code, 'shortDescription']}
                      label="Mô tả ngắn"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                      name={['translations', code, 'description']}
                      label="Mô tả chi tiết"
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                    <Collapse
                      items={[
                        {
                          key: 'seo',
                          label: 'SEO',
                          children: (
                            <>
                              <Form.Item
                                name={['translations', code, 'seo', 'title']}
                                label="SEO Title"
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                name={[
                                  'translations',
                                  code,
                                  'seo',
                                  'description',
                                ]}
                                label="SEO Description"
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                              <Form.Item
                                name={['translations', code, 'seo', 'keywords']}
                                label="SEO Keywords"
                              >
                                <Select
                                  mode="tags"
                                  placeholder="keyword1, keyword2"
                                />
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
        </Form>

        <Collapse
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'wards',
              label: `Wards (${wards.length})`,
              children: (
                <>
                  <Input
                    allowClear
                    placeholder="Tìm theo tên / code phường/xã"
                    value={wardSearch}
                    onChange={(e) => setWardSearch(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Table<ProvinceWard>
                    size="small"
                    rowKey="code"
                    dataSource={filteredWards}
                    columns={wardColumns}
                    pagination={{ pageSize: 50 }}
                    scroll={{ y: 260 }}
                    loading={isDetailLoading}
                  />
                </>
              ),
            },
          ]}
        />
      </Modal>
    </Card>
  );
}
