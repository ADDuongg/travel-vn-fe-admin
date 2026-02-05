import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateTour } from '@/queries/tour.queries';
import type { TourUpsertPayload } from '@/interface/tour';
import TourForm from './TourForm';

export default function TourCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateTour();

  const onSubmit = async (payload: TourUpsertPayload) => {
    await createMutation.mutateAsync(payload);
    message.success('Tour created');
    navigate('/dashboard/tour');
  };

  return (
    <Card title="Add Tour">
      <TourForm
        submitText="Create"
        loading={createMutation.isPending}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      />
    </Card>
  );
}

