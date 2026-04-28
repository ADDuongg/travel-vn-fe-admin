import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  useProvinces,
  useProvince,
  useSoftDeleteProvince,
  useToggleProvincePopular,
  useUpdateProvinceMetadata,
  useRestoreProvince,
} from '@/queries/province.queries';
import {
  type Province,
  type ProvinceDetail,
  type ProvinceHighlight,
  type ProvinceHighlightTranslation,
  type ProvinceThumbnail,
  type ProvinceQueryParams,
  type ProvinceRegion,
  type ProvinceTranslation,
  type ProvinceGalleryItem,
  type ProvinceWard,
  type ProvinceMetadataUpdatePayload,
  highlightsForForm,
} from '@/interface/province';
import {
  getProvinceLabel,
  localizedSearchHaystack,
  pickDynamicLocalized,
  pickSecondaryLocalized,
} from '@/lib/dynamic-localized';
import { useLanguages } from '@/queries/language.queries';
import { uploadMedia, uploadMediaMultiple } from '@/services/media.service';
import tableStyles from '@/styles/promax-table.module.css';
import ProvinceHighlightsEditor from '@/pages/province/components/ProvinceHighlightsEditor';
import ProvinceMediaEditor from '@/pages/province/components/ProvinceMediaEditor';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';

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

