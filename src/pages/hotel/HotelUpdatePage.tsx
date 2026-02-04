import { Card, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotel, useUpdateHotel } from '@/queries/hotel.queries';
import HotelForm from './HotelForm';

export default function HotelUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useHotel(id);
  const updateMutation = useUpdateHotel();

  const onSubmit = async (formData: FormData) => {
    if (!id) return;
    await updateMutation.mutateAsync({ id, data: formData });
    message.success('Hotel updated');
    navigate('/dashboard/hotel');
  };

  if (isLoading) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  return (
    <Card title="Edit Hotel">
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
