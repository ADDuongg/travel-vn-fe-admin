import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getAdminBookings,
  getAdminBookingById,
  markBookingPaid,
  cancelBooking,
  refundBooking,
} from '@/services/booking.service';
import type {
  BookingPaymentStatus,
  BookingStatus,
  BookingType,
} from '@/services/booking.service';

export const ADMIN_BOOKING_QUERY_KEY = ['admin-bookings'] as const;

export const useAdminBookings = (params: {
  pageIndex: number;
  pageSize: number;
  bookingType?: BookingType;
  status?: BookingStatus;
  paymentStatus?: BookingPaymentStatus;
  q?: string;
}) =>
  useQuery({
    queryKey: [...ADMIN_BOOKING_QUERY_KEY, params],
    queryFn: () => getAdminBookings(params),
    placeholderData: keepPreviousData,
  });

export const useAdminBooking = (id?: string) =>
  useQuery({
    queryKey: id ? [...ADMIN_BOOKING_QUERY_KEY, 'detail', id] : [],
    queryFn: () => getAdminBookingById(id!),
    enabled: !!id,
  });

export const useMarkBookingPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markBookingPaid,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_BOOKING_QUERY_KEY });
    },
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_BOOKING_QUERY_KEY });
    },
  });
};

export const useRefundBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fullyRefunded }: { id: string; fullyRefunded?: boolean }) =>
      refundBooking(id, fullyRefunded),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_BOOKING_QUERY_KEY });
    },
  });
};

