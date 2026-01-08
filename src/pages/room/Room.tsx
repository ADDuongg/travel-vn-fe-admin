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
import { useRooms, useDeleteRoom } from '@/queries/room.queries';

const { Title } = Typography;

export default function RoomPage() {
  const navigate = useNavigate();
  const { data = [], isLoading } = useRooms();
  const deleteMutation = useDeleteRoom();
  console.log('data', data);
  const tableData = data.map(({ children, ...rest }) => ({
    ...rest,
    childrenCount: children,
  }));
  return (
    <Card>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={5}>Rooms</Title>
        <Button
          type="primary"
          onClick={() => navigate('/dashboard/room/create')}
        >
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
            title: 'Price',
            dataIndex: ['pricing', 'basePrice'],
            render: (v) => v?.toLocaleString(),
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