function errMessage(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'message' in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string' && m) return m;
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

export default function ProvincePage() {
  const { can } = useRbac();
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<ProvinceFormValues>();
  const [modal, contextHolder] = Modal.useModal();

  const { data: languages = [] } = useLanguages();
  const activeLangCodes = useMemo((): string[] => {
    const codes = languages
      .filter((l) => l.isActive)
      .map((l) => l.code.toLowerCase());
    return codes.length > 0 ? codes : ['vi', 'en'];
  }, [languages]);

  const languageTabs = useMemo(
    () =>
      activeLangCodes.map((code) => {
        const meta = languages.find(
          (l) => l.code.toLowerCase() === code,
        );
        return {
          code,
          label: meta?.name
            ? `${meta.name} (${code.toUpperCase()})`
            : code.toUpperCase(),
        };
      }),
    [activeLangCodes, languages],
  );

  /** Merges legacy root `bestTimeToVisit` into per-lang translations when API not migrated yet. */
  const translationsForForm = useCallback(
    (detail: ProvinceDetail): Record<string, ProvinceTranslation> => {
      const base: Record<string, ProvinceTranslation> = {
        ...(detail.translations || {}),
      };
      activeLangCodes.forEach((code) => {
        if (!base[code]) base[code] = {};
      });
      const legacy = detail.bestTimeToVisit;
      if (legacy) {
        (['vi', 'en'] as const).forEach((lang) => {
          const v = legacy[lang]?.trim();
          if (!v) return;
          const cur = base[lang] || {};
          if (!cur.bestTimeToVisit?.trim()) {
            base[lang] = { ...cur, bestTimeToVisit: v };
          }
        });
      }
      return base;
    },
    [activeLangCodes],
  );

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
      translations: translationsForForm(provinceDetail),
      isPopular: provinceDetail.isPopular ?? false,
      isActive: provinceDetail.isActive ?? true,
      displayOrder: provinceDetail.displayOrder ?? 0,
      region: provinceDetail.region,
      population: provinceDetail.population,
      area: provinceDetail.area,
      highlights: highlightsForForm(provinceDetail.highlights),
      thumbnail: provinceDetail.thumbnail,
      gallery: provinceDetail.gallery || [],
    });
    setThumbnailFileList(
      provinceDetail.thumbnail?.url
        ? [
            mapUrlToUploadFile(
              provinceDetail.thumbnail.url,
              'province-thumbnail',
            ),
          ]
        : [],
    );
    setGalleryFileList(
      (provinceDetail.gallery || []).map((img, index) =>
        mapUrlToUploadFile(img.url, `province-gallery-${index}`),
      ),
    );
    setHighlightUploadMap({});
  }, [provinceDetail, form, translationsForForm]);

  const handleOpenEdit = (row: ProvinceRow) => {
    setEditSlug(row.slug);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsSubmitting(false);
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
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();

      const translations: Record<string, ProvinceTranslation> = {};
      Object.entries(values.translations || {}).forEach(([lang, raw]) => {
        if (!raw || typeof raw !== 'object') return;
        const t = raw as ProvinceTranslation;
        const bestTime = t.bestTimeToVisit?.trim();
        const hasContent =
          t.description ||
          t.shortDescription ||
          bestTime ||
          t.seo?.title ||
          t.seo?.description ||
          (t.seo?.keywords && t.seo.keywords.length > 0);
        if (hasContent) {
          translations[lang] = {
            ...(t.description && { description: t.description }),
            ...(t.shortDescription && { shortDescription: t.shortDescription }),
            ...(bestTime && { bestTimeToVisit: bestTime }),
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

      const existingHighlights = provinceDetail.highlights || [];
      const rowHasContent = (item: ProvinceHighlight | undefined) => {
        const tr = item?.translations || {};
        return activeLangCodes.some(
          (code) =>
            tr[code]?.name?.trim() || tr[code]?.description?.trim(),
        );
      };
      for (let index = 0; index < (values.highlights?.length || 0); index++) {
        const item = values.highlights?.[index];
        if (!rowHasContent(item)) continue;
        for (const code of activeLangCodes) {
          if (!item?.translations?.[code]?.name?.trim()) {
            message.error(
              `Highlight #${index + 1}: cần nhập tên cho ngôn ngữ "${code.toUpperCase()}"`,
            );
            return;
          }
        }
      }

      const validHighlightIndexes = new Set<number>();
      (values.highlights || []).forEach((item, index) => {
        if (!rowHasContent(item)) return;
        validHighlightIndexes.add(index);
      });

      const highlightUploadResults = new Map<
        number,
        { url: string; publicId?: string }
      >();
      for (const index of validHighlightIndexes) {
        const newHighlightFile = highlightUploadMap[index]?.[0]
          ?.originFileObj as File | undefined;
        if (!newHighlightFile) continue;
        try {
          const up = await uploadMedia(newHighlightFile);
          highlightUploadResults.set(index, {
            url: up.url,
            publicId: up.publicId,
          });
        } catch (e) {
          message.error(
            `Không thể tải ảnh lên (highlight #${index + 1}): ${errMessage(e, 'Lỗi không xác định')}`,
          );
          return;
        }
      }

      const thumbFile = thumbnailFileList[0]?.originFileObj as
        | File
        | undefined;

      let provinceThumbnail: ProvinceThumbnail | undefined;
      if (thumbFile) {
        try {
          const upT = await uploadMedia(thumbFile);
          const altT = values.thumbnail?.alt?.trim();
          provinceThumbnail = {
            url: upT.url,
            ...(upT.publicId ? { publicId: upT.publicId } : {}),
            ...(altT ? { alt: altT } : {}),
          };
        } catch (e) {
          message.error(
            `Không thể tải ảnh đại diện tỉnh/thành: ${errMessage(e, 'Lỗi không xác định')}`,
          );
          return;
        }
      } else if (values.thumbnail?.url) {
        provinceThumbnail = {
          url: values.thumbnail.url,
          ...(values.thumbnail.publicId
            ? { publicId: values.thumbnail.publicId }
            : {}),
          ...(values.thumbnail.alt?.trim()
            ? { alt: values.thumbnail.alt.trim() }
            : {}),
        };
      } else {
        provinceThumbnail = provinceDetail.thumbnail;
      }

      const existingGalleryByUrl = new Map(
        (provinceDetail.gallery || []).map((item) => [item.url, item]),
      );
      const newGalleryOnlyFiles: File[] = [];
      galleryFileList.forEach((f) => {
        if (f.originFileObj) {
          newGalleryOnlyFiles.push(f.originFileObj as File);
        }
      });
      let galleryBatch: Awaited<ReturnType<typeof uploadMediaMultiple>> = [];
      if (newGalleryOnlyFiles.length > 0) {
        try {
          galleryBatch = await uploadMediaMultiple(newGalleryOnlyFiles);
        } catch (e) {
          message.error(
            `Không thể tải ảnh gallery: ${errMessage(e, 'Lỗi không xác định')}`,
          );
          return;
        }
      }
      let galleryBatchIdx = 0;
      const galleryItems: NonNullable<ProvinceDetail['gallery']> = [];
      for (let index = 0; index < galleryFileList.length; index++) {
        const file = galleryFileList[index];
        if (file.originFileObj) {
          const up = galleryBatch[galleryBatchIdx];
          galleryBatchIdx += 1;
          const old = file.url
            ? existingGalleryByUrl.get(file.url)
            : undefined;
          const altFromOld = old?.alt;
          galleryItems.push({
            url: up.url,
            ...(up.publicId
              ? { publicId: up.publicId }
              : old?.publicId
                ? { publicId: old.publicId }
                : {}),
            ...(altFromOld ? { alt: altFromOld } : {}),
            order: index,
          });
        } else if (file.url) {
          const old = existingGalleryByUrl.get(file.url);
          galleryItems.push({
            url: file.url,
            ...(old?.publicId ? { publicId: old.publicId } : {}),
            ...(old?.alt ? { alt: old.alt } : {}),
            order: index,
          });
        }
      }

      const highlights: ProvinceHighlight[] = [];
      for (let index = 0; index < (values.highlights?.length || 0); index++) {
        if (!validHighlightIndexes.has(index)) continue;
        const item = values.highlights![index];
        const tr = item?.translations || {};
        const hlTranslations: Record<string, ProvinceHighlightTranslation> =
          {};
        for (const code of activeLangCodes) {
          const name = tr[code]?.name?.trim();
          if (!name) continue;
          hlTranslations[code] = {
            name,
            ...(tr[code]?.description?.trim() && {
              description: tr[code]!.description!.trim(),
            }),
          };
        }
        const formThumb = item?.thumbnail;
        const prevThumb = existingHighlights[index]?.thumbnail;
        const upRes = highlightUploadResults.get(index);
        let hlThumb: ProvinceHighlight['thumbnail'] | undefined;
        if (upRes) {
          hlThumb = {
            url: upRes.url,
            ...(upRes.publicId ? { publicId: upRes.publicId } : {}),
            ...(formThumb?.alt?.trim() ? { alt: formThumb.alt.trim() } : {}),
            ...(formThumb?.order != null ? { order: formThumb.order } : {}),
          };
        } else {
          const url = formThumb?.url?.trim() || prevThumb?.url;
          if (url) {
            const alt = formThumb?.alt?.trim() || prevThumb?.alt;
            hlThumb = {
              url,
              ...(prevThumb?.publicId
                ? { publicId: prevThumb.publicId }
                : formThumb?.publicId
                  ? { publicId: formThumb.publicId }
                  : {}),
              ...(alt ? { alt } : {}),
              ...(formThumb?.order != null
                ? { order: formThumb.order }
                : prevThumb?.order != null
                  ? { order: prevThumb.order }
                  : {}),
            };
          }
        }
        highlights.push({
          translations: hlTranslations,
          ...(hlThumb ? { thumbnail: hlThumb } : {}),
        });
      }

      const payload: ProvinceMetadataUpdatePayload = {
          ...(Object.keys(translations).length > 0 ? { translations } : {}),
          isPopular: values.isPopular,
          isActive: values.isActive,
          displayOrder: values.displayOrder,
          region: values.region,
          population: values.population,
          area: values.area,
          ...(highlights.length > 0 ? { highlights } : {}),
          ...(galleryItems.length > 0 ? { gallery: galleryItems } : {}),
          ...(provinceThumbnail?.url ? { thumbnail: provinceThumbnail } : {}),
        };

      try {
        await updateMetadataMutation.mutateAsync({
          id: provinceDetail._id,
          payload,
        });
      } catch (e) {
        message.error(
          `Không thể cập nhật tỉnh/thành: ${errMessage(e, 'Vui lòng thử lại.')}`,
        );
        return;
      }
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
        errMessage(
          error,
          'Không thể cập nhật tỉnh/thành. Vui lòng thử lại.',
        ),
      );
    } finally {
      setIsSubmitting(false);
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
      render: (_, row) => {
        const primary = getProvinceLabel({ name: row.name, code: row.code });
        const sub = pickSecondaryLocalized(row.name, row.fullName);
        return (
          <div>
            <div>{primary}</div>
            {sub && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {sub}
              </Text>
            )}
          </div>
        );
      },
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
      render: (_, row) =>
        can(RBAC.province.update) ? (
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
        ) : null,
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
      const hay = localizedSearchHaystack(w.name, w.fullName);
      return w.code.toLowerCase().includes(q) || hay.includes(q);
    });
  }, [wards, wardSearch]);

  const wardColumns: ColumnsType<ProvinceWard> = [
    { title: 'Code', dataIndex: 'code', width: 100 },
    {
      title: 'Name',
      key: 'name',
      render: (_, w) => pickDynamicLocalized(w.name),
    },
    {
      title: 'Full name',
      key: 'fullName',
      render: (_, w) => pickDynamicLocalized(w.fullName),
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
            ? `Chỉnh sửa tỉnh/thành: ${getProvinceLabel({
                name: provinceDetail.name,
                code: provinceDetail.code,
              })}`
            : 'Chỉnh sửa tỉnh/thành'
        }
        open={editModalOpen}
        onCancel={handleCloseEdit}
        onOk={handleSubmitEdit}
        confirmLoading={isSubmitting}
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

          <Collapse
            items={[
              {
                key: 'highlights',
                label: 'Điểm nổi bật du lịch',
                children: (
                  <ProvinceHighlightsEditor
                    form={form}
                    activeLanguages={languageTabs}
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
              items={languageTabs.map((lang) => ({
                key: lang.code,
                label: lang.label,
                children: (
                  <>
                    <Form.Item
                      name={['translations', lang.code, 'bestTimeToVisit']}
                      label="Thời gian du lịch tốt nhất"
                    >
                      <Input
                        placeholder={
                          lang.code === 'vi'
                            ? 'VD: Tháng 10 đến tháng 4'
                            : 'Ex: October to April'
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      name={['translations', lang.code, 'shortDescription']}
                      label="Mô tả ngắn"
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                      name={['translations', lang.code, 'description']}
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
                                name={[
                                  'translations',
                                  lang.code,
                                  'seo',
                                  'title',
                                ]}
                                label="SEO Title"
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                name={[
                                  'translations',
                                  lang.code,
                                  'seo',
                                  'description',
                                ]}
                                label="SEO Description"
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                              <Form.Item
                                name={[
                                  'translations',
                                  lang.code,
                                  'seo',
                                  'keywords',
                                ]}
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
