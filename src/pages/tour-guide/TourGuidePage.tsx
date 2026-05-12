import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  Drawer,
  Empty,
  Grid,
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
  Form,
  message,
  Upload,
} from 'antd';
import {
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useProvinceDropdown } from '@/queries/province.queries';
import { getProvinceLabel } from '@/lib/dynamic-localized';
import { useUsers } from '@/queries/user.queries';
import { useLanguages } from '@/queries/language.queries';
import {
  useCreateTourGuide,
  useDeleteTourGuide,
  useToggleTourGuideAvailability,
  useTourGuides,
  useUpdateTourGuide,
  useVerifyTourGuide,
} from '@/queries/tour-guide.queries';
import type {
  TourGuide,
  TourGuideCV,
  TourGuideGalleryItem,
  TourGuideQueryParams,
  TourGuideUpsertPayload,
} from '@/interface/tour-guide';
import { uploadMedia } from '@/services/media.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route.constant';
import tableStyles from '@/styles/promax-table.module.css';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const LANGUAGE_OPTIONS = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
  { label: '中文', value: 'zh' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' },
];

const CONTACT_METHOD_OPTIONS = [
  { label: 'Phone', value: 'phone' },
  { label: 'Zalo', value: 'zalo' },
  { label: 'Email', value: 'email' },
];

type CreateGuideFormValues = {
  userId: string;
  translations: Record<
    string,
    {
      bio?: string;
      shortBio?: string;
      specialties?: string;
      specialtyItems?: string[];
    }
  >;
  languages: string[];
  specializedProvinces: string[];
  certifications?: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  responseRate?: number;
  completedTripsCount?: number;
  returningCustomerRate?: number;
  dailyRate?: number;
  currency?: string;
  contactMethods?: string[];
  isAvailable?: boolean;
};

function getGuideName(guide: TourGuide) {
  const vi = guide.translations?.vi;
  const firstSpecialty =
    vi?.specialtyItems?.[0] ?? vi?.specialties ?? vi?.shortBio;
  return guide.user?.fullName ?? guide.user?.username ?? firstSpecialty ?? '—';
}

