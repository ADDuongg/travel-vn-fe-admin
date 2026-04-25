import PageShell from '@/components/PageShell';
import { useHotels } from '@/queries/hotel.queries';
import { useProvinceDropdown } from '@/queries/province.queries';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Select, Switch, Table, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProvinceLabel } from '@/lib/dynamic-localized';
import type { DynamicLocalized } from '@/lib/dynamic-localized';

const { Text } = Typography;

function getHotelName(row: {
  translations?: Record<string, { name?: string }>;
}) {
  const t = row?.translations;
  return t?.vi?.name || t?.en?.name || '-';
}

function formatProvinceFromRow(
  prov: { name?: DynamicLocalized; code?: string } | string | undefined,
) {
  if (!prov || typeof prov === 'string') return '-';
  return getProvinceLabel({ name: prov.name, code: prov.code });
}

export default function HotelPage() {
  const navigate = useNavigate();
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const { data: provinces = [] } = useProvinceDropdown();
  const { data: hotels = [], isLoading } = useHotels({ provinceId });

  return (
    <PageShell
      title="Hotels"
      subtitle="Quản lý danh sách khách sạn theo tỉnh/thành."
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/dashboard/hotel/create')}
        >
          Thêm hotel
        </Button>
      }
    >
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Lọc theo tỉnh/thành"
            allowClear
            style={{ width: 240 }}
            value={provinceId}
            onChange={setProvinceId}
            options={provinces.map((p) => ({
              label: getProvinceLabel({ name: p.name, code: p.code }),
              value: p._id,
            }))}
          />
        </div>

        <Table
          rowKey="_id"
          loading={isLoading}
          dataSource={Array.isArray(hotels) ? hotels : []}
          size="middle"
          columns={[
            {
              title: 'Name',
              key: 'name',
              render: (_, row) => (
                <Text style={{ fontSize: 13, fontWeight: 450 }}>
                  {getHotelName(row)}
                </Text>
              ),
            },
            {
              title: 'Slug',
              dataIndex: 'slug',
              render: (v) => (
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {v}
                </Text>
              ),
            },
            {
              title: 'Province',
              key: 'province',
              render: (_, row) => (
                <Text style={{ fontSize: 13 }}>
                  {formatProvinceFromRow(row.provinceId)}
                </Text>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'isActive',
              width: 90,
              render: (v: boolean) => (
                <Switch checked={v} disabled size="small" />
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 100,
              render: (_, row) => (
                <Button
                  size="small"
                  onClick={() => navigate(`/dashboard/hotel/${row._id}/edit`)}
                >
                  Edit
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </PageShell>
  );
}
