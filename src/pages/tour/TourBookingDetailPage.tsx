import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useTourBooking,
  useConfirmTourBooking,
  useCancelTourBooking,
  useRecordTourBookingPayment,
  useAssignTourBookingGuide,
} from '@/queries/tour-booking.queries';
import { useTourGuides } from '@/queries/tour-guide.queries';
import type { TourBooking } from '@/interface/tour-booking';

const { Title } = Typography;

function getTourName(tourId: TourBooking['tourId']): string {
  if (!tourId || typeof tourId === 'string') return '—';
  const t = (tourId as { translations?: Record<string, { name?: string }> }).translations;
  return t?.vi?.name || t?.en?.name || (tourId as { code?: string }).code || '—';
}

const statusColor: Record<string, string> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  PAID: 'green',
  CANCELLED: 'red',
  COMPLETED: 'default',
};

export default function TourBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm] = Form.useForm();
  const [selectedGuideId, setSelectedGuideId] = useState<string | undefined>();

  const { data: booking, isLoading } = useTourBooking(id);
  const { data: guideList } = useTourGuides({
    page: 1,
    limit: 100,
    isVerified: true,
    isAvailable: true,
  });
  const confirmMutation = useConfirmTourBooking();
  const cancelMutation = useCancelTourBooking();
  const paymentMutation = useRecordTourBookingPayment();
  const assignGuideMutation = useAssignTourBookingGuide();

  const canConfirm = booking?.status === 'PENDING';
  const canCancel = booking && !['CANCELLED', 'COMPLETED'].includes(booking.status);
  const canRecordPayment =
    booking && ['PENDING', 'CONFIRMED'].includes(booking.status) && (booking.paidAmount ?? 0) < (booking.totalAmount ?? 0);

  const handleAssignGuide = async () => {
    if (!id || !selectedGuideId) {
      message.error('Chọn hướng dẫn viên trước khi gán.');
      return;
    }
    await assignGuideMutation.mutateAsync({ id, guideId: selectedGuideId });
    message.success('Đã gán hướng dẫn viên cho đơn.');
  };

  const handleConfirm = async () => {
    if (!id) return;
    await confirmMutation.mutateAsync(id);
    message.success('Đã xác nhận đơn.');
  };

  const handleCancel = async () => {
    if (!id) return;
    await cancelMutation.mutateAsync({ id });
    message.success('Đã hủy đơn.');
  };

  const handlePayment = async () => {
    if (!id) return;
    try {
      const values = await paymentForm.validateFields();
      const amount = values.amount;
      if (amount == null || amount <= 0) {
        message.error('Nhập số tiền.');
        return;
      }
      await paymentMutation.mutateAsync({
        id,
        amount: Number(amount),
        provider: values.provider,
        transactionId: values.transactionId,
      });
      message.success('Đã ghi nhận thanh toán.');
      setPaymentModalOpen(false);
      paymentForm.resetFields();
    } catch {
      // validation failed
    }
  };

  return (
    <Card loading={isLoading}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <div>
          <Title level={5} style={{ marginBottom: 0 }}>
            Đơn tour: {booking?.bookingCode ?? id}
          </Title>
          <div style={{ fontSize: 12, color: '#666' }}>
            {booking?.guest?.fullName} — {booking?.guest?.email}
          </div>
        </div>
        <Space>
          <Button onClick={() => navigate('/dashboard/tour-bookings')}>Quay lại</Button>
          {canConfirm && (
            <Popconfirm
              title="Xác nhận đơn này?"
              onConfirm={handleConfirm}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                loading={confirmMutation.isPending}
              >
                Xác nhận đơn
              </Button>
            </Popconfirm>
          )}
          {canCancel && (
            <Popconfirm
              title="Hủy đơn? Số chỗ sẽ được trả lại."
              onConfirm={handleCancel}
              okText="Hủy đơn"
              cancelText="Không"
            >
              <Button danger loading={cancelMutation.isPending}>
                Hủy đơn
              </Button>
            </Popconfirm>
          )}
          {canRecordPayment && (
            <Button type="primary" onClick={() => setPaymentModalOpen(true)}>
              Ghi nhận thanh toán
            </Button>
          )}
        </Space>
      </Space>

      <Descriptions bordered size="small" style={{ marginTop: 16 }} column={1}>
        <Descriptions.Item label="Mã đặt">{booking?.bookingCode ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Tour">
          {booking?.tourId != null ? getTourName(booking.tourId) : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày khởi hành">
          {booking?.departureDate ? String(booking.departureDate).slice(0, 10) : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Khách">
          {booking?.guest?.fullName} / {booking?.guest?.email} / {booking?.guest?.phone ?? '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Số người">
          {booking?.adults ?? 0} người lớn, {booking?.children ?? 0} trẻ em, {booking?.infants ?? 0} em bé
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">
          {(booking?.totalAmount ?? 0).toLocaleString()} {booking?.currency ?? 'VND'}
        </Descriptions.Item>
        <Descriptions.Item label="Đặt cọc">
          {(booking?.depositAmount ?? 0).toLocaleString()} {booking?.currency ?? 'VND'}
        </Descriptions.Item>
        <Descriptions.Item label="Đã thanh toán">
          {(booking?.paidAmount ?? 0).toLocaleString()} {booking?.currency ?? 'VND'}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusColor[booking?.status ?? ''] || 'default'}>{booking?.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{booking?.guest?.note ?? '—'}</Descriptions.Item>
        {booking?.cancelReason && (
          <Descriptions.Item label="Lý do hủy">{booking.cancelReason}</Descriptions.Item>
        )}
      </Descriptions>

      <Card
        size="small"
        style={{ marginTop: 16 }}
        title="Hướng dẫn viên"
      >
        <Space align="center">
          <Select
            showSearch
            allowClear
            placeholder="Chọn hướng dẫn viên"
            style={{ minWidth: 260 }}
            value={selectedGuideId}
            onChange={setSelectedGuideId}
            options={(guideList?.items ?? []).map((g) => ({
              label: g.user?.fullName || g.user?.username || '—',
              value: g._id,
            }))}
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
          <Button
            type="primary"
            onClick={handleAssignGuide}
            loading={assignGuideMutation.isPending}
          >
            Gán HDV
          </Button>
          {booking?.guideId && (
            <span style={{ marginLeft: 12, fontSize: 12 }}>
              HDV hiện tại: {String(booking.guideId)}
            </span>
          )}
        </Space>
      </Card>

      <Modal
        title="Ghi nhận thanh toán"
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        onOk={handlePayment}
        confirmLoading={paymentMutation.isPending}
        okText="Ghi nhận"
      >
        <Form form={paymentForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Số tiền (VND)"
            rules={[{ required: true, message: 'Nhập số tiền' }, { type: 'number', min: 1 }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Số tiền" />
          </Form.Item>
          <Form.Item name="provider" label="Kênh thanh toán">
            <Select
              placeholder="Chọn kênh"
              allowClear
              options={[
                { label: 'Chuyển khoản', value: 'BANK_TRANSFER' },
                { label: 'VNPay', value: 'VNPay' },
                { label: 'Momo', value: 'Momo' },
                { label: 'Tiền mặt', value: 'CASH' },
              ]}
            />
          </Form.Item>
          <Form.Item name="transactionId" label="Mã giao dịch">
            <Input placeholder="Tùy chọn" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
