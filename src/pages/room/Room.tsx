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
import { useNavigate } from 'react-router-dom';
import { useRooms, useDeleteRoom } from '@/queries/room.queries';
import { useProvinces } from '@/queries/province.queries';
import { useHotelOptions } from '@/queries/hotel.queries';
import api from '@/lib/axios';

const { Title } = Typography;

function getHotelName(room: { hotelId?: unknown }) {
  const hotel = room?.hotelId;
  if (!hotel || typeof hotel === 'string') return '-';
  const t = (hotel as { translations?: Record<string, { name?: string }> })?.translations;
  return t?.vi?.name || t?.en?.name || '-';
}

function getProvinceName(room: { hotelId?: unknown }) {
  const hotel = room?.hotelId;
  if (!hotel || typeof hotel === 'string') return '-';
  const prov = (hotel as { provinceId?: { name?: { vi?: string; en?: string } } | string })
    ?.provinceId;
  if (!prov || typeof prov === 'string') return '-';
  return (prov as { name?: { vi?: string; en?: string } })?.name?.vi
    || (prov as { name?: { vi?: string; en?: string } })?.name?.en
    || '-';
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
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [hotelIds, setHotelIds] = useState<string[] | undefined>();
  const { data: provinces = [] } = useProvinces();
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
        `/api/v1/room-inventories/ensure/${roomId}`,
        undefined,
        {
          params: { from, to },
        },
      );
      message.success('Generate room inventory success');
    } catch (error: any) {
      message.error(error?.message || 'Generate room inventory failed');
    } finally {
      setGeneratingRoomId(null);
    }
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Space wrap>
          <Title level={5} style={{ margin: 0 }}>
            Rooms
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
          <Select
            placeholder="Filter by hotel"
            allowClear
            mode="multiple"
            style={{ minWidth: 220 }}
            value={hotelIds}
            onChange={setHotelIds}
            options={hotelOptions.map((h) => ({
              label: h.translations?.vi?.name || h.translations?.en?.name || h.slug,
              value: h._id,
            }))}
          />
        </Space>
        <Button type="primary" onClick={() => navigate('/dashboard/room/create')}>
          Create Room
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        style={{ marginTop: 16 }}
        dataSource={tableData}
        columns={[
          { title: 'Code', dataIndex: 'code' },
          {
            title: 'Hotel',
            key: 'hotel',
            render: (_, room) => getHotelName(room),
          },
          {
            title: 'Province',
            key: 'province',
            render: (_, room) => getProvinceName(room),
          },
          {
            title: 'Price',
            dataIndex: ['pricing', 'basePrice'],
            render: (v) => (v != null ? v.toLocaleString() : '-'),
          },
          {
            title: 'Capacity',
            dataIndex: 'maxGuests',
          },
          {
            title: 'Active',
            dataIndex: 'isActive',
            render: (v) => <Switch checked={v} disabled />,
          },
          {
            title: 'Actions',
            render: (_, room) => (
              <Space>
                <Button
                  size="small"
                  onClick={() => navigate(`/dashboard/room/${room._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  loading={generatingRoomId === room._id}
                  disabled={generatingRoomId === room._id}
                  onClick={() => handleGenerateInventory(room._id)}
                >
                  Gen inventory
                </Button>
                <Popconfirm
                  title="Delete this room?"
                  onConfirm={() => deleteMutation.mutate(room._id)}
                >
                  <Button size="small" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
