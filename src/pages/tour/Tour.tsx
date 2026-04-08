import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Grid,
  Input,
  Space,
  Select,
  Switch,
  Table,
  Typography,
  Empty,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useProvinceDropdown } from '@/queries/province.queries';
import { useDeleteTour, useTours } from '@/queries/tour.queries';
import type { Tour } from '@/interface/tour';
import styles from './tour-list.module.css';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function getTourName(row: Pick<Tour, 'translations'>) {
  const t = row?.translations;
  return t?.vi?.name || t?.en?.name || '-';
}

function getProvinceName(prov: any) {
  if (!prov) return '-';
  if (typeof prov === 'string') return '-';
  return prov?.name?.vi || prov?.name?.en || prov?.code || '-';
}

export default function TourPage() {
  const navigate = useNavigate();
  const { data: provinces = [] } = useProvinceDropdown();
  const deleteMutation = useDeleteTour();
  const screens = useBreakpoint();

  const [search, setSearch] = useState<string>('');
  const [tourType, setTourType] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [departureProvinceId, setDepartureProvinceId] = useState<
    string | undefined
  >();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      tourType: tourType as any,
      difficulty: difficulty as any,
      destinationId,
      departureProvinceId,
      sortBy: 'newest' as const,
    }),
    [
      page,
      limit,
      search,
      tourType,
      difficulty,
      destinationId,
      departureProvinceId,
    ],
  );

  const { data, isLoading, refetch, isFetching } = useTours(params);
  const items = Array.isArray(data?.items) ? data.items : [];

  const filters = (
    <div className={styles.filtersRow}>
      <Input
        allowClear
        placeholder="Tìm theo tên / mã"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        style={{ width: screens.md ? 260 : '100%' }}
      />
      <Select
        allowClear
        placeholder="Loại tour"
        style={{ width: screens.md ? 160 : '100%' }}
        value={tourType}
        onChange={(v) => {
          setPage(1);
          setTourType(v);
        }}
        options={[
          { label: 'Domestic', value: 'DOMESTIC' },
          { label: 'International', value: 'INTERNATIONAL' },
          { label: 'Daily', value: 'DAILY' },
        ]}
      />
      <Select
        allowClear
        placeholder="Độ khó"
        style={{ width: screens.md ? 160 : '100%' }}
        value={difficulty}
        onChange={(v) => {
          setPage(1);
          setDifficulty(v);
        }}
        options={[
          { label: 'Easy', value: 'EASY' },
          { label: 'Moderate', value: 'MODERATE' },
          { label: 'Challenging', value: 'CHALLENGING' },
          { label: 'Difficult', value: 'DIFFICULT' },
        ]}
      />
      <Select
        allowClear
        showSearch
        placeholder="Điểm đến"
        style={{ width: screens.md ? 220 : '100%' }}
        value={destinationId}
        onChange={(v) => {
          setPage(1);
          setDestinationId(v);
        }}
        options={provinces.map((p) => ({
          label: p.name?.vi || p.name?.en || p.code,
          value: p._id,
        }))}
      />
      <Select
        allowClear
        showSearch
        placeholder="Nơi khởi hành"
        style={{ width: screens.md ? 240 : '100%' }}
        value={departureProvinceId}
        onChange={(v) => {
          setPage(1);
          setDepartureProvinceId(v);
        }}
        options={provinces.map((p) => ({
          label: p.name?.vi || p.name?.en || p.code,
          value: p._id,
        }))}
      />
    </div>
  );

  return (
    <div className={styles.page} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card className={styles.tableCard}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <Title level={screens.sm ? 4 : 5} style={{ margin: 0 }}>
              Tours
            </Title>
            <Text type="secondary" style={{ fontSize: screens.sm ? 13 : 12 }}>
              Quản lý danh sách tour, lọc nhanh theo loại/độ khó/điểm đến.
            </Text>
          </div>

          <div className={styles.toolbar}>
            {!screens.md && (
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen(true)}
                size="middle"
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/dashboard/tour/create')}
            >
              Thêm tour
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

        <Table<Tour>
          rowKey="_id"
          loading={isLoading}
          dataSource={items}
          size={screens.md ? 'middle' : 'small'}
          scroll={screens.md ? { x: 900 } : { x: 760 }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <span>
                    Không có tour phù hợp. Hãy thử đổi điều kiện lọc hoặc từ
                    khóa.
                  </span>
                }
              />
            ),
          }}
          pagination={{
            current: page,
            pageSize: limit,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            total:
              (data as any)?.total ?? (data as any)?.meta?.total ?? undefined,
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
          columns={[
            {
              title: 'Name',
              key: 'name',
              width: 260,
              ellipsis: true,
              responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
              render: (_, row) => getTourName(row),
            },
            {
              title: 'Code',
              dataIndex: 'code',
              width: 120,
              responsive: ['sm', 'md', 'lg', 'xl'],
            },
            {
              title: 'Slug',
              dataIndex: 'slug',
              width: 180,
              ellipsis: true,
              responsive: ['md', 'lg', 'xl'],
            },
            {
              title: 'Type',
              dataIndex: 'tourType',
              width: 120,
              responsive: ['sm', 'md', 'lg', 'xl'],
            },
            {
              title: 'Departure',
              key: 'departureProvinceId',
              width: 200,
              ellipsis: true,
              responsive: ['md', 'lg', 'xl'],
              render: (_, row) =>
                getProvinceName((row as any).departureProvinceId),
            },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 90,
              responsive: ['md', 'lg', 'xl'],
              render: (v: boolean) => (
                <Switch checked={v} disabled size="small" />
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 150,
              fixed: 'right',
              render: (_, row) => (
                <Space>
                  <Button
                    size="small"
                    onClick={() => navigate(`/dashboard/tour/${row._id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    danger
                    loading={deleteMutation.isPending}
                    onClick={async () => {
                      await deleteMutation.mutateAsync(row._id);
                      message.success('Tour deleted');
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
