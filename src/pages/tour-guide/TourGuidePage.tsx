import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Collapse,
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
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useProvinces } from '@/queries/province.queries';
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
import type { TourGuide, TourGuideQueryParams } from '@/interface/tour-guide';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/route.constant';

const { Title, Text } = Typography;

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
    { bio?: string; shortBio?: string; specialties?: string; specialtyItems?: string[] }
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
  return (
    guide.user?.fullName ??
    guide.user?.username ??
    firstSpecialty ??
    '—'
  );
}

export default function TourGuidePage() {
  const { data: provinces = [] } = useProvinces();
  const { data: users = [] } = useUsers();
  const { data: languages = [] } = useLanguages();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState<string | undefined>();
  const [isAvailable, setIsAvailable] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<string | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<TourGuide | null>(null);
  const [createCvFileList, setCreateCvFileList] = useState<UploadFile[]>([]);
  const [createGalleryFileList, setCreateGalleryFileList] = useState<UploadFile[]>([]);
  const [editCvFileList, setEditCvFileList] = useState<UploadFile[]>([]);
  const [editGalleryFileList, setEditGalleryFileList] = useState<UploadFile[]>([]);
  const [createForm] = Form.useForm<CreateGuideFormValues>();
  const [editForm] = Form.useForm<CreateGuideFormValues>();

  const params: TourGuideQueryParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      search: search || undefined,
      provinceId,
      language,
      isVerified:
        isVerified === undefined ? undefined : isVerified === 'true',
      isAvailable:
        isAvailable === undefined ? undefined : isAvailable === 'true',
      isActive: isActive === undefined ? undefined : isActive === 'true',
      minRating,
      sort: 'newest',
    }),
    [search, provinceId, language, isVerified, isAvailable, isActive, minRating],
  );

  const { data, isLoading } = useTourGuides(params);
  const items = Array.isArray(data?.items) ? data.items : [];

  const createMutation = useCreateTourGuide();
  const updateMutation = useUpdateTourGuide();
  const deleteMutation = useDeleteTourGuide();
  const toggleAvailabilityMutation = useToggleTourGuideAvailability();
  const verifyMutation = useVerifyTourGuide();

  const handleOpenCreate = () => {
    createForm.resetFields();
    setCreateCvFileList([]);
    setCreateGalleryFileList([]);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (guide: TourGuide) => {
    setEditingGuide(guide);
    const provinceIds = (guide.specializedProvinces || []).map((p) =>
      typeof p === 'string' ? p : (p as { _id?: string })._id ?? '',
    ).filter(Boolean);
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
    const cvList: UploadFile[] = [];
    if (guide.cv?.url) {
      cvList.push({
        uid: guide.cv.publicId || 'cv',
        name:
          guide.cv.filename ||
          guide.cv.url.split('/').pop() ||
          'cv',
        status: 'done',
        url: guide.cv.url,
      });
    }
    setEditCvFileList(cvList);

    const galleryList: UploadFile[] = (guide.gallery || []).map((img, index) => ({
      uid: img.publicId || `${index}`,
      name: img.alt || img.url.split('/').pop() || `image-${index}`,
      status: 'done',
      url: img.url,
    }));
    setEditGalleryFileList(galleryList);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingGuide(null);
    editForm.resetFields();
    setEditCvFileList([]);
    setEditGalleryFileList([]);
  };

  const handleEdit = async () => {
    if (!editingGuide) return;
    try {
      const values = await editForm.validateFields();
      const translations: Record<string, { bio?: string; shortBio?: string; specialties?: string; specialtyItems?: string[] }> = {};
      Object.entries(values.translations || {}).forEach(([langCode, t]) => {
        if (!t || typeof t !== 'object') return;
        const item = t as { bio?: string; shortBio?: string; specialties?: string; specialtyItems?: string[] };
        const hasContent = item.bio || item.shortBio || item.specialties || (item.specialtyItems?.length ?? 0) > 0;
        if (hasContent) {
          translations[langCode] = {
            ...(item.bio && { bio: item.bio }),
            ...(item.shortBio && { shortBio: item.shortBio }),
            ...(item.specialties && { specialties: item.specialties }),
            ...(item.specialtyItems?.length ? { specialtyItems: item.specialtyItems.filter(Boolean) } : {}),
          };
        }
      });
      const payload = {
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
      const cvFile = editCvFileList.find((f) => f.originFileObj)?.originFileObj as File | undefined;
      const galleryFiles = editGalleryFileList
        .filter((f) => f.originFileObj)
        .map((f) => f.originFileObj as File);

      const formData = new FormData();
      formData.append('translations', JSON.stringify(payload.translations ?? {}));
      formData.append('languages', JSON.stringify(payload.languages ?? []));
      formData.append(
        'specializedProvinces',
        JSON.stringify(payload.specializedProvinces ?? []),
      );
      formData.append('certifications', JSON.stringify(payload.certifications ?? []));
      if (payload.licenseNumber) formData.append('licenseNumber', payload.licenseNumber);
      if (payload.yearsOfExperience != null) {
        formData.append('yearsOfExperience', String(payload.yearsOfExperience));
      }
      if (payload.responseRate != null) {
        formData.append('responseRate', String(payload.responseRate));
      }
      if (payload.completedTripsCount != null) {
        formData.append('completedTripsCount', String(payload.completedTripsCount));
      }
      if (payload.returningCustomerRate != null) {
        formData.append('returningCustomerRate', String(payload.returningCustomerRate));
      }
      if (payload.dailyRate != null) {
        formData.append('dailyRate', String(payload.dailyRate));
      }
      if (payload.currency) {
        formData.append('currency', payload.currency);
      }
      formData.append('contactMethods', JSON.stringify(payload.contactMethods ?? []));
      formData.append('isAvailable', String(payload.isAvailable ?? true));

      if (cvFile) {
        formData.append('cv', cvFile);
      }
      galleryFiles.forEach((file) => formData.append('gallery', file));

      await updateMutation.mutateAsync({ id: editingGuide._id, payload: formData });
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
      const translations: Record<string, { bio?: string; shortBio?: string; specialties?: string; specialtyItems?: string[] }> = {};
      Object.entries(values.translations || {}).forEach(([langCode, t]) => {
        if (!t || typeof t !== 'object') return;
        const item = t as { bio?: string; shortBio?: string; specialties?: string; specialtyItems?: string[] };
        const hasContent = item.bio || item.shortBio || item.specialties || (item.specialtyItems?.length ?? 0) > 0;
        if (hasContent) {
          translations[langCode] = {
            ...(item.bio && { bio: item.bio }),
            ...(item.shortBio && { shortBio: item.shortBio }),
            ...(item.specialties && { specialties: item.specialties }),
            ...(item.specialtyItems?.length ? { specialtyItems: item.specialtyItems.filter(Boolean) } : {}),
          };
        }
      });
      const payload = {
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
      const cvFile = createCvFileList.find((f) => f.originFileObj)?.originFileObj as File | undefined;
      const galleryFiles = createGalleryFileList
        .filter((f) => f.originFileObj)
        .map((f) => f.originFileObj as File);

      const formData = new FormData();
      formData.append('userId', payload.userId);
      formData.append('translations', JSON.stringify(payload.translations ?? {}));
      formData.append('languages', JSON.stringify(payload.languages ?? []));
      formData.append(
        'specializedProvinces',
        JSON.stringify(payload.specializedProvinces ?? []),
      );
      formData.append('certifications', JSON.stringify(payload.certifications ?? []));
      if (payload.licenseNumber) formData.append('licenseNumber', payload.licenseNumber);
      if (payload.yearsOfExperience != null) {
        formData.append('yearsOfExperience', String(payload.yearsOfExperience));
      }
      if (payload.responseRate != null) {
        formData.append('responseRate', String(payload.responseRate));
      }
      if (payload.completedTripsCount != null) {
        formData.append('completedTripsCount', String(payload.completedTripsCount));
      }
      if (payload.returningCustomerRate != null) {
        formData.append('returningCustomerRate', String(payload.returningCustomerRate));
      }
      if (payload.dailyRate != null) {
        formData.append('dailyRate', String(payload.dailyRate));
      }
      if (payload.currency) {
        formData.append('currency', payload.currency);
      }
      formData.append('contactMethods', JSON.stringify(payload.contactMethods ?? []));
      formData.append('isAvailable', String(payload.isAvailable ?? true));

      if (cvFile) {
        formData.append('cv', cvFile);
      }
      galleryFiles.forEach((file) => formData.append('gallery', file));

      await createMutation.mutateAsync(formData);
      message.success('Đã tạo hồ sơ hướng dẫn viên');
      setCreateModalOpen(false);
      createForm.resetFields();
      setCreateCvFileList([]);
      setCreateGalleryFileList([]);
    } catch {
      // validation errors
    }
  };

  return (
    <Card>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}
      >
        <Space wrap>
          <Title level={5} style={{ margin: 0 }}>
            Hướng dẫn viên
          </Title>
          <Input
            allowClear
            placeholder="Tìm theo tên / username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Select
            allowClear
            placeholder="Tỉnh chuyên dẫn"
            style={{ width: 200 }}
            value={provinceId}
            onChange={setProvinceId}
            options={provinces.map((p) => ({
              label: p.name?.vi || p.name?.en || p.code,
              value: p._id,
            }))}
          />
          <Select
            allowClear
            placeholder="Ngôn ngữ"
            style={{ width: 140 }}
            value={language}
            onChange={setLanguage}
            options={LANGUAGE_OPTIONS}
          />
          <Select
            allowClear
            placeholder="Verified?"
            style={{ width: 140 }}
            value={isVerified}
            onChange={setIsVerified}
            options={[
              { label: 'Đã verify', value: 'true' },
              { label: 'Chưa verify', value: 'false' },
            ]}
          />
          <Select
            allowClear
            placeholder="Available?"
            style={{ width: 140 }}
            value={isAvailable}
            onChange={setIsAvailable}
            options={[
              { label: 'Có thể nhận tour', value: 'true' },
              { label: 'Tạm ngưng', value: 'false' },
            ]}
          />
          <Select
            allowClear
            placeholder="Active?"
            style={{ width: 120 }}
            value={isActive}
            onChange={setIsActive}
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
            onChange={(v) => setMinRating(v ?? undefined)}
          />
        </Space>

        <Button type="primary" onClick={handleOpenCreate}>
          Tạo hồ sơ HDV
        </Button>
      </Space>

      <Table<TourGuide>
        rowKey="_id"
        loading={isLoading}
        dataSource={items}
        columns={[
          {
            title: 'Hướng dẫn viên',
            key: 'name',
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
            render: (_, row) =>
              row.ratingSummary
                ? `${row.ratingSummary.average.toFixed(1)} (${row.ratingSummary.total})`
                : '—',
          },
          {
            title: 'Verified',
            dataIndex: 'isVerified',
            render: (v: boolean) => (
              <Tag color={v ? 'green' : 'default'}>{v ? 'Verified' : 'Pending'}</Tag>
            ),
          },
          {
            title: 'Available',
            dataIndex: 'isAvailable',
            render: (v: boolean, row) => (
              <Switch
                checked={v}
                size="small"
                loading={toggleAvailabilityMutation.isPending}
                onChange={async () => {
                  await toggleAvailabilityMutation.mutateAsync(row._id);
                  message.success('Đã cập nhật trạng thái nhận tour');
                }}
              />
            ),
          },
          {
            title: 'Giá / ngày',
            dataIndex: 'dailyRate',
            render: (v: number, row) =>
              v != null ? `${v.toLocaleString()} ${row.currency ?? 'VND'}` : '—',
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => handleOpenEdit(row)}>
                  Sửa
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    navigate(
                      `${ROUTES.ADMIN_REVIEWS}?entityType=GUIDE`,
                    )
                  }
                >
                  Reviews
                </Button>
                <Button
                  size="small"
                  onClick={async () => {
                    await verifyMutation.mutateAsync({
                      id: row._id,
                      isVerified: !row.isVerified,
                    });
                    message.success(
                      !row.isVerified ? 'Đã verify hướng dẫn viên' : 'Đã bỏ verify',
                    );
                  }}
                  loading={verifyMutation.isPending}
                >
                  {row.isVerified ? 'Unverify' : 'Verify'}
                </Button>
                <Button
                  size="small"
                  danger
                  loading={deleteMutation.isPending}
                  onClick={() => handleDelete(row)}
                >
                  Xoá / Vô hiệu
                </Button>
              </Space>
            ),
          },
        ]}
      />

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
                  <Form.Item label="Nội dung theo ngôn ngữ" style={{ marginBottom: 0 }}>
                    <Tabs
                      items={languages.map((lang) => ({
                        key: lang.code,
                        label: (
                          <Space>
                            {lang.flagUrl && (
                              <img src={lang.flagUrl} alt="" width={18} height={12} />
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
                              <Input.TextArea rows={4} placeholder="Mô tả chi tiết" />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'shortBio']}
                              label="Tóm tắt"
                            >
                              <Input.TextArea rows={2} placeholder="Mô tả ngắn" />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'specialties']}
                              label="Chuyên môn (text)"
                            >
                              <Input placeholder="Mô tả chung (tuỳ chọn)" />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'specialtyItems']}
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
                      rules={[{ required: true, message: 'Chọn ít nhất 1 ngôn ngữ' }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn ngôn ngữ"
                        options={LANGUAGE_OPTIONS}
                      />
                    </Form.Item>
                    <Form.Item name="specializedProvinces" label="Tỉnh chuyên dẫn">
                      <Select
                        mode="multiple"
                        placeholder="Chọn tỉnh"
                        options={provinces.map((p) => ({
                          label: p.name?.vi || p.name?.en || p.code,
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
                      <Form.Item name="licenseNumber" label="Số thẻ HDV" style={{ minWidth: 200 }}>
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
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
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
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Space>
                    <Form.Item label="CV (PDF/DOC)">
                      <Upload
                        beforeUpload={() => false}
                        fileList={createCvFileList}
                        maxCount={1}
                        onChange={({ fileList }) =>
                          setCreateCvFileList(fileList.slice(-1))
                        }
                      >
                        <Button icon={<UploadOutlined />}>Chọn file CV</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item label="Gallery (ảnh HDV)">
                      <Upload
                        listType="picture"
                        multiple
                        beforeUpload={() => false}
                        fileList={createGalleryFileList}
                        onChange={({ fileList }) => setCreateGalleryFileList(fileList)}
                      >
                        <Button icon={<UploadOutlined />}>Thêm ảnh</Button>
                      </Upload>
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
                      <Form.Item name="currency" label="Tiền tệ" style={{ minWidth: 120 }}>
                        <Select
                          options={[
                            { label: 'VND', value: 'VND' },
                            { label: 'USD', value: 'USD' },
                          ]}
                        />
                      </Form.Item>
                    </Space>
                    <Form.Item name="contactMethods" label="Kênh liên hệ ưu tiên">
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
                          : [{ label: editingGuide?.userId ?? '', value: editingGuide?.userId }]
                      }
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'translations',
                label: 'Nội dung đa ngôn ngữ',
                children: (
                  <Form.Item label="Nội dung theo ngôn ngữ" style={{ marginBottom: 0 }}>
                    <Tabs
                      items={languages.map((lang) => ({
                        key: lang.code,
                        label: (
                          <Space>
                            {lang.flagUrl && (
                              <img src={lang.flagUrl} alt="" width={18} height={12} />
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
                              <Input.TextArea rows={4} placeholder="Mô tả chi tiết" />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'shortBio']}
                              label="Tóm tắt"
                            >
                              <Input.TextArea rows={2} placeholder="Mô tả ngắn" />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'specialties']}
                              label="Chuyên môn (text)"
                            >
                              <Input placeholder="Mô tả chung (tuỳ chọn)" />
                            </Form.Item>
                            <Form.Item
                              name={['translations', lang.code, 'specialtyItems']}
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
                      rules={[{ required: true, message: 'Chọn ít nhất 1 ngôn ngữ' }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn ngôn ngữ"
                        options={LANGUAGE_OPTIONS}
                      />
                    </Form.Item>
                    <Form.Item name="specializedProvinces" label="Tỉnh chuyên dẫn">
                      <Select
                        mode="multiple"
                        placeholder="Chọn tỉnh"
                        options={provinces.map((p) => ({
                          label: p.name?.vi || p.name?.en || p.code,
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
                      <Form.Item name="licenseNumber" label="Số thẻ HDV" style={{ minWidth: 200 }}>
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
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
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
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Space>
                    <Form.Item label="CV (PDF/DOC)">
                      <Upload
                        beforeUpload={() => false}
                        fileList={editCvFileList}
                        maxCount={1}
                        onChange={({ fileList }) =>
                          setEditCvFileList(fileList.slice(-1))
                        }
                      >
                        <Button icon={<UploadOutlined />}>Chọn file CV</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item label="Gallery (ảnh HDV)">
                      <Upload
                        listType="picture"
                        multiple
                        beforeUpload={() => false}
                        fileList={editGalleryFileList}
                        onChange={({ fileList }) => setEditGalleryFileList(fileList)}
                      >
                        <Button icon={<UploadOutlined />}>Thêm ảnh</Button>
                      </Upload>
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
                      <Form.Item name="currency" label="Tiền tệ" style={{ minWidth: 120 }}>
                        <Select
                          options={[
                            { label: 'VND', value: 'VND' },
                            { label: 'USD', value: 'USD' },
                          ]}
                        />
                      </Form.Item>
                    </Space>
                    <Form.Item name="contactMethods" label="Kênh liên hệ ưu tiên">
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
    </Card>
  );
}

