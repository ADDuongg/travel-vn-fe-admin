import { Card, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { HotelCreateUpdateBody } from '@/interface/hotel';
import { useHotel, useUpdateHotel } from '@/queries/hotel.queries';
import HotelForm from './HotelForm';

export default function HotelUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useHotel(id);
  const updateMutation = useUpdateHotel();

  const onSubmit = async (payload: HotelCreateUpdateBody) => {
    if (!id) return;
    await updateMutation.mutateAsync({ id, data: payload });
    message.success('Hotel updated');
    navigate('/dashboard/hotel');
  };

  if (isLoading) {
    return (
      <Card className="form-page-card">
        <Spin />
      </Card>
    );
  }

  return (
    <Card title="Edit Hotel" className="form-page-card">
      <HotelForm
        initialValues={data}
        submitText="Update"
        loading={updateMutation.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      />
    </Card>
  );
}