export default function TourGuidePage() {
  const { can } = useRbac();
  const { data: provinces = [] } = useProvinceDropdown();
  const { data: users = [] } = useUsers();
  const { data: languages = [] } = useLanguages();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [search, setSearch] = useState('');
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState<string | undefined>();
  const [isAvailable, setIsAvailable] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<string | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<TourGuide | null>(null);
  const [createCv, setCreateCv] = useState<TourGuideCV | undefined>();
  const [createGallery, setCreateGallery] = useState<TourGuideGalleryItem[]>(
    [],
  );
  const [editCv, setEditCv] = useState<TourGuideCV | undefined>();
  const [editCvRemoved, setEditCvRemoved] = useState(false);
  const [editGallery, setEditGallery] = useState<TourGuideGalleryItem[]>([]);
  const [createForm] = Form.useForm<CreateGuideFormValues>();
  const [editForm] = Form.useForm<CreateGuideFormValues>();

  const params: TourGuideQueryParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      provinceId,
      language,
      isVerified: isVerified === undefined ? undefined : isVerified === 'true',
      isAvailable:
        isAvailable === undefined ? undefined : isAvailable === 'true',
      isActive: isActive === undefined ? undefined : isActive === 'true',
      minRating,
      sort: 'newest',
    }),
    [
      page,
      limit,
      search,
      provinceId,
      language,
      isVerified,
      isAvailable,
      isActive,
      minRating,
    ],
  );

  const { data, isLoading, refetch, isFetching } = useTourGuides(params);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = data?.pagination;

  const createMutation = useCreateTourGuide();
  const updateMutation = useUpdateTourGuide();
  const deleteMutation = useDeleteTourGuide();
  const toggleAvailabilityMutation = useToggleTourGuideAvailability();
  const verifyMutation = useVerifyTourGuide();

  const handleOpenCreate = () => {
    createForm.resetFields();
    setCreateCv(undefined);
    setCreateGallery([]);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (guide: TourGuide) => {
    setEditingGuide(guide);
    const provinceIds = (guide.specializedProvinces || [])
      .map((p) =>
        typeof p === 'string' ? p : ((p as { _id?: string })._id ?? ''),
      )
      .filter(Boolean);
    editForm.setFieldsValue({
      userId: guide.userId,
      translations: guide.translations || {},
      languages: guide.languages || [],
      specializedProvinces: provinceIds,
      certifications: guide.certifications || [],
      licenseNumber: guide.licenseNumber,
      yearsOfExperience: guide.yearsOfExperience,
      responseRate: guide.responseRate,
      completedTripsCount: guide.completedTripsCount,
      returningCustomerRate: guide.returningCustomerRate,
      dailyRate: guide.dailyRate,
      currency: guide.currency || 'VND',
      contactMethods: guide.contactMethods || [],
      isAvailable: guide.isAvailable ?? true,
    });
    setEditCv(
      guide.cv?.url
        ? {
            url: guide.cv.url,
            publicId: guide.cv.publicId,
            filename: guide.cv.filename,
            format: guide.cv.format,
          }
        : undefined,
    );
    setEditCvRemoved(false);
    setEditGallery(
      (guide.gallery || []).map((img, i) => ({
        url: img.url,
        publicId: img.publicId,
        alt: img.alt,
        order: img.order ?? i,
      })),
    );
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingGuide(null);
    editForm.resetFields();
    setEditCv(undefined);
    setEditCvRemoved(false);
    setEditGallery([]);
  };

  const handleEdit = async () => {
    if (!editingGuide) return;
    try {
      const values = await editForm.validateFields();
      const translations: Record<
        string,
        {
          bio?: string;
          shortBio?: string;
          specialties?: string;
          specialtyItems?: string[];
        }
      > = {};
      Object.entries(values.translations || {}).forEach(([langCode, t]) => {
        if (!t || typeof t !== 'object') return;
        const item = t as {
          bio?: string;
          shortBio?: string;
          specialties?: string;
          specialtyItems?: string[];
        };
        const hasContent =
          item.bio ||
          item.shortBio ||
          item.specialties ||
          (item.specialtyItems?.length ?? 0) > 0;
        if (hasContent) {
          translations[langCode] = {
            ...(item.bio && { bio: item.bio }),
            ...(item.shortBio && { shortBio: item.shortBio }),
            ...(item.specialties && { specialties: item.specialties }),
            ...(item.specialtyItems?.length
              ? { specialtyItems: item.specialtyItems.filter(Boolean) }
              : {}),
          };
        }
      });
      const partial: Partial<TourGuideUpsertPayload> = {
        translations,
        languages: values.languages ?? [],
        specializedProvinces: values.specializedProvinces ?? [],
        certifications: values.certifications?.filter(Boolean),
        licenseNumber: values.licenseNumber,
        yearsOfExperience: values.yearsOfExperience,
        responseRate: values.responseRate,
        completedTripsCount: values.completedTripsCount,
        returningCustomerRate: values.returningCustomerRate,
        dailyRate: values.dailyRate,
        currency: values.currency || 'VND',
        contactMethods: values.contactMethods ?? [],
        isAvailable: values.isAvailable ?? true,
        gallery: editGallery.map((g, i) => ({
          ...g,
          order: g.order ?? i,
        })),
      };

      const initialCvUrl = editingGuide.cv?.url;
      const initialCvPublicId = editingGuide.cv?.publicId;
      if (editCvRemoved && initialCvUrl) {
        partial.cv = null;
      } else if (
        editCv &&
        (editCv.url !== initialCvUrl || editCv.publicId !== initialCvPublicId)
      ) {
        partial.cv = editCv;
      }

      await updateMutation.mutateAsync({
        id: editingGuide._id,
        payload: partial,
      });
      message.success('Đã cập nhật hồ sơ hướng dẫn viên');
      handleCloseEdit();
    } catch {
      // validation errors
    }
  };

  const handleDelete = (guide: TourGuide) => {
    Modal.confirm({
      title: 'Vô hiệu hóa hướng dẫn viên',
      content: `Bạn có chắc muốn vô hiệu hóa hồ sơ HDV "${getGuideName(guide)}"? User vẫn đăng nhập được nhưng không còn vai trò guide.`,
      okText: 'Vô hiệu hóa',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: async () => {
        await deleteMutation.mutateAsync(guide._id);
        message.success('Đã vô hiệu hóa hồ sơ HDV');
      },
    });
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const translations: Record<
        string,
        {
          bio?: string;
          shortBio?: string;
          specialties?: string;
          specialtyItems?: string[];
        }
      > = {};
      Object.entries(values.translations || {}).forEach(([langCode, t]) => {
        if (!t || typeof t !== 'object') return;
        const item = t as {
          bio?: string;
          shortBio?: string;
          specialties?: string;
          specialtyItems?: string[];
        };
        const hasContent =
          item.bio ||
          item.shortBio ||
          item.specialties ||
          (item.specialtyItems?.length ?? 0) > 0;
        if (hasContent) {
          translations[langCode] = {
            ...(item.bio && { bio: item.bio }),
            ...(item.shortBio && { shortBio: item.shortBio }),
            ...(item.specialties && { specialties: item.specialties }),
            ...(item.specialtyItems?.length
              ? { specialtyItems: item.specialtyItems.filter(Boolean) }
              : {}),
          };
        }
      });
      const payload: TourGuideUpsertPayload = {
        userId: values.userId,
        translations,
        languages: values.languages ?? [],
        specializedProvinces: values.specializedProvinces ?? [],
        certifications: values.certifications?.filter(Boolean),
        licenseNumber: values.licenseNumber,
        yearsOfExperience: values.yearsOfExperience,
        responseRate: values.responseRate,
        completedTripsCount: values.completedTripsCount,
        returningCustomerRate: values.returningCustomerRate,
        dailyRate: values.dailyRate,
        currency: values.currency || 'VND',
        contactMethods: values.contactMethods ?? [],
        isAvailable: values.isAvailable ?? true,
      };
      if (createCv) {
        payload.cv = createCv;
      }
      if (createGallery.length > 0) {
        payload.gallery = createGallery.map((g, i) => ({
          ...g,
          order: g.order ?? i,
        }));
      }

      await createMutation.mutateAsync(payload);
      message.success('Đã tạo hồ sơ hướng dẫn viên');
      setCreateModalOpen(false);
      createForm.resetFields();
      setCreateCv(undefined);
      setCreateGallery([]);
    } catch {
      // validation errors
    }
  };

  const filters = (
    <div className={tableStyles.filtersForm}>
      <Input
        allowClear
        placeholder="Tìm theo tên / username"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />
      <Select
        allowClear
        placeholder="Tỉnh chuyên dẫn"
        value={provinceId}
        onChange={(v) => {
          setPage(1);
          setProvinceId(v);
        }}
        options={provinces.map((p) => ({
          label: getProvinceLabel({ name: p.name, code: p.code }),
          value: p._id,
        }))}
      />
      <Select
        allowClear
        placeholder="Ngôn ngữ"
        value={language}
        onChange={(v) => {
          setPage(1);
          setLanguage(v);
        }}
        options={LANGUAGE_OPTIONS}
      />
      <Select
        allowClear
        placeholder="Verified?"
        value={isVerified}
        onChange={(v) => {
          setPage(1);
          setIsVerified(v);
        }}
        options={[
          { label: 'Đã verify', value: 'true' },
          { label: 'Chưa verify', value: 'false' },
        ]}
      />
      <Select
        allowClear
        placeholder="Available?"
        value={isAvailable}
        onChange={(v) => {
          setPage(1);
          setIsAvailable(v);
        }}
        options={[
          { label: 'Có thể nhận tour', value: 'true' },
          { label: 'Tạm ngưng', value: 'false' },
        ]}
      />
      <Select
        allowClear
        placeholder="Active?"
        value={isActive}
        onChange={(v) => {
          setPage(1);
          setIsActive(v);
        }}
        options={[
          { label: 'Đang hoạt động', value: 'true' },
          { label: 'Đã vô hiệu', value: 'false' },
        ]}
      />
      <InputNumber
        min={0}
        max={5}
        step={0.5}
        placeholder="Min rating"
        value={minRating}
        onChange={(v) => {
          setPage(1);
          setMinRating(v ?? undefined);
        }}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div
      className={tableStyles.page}
      style={{ maxWidth: 1200, margin: '0 auto' }}
    >
      <Card className={tableStyles.mainCard}>
        <div className={tableStyles.header}>
          <div className={tableStyles.titleWrap}>
            <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
              Hướng dẫn viên
            </Title>
            <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
              Quản lý hồ sơ HDV, trạng thái xác minh và khả năng nhận tour.
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
            {can(RBAC.tour_guide.create) ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
              >
                Tạo hồ sơ HDV
              </Button>
            ) : null}
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

        <Table<TourGuide>
          rowKey="_id"
          loading={isLoading}
          dataSource={items}
          size={screens.md ? 'middle' : 'small'}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: <Empty description="Không có hướng dẫn viên phù hợp." />,
          }}
          pagination={{
            current: pagination?.page ?? page,
            pageSize: pagination?.limit ?? limit,
            total: pagination?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (p, ps) => {
              setPage(p);
              if (ps) setLimit(ps);
            },
          }}
          columns={[
            {
              title: 'Hướng dẫn viên',
              key: 'name',
              width: 260,
              ellipsis: true,
              responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              render: (_, row) => (
                <div>
                  <div>{getGuideName(row)}</div>
                  {row.user?.username && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      @{row.user.username}
                    </Text>
                  )}
                </div>
              ),
            },
            {
              title: 'Ngôn ngữ',
              dataIndex: 'languages',
              width: 200,
              responsive: ['sm', 'md', 'lg', 'xl'],
              render: (langs: string[]) =>
                (langs || []).map((l) => (
                  <Tag key={l} color="blue">
                    {l.toUpperCase()}
                  </Tag>
                )),
            },
            {
              title: 'Rating',
              key: 'rating',
              width: 160,
              responsive: ['md', 'lg', 'xl'],
              render: (_, row) =>
                row.ratingSummary
                  ? `${row.ratingSummary.average.toFixed(1)} (${row.ratingSummary.total})`
                  : '—',
            },
            {
              title: 'Verified',
              dataIndex: 'isVerified',
              width: 120,
              responsive: ['sm', 'md', 'lg', 'xl'],
              render: (v: boolean) => (
                <Tag color={v ? 'green' : 'default'}>
                  {v ? 'Verified' : 'Pending'}
                </Tag>
              ),
            },
            {
              title: 'Available',
              dataIndex: 'isAvailable',
              width: 120,
              responsive: ['md', 'lg', 'xl'],
              render: (v: boolean, row) =>
                can(RBAC.tour_guide.update) ? (
                  <Switch
                    checked={v}
                    size="small"
                    loading={toggleAvailabilityMutation.isPending}
                    onChange={async () => {
                      await toggleAvailabilityMutation.mutateAsync(row._id);
                      message.success('Đã cập nhật trạng thái nhận tour');
                    }}
                  />
                ) : (
                  <Switch checked={v} disabled size="small" />
                ),
            },
            {
              title: 'Giá / ngày',
              dataIndex: 'dailyRate',
              width: 160,
              responsive: ['lg', 'xl'],
              render: (v: number, row) =>
                v != null
                  ? `${v.toLocaleString()} ${row.currency ?? 'VND'}`
                  : '—',
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 260,
              fixed: 'right',
              render: (_, row) => (
                <Space wrap>
                  {can(RBAC.tour_guide.update) ? (
                    <Button size="small" onClick={() => handleOpenEdit(row)}>
                      Sửa
                    </Button>
                  ) : null}
                  {can(RBAC.review.view) ? (
                    <Button
                      size="small"
                      onClick={() =>
                        navigate(`${ROUTES.ADMIN_REVIEWS}?entityType=GUIDE`)
                      }
                    >
                      Reviews
                    </Button>
                  ) : null}
                  {can(RBAC.tour_guide.update) ? (
                    <Button
                      size="small"
                      onClick={async () => {
                        await verifyMutation.mutateAsync({
                          id: row._id,
                          isVerified: !row.isVerified,
                        });
                        message.success(
                          !row.isVerified
                            ? 'Đã verify hướng dẫn viên'
                            : 'Đã bỏ verify',
                        );
                      }}
                      loading={verifyMutation.isPending}
                    >
                      {row.isVerified ? 'Unverify' : 'Verify'}
                    </Button>
                  ) : null}
                  {can(RBAC.tour_guide.delete) ? (
                    <Button
                      size="small"
                      danger
                      loading={deleteMutation.isPending}
                      onClick={() => handleDelete(row)}
                    >
                      Xoá / Vô hiệu
                    </Button>
                  ) : null}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Tạo hồ sơ hướng dẫn viên"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={createMutation.isPending}
        width={720}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ translations: {}, isAvailable: true }}
        >
          <Collapse
            defaultActiveKey={['basic', 'translations']}
            items={[
              {
                key: 'basic',
                label: 'Thông tin cơ bản',
                children: (
                  <Form.Item
                    name="userId"
                    label="User"
                    rules={[{ required: true, message: 'Chọn user' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn user"
                      filterOption={(input, option) =>
                        (option?.label as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={users.map((u) => ({
                        label: `${u.username} (${u.email ?? 'no email'})`,
                        value: u._id,
                      }))}
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'translations',
                label: 'Nội dung đa ngôn ngữ',
                children: (
                  <Form.Item
                    label="Nội dung theo ngôn ngữ"
                    style={{ marginBottom: 0 }}
                  >
                    <Tabs
                      items={languages.map((lang) => ({
                        key: lang.code,
                        label: (
                          <Space>
                            {lang.flagUrl && (
                              <img
                                src={lang.flagUrl}
                                alt=""
                                width={18}
                                height={12}
                              />
                            )}
                            {lang.code.toUpperCase()}
                          </Space>
                        ),
                        children: (
                          <>
                            <Form.Item
                              name={['translations', lang.code, 'bio']}
                              label="Giới thiệu"
                              rules={[
                                {
                                  required: lang.code === 'vi',
                                  message: 'Nhập giới thiệu (tiếng Việt)',
                                },
                              ]}
                            >
                              <Input.TextArea
                                rows={4}
                                placeholder="Mô tả chi tiết"
                              />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'shortBio']}
                              label="Tóm tắt"
                            >
                              <Input.TextArea
                                rows={2}
                                placeholder="Mô tả ngắn"
                              />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'specialties']}
                              label="Chuyên môn (text)"
                            >
                              <Input placeholder="Mô tả chung (tuỳ chọn)" />
                            </Form.Item>
                            <Form.Item
                              name={[
                                'translations',
                                lang.code,
                                'specialtyItems',
                              ]}
                              label="Chuyên môn (tags)"
                            >
                              <Select
                                mode="tags"
                                placeholder="Thêm mục, Enter để tạo tag"
                                tokenSeparators={[',']}
                              />
                            </Form.Item>
                          </>
                        ),
                      }))}
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'scope',
                label: 'Phạm vi & Chứng chỉ',
                children: (
                  <>
                    <Form.Item
                      name="languages"
                      label="Ngôn ngữ HDV sử dụng"
                      rules={[
                        { required: true, message: 'Chọn ít nhất 1 ngôn ngữ' },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn ngôn ngữ"
                        options={LANGUAGE_OPTIONS}
                      />
                    </Form.Item>
                    <Form.Item
                      name="specializedProvinces"
                      label="Tỉnh chuyên dẫn"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn tỉnh"
                        options={provinces.map((p) => ({
                          label: getProvinceLabel({ name: p.name, code: p.code }),
                          value: p._id,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item name="certifications" label="Chứng chỉ">
                      <Select
                        mode="tags"
                        placeholder="Thêm chứng chỉ, Enter để tạo tag"
                        tokenSeparators={[',']}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'profile',
                label: 'Hồ sơ chuyên môn',
                children: (
                  <>
                    <Space style={{ width: '100%' }} wrap>
                      <Form.Item
                        name="licenseNumber"
                        label="Số thẻ HDV"
                        style={{ minWidth: 200 }}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="yearsOfExperience"
                        label="Số năm kinh nghiệm"
                        style={{ minWidth: 160 }}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Space>
                    <Space style={{ width: '100%' }} wrap>
                      <Form.Item
                        name="responseRate"
                        label="Tỷ lệ phản hồi (%)"
                        style={{ minWidth: 140 }}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="completedTripsCount"
                        label="Số chuyến hoàn tất"
                        style={{ minWidth: 140 }}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        name="returningCustomerRate"
                        label="Tỷ lệ khách quay lại (%)"
                        style={{ minWidth: 160 }}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Space>
                    <Form.Item label="CV (PDF/DOC)">
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--ant-color-text-secondary)',
                          marginBottom: 8,
                        }}
                      >
                        Tải lên qua Media API; body tạo HDV chỉ gửi reference (url,
                        publicId).
                      </p>
                      <TourGuideCvFormControl
                        value={createCv}
                        onChange={setCreateCv}
                      />
                    </Form.Item>
                    <Form.Item label="Gallery (ảnh HDV)">
                      <TourGuideGalleryFormControl
                        value={createGallery}
                        onChange={setCreateGallery}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'pricing',
                label: 'Giá & Liên hệ',
                children: (
                  <>
                    <Space style={{ width: '100%' }} wrap>
                      <Form.Item
                        name="dailyRate"
                        label="Giá/ngày"
                        style={{ minWidth: 160 }}
                        rules={[{ type: 'number', min: 0 }]}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        name="currency"
                        label="Tiền tệ"
                        style={{ minWidth: 120 }}
                      >
                        <Select
                          options={[
                            { label: 'VND', value: 'VND' },
                            { label: 'USD', value: 'USD' },
                          ]}
                        />
                      </Form.Item>
                    </Space>
                    <Form.Item
                      name="contactMethods"
                      label="Kênh liên hệ ưu tiên"
                    >
                      <Select
                        mode="multiple"
                        options={CONTACT_METHOD_OPTIONS}
                        placeholder="Chọn kênh liên hệ"
                      />
                    </Form.Item>
                    <Form.Item
                      name="isAvailable"
                      label="Có thể nhận tour"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      <Modal
        title="Cập nhật hồ sơ hướng dẫn viên"
        open={editModalOpen}
        onCancel={handleCloseEdit}
        onOk={handleEdit}
        confirmLoading={updateMutation.isPending}
        width={720}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Collapse
            defaultActiveKey={['basic', 'translations']}
            items={[
              {
                key: 'basic',
                label: 'Thông tin cơ bản',
                children: (
                  <Form.Item name="userId" label="User">
                    <Select
                      disabled
                      options={
                        editingGuide?.user
                          ? [
                              {
                                label: `${editingGuide.user.fullName ?? editingGuide.user.username ?? ''} (${editingGuide.user.email ?? 'no email'})`,
                                value: editingGuide.userId,
                              },
                            ]
                          : [
                              {
                                label: editingGuide?.userId ?? '',
                                value: editingGuide?.userId,
                              },
                            ]
                      }
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'translations',
                label: 'Nội dung đa ngôn ngữ',
                children: (
                  <Form.Item
                    label="Nội dung theo ngôn ngữ"
                    style={{ marginBottom: 0 }}
                  >
                    <Tabs
                      items={languages.map((lang) => ({
                        key: lang.code,
                        label: (
                          <Space>
                            {lang.flagUrl && (
                              <img
                                src={lang.flagUrl}
                                alt=""
                                width={18}
                                height={12}
                              />
                            )}
                            {lang.code.toUpperCase()}
                          </Space>
                        ),
                        children: (
                          <>
                            <Form.Item
                              name={['translations', lang.code, 'bio']}
                              label="Giới thiệu"
                              rules={[
                                {
                                  required: lang.code === 'vi',
                                  message: 'Nhập giới thiệu (tiếng Việt)',
                                },
                              ]}
                            >
                              <Input.TextArea
                                rows={4}
                                placeholder="Mô tả chi tiết"
                              />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'shortBio']}
                              label="Tóm tắt"
                            >
                              <Input.TextArea
                                rows={2}
                                placeholder="Mô tả ngắn"
                              />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'specialties']}
                              label="Chuyên môn (text)"
                            >
                              <Input placeholder="Mô tả chung (tuỳ chọn)" />
                            </Form.Item>
                            <Form.Item
                              name={[
                                'translations',
                                lang.code,
                                'specialtyItems',
                              ]}
                              label="Chuyên môn (tags)"
                            >
                              <Select
                                mode="tags"
                                placeholder="Thêm mục, Enter để tạo tag"
                                tokenSeparators={[',']}
                              />
                            </Form.Item>
                          </>
                        ),
                      }))}
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'scope',
                label: 'Phạm vi & Chứng chỉ',
                children: (
                  <>
                    <Form.Item
                      name="languages"
                      label="Ngôn ngữ HDV sử dụng"
                      rules={[
                        { required: true, message: 'Chọn ít nhất 1 ngôn ngữ' },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn ngôn ngữ"
                        options={LANGUAGE_OPTIONS}
                      />
                    </Form.Item>
                    <Form.Item
                      name="specializedProvinces"
                      label="Tỉnh chuyên dẫn"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn tỉnh"
                        options={provinces.map((p) => ({
                          label: getProvinceLabel({ name: p.name, code: p.code }),
                          value: p._id,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item name="certifications" label="Chứng chỉ">
                      <Select
                        mode="tags"
                        placeholder="Thêm chứng chỉ, Enter để tạo tag"
                        tokenSeparators={[',']}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'profile',
                label: 'Hồ sơ chuyên môn',
                children: (
                  <>
                    <Space style={{ width: '100%' }} wrap>
                      <Form.Item
                        name="licenseNumber"
                        label="Số thẻ HDV"
                        style={{ minWidth: 200 }}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="yearsOfExperience"
                        label="Số năm kinh nghiệm"
                        style={{ minWidth: 160 }}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Space>
                    <Space style={{ width: '100%' }} wrap>
                      <Form.Item
                        name="responseRate"
                        label="Tỷ lệ phản hồi (%)"
                        style={{ minWidth: 140 }}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="completedTripsCount"
                        label="Số chuyến hoàn tất"
                        style={{ minWidth: 140 }}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        name="returningCustomerRate"
                        label="Tỷ lệ khách quay lại (%)"
                        style={{ minWidth: 160 }}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Space>
                    <Form.Item label="CV (PDF/DOC)">
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--ant-color-text-secondary)',
                          marginBottom: 8,
                        }}
                      >
                        Tải lên qua Media API. Xoá file trong danh sách để gửi{' '}
                        <code>cv: null</code> khi lưu (nếu trước đó có CV).
                      </p>
                      <TourGuideCvFormControl
                        value={editCv}
                        onChange={(v) => {
                          setEditCv(v);
                          if (v) {
                            setEditCvRemoved(false);
                          } else if (editingGuide?.cv?.url) {
                            setEditCvRemoved(true);
                          }
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="Gallery (ảnh HDV)">
                      <TourGuideGalleryFormControl
                        value={editGallery}
                        onChange={setEditGallery}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'pricing',
                label: 'Giá & Liên hệ',
                children: (
                  <>
                    <Space style={{ width: '100%' }} wrap>
                      <Form.Item
                        name="dailyRate"
                        label="Giá/ngày"
                        style={{ minWidth: 160 }}
                        rules={[{ type: 'number', min: 0 }]}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        name="currency"
                        label="Tiền tệ"
                        style={{ minWidth: 120 }}
                      >
                        <Select
                          options={[
                            { label: 'VND', value: 'VND' },
                            { label: 'USD', value: 'USD' },
                          ]}
                        />
                      </Form.Item>
                    </Space>
                    <Form.Item
                      name="contactMethods"
                      label="Kênh liên hệ ưu tiên"
                    >
                      <Select
                        mode="multiple"
                        options={CONTACT_METHOD_OPTIONS}
                        placeholder="Chọn kênh liên hệ"
                      />
                    </Form.Item>
                    <Form.Item
                      name="isAvailable"
                      label="Có thể nhận tour"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
}

function TourGuideCvFormControl({
  value,
  onChange,
}: {
  value?: TourGuideCV;
  onChange?: (v: TourGuideCV | undefined) => void;
}) {
  return (
    <Upload
      maxCount={1}
      fileList={
        value?.url
          ? [
              {
                uid: value.publicId || 'cv',
                name: value.filename || value.url.split('/').pop() || 'cv',
                status: 'done' as const,
                url: value.url,
              },
            ]
          : []
      }
      beforeUpload={async (file) => {
        try {
          const r = await uploadMedia(file);
          onChange?.({
            url: r.url,
            publicId: r.publicId,
            filename: file.name,
            ...(r.format ? { format: r.format } : {}),
          });
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
      <Button icon={<UploadOutlined />}>Chọn file CV</Button>
    </Upload>
  );
}

function TourGuideGalleryFormControl({
  value,
  onChange,
}: {
  value?: TourGuideGalleryItem[];
  onChange?: (v: TourGuideGalleryItem[]) => void;
}) {
  const list = value || [];
  const fileList = list.map((g, i) => ({
    uid: `${g.publicId ?? g.url}-${i}`,
    name: g.alt || g.url.split('/').pop() || `img-${i}`,
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
