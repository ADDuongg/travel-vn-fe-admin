import { Card, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { RoomPayload } from '@interface/room';
import { useRoom, useUpdateRoom } from '@/queries/room.queries';
import RoomForm from './RoomForm';

function getErrorCode(e: unknown): string | undefined {
  const x = e as { response?: { data?: { code?: string } }; code?: string };
  return x?.response?.data?.code ?? x?.code;
}

function getErrorMessage(e: unknown): string {
  const x = e as { message?: string };
  return x?.message ?? 'Cập nhật thất bại';
}

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

  const onSubmit = async (payload: RoomPayload) => {
    try {
      await updateMutation.mutateAsync({ id: id!, data: payload });
      message.success('Room updated');
      navigate('/dashboard/room');
    } catch (e: unknown) {
      if (getErrorCode(e) === 'ROOM_HAS_FUTURE_INVENTORY') {
        message.error(
          'Phòng đã có inventory tương lai, không đổi được số lượng phòng (totalRooms).',
        );
      } else {
        message.error(getErrorMessage(e));
      }
    }
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
