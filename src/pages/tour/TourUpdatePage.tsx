import { Card, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTour, useUpdateTour } from '@/queries/tour.queries';
import type { TourUpsertPayload } from '@/interface/tour';
import TourForm from './TourForm';
import TourReviewSection from './TourReviewSection';

export default function TourUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useTour(id);
  const updateMutation = useUpdateTour();

  const onSubmit = async (payload: TourUpsertPayload | FormData) => {
    if (!id) return;
    await updateMutation.mutateAsync({ id, data: payload });
    message.success('Tour updated');
    navigate('/dashboard/tour');
  };

  if (isLoading) {
    return (
      <Card>
        <Spin />
      </Card>
    );
  }

  return (
    <>
      <Card title="Edit Tour">
        <TourForm
          initialValues={data}
          submitText="Update"
          loading={updateMutation.isPending}
          onSubmit={onSubmit}
          onCancel={() => navigate(-1)}
        />
      </Card>
      {id && (
        <TourReviewSection
          tourId={id}
          ratingSummary={data?.ratingSummary}
        />
      )}
    </>
  );
}

