import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Collapse,
  Card,
  Drawer,
  Empty,
  Grid,
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
import type { UploadFile } from 'antd/es/upload/interface';
import {
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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
  ProvinceHighlight,
  ProvinceLocalizedText,
  ProvinceHighlightThumbnail,
  ProvinceThumbnail,
  ProvinceQueryParams,
  ProvinceRegion,
  ProvinceTranslation,
  ProvinceGalleryItem,
  ProvinceWard,
} from '@/interface/province';
import tableStyles from '@/styles/promax-table.module.css';
import ProvinceHighlightsEditor from '@/pages/province/components/ProvinceHighlightsEditor';
import ProvinceMediaEditor from '@/pages/province/components/ProvinceMediaEditor';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type ProvinceRow = Province;

type ProvinceFormValues = {
  translations?: Record<string, ProvinceTranslation>;
  isPopular?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  region?: ProvinceRegion;
  population?: number;
  area?: number;
  bestTimeToVisit?: ProvinceLocalizedText;
  highlights?: ProvinceHighlight[];
  thumbnail?: ProvinceThumbnail;
  gallery?: ProvinceGalleryItem[];
};

const mapUrlToUploadFile = (url: string, key: string): UploadFile => ({
  uid: key,
  name: url.split('/').pop() || 'image',
  status: 'done',
  url,
});

const normalizeLocalizedText = (value?: ProvinceLocalizedText) => {
  if (!value) return undefined;
  const vi = value.vi?.trim();
  const en = value.en?.trim();
  if (!vi && !en) return undefined;
  return {
    ...(vi ? { vi } : {}),
    ...(en ? { en } : {}),
  };
};

const normalizeHighlightThumbnail = (value?: ProvinceHighlightThumbnail) => {
  if (!value?.url?.trim()) return undefined;
  const url = value.url.trim();
  const alt = value.alt?.trim();
  return {
    url,
    ...(value.publicId ? { publicId: value.publicId } : {}),
    ...(alt ? { alt } : {}),
    ...(value.order != null ? { order: value.order } : {}),
  };
};

