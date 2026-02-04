import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateHotel } from '@/queries/hotel.queries';
import HotelForm from './HotelForm';

export default function HotelCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateHotel();

  const onSubmit = async (formData: FormData) => {
    await createMutation.mutateAsync(formData);
    message.success('Hotel created');
    navigate('/dashboard/hotel');
  };

  return (
    <Card title="Add Hotel">
      <HotelForm
        submitText="Create"
        loading={createMutation.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      />
    </Card>
  );
}
