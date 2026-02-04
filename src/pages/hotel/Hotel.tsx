import { useState } from 'react';
import {
  Button,
  Card,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useHotels } from '@/queries/hotel.queries';
import { useProvinces } from '@/queries/province.queries';

const { Title } = Typography;

function getHotelName(row: { translations?: Record<string, { name?: string }> }) {
  const t = row?.translations;
  return t?.vi?.name || t?.en?.name || '-';
}

function getProvinceName(prov: { name?: { vi?: string; en?: string } } | string) {
  if (typeof prov === 'string') return '-';
  return prov?.name?.vi || prov?.name?.en || '-';
}

export default function HotelPage() {
  const navigate = useNavigate();
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const { data: provinces = [] } = useProvinces();
  const { data: hotels = [], isLoading } = useHotels({ provinceId });

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            Hotels
          </Title>
          <Select
            placeholder="Filter by province"
            allowClear
            style={{ width: 200 }}
            value={provinceId}
            onChange={setProvinceId}
            options={provinces.map((p) => ({
              label: p.name?.vi || p.name?.en || p.code,
              value: p._id,
            }))}
          />
        </Space>
        <Button type="primary" onClick={() => navigate('/dashboard/hotel/create')}>
          Add Hotel
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={Array.isArray(hotels) ? hotels : []}
        columns={[
          {
            title: 'Name',
            key: 'name',
            render: (_, row) => getHotelName(row),
          },
          {
            title: 'Slug',
            dataIndex: 'slug',
          },
          {
            title: 'Province',
            key: 'province',
            render: (_, row) => getProvinceName(row.provinceId),
          },
          {
            title: 'Status',
            dataIndex: 'isActive',
            render: (v: boolean) => <Switch checked={v} disabled size="small" />,
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_, row) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => navigate(`/dashboard/hotel/${row._id}/edit`)}
                >
                  Edit
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
