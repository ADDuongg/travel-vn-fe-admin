import { useMemo, useState } from 'react';
import { Button, Card, Input, Select, Space, Switch, Table, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useProvinceDropdown } from '@/queries/province.queries';
import { useDeleteTour, useTours } from '@/queries/tour.queries';
import type { Tour } from '@/interface/tour';

const { Title } = Typography;

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

  const [search, setSearch] = useState<string>('');
  const [tourType, setTourType] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [departureProvinceId, setDepartureProvinceId] = useState<string | undefined>();

  const params = useMemo(
    () => ({
      page: 1,
      limit: 50,
      search: search || undefined,
      tourType: tourType as any,
      difficulty: difficulty as any,
      destinationId,
      departureProvinceId,
      sortBy: 'newest' as const,
    }),
    [search, tourType, difficulty, destinationId, departureProvinceId],
  );

  const { data, isLoading } = useTours(params);
  const items = Array.isArray(data?.items) ? data.items : [];

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space wrap>
          <Title level={5} style={{ margin: 0 }}>
            Tours
          </Title>
          <Input
            allowClear
            placeholder="Search by name / code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Select
            allowClear
            placeholder="Tour type"
            style={{ width: 160 }}
            value={tourType}
            onChange={setTourType}
            options={[
              { label: 'Domestic', value: 'DOMESTIC' },
              { label: 'International', value: 'INTERNATIONAL' },
              { label: 'Daily', value: 'DAILY' },
            ]}
          />
          <Select
            allowClear
            placeholder="Difficulty"
            style={{ width: 160 }}
            value={difficulty}
            onChange={setDifficulty}
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
            placeholder="Destination"
            style={{ width: 200 }}
            value={destinationId}
            onChange={setDestinationId}
            options={provinces.map((p) => ({
              label: p.name?.vi || p.name?.en || p.code,
              value: p._id,
            }))}
          />
          <Select
            allowClear
            showSearch
            placeholder="Departure province"
            style={{ width: 220 }}
            value={departureProvinceId}
            onChange={setDepartureProvinceId}
            options={provinces.map((p) => ({
              label: p.name?.vi || p.name?.en || p.code,
              value: p._id,
            }))}
          />
        </Space>

        <Button type="primary" onClick={() => navigate('/dashboard/tour/create')}>
          Add Tour
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={items}
        columns={[
          {
            title: 'Name',
            key: 'name',
            render: (_, row) => getTourName(row),
          },
          { title: 'Code', dataIndex: 'code' },
          { title: 'Slug', dataIndex: 'slug' },
          { title: 'Type', dataIndex: 'tourType' },
          {
            title: 'Departure',
            key: 'departureProvinceId',
            render: (_, row) => getProvinceName((row as any).departureProvinceId),
          },
          {
            title: 'Active',
            dataIndex: 'isActive',
            render: (v: boolean) => <Switch checked={v} disabled size="small" />,
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => navigate(`/dashboard/tour/${row._id}/edit`)}>
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
  );
}

