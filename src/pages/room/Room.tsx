import {
  Button,
  Card,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { mockRooms, type Room } from './room.mock';

const { Title } = Typography;

export default function RoomPage() {
  const [data, setData] = useState<Room[]>(mockRooms);
  const navigate = useNavigate();

  const onDelete = (id: string) => {
    setData((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={5}>Rooms</Title>

        {/* 👉 NAVIGATE CREATE */}
        <Button
          type="primary"
          onClick={() => navigate('/dashboard/room/create')}
        >
          Create Room
        </Button>
      </Space>

      <Table<Room>
        rowKey="_id"
        style={{ marginTop: 16 }}
        dataSource={data}
        columns={[
          {
            title: 'Code',
            dataIndex: 'code',
          },
          {
            title: 'Price',
            dataIndex: 'price',
            render: (v) => `${v.toLocaleString()} ₫`,
          },
          {
            title: 'Capacity',
            dataIndex: 'capacity',
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
                {/* 👉 NAVIGATE EDIT */}
                <Button
                  size="small"
                  onClick={() => navigate(`/dashboard/room/${room._id}/edit`)}
                >
                  Edit
                </Button>

                <Popconfirm
                  title="Delete this room?"
                  onConfirm={() => onDelete(room._id)}
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
