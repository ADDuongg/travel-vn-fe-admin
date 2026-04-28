import { useState } from 'react';
import {
  Button,
  Card,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRooms, useDeleteRoom } from '@/queries/room.queries';
import { useProvinceDropdown } from '@/queries/province.queries';
import { useHotelOptions } from '@/queries/hotel.queries';
import api from '@/lib/axios';
import type { Room } from '@/interface/room';
import PageShell from '@/components/PageShell';
import { RBAC } from '@/constants/rbac-keys';
import { useRbac } from '@/hooks/useRbac';
import { getProvinceLabel } from '@/lib/dynamic-localized';
import type { DynamicLocalized } from '@/lib/dynamic-localized';

const { Text } = Typography;

function getHotelName(room: { hotelId?: unknown }) {
  const hotel = room?.hotelId;
  if (!hotel || typeof hotel === 'string') return '-';
  const t = (hotel as { translations?: Record<string, { name?: string }> })?.translations;
  return t?.vi?.name || t?.en?.name || '-';
}

function getProvinceName(room: { hotelId?: unknown }) {
  const hotel = room?.hotelId;
  if (!hotel || typeof hotel === 'string') return '-';
  const prov = (hotel as { provinceId?: { name?: DynamicLocalized; code?: string } | string })
    ?.provinceId;
  if (!prov || typeof prov === 'string') return '-';
  const p = prov as { name?: DynamicLocalized; code?: string };
  return getProvinceLabel({ name: p.name, code: p.code });
}

function formatDateYMD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function RoomPage() {
  const navigate = useNavigate();
  const { can } = useRbac();
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [hotelIds, setHotelIds] = useState<string[] | undefined>();
  const { data: provinces = [] } = useProvinceDropdown();
  const { data: hotelOptions = [] } = useHotelOptions({ provinceId });
  const { data, isLoading } = useRooms({
    provinceId,
    hotelIds: hotelIds?.length ? hotelIds : undefined,
  });
  const deleteMutation = useDeleteRoom();
  const tableData = data?.items?.map(({ children, ...rest }) => ({
    ...rest,
    childrenCount: children,
  }));
  const [generatingRoomId, setGeneratingRoomId] = useState<string | null>(null);

  const handleGenerateInventory = async (roomId: string) => {
    const today = new Date();
    const from = formatDateYMD(today);
    const to = formatDateYMD(addDays(today, 365));

    setGeneratingRoomId(roomId);
    try {
      await api.post(
        `/api/v1/admin/room-inventories/ensure/${roomId}`,
        undefined,
        { params: { from, to } },
      );
      message.success('Generate room inventory success');
    } catch (error: any) {
      message.error(error?.message || 'Generate room inventory failed');
    } finally {
      setGeneratingRoomId(null);
    }
  };

  return (
    <PageShell
      title="Rooms"
      subtitle="Quản lý phòng theo khách sạn và tỉnh/thành."
      actions={
        can(RBAC.room.create) ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/dashboard/room/create')}
          >
            Tạo phòng
          </Button>
        ) : null
      }
    >
      <Card>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <Select
            placeholder="Lọc theo tỉnh/thành"
            allowClear
            style={{ width: 200 }}
            value={provinceId}
            onChange={setProvinceId}
            options={provinces.map((p) => ({
              label: getProvinceLabel({ name: p.name, code: p.code }),
              value: p._id,
            }))}
          />
          <Select
            placeholder="Lọc theo hotel"
            allowClear
            mode="multiple"
            style={{ minWidth: 240 }}
            value={hotelIds}
            onChange={setHotelIds}
            options={hotelOptions.map((h) => ({
              label: h.translations?.vi?.name || h.translations?.en?.name || h.slug,
              value: h._id,
            }))}
          />
        </div>

        <Table
          rowKey="_id"
          loading={isLoading}
          dataSource={tableData}
          size="middle"
          columns={[
            {
              title: 'Code',
              dataIndex: 'code',
              width: 100,
              render: (v) => <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{v}</Text>,
            },
            {
              title: 'Hotel',
              key: 'hotel',
              render: (_, room) => <Text style={{ fontSize: 13 }}>{getHotelName(room)}</Text>,
            },
            {
              title: 'Province',
              key: 'province',
              render: (_, room) => <Text style={{ fontSize: 13 }}>{getProvinceName(room)}</Text>,
            },
            {
              title: 'Price',
              dataIndex: ['pricing', 'basePrice'],
              width: 120,
              render: (v) => (
                <Text style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  {v != null ? v.toLocaleString() : '-'}
                </Text>
              ),
            },
            {
              title: 'Capacity',
              dataIndex: 'maxGuests',
              width: 90,
            },
            {
              title: 'Active',
              dataIndex: 'isActive',
              width: 80,
              render: (v) => <Switch checked={v} disabled size="small" />,
            },
            ...(can(RBAC.room.update) ||
            can(RBAC.inventory.manage) ||
            can(RBAC.room.delete)
              ? [
                  {
                    title: 'Actions',
                    width: 240,
                    render: (_: unknown, room: Room & { childrenCount?: number }) => (
                      <Space size={4}>
                        {can(RBAC.room.update) ? (
                          <Button
                            size="small"
                            onClick={() =>
                              navigate(`/dashboard/room/${room._id}/edit`)
                            }
                          >
                            Edit
                          </Button>
                        ) : null}
                        {can(RBAC.inventory.manage) ? (
                          <Button
                            size="small"
                            loading={generatingRoomId === room._id}
                            disabled={generatingRoomId === room._id}
                            onClick={() => handleGenerateInventory(room._id)}
                          >
                            Gen inventory
                          </Button>
                        ) : null}
                        {can(RBAC.room.delete) ? (
                          <Popconfirm
                            title="Delete this room?"
                            onConfirm={() => deleteMutation.mutate(room._id)}
                          >
                            <Button size="small" danger>
                              Delete
                            </Button>
                          </Popconfirm>
                        ) : null}
                      </Space>
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
