import PageShell from '@/components/PageShell';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';
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
  const { can } = useRbac();
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data: provinces = [] } = useProvinceDropdown();
  const { data, isLoading } = useHotels({ provinceId, page, pageSize });
  const hotels = Array.isArray(data?.items) ? data.items : [];
  const total = data?.pagination?.total ?? 0;
  const current = data?.pagination?.page ?? page;
  const currentPageSize = data?.pagination?.limit ?? pageSize;

  return (
    <PageShell
      title="Hotels"
      subtitle="Quản lý danh sách khách sạn theo tỉnh/thành."
      actions={
        can(RBAC.hotel.create) ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/dashboard/hotel/create')}
          >
            Thêm hotel
          </Button>
        ) : null
      }
    >
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Lọc theo tỉnh/thành"
            allowClear
            style={{ width: 240 }}
            value={provinceId}
            onChange={(value) => {
              setProvinceId(value);
              setPage(1);
            }}
            options={provinces.map((p) => ({
              label: getProvinceLabel({ name: p.name, code: p.code }),
              value: p._id,
            }))}
          />
        </div>

        <Table
          rowKey="_id"
          loading={isLoading}
          dataSource={hotels}
          size="middle"
          pagination={{
            current,
            pageSize: currentPageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
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
            ...(can(RBAC.hotel.update)
              ? [
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 100,
                    render: (_: unknown, row: { _id: string }) => (
                      <Button
                        size="small"
                        onClick={() => navigate(`/dashboard/hotel/${row._id}/edit`)}
                      >
                        Edit
                      </Button>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </PageShell>
  );
}