export default function ProvincePage() {
  const screens = useBreakpoint();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string | undefined>();
  const [isPopular, setIsPopular] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<string | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [wardSearch, setWardSearch] = useState('');
  const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([]);
  const [galleryFileList, setGalleryFileList] = useState<UploadFile[]>([]);
  const [highlightUploadMap, setHighlightUploadMap] = useState<
    Record<number, UploadFile[]>
  >({});

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

  const {
    data: provinces,
    isLoading,
    refetch,
    isFetching,
  } = useProvinces(params);

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
      population: provinceDetail.population,
      area: provinceDetail.area,
      bestTimeToVisit: provinceDetail.bestTimeToVisit,
      highlights: provinceDetail.highlights || [],
      thumbnail: provinceDetail.thumbnail,
      gallery: provinceDetail.gallery || [],
    });
    setThumbnailFileList(
      provinceDetail.thumbnail?.url
        ? [mapUrlToUploadFile(provinceDetail.thumbnail.url, 'province-thumbnail')]
        : [],
    );
    setGalleryFileList(
      (provinceDetail.gallery || []).map((img, index) =>
        mapUrlToUploadFile(img.url, `province-gallery-${index}`),
      ),
    );
    setHighlightUploadMap({});
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
    setThumbnailFileList([]);
    setGalleryFileList([]);
    setHighlightUploadMap({});
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

      const bestTimeToVisit = normalizeLocalizedText(values.bestTimeToVisit);

      const existingHighlights = provinceDetail.highlights || [];
      const validHighlightIndexes = new Set<number>();
      const highlights = (values.highlights || []).flatMap((item, index) => {
        const name = normalizeLocalizedText(item?.name);
        const hasValidName = !!(name?.vi && name?.en);
        const description = normalizeLocalizedText(item?.description);
        const thumbnail = normalizeHighlightThumbnail(item?.thumbnail);
        const existingThumbnail = existingHighlights[index]?.thumbnail;
        const hasNewFile =
          !!highlightUploadMap[index]?.[0]?.originFileObj;
        const mergedThumbnail =
          thumbnail || existingThumbnail
            ? {
                ...(thumbnail || existingThumbnail || {}),
                ...(item?.thumbnail?.alt?.trim()
                  ? { alt: item.thumbnail.alt.trim() }
                  : {}),
                ...(item?.thumbnail?.order != null
                  ? { order: item.thumbnail.order }
                  : {}),
              }
            : undefined;

        if (!hasValidName) return [];
        if (!description && !mergedThumbnail && !hasNewFile) return [];
        validHighlightIndexes.add(index);

        return [
          {
            ...(name ? { name } : {}),
            ...(description ? { description } : {}),
            ...(mergedThumbnail?.url ? { thumbnail: mergedThumbnail } : {}),
          } as ProvinceHighlight,
        ];
      });

      const provinceThumbnail = values.thumbnail?.url
        ? {
            url: values.thumbnail.url,
            ...(values.thumbnail.publicId
              ? { publicId: values.thumbnail.publicId }
              : {}),
            ...(values.thumbnail.alt?.trim()
              ? { alt: values.thumbnail.alt.trim() }
              : {}),
          }
        : provinceDetail.thumbnail;

      const existingGalleryByUrl = new Map(
        (provinceDetail.gallery || []).map((item) => [item.url, item]),
      );
      const gallery = galleryFileList
        .map((file, index) => {
          if (!file.url) return null;
          const old = existingGalleryByUrl.get(file.url);
          return {
            url: file.url,
            ...(old?.publicId ? { publicId: old.publicId } : {}),
            ...(old?.alt ? { alt: old.alt } : {}),
            order: index,
          };
        })
        .filter(Boolean);

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
      if (values.population != null) {
        formData.append('population', String(values.population));
      }
      if (values.area != null) {
        formData.append('area', String(values.area));
      }
      if (bestTimeToVisit) {
        formData.append('bestTimeToVisit', JSON.stringify(bestTimeToVisit));
      }
      if (highlights.length > 0) {
        formData.append('highlights', JSON.stringify(highlights));
      }
      if (provinceThumbnail?.url) {
        formData.append('thumbnail', JSON.stringify(provinceThumbnail));
      }
      if (gallery.length > 0) {
        formData.append('gallery', JSON.stringify(gallery));
      }

      const thumbnailUploadFile = thumbnailFileList[0]?.originFileObj as
        | File
        | undefined;
      if (thumbnailUploadFile) {
        formData.append('thumbnail', thumbnailUploadFile);
      }
      galleryFileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('gallery', file.originFileObj as File);
        }
      });
      Object.entries(highlightUploadMap).forEach(([index, files]) => {
        if (!validHighlightIndexes.has(Number(index))) return;
        const firstFile = files?.[0]?.originFileObj as File | undefined;
        if (firstFile) {
          formData.append(`highlightsThumbnail_${index}`, firstFile);
        }
      });

      if (highlights.length === 0) {
        formData.append('highlights', JSON.stringify([]));
      }

      await updateMetadataMutation.mutateAsync({
        id: provinceDetail._id,
        payload: formData,
      });
      message.success('Đã cập nhật thông tin tỉnh/thành');
      handleCloseEdit();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error != null &&
        'errorFields' in error &&
        Array.isArray((error as { errorFields?: unknown[] }).errorFields)
      ) {
        return;
      }
      message.error(
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật tỉnh/thành. Vui lòng thử lại.',
      );
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
      width: 280,
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
      width: 120,
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Region',
      dataIndex: 'region',
      width: 120,
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (v: ProvinceRegion | undefined) =>
        v ? <Tag color="blue">{v}</Tag> : '—',
    },
    {
      title: 'Nổi bật',
      dataIndex: 'isPopular',
      width: 120,
      responsive: ['md', 'lg', 'xl'],
      render: (v: boolean | undefined) => (
        <Tag color={v ? 'gold' : 'default'}>{v ? 'Popular' : 'Normal'}</Tag>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 120,
      responsive: ['md', 'lg', 'xl'],
      render: (v: boolean | undefined) => (
        <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Order',
      dataIndex: 'displayOrder',
      width: 100,
      responsive: ['lg', 'xl'],
      render: (v: number | undefined) => (v != null ? v : '—'),
    },
    {
      title: 'Population',
      dataIndex: 'population',
      width: 140,
      responsive: ['lg', 'xl'],
      render: (v: number | undefined) =>
        v != null ? v.toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Area (km2)',
      dataIndex: 'area',
      width: 130,
      responsive: ['lg', 'xl'],
      render: (v: number | undefined) =>
        v != null ? v.toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Counts',
      key: 'counts',
      width: 220,
      responsive: ['md', 'lg', 'xl'],
      render: (_, row) => (
        <Space size={4} wrap>
          <Tag>Hotels: {row.totalHotels ?? 0}</Tag>
          <Tag>Tours: {row.totalTours ?? 0}</Tag>
          <Tag>Guides: {row.totalTourGuides ?? 0}</Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 320,
      fixed: 'right',
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

  const filters = (
    <div className={tableStyles.filtersForm}>
      <Input
        allowClear
        placeholder="Tìm theo tên / code"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select
        allowClear
        placeholder="Region"
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
        value={isActive}
        onChange={setIsActive}
        options={[
          { label: 'Đang hoạt động', value: 'true' },
          { label: 'Đã ẩn (soft delete)', value: 'false' },
        ]}
      />
    </div>
  );

  return (
    <div
      className={tableStyles.page}
      style={{ maxWidth: 1200, margin: '0 auto' }}
    >
      {contextHolder}
      <Card className={tableStyles.mainCard}>
        <div className={tableStyles.header}>
          <div className={tableStyles.titleWrap}>
            <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
              Provinces
            </Title>
            <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
              Quản lý danh sách tỉnh/thành, trạng thái hoạt động và hiển thị.
            </Text>
          </div>

          <div className={tableStyles.toolbar}>
            {!screens.md && (
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen(true)}
              >
                Bộ lọc
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {screens.md ? (
          <div style={{ marginTop: 12 }}>{filters}</div>
        ) : (
          <Drawer
            title="Bộ lọc"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            placement="right"
            width={360}
          >
            {filters}
          </Drawer>
        )}

        <Table<ProvinceRow>
          rowKey="_id"
          loading={isLoading}
          dataSource={provinces?.items ?? []}
          columns={columns}
          size={screens.md ? 'middle' : 'small'}
          scroll={{ x: 1300 }}
          locale={{
            emptyText: (
              <Empty description="Không có tỉnh/thành phù hợp với điều kiện lọc." />
            ),
          }}
        />
      </Card>

      <Modal
        title={
          provinceDetail
            ? `Chỉnh sửa tỉnh/thành: ${provinceDetail.name?.vi || provinceDetail.code}`
            : 'Chỉnh sửa tỉnh/thành'
        }
        open={editModalOpen}
        onCancel={handleCloseEdit}
        onOk={handleSubmitEdit}
        confirmLoading={
          updateMetadataMutation.isPending
        }
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
            <Form.Item
              name="population"
              label="Dân số"
              style={{ minWidth: 180 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="area"
              label="Diện tích (km2)"
              style={{ minWidth: 180 }}
            >
              <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Form.Item label="Thời gian du lịch tốt nhất" style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%' }} wrap>
              <Form.Item
                name={['bestTimeToVisit', 'vi']}
                label="VI"
                style={{ minWidth: 320, flex: 1 }}
              >
                <Input placeholder="VD: Tháng 10 đến tháng 4" />
              </Form.Item>
              <Form.Item
                name={['bestTimeToVisit', 'en']}
                label="EN"
                style={{ minWidth: 320, flex: 1 }}
              >
                <Input placeholder="Ex: October to April" />
              </Form.Item>
            </Space>
          </Form.Item>

          <Collapse
            items={[
              {
                key: 'highlights',
                label: 'Điểm nổi bật du lịch',
                children: (
                  <ProvinceHighlightsEditor
                    form={form}
                    highlightUploadMap={highlightUploadMap}
                    setHighlightUploadMap={setHighlightUploadMap}
                    mapUrlToUploadFile={mapUrlToUploadFile}
                  />
                ),
              },
            ]}
          />

          <Collapse
            items={[
              {
                key: 'media',
                label: 'Media',
                children: (
                  <ProvinceMediaEditor
                    thumbnailFileList={thumbnailFileList}
                    setThumbnailFileList={setThumbnailFileList}
                    galleryFileList={galleryFileList}
                    setGalleryFileList={setGalleryFileList}
                  />
                ),
              },
            ]}
          />

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
    </div>
  );
}
