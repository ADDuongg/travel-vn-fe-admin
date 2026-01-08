import { Button, Card, Form, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateRoom } from '@/queries/room.queries';
import RoomForm from './RoomForm';

export default function RoomCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateRoom();

  const onSubmit = async (formData: FormData) => {
    await createMutation.mutateAsync(formData);
    message.success('Room created');
    navigate('/dashboard/room');
  };

  return (
    <Card>
      <RoomForm
        submitText="Create"
        loading={createMutation.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      />
    </Card>
  );
}
