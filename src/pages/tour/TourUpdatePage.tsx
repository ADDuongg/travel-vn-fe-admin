import { Card, Spin, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTour, useUpdateTour } from '@/queries/tour.queries';
import TourForm from './TourForm';
import TourReviewSection from './TourReviewSection';

export default function TourUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useTour(id);
  const updateMutation = useUpdateTour();

  const onSubmit = async (payload: FormData) => {
    if (!id) return;
    await updateMutation.mutateAsync({ id, data: payload });
    message.success('Tour updated');
    navigate('/dashboard/tour');
  };

  if (isLoading) {
    return (
      <Card className="form-page-card">
        <Spin />
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="Edit Tour" className="form-page-card">
        <TourForm
          initialValues={data}
          submitText="Update"
          loading={updateMutation.isPending}
          onSubmit={onSubmit}
          onCancel={() => navigate(-1)}
        />
      </Card>
      {id && (
        <TourReviewSection tourId={id} ratingSummary={data?.ratingSummary} />
      )}
    </div>
  );
}
