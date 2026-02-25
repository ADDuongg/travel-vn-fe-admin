import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  Form,
  message,
} from 'antd';
import { useProvinces } from '@/queries/province.queries';
import { useUsers } from '@/queries/user.queries';
import {
  useCreateTourGuide,
  useDeleteTourGuide,
  useToggleTourGuideAvailability,
  useTourGuides,
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
  bioVi: string;
  shortBioVi?: string;
  specialtiesVi?: string;
  languages: string[];
  specializedProvinces: string[];
  certifications?: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  dailyRate?: number;
  currency?: string;
  contactMethods?: string[];
  isAvailable?: boolean;
};

function getGuideName(guide: TourGuide) {
  return (
    guide.user?.fullName ??
    guide.user?.username ??
    guide.translations?.vi?.specialties ??
    '—'
  );
}

export default function TourGuidePage() {
  const { data: provinces = [] } = useProvinces();
  const { data: users = [] } = useUsers();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState<string | undefined>();
  const [isAvailable, setIsAvailable] = useState<string | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm<CreateGuideFormValues>();

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
      minRating,
      sort: 'newest',
    }),
    [search, provinceId, language, isVerified, isAvailable, minRating],
  );

  const { data, isLoading } = useTourGuides(params);
  const items = Array.isArray(data?.items) ? data.items : [];

  const createMutation = useCreateTourGuide();
  const deleteMutation = useDeleteTourGuide();
  const toggleAvailabilityMutation = useToggleTourGuideAvailability();
  const verifyMutation = useVerifyTourGuide();

  const handleOpenCreate = () => {
    createForm.resetFields();
    setCreateModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const payload = {
        userId: values.userId,
        translations: {
          vi: {
            bio: values.bioVi,
            shortBio: values.shortBioVi,
            specialties: values.specialtiesVi,
          },
        },
        languages: values.languages ?? [],
        specializedProvinces: values.specializedProvinces ?? [],
        certifications: values.certifications?.filter(Boolean),
        licenseNumber: values.licenseNumber,
        yearsOfExperience: values.yearsOfExperience,
        dailyRate: values.dailyRate,
        currency: values.currency || 'VND',
        contactMethods: values.contactMethods ?? [],
        isAvailable: values.isAvailable ?? true,
      };
      await createMutation.mutateAsync(payload);
      message.success('Đã tạo hồ sơ hướng dẫn viên');
      setCreateModalOpen(false);
      createForm.resetFields();
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
                  onClick={async () => {
                    await deleteMutation.mutateAsync(row._id);
                    message.success('Đã vô hiệu hóa hồ sơ HDV');
                  }}
                >
                  Deactivate
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
        <Form form={createForm} layout="vertical">
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

          <Form.Item
            name="bioVi"
            label="Giới thiệu (VI)"
            rules={[{ required: true, message: 'Nhập bio tiếng Việt' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="shortBioVi" label="Tóm tắt (VI)">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="specialtiesVi" label="Chuyên môn (VI)">
            <Input />
          </Form.Item>

          <Form.Item
            name="languages"
            label="Ngôn ngữ"
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

          <Form.Item name="certifications" label="Chứng chỉ (mỗi dòng 1 chứng chỉ)">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mỗi chứng chỉ trên một dòng"
              onBlur={(e) => {
                const lines = e.target.value
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean);
                createForm.setFieldValue('certifications', lines);
              }}
            />
          </Form.Item>

          <Space style={{ width: '100%' }}>
            <Form.Item name="licenseNumber" label="Số thẻ HDV" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item
              name="yearsOfExperience"
              label="Số năm kinh nghiệm"
              style={{ flex: 1 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }}>
            <Form.Item
              name="dailyRate"
              label="Giá/ngày"
              style={{ flex: 1 }}
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="currency" label="Tiền tệ" style={{ flex: 1 }}>
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
            initialValue
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

