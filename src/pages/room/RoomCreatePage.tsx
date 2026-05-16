import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { RoomPayload } from '@interface/room';
import { useCreateRoom } from '@/queries/room.queries';
import RoomForm from './RoomForm';

export default function RoomCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateRoom();

  const onSubmit = async (payload: RoomPayload) => {
    await createMutation.mutateAsync(payload);
    message.success('Room created');
    navigate('/dashboard/room');
  };

  return (
    <Card title="Create Room" className="form-page-card">
      <RoomForm
        submitText="Create"
        loading={createMutation.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      />
    </Card>
  );
}
