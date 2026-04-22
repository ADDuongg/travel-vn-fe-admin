import { Card, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoom, useUpdateRoom } from '@/queries/room.queries';
import RoomForm from './RoomForm';

export default function RoomUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useRoom(id);
  const updateMutation = useUpdateRoom();

  if (isLoading) {
    return (
      <Card className="form-page-card">
        <Spin />
      </Card>
    );
  }

  const onSubmit = async (formData: FormData) => {
    await updateMutation.mutateAsync({ id: id!, data: formData });
    message.success('Room updated');
    navigate('/dashboard/room');
  };

  return (
    <Card title="Edit Room" className="form-page-card">
      <RoomForm
        initialValues={data}
        submitText="Update"
        loading={updateMutation.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      />
    </Card>
  );
}
